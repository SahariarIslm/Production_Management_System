<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\FinishedBatch;
use App\Models\ProductionEvent;

class TraceabilityController extends Controller
{
    // GET /api/finished-batches/{finishedBatch}/trace
    public function trace(FinishedBatch $finishedBatch)
    {
        $finishedBatch->load([
            'finishedProduct',
            'semiFinishedBatches.semiFinishedProduct',
            'semiFinishedBatches.rawMaterialBatches.rawMaterial',
        ]);

        $trace = [
            'finished_batch' => [
                'id' => $finishedBatch->id,
                'batch_number' => $finishedBatch->batch_number,
                'product' => $finishedBatch->finishedProduct->name,
                'quantity' => $finishedBatch->quantity,
                'status' => $finishedBatch->status,
                'produced_at' => $finishedBatch->produced_at,
            ],
            'semi_finished_sources' => $finishedBatch->semiFinishedBatches->map(function ($semi) {
                return [
                    'batch_id' => $semi->id,
                    'batch_number' => $semi->batch_number,
                    'product' => $semi->semiFinishedProduct->name,
                    'quantity_consumed' => $semi->pivot->quantity_consumed,
                    'raw_material_sources' => $semi->rawMaterialBatches->map(function ($rm) {
                        return [
                            'batch_id' => $rm->id,
                            'batch_number' => $rm->batch_number,
                            'raw_material' => $rm->rawMaterial->name,
                            'quantity_consumed' => $rm->pivot->quantity_consumed,
                            'received_at' => $rm->received_at,
                        ];
                    }),
                ];
            }),
        ];

        return response()->json($trace);
    }

    // GET /api/production-history
    public function history()
    {
        return ProductionEvent::orderByDesc('processed_at')->get();
    }
}
