<?php

use App\Http\Controllers\Api\FinishedProductController;
use App\Http\Controllers\Api\InventoryController;
use App\Http\Controllers\Api\ProductionController;
use App\Http\Controllers\Api\RawMaterialController;
use App\Http\Controllers\Api\SemiFinishedProductController;
use App\Http\Controllers\Api\TraceabilityController;
use Illuminate\Support\Facades\Route;

Route::apiResource('raw-materials', RawMaterialController::class);
Route::post('raw-materials/{rawMaterial}/receive-batch', [RawMaterialController::class, 'receiveBatch']);

Route::apiResource('semi-finished-products', SemiFinishedProductController::class);
Route::apiResource('finished-products', FinishedProductController::class);

Route::post('production/semi-finished', [ProductionController::class, 'produceSemiFinished']);
Route::post('production/finished', [ProductionController::class, 'produceFinished']);

Route::get('inventory', [InventoryController::class, 'index']);

Route::get('finished-batches/{finishedBatch}/trace', [TraceabilityController::class, 'trace']);
Route::get('production-history', [TraceabilityController::class, 'history']);
