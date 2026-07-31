<?php

namespace App\Services;

use App\Exceptions\InsufficientInventoryException;
use App\Jobs\ProcessFinishedProduction;
use App\Jobs\ProcessSemiFinishedProduction;
use App\Models\FinishedBatch;
use App\Models\FinishedProduct;
use App\Models\RawMaterial;
use App\Models\RawMaterialBatch;
use App\Models\SemiFinishedBatch;
use App\Models\SemiFinishedProduct;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class ProductionService
{
    /**
     * Raw Material(s) -> Semi-Finished Product batch.
     *
     * $consumptions: array of ['raw_material_id' => int, 'quantity' => float]
     */
    public function produceSemiFinished(int $semiFinishedProductId, string $batchNumber, float $outputQuantity, array $consumptions): SemiFinishedBatch
    {
        return DB::transaction(function () use ($semiFinishedProductId, $batchNumber, $outputQuantity, $consumptions) {
            $product = SemiFinishedProduct::findOrFail($semiFinishedProductId);

            $batch = SemiFinishedBatch::create([
                'semi_finished_product_id' => $product->id,
                'batch_number' => $batchNumber,
                'quantity' => $outputQuantity,
                'quantity_remaining' => 0, // set once completed by worker
                'status' => 'pending',
                'produced_at' => now(),
            ]);

            foreach ($consumptions as $item) {
                $this->consumeRawMaterialFifo($item['raw_material_id'], (float) $item['quantity'], $batch);
            }

            // Publish to RabbitMQ (via Laravel queue driver) to complete the process async
            ProcessSemiFinishedProduction::dispatch($batch->id)->onConnection('rabbitmq');

            return $batch->fresh();
        });
    }

    /**
     * Semi-Finished Batch(es) -> Finished Product batch.
     *
     * $consumptions: array of ['semi_finished_batch_id' => int, 'quantity' => float]
     */
    public function produceFinished(int $finishedProductId, string $batchNumber, float $outputQuantity, array $consumptions): FinishedBatch
    {
        return DB::transaction(function () use ($finishedProductId, $batchNumber, $outputQuantity, $consumptions) {
            $product = FinishedProduct::findOrFail($finishedProductId);

            $batch = FinishedBatch::create([
                'finished_product_id' => $product->id,
                'batch_number' => $batchNumber,
                'quantity' => $outputQuantity,
                'status' => 'pending',
                'produced_at' => now(),
            ]);

            foreach ($consumptions as $item) {
                $this->consumeSemiFinishedBatch((int) $item['semi_finished_batch_id'], (float) $item['quantity'], $batch);
            }

            ProcessFinishedProduction::dispatch($batch->id)->onConnection('rabbitmq');

            return $batch->fresh();
        });
    }

    /**
     * Deduct $quantity of a raw material using FIFO across its batches
     * (oldest received_at first), recording exactly which batch supplied how much.
     */
    private function consumeRawMaterialFifo(int $rawMaterialId, float $quantity, SemiFinishedBatch $semiBatch): void
    {
        $rawMaterial = RawMaterial::lockForUpdate()->findOrFail($rawMaterialId);

        if ($rawMaterial->quantity_on_hand < $quantity) {
            throw new InsufficientInventoryException(
                "Insufficient stock for raw material '{$rawMaterial->name}'. Requested: {$quantity}, Available: {$rawMaterial->quantity_on_hand}"
            );
        }

        $remainingToConsume = $quantity;

        $batches = RawMaterialBatch::where('raw_material_id', $rawMaterialId)
            ->where('quantity_remaining', '>', 0)
            ->orderBy('received_at') // FIFO
            ->lockForUpdate()
            ->get();

        foreach ($batches as $rmBatch) {
            if ($remainingToConsume <= 0) break;

            $take = min($rmBatch->quantity_remaining, $remainingToConsume);

            $rmBatch->decrement('quantity_remaining', $take);

            $semiBatch->rawMaterialBatches()->attach($rmBatch->id, [
                'quantity_consumed' => $take,
            ]);

            $remainingToConsume -= $take;
        }

        if ($remainingToConsume > 0.0001) {
            // Should not happen since we checked aggregate above, but guards against data drift
            throw new InsufficientInventoryException(
                "Insufficient batch-level stock for raw material '{$rawMaterial->name}'."
            );
        }

        $rawMaterial->decrement('quantity_on_hand', $quantity);
    }

    /**
     * Deduct $quantity from a specific semi-finished batch and link it as an input
     * to the finished batch (traceability).
     */
    private function consumeSemiFinishedBatch(int $semiFinishedBatchId, float $quantity, FinishedBatch $finishedBatch): void
    {
        $semiBatch = SemiFinishedBatch::lockForUpdate()->findOrFail($semiFinishedBatchId);

        if ($semiBatch->status !== 'completed') {
            throw new InsufficientInventoryException(
                "Semi-finished batch '{$semiBatch->batch_number}' is not yet completed and cannot be consumed."
            );
        }

        if ($semiBatch->quantity_remaining < $quantity) {
            throw new InsufficientInventoryException(
                "Insufficient stock in semi-finished batch '{$semiBatch->batch_number}'. Requested: {$quantity}, Available: {$semiBatch->quantity_remaining}"
            );
        }

        $semiBatch->decrement('quantity_remaining', $quantity);

        $product = $semiBatch->semiFinishedProduct()->lockForUpdate()->first();
        $product->decrement('quantity_on_hand', $quantity);

        $finishedBatch->semiFinishedBatches()->attach($semiBatch->id, [
            'quantity_consumed' => $quantity,
        ]);
    }
}
