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
        Schema::create('finished_batch_semi_finished', function (Blueprint $table) {
            $table->id();
            $table->foreignId('finished_batch_id')->constrained()->cascadeOnDelete();
            $table->foreignId('semi_finished_batch_id')->constrained()->cascadeOnDelete();
            $table->decimal('quantity_consumed', 14, 3);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('finished_batch_semi_finished');
    }
};
