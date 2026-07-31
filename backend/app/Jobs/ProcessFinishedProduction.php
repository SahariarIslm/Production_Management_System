<?php

namespace App\Jobs;

use App\Models\FinishedBatch;
use App\Models\ProductionEvent;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class ProcessFinishedProduction implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;

    public function __construct(public int $batchId) {}

    public function handle(): void
    {
        DB::transaction(function () {
            $batch = FinishedBatch::lockForUpdate()->findOrFail($this->batchId);

            if ($batch->status === 'completed') {
                return;
            }

            $product = $batch->finishedProduct()->lockForUpdate()->first();
            $product->increment('quantity_on_hand', $batch->quantity);

            $batch->update(['status' => 'completed']);

            ProductionEvent::create([
                'event_type' => 'finished_completed',
                'batch_type' => 'finished',
                'batch_id' => $batch->id,
                'payload' => [
                    'batch_number' => $batch->batch_number,
                    'product' => $product->name,
                    'quantity' => $batch->quantity,
                ],
                'processed_at' => now(),
            ]);

            Log::info("[Notification] Finished batch {$batch->batch_number} completed. Inventory updated for {$product->name}.");
        });
    }

    public function failed(\Throwable $exception): void
    {
        FinishedBatch::where('id', $this->batchId)->update(['status' => 'failed']);
        Log::error("Finished production failed for batch {$this->batchId}: {$exception->getMessage()}");
    }
}
