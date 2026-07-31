<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\FinishedProduct;
use App\Models\RawMaterial;
use App\Models\SemiFinishedProduct;

class InventoryController extends Controller
{
    // GET /api/inventory  — current stock at every production stage
    public function index()
    {
        return response()->json([
            'raw_materials' => RawMaterial::select('id', 'name', 'sku', 'unit', 'quantity_on_hand')->get(),
            'semi_finished_products' => SemiFinishedProduct::select('id', 'name', 'sku', 'unit', 'quantity_on_hand')->get(),
            'finished_products' => FinishedProduct::select('id', 'name', 'sku', 'unit', 'quantity_on_hand')->get(),
        ]);
    }
}
