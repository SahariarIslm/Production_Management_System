<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('semi_finished_batch_raw_material', function (Blueprint $table) {
            $table->id();
            $table->foreignId('semi_finished_batch_id')->constrained()->cascadeOnDelete();
            $table->foreignId('raw_material_batch_id')->constrained()->cascadeOnDelete();
            $table->decimal('quantity_consumed', 14, 3);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('semi_finished_batch_raw_material');
    }
};
