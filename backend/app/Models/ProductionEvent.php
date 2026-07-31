<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProductionEvent extends Model
{
    protected $fillable = ['event_type', 'batch_type', 'batch_id', 'payload', 'processed_at'];
    protected $casts = ['payload' => 'array', 'processed_at' => 'datetime'];
}
