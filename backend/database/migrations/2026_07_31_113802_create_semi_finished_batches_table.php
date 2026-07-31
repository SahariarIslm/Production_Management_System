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
        Schema::create('semi_finished_batches', function (Blueprint $table) {
            $table->id();
            $table->foreignId('semi_finished_product_id')->constrained()->cascadeOnDelete();
            $table->string('batch_number')->unique();
            $table->decimal('quantity', 14, 3);            // output quantity produced
            $table->decimal('quantity_remaining', 14, 3)->default(0); // available for further consumption
            $table->enum('status', ['pending', 'completed', 'failed'])->default('pending');
            $table->timestamp('produced_at')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('semi_finished_batches');
    }
};
