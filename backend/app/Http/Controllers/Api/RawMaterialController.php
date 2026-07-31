<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\RawMaterial;
use App\Models\RawMaterialBatch;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class RawMaterialController extends Controller
{
    public function index()
    {
        return RawMaterial::with(['batches' => fn ($q) => $q->orderByDesc('received_at')])->get();
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'sku' => 'required|string|unique:raw_materials,sku',
            'unit' => 'required|string|max:20',
        ]);

        $material = RawMaterial::create($data + ['quantity_on_hand' => 0]);

        return response()->json($material, 201);
    }

    public function show(RawMaterial $rawMaterial)
    {
        return $rawMaterial->load('batches');
    }

    public function update(Request $request, RawMaterial $rawMaterial)
    {
        $data = $request->validate([
            'name' => 'sometimes|string|max:255',
            'sku' => 'sometimes|string|unique:raw_materials,sku,' . $rawMaterial->id,
            'unit' => 'sometimes|string|max:20',
        ]);

        $rawMaterial->update($data);

        return $rawMaterial;
    }

    public function destroy(RawMaterial $rawMaterial)
    {
        $rawMaterial->delete();
        return response()->noContent();
    }

    // Receive a new raw material batch (increments stock)
    public function receiveBatch(Request $request, RawMaterial $rawMaterial)
    {
        $data = $request->validate([
            'batch_number' => 'required|string|unique:raw_material_batches,batch_number',
            'quantity' => 'required|numeric|min:0.001',
            'received_at' => 'nullable|date',
        ]);

        $batch = DB::transaction(function () use ($rawMaterial, $data) {
            $batch = RawMaterialBatch::create([
                'raw_material_id' => $rawMaterial->id,
                'batch_number' => $data['batch_number'],
                'quantity' => $data['quantity'],
                'quantity_remaining' => $data['quantity'],
                'received_at' => $data['received_at'] ?? now(),
            ]);

            $rawMaterial->increment('quantity_on_hand', $data['quantity']);

            return $batch;
        });

        return response()->json($batch, 201);
    }
}
