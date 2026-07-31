<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RawMaterial extends Model
{
    protected $fillable = ['name', 'sku', 'unit', 'quantity_on_hand'];

    public function batches()
    {
        return $this->hasMany(RawMaterialBatch::class);
    }
}
