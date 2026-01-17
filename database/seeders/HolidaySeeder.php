<?php
// database/seeders/HolidaySeeder.php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class HolidaySeeder extends Seeder
{
    public function run(): void
    {
        $now = Carbon::now();

        $holidays = [
            ['name' => 'New Year\'s Day', 'month' => 1, 'day' => 1, 'calculation_rule' => null],
            ['name' => 'Martin Luther King Jr. Day', 'month' => 1, 'day' => null, 'calculation_rule' => 'third_monday_january'],
            ['name' => 'Presidents\' Day', 'month' => 2, 'day' => null, 'calculation_rule' => 'third_monday_february'],
            ['name' => 'Memorial Day', 'month' => 5, 'day' => null, 'calculation_rule' => 'last_monday_may'],
            ['name' => 'Juneteenth', 'month' => 6, 'day' => 19, 'calculation_rule' => null],
            ['name' => 'Independence Day', 'month' => 7, 'day' => 4, 'calculation_rule' => null],
            ['name' => 'Labor Day', 'month' => 9, 'day' => null, 'calculation_rule' => 'first_monday_september'],
            ['name' => 'Columbus Day', 'month' => 10, 'day' => null, 'calculation_rule' => 'second_monday_october'],
            ['name' => 'Veterans Day', 'month' => 11, 'day' => 11, 'calculation_rule' => null],
            ['name' => 'Thanksgiving Day', 'month' => 11, 'day' => null, 'calculation_rule' => 'fourth_thursday_november'],
            ['name' => 'Christmas Day', 'month' => 12, 'day' => 25, 'calculation_rule' => null],
        ];

        foreach ($holidays as $holiday) {
            DB::table('holidays')->insert([...$holiday, 'is_federal' => true, 'is_active' => true, 'color' => '#6366f1', 'created_at' => $now, 'updated_at' => $now]);
        }
    }
}
