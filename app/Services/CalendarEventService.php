<?php
// app/Services/CalendarEventService.php

namespace App\Services;

use App\Models\Employee;
use App\Models\MilestoneTemplate;
use App\Models\Holiday;
use App\Models\CustomEvent;
use Carbon\Carbon;

class CalendarEventService
{
    public function generateEventsForDateRange(Carbon $startDate, Carbon $endDate): array
    {
        $events = [];
        $events = array_merge($events, $this->generateEmployeeMilestones($startDate, $endDate));
        $events = array_merge($events, $this->generateHolidayEvents($startDate, $endDate));
        $events = array_merge($events, $this->generateCustomEvents($startDate, $endDate));
        usort($events, fn($a, $b) => strcmp($a['date'], $b['date']));
        return $events;
    }

    private function generateEmployeeMilestones(Carbon $startDate, Carbon $endDate): array
    {
        $events = [];
        $employees = Employee::with(['employment', 'demographics'])->get();
        $birthdayTemplates = MilestoneTemplate::where('milestone_type', 'birthday')->where('is_active', true)->orderBy('sort_order')->get();
        $hiringTemplates = MilestoneTemplate::where('milestone_type', 'hiring_anniversary')->where('is_active', true)->orderBy('sort_order')->get();

        foreach ($employees as $employee) {
            $displayName = $this->getEmployeeDisplayName($employee);

            // Birthday events (show every year)
            if ($employee->demographics?->date_of_birth) {
                $dob = Carbon::parse($employee->demographics->date_of_birth);
                foreach ($birthdayTemplates as $template) {
                    $occurrences = $this->generateMilestoneOccurrences($dob, $template, $startDate, $endDate);
                    foreach ($occurrences as $occurrence) {
                        $age = (int) $occurrence->year - (int) $dob->year;
                        $events[] = [
                            'id' => "birthday-{$employee->id}-{$occurrence->format('Y-m-d')}",
                            'employee_id' => $employee->id,
                            'date' => $occurrence->toDateString(),
                            'name' => "{$displayName} turns {$age}",
                            'type' => 'birthday',
                            'color' => '#22c55e',
                        ];
                    }
                }
            }

            // ✅ FIXED: Anniversary events - only show the highest milestone achieved per year
            if ($employee->employment?->hiring_date) {
                $hireDate = Carbon::parse($employee->employment->hiring_date);

                // Group all anniversaries by date, then pick the highest milestone for each date
                $anniversariesByDate = [];

                foreach ($hiringTemplates as $template) {
                    $occurrences = $this->generateAllMilestoneOccurrences($hireDate, $template, $startDate, $endDate);

                    foreach ($occurrences as $occurrence) {
                        if ($occurrence->isSameDay($hireDate)) continue;

                        $dateKey = $occurrence->toDateString();
                        $yearsSince = $hireDate->diffInYears($occurrence);

                        // Store the milestone with the highest years for each date
                        if (!isset($anniversariesByDate[$dateKey]) || $yearsSince > $anniversariesByDate[$dateKey]['years']) {
                            $anniversariesByDate[$dateKey] = [
                                'occurrence' => $occurrence,
                                'years' => $yearsSince,
                                'template' => $template,
                            ];
                        }
                    }
                }

                // Now create events from the highest milestones
                foreach ($anniversariesByDate as $anniversary) {
                    $timeText = $this->calculateTimeText($hireDate, $anniversary['occurrence']);

                    $events[] = [
                        'id' => "anniversary-{$employee->id}-{$anniversary['occurrence']->format('Y-m-d')}",
                        'employee_id' => $employee->id,
                        'date' => $anniversary['occurrence']->toDateString(),
                        'name' => "{$displayName} • {$timeText} with us",
                        'type' => 'anniversary',
                        'color' => '#3b82f6',
                    ];
                }
            }
        }

        return $events;
    }

    // ✅ NEW: Generate ALL occurrences for a template (every matching year)
    private function generateAllMilestoneOccurrences(Carbon $baseDate, MilestoneTemplate $template, Carbon $startDate, Carbon $endDate): array
    {
        $occurrences = [];

        if ($template->unit === 'years') {
            // For yearly templates, generate occurrences for every year that matches
            for ($year = (int) $startDate->year; $year <= (int) $endDate->year; $year++) {
                $anniversaryDate = Carbon::create($year, $baseDate->month, $baseDate->day)->startOfDay();

                if (!$anniversaryDate->between($startDate, $endDate)) continue;
                if ($anniversaryDate->lessThan($baseDate)) continue;

                $yearsSince = $baseDate->diffInYears($anniversaryDate);

                // Add if this year matches the template pattern
                if ($yearsSince > 0 && $yearsSince % $template->value === 0) {
                    $occurrences[] = $anniversaryDate;
                }
            }
        } else {
            // For non-yearly milestones (days, weeks, months)
            $current = $baseDate->copy();

            $current = match ($template->unit) {
                'days' => $current->addDays($template->value),
                'weeks' => $current->addWeeks($template->value),
                'months' => $current->addMonths($template->value),
            };

            if ($current->between($startDate, $endDate)) {
                $occurrences[] = $current;
            }
        }

        return $occurrences;
    }

