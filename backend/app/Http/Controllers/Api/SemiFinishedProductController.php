<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\SemiFinishedProduct;
use Illuminate\Http\Request;

class SemiFinishedProductController extends Controller
{
    public function index()
    {
        return SemiFinishedProduct::with(['batches' => fn ($q) => $q->orderByDesc('produced_at')])->get();
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'sku' => 'required|string|unique:semi_finished_products,sku',
            'unit' => 'required|string|max:20',
        ]);

        return response()->json(SemiFinishedProduct::create($data + ['quantity_on_hand' => 0]), 201);
    }

    public function show(SemiFinishedProduct $semiFinishedProduct)
    {
        return $semiFinishedProduct->load('batches');
    }

    public function update(Request $request, SemiFinishedProduct $semiFinishedProduct)
    {
        $data = $request->validate([
            'name' => 'sometimes|string|max:255',
            'sku' => 'sometimes|string|unique:semi_finished_products,sku,' . $semiFinishedProduct->id,
            'unit' => 'sometimes|string|max:20',
        ]);

        $semiFinishedProduct->update($data);

        return $semiFinishedProduct;
    }

    public function destroy(SemiFinishedProduct $semiFinishedProduct)
    {
        $semiFinishedProduct->delete();
        return response()->noContent();
    }
}
