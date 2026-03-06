<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('employee_identifiers', function (Blueprint $table) {
            $table->string('paychex_id')->nullable()->after('itin');
            $table->unique('paychex_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('employee_identifiers', function (Blueprint $table) {
            $table->dropUnique(['paychex_id']);
            $table->dropColumn('paychex_id');
        });
    }
};