    // ✅ KEPT: Original method for birthdays (still needed)
    private function generateMilestoneOccurrences(Carbon $baseDate, MilestoneTemplate $template, Carbon $startDate, Carbon $endDate): array
    {
        $occurrences = [];

        if ($template->unit === 'years') {
            for ($year = (int) $startDate->year; $year <= (int) $endDate->year; $year++) {
                $anniversaryDate = Carbon::create($year, $baseDate->month, $baseDate->day)->startOfDay();

                if (!$anniversaryDate->between($startDate, $endDate)) continue;
                if ($anniversaryDate->lessThan($baseDate)) continue;

                $yearsSince = $baseDate->diffInYears($anniversaryDate);

                if ($yearsSince > 0 && $yearsSince % $template->value === 0) {
                    $occurrences[] = $anniversaryDate;
                }
            }
        } else {
            $current = $baseDate->copy();

            $current = match ($template->unit) {
                'days' => $current->addDays($template->value),
                'weeks' => $current->addWeeks($template->value),
                'months' => $current->addMonths($template->value),
            };

            if ($current->between($startDate, $endDate)) {
                $occurrences[] = $current;
            }
        }

        return $occurrences;
    }

    // ✅ NEW: Calculate the actual time since hire
    private function calculateTimeText(Carbon $hireDate, Carbon $occurrence): string
    {
        $diff = $hireDate->diff($occurrence);

        $years = $diff->y;
        $months = $diff->m;
        $weeks = floor($diff->days / 7);
        $days = $diff->days;

        // Prioritize years
        if ($years > 0) {
            return $years === 1 ? '1 year' : "{$years} years";
        }

        // Then months
        if ($months > 0) {
            return $months === 1 ? '1 month' : "{$months} months";
        }

        // Then weeks
        if ($weeks > 0) {
            return $weeks === 1 ? '1 week' : "{$weeks} weeks";
        }

        // Finally days
        return $days === 1 ? '1 day' : "{$days} days";
    }

    private function generateHolidayEvents(Carbon $startDate, Carbon $endDate): array
    {
        $events = [];
        $holidays = Holiday::where('is_active', true)->get();

        for ($year = (int) $startDate->year; $year <= (int) $endDate->year; $year++) {
            foreach ($holidays as $holiday) {
                $holidayDate = $holiday->getDateForYear($year);
                if ($holidayDate->between($startDate, $endDate)) {
                    $events[] = [
                        'id' => "holiday-{$holiday->id}-{$year}",
                        'employee_id' => null,
                        'date' => $holidayDate->toDateString(),
                        'name' => $holiday->name,
                        'type' => 'holiday',
                        'color' => $holiday->color,
                        'holiday_id' => $holiday->id,
                    ];
                }
            }
        }

        return $events;
    }

    private function generateCustomEvents(Carbon $startDate, Carbon $endDate): array
    {
        $events = [];
        $customEvents = CustomEvent::with('employee')->get();

        foreach ($customEvents as $customEvent) {
            $current = $startDate->copy();
            while ($current->lessThanOrEqualTo($endDate)) {
                if ($customEvent->occursOnDate($current)) {
                    $name = $customEvent->title;
                    if ($customEvent->employee_id) {
                        $employeeName = $this->getEmployeeDisplayName($customEvent->employee);
                        $name = "{$employeeName} • {$name}";
                    }
                    $events[] = [
                        'id' => "custom-{$customEvent->id}-{$current->format('Y-m-d')}",
                        'employee_id' => $customEvent->employee_id,
                        'date' => $current->toDateString(),
                        'name' => $name,
                        'type' => 'custom',
                        'color' => $customEvent->color,
                        'description' => $customEvent->description,
                        'notes' => $customEvent->notes,
                        'custom_event_id' => $customEvent->id,
                        'recurrence_type' => $customEvent->recurrence_type,
                        'event_time' => $customEvent->event_time, // ✅ ADD THIS
                        'recurrence_interval' => $customEvent->recurrence_interval, // ✅ ADD THIS
                        'recurrence_end_date' => $customEvent->recurrence_end_date?->toDateString(), // ✅ ADD THIS
                    ];
                }
                $current->addDay();
            }
        }

        return $events;
    }

    private function getEmployeeDisplayName(Employee $employee): string
    {
        $preferred = trim((string) ($employee->preferred_name ?? ''));
        if ($preferred !== '') return $preferred;
        $parts = array_filter([$employee->first_name, $employee->middle_name, $employee->last_name]);
        return trim(implode(' ', $parts));
    }
}
