<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class FinishedBatch extends Model
{
    protected $fillable = ['finished_product_id', 'batch_number', 'quantity', 'status', 'produced_at'];
    protected $casts = ['produced_at' => 'datetime'];

    public function finishedProduct()
    {
        return $this->belongsTo(FinishedProduct::class);
    }

    // Traceability: semi-finished batches consumed to make this batch
    public function semiFinishedBatches()
    {
        return $this->belongsToMany(SemiFinishedBatch::class, 'finished_batch_semi_finished')
            ->withPivot('quantity_consumed')
            ->withTimestamps();
    }
}
