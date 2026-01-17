<?php
// database/seeders/MilestoneTemplateSeeder.php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class MilestoneTemplateSeeder extends Seeder
{
    public function run(): void
    {
        $now = Carbon::now();

        $templates = [
            ['milestone_type' => 'birthday', 'value' => 1, 'unit' => 'years', 'sort_order' => 1],
            ['milestone_type' => 'hiring_anniversary', 'value' => 2, 'unit' => 'weeks', 'sort_order' => 1],
            ['milestone_type' => 'hiring_anniversary', 'value' => 1, 'unit' => 'months', 'sort_order' => 2],
            ['milestone_type' => 'hiring_anniversary', 'value' => 2, 'unit' => 'months', 'sort_order' => 3],
            ['milestone_type' => 'hiring_anniversary', 'value' => 3, 'unit' => 'months', 'sort_order' => 4],
            ['milestone_type' => 'hiring_anniversary', 'value' => 6, 'unit' => 'months', 'sort_order' => 5],
            ['milestone_type' => 'hiring_anniversary', 'value' => 1, 'unit' => 'years', 'sort_order' => 6],
            ['milestone_type' => 'hiring_anniversary', 'value' => 2, 'unit' => 'years', 'sort_order' => 7],
            ['milestone_type' => 'hiring_anniversary', 'value' => 5, 'unit' => 'years', 'sort_order' => 8],
            ['milestone_type' => 'hiring_anniversary', 'value' => 10, 'unit' => 'years', 'sort_order' => 9],
        ];

        foreach ($templates as $template) {
            DB::table('milestone_templates')->insert([...$template, 'is_active' => true, 'created_at' => $now, 'updated_at' => $now]);
        }
    }
}
