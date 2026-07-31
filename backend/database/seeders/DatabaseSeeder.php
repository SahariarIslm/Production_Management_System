<?php

namespace Database\Seeders;

use App\Models\FinishedProduct;
use App\Models\RawMaterial;
use App\Models\RawMaterialBatch;
use App\Models\SemiFinishedProduct;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $steel = RawMaterial::create([
            'name' => 'Steel Sheets', 'sku' => 'RM-STEEL-001', 'unit' => 'kg', 'quantity_on_hand' => 0,
        ]);

        $batch1 = RawMaterialBatch::create([
            'raw_material_id' => $steel->id, 'batch_number' => 'RMB-0001',
            'quantity' => 500, 'quantity_remaining' => 500, 'received_at' => now()->subDays(3),
        ]);
        $batch2 = RawMaterialBatch::create([
            'raw_material_id' => $steel->id, 'batch_number' => 'RMB-0002',
            'quantity' => 300, 'quantity_remaining' => 300, 'received_at' => now()->subDay(),
        ]);
        $steel->increment('quantity_on_hand', $batch1->quantity + $batch2->quantity);

        SemiFinishedProduct::create([
            'name' => 'Steel Rods', 'sku' => 'SF-ROD-001', 'unit' => 'kg', 'quantity_on_hand' => 0,
        ]);

        FinishedProduct::create([
            'name' => 'Steel Pipes', 'sku' => 'FP-PIPE-001', 'unit' => 'kg', 'quantity_on_hand' => 0,
        ]);
    }
}
