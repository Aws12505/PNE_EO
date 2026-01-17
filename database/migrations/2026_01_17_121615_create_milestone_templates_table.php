<?php
// database/migrations/2026_01_17_000001_create_milestone_templates_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('milestone_templates', function (Blueprint $table) {
            $table->id();
            $table->enum('milestone_type', ['birthday', 'hiring_anniversary']);
            $table->integer('value');
            $table->enum('unit', ['days', 'weeks', 'months', 'years']);
            $table->boolean('is_active')->default(true);
            $table->integer('sort_order')->default(0);
            $table->timestamps();

            $table->unique(['milestone_type', 'value', 'unit']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('milestone_templates');
    }
};
