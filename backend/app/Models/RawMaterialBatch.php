<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RawMaterialBatch extends Model
{
    protected $fillable = ['raw_material_id', 'batch_number', 'quantity', 'quantity_remaining', 'received_at'];
    protected $casts = ['received_at' => 'datetime'];

    public function rawMaterial()
    {
        return $this->belongsTo(RawMaterial::class);
    }
}
