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
        Schema::create('finished_batches', function (Blueprint $table) {
            $table->id();
            $table->foreignId('finished_product_id')->constrained()->cascadeOnDelete();
            $table->string('batch_number')->unique();
            $table->decimal('quantity', 14, 3);
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
        Schema::dropIfExists('finished_batches');
    }
};
