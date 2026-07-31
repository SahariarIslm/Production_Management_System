<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\FinishedProduct;
use Illuminate\Http\Request;

class FinishedProductController extends Controller
{
    public function index()
    {
        return FinishedProduct::with(['batches' => fn ($q) => $q->orderByDesc('produced_at')])->get();
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'sku' => 'required|string|unique:finished_products,sku',
            'unit' => 'required|string|max:20',
        ]);

        return response()->json(FinishedProduct::create($data + ['quantity_on_hand' => 0]), 201);
    }

    public function show(FinishedProduct $finishedProduct)
    {
        return $finishedProduct->load('batches');
    }

    public function update(Request $request, FinishedProduct $finishedProduct)
    {
        $data = $request->validate([
            'name' => 'sometimes|string|max:255',
            'sku' => 'sometimes|string|unique:finished_products,sku,' . $finishedProduct->id,
            'unit' => 'sometimes|string|max:20',
        ]);

        $finishedProduct->update($data);

        return $finishedProduct;
    }

    public function destroy(FinishedProduct $finishedProduct)
    {
        $finishedProduct->delete();
        return response()->noContent();
    }
}
