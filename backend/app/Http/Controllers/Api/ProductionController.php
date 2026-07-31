<?php

namespace App\Http\Controllers\Api;

use App\Exceptions\InsufficientInventoryException;
use App\Http\Controllers\Controller;
use App\Services\ProductionService;
use Illuminate\Http\Request;

class ProductionController extends Controller
{
    public function __construct(private ProductionService $productionService)
    {

    }

    // POST /api/production/semi-finished
    public function produceSemiFinished(Request $request)
    {
        $data = $request->validate([
            'semi_finished_product_id' => 'required|exists:semi_finished_products,id',
            'batch_number' => 'required|string|unique:semi_finished_batches,batch_number',
            'quantity' => 'required|numeric|min:0.001',
            'consumptions' => 'required|array|min:1',
            'consumptions.*.raw_material_id' => 'required|exists:raw_materials,id',
            'consumptions.*.quantity' => 'required|numeric|min:0.001',
        ]);

        try {
            $batch = $this->productionService->produceSemiFinished(
                $data['semi_finished_product_id'],
                $data['batch_number'],
                $data['quantity'],
                $data['consumptions']
            );

            return response()->json([
                'message' => 'Production accepted. Inventory reserved; completion will be processed asynchronously.',
                'batch' => $batch,
            ], 202);
        } catch (InsufficientInventoryException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }
    }

    // POST /api/production/finished
    public function produceFinished(Request $request)
    {
        $data = $request->validate([
            'finished_product_id' => 'required|exists:finished_products,id',
            'batch_number' => 'required|string|unique:finished_batches,batch_number',
            'quantity' => 'required|numeric|min:0.001',
            'consumptions' => 'required|array|min:1',
            'consumptions.*.semi_finished_batch_id' => 'required|exists:semi_finished_batches,id',
            'consumptions.*.quantity' => 'required|numeric|min:0.001',
        ]);

        try {
            $batch = $this->productionService->produceFinished(
                $data['finished_product_id'],
                $data['batch_number'],
                $data['quantity'],
                $data['consumptions']
            );

            return response()->json([
                'message' => 'Production accepted. Inventory reserved; completion will be processed asynchronously.',
                'batch' => $batch,
            ], 202);
        } catch (InsufficientInventoryException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }
    }
}
