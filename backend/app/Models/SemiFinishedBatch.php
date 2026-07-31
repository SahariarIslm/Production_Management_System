<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SemiFinishedBatch extends Model
{
    protected $fillable = [
        'semi_finished_product_id', 'batch_number', 'quantity',
        'quantity_remaining', 'status', 'produced_at',
    ];
    protected $casts = ['produced_at' => 'datetime'];

    public function semiFinishedProduct()
    {
        return $this->belongsTo(SemiFinishedProduct::class);
    }

    // Traceability: raw material batches consumed to make this batch
    public function rawMaterialBatches()
    {
        return $this->belongsToMany(RawMaterialBatch::class, 'semi_finished_batch_raw_material')
            ->withPivot('quantity_consumed')
            ->withTimestamps();
    }
}
