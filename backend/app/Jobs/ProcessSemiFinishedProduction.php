<?php

namespace App\Jobs;

use App\Models\ProductionEvent;
use App\Models\SemiFinishedBatch;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class ProcessSemiFinishedProduction implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;

    public function __construct(public int $batchId){}

    public function handle(): void
    {
        DB::transaction(function () {
            $batch = SemiFinishedBatch::lockForUpdate()->findOrFail($this->batchId);

            if ($batch->status === 'completed') {
                return; // idempotent — already processed
            }

            $product = $batch->semiFinishedProduct()->lockForUpdate()->first();

            // Add output quantity to semi-finished inventory
            $product->increment('quantity_on_hand', $batch->quantity);

            $batch->update([
                'status' => 'completed',
                'quantity_remaining' => $batch->quantity,
            ]);

            ProductionEvent::create([
                'event_type' => 'semi_finished_completed',
                'batch_type' => 'semi_finished',
                'batch_id' => $batch->id,
                'payload' => [
                    'batch_number' => $batch->batch_number,
                    'product' => $product->name,
                    'quantity' => $batch->quantity,
                ],
                'processed_at' => now(),
            ]);

            Log::info("[Notification] Semi-finished batch {$batch->batch_number} completed. Inventory updated for {$product->name}.");
        });
    }

    public function failed(\Throwable $exception): void
    {
        SemiFinishedBatch::where('id', $this->batchId)->update(['status' => 'failed']);
        Log::error("Semi-finished production failed for batch {$this->batchId}: {$exception->getMessage()}");
    }
}
