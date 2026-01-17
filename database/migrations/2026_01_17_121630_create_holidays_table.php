<?php
// database/migrations/2026_01_17_000002_create_holidays_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('holidays', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->integer('month');
            $table->integer('day')->nullable();
            $table->string('calculation_rule')->nullable();
            $table->boolean('is_federal')->default(true);
            $table->boolean('is_active')->default(true);
            $table->string('color', 7)->default('#6366f1');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('holidays');
    }
};
