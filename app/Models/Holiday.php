<?php
// app/Models/Holiday.php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

class Holiday extends Model
{
    protected $fillable = ['name', 'month', 'day', 'calculation_rule', 'is_federal', 'is_active', 'color'];

    protected $casts = [
        'is_federal' => 'boolean',
        'is_active' => 'boolean',
        'month' => 'integer',
        'day' => 'integer',
    ];

    public function getDateForYear(int $year): Carbon
    {
        if ($this->day !== null) {
            return Carbon::create($year, $this->month, $this->day)->startOfDay();
        }
        return $this->calculateHolidayDate($year);
    }

    private function calculateHolidayDate(int $year): Carbon
    {
        return match ($this->calculation_rule) {
            'third_monday_january' => $this->getNthWeekdayOfMonth($year, 1, Carbon::MONDAY, 3),
            'third_monday_february' => $this->getNthWeekdayOfMonth($year, 2, Carbon::MONDAY, 3),
            'last_monday_may' => $this->getLastWeekdayOfMonth($year, 5, Carbon::MONDAY),
            'first_monday_september' => $this->getNthWeekdayOfMonth($year, 9, Carbon::MONDAY, 1),
            'second_monday_october' => $this->getNthWeekdayOfMonth($year, 10, Carbon::MONDAY, 2),
            'fourth_thursday_november' => $this->getNthWeekdayOfMonth($year, 11, Carbon::THURSDAY, 4),
            default => Carbon::create($year, $this->month, 1),
        };
    }

    private function getNthWeekdayOfMonth(int $year, int $month, int $dayOfWeek, int $occurrence): Carbon
    {
        $date = Carbon::create($year, $month, 1)->startOfDay();
        while ($date->dayOfWeek !== $dayOfWeek) $date->addDay();
        $date->addWeeks($occurrence - 1);
        return $date;
    }

    private function getLastWeekdayOfMonth(int $year, int $month, int $dayOfWeek): Carbon
    {
        $date = Carbon::create($year, $month, 1)->endOfMonth()->startOfDay();
        while ($date->dayOfWeek !== $dayOfWeek) $date->subDay();
        return $date;
    }
}
