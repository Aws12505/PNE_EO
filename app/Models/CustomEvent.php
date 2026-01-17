<?php
// app/Models/CustomEvent.php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use Carbon\Carbon;

class CustomEvent extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'title',
        'description',
        'event_date',
        'event_time',
        'recurrence_type',
        'recurrence_end_date',
        'recurrence_interval',
        'employee_id',
        'color',
        'notes',
        'created_by',
    ];

    protected $casts = [
        'event_date' => 'date',
        'recurrence_end_date' => 'date',
        'recurrence_interval' => 'integer',
    ];

    public function employee(): BelongsTo
    {
        return $this->belongsTo(Employee::class);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function occursOnDate(Carbon $date): bool
    {
        $eventDate = Carbon::parse($this->event_date);

        if ($eventDate->isSameDay($date)) return true;
        if ($this->recurrence_type === 'none') return false;
        if ($date->lessThan($eventDate)) return false;
        if ($this->recurrence_end_date && $date->greaterThan($this->recurrence_end_date)) return false;

        return match ($this->recurrence_type) {
            'daily' => $eventDate->diffInDays($date) % $this->recurrence_interval === 0,
            'weekly' => $eventDate->dayOfWeek === $date->dayOfWeek && $eventDate->diffInWeeks($date) % $this->recurrence_interval === 0,
            'monthly' => $eventDate->day === $date->day && $eventDate->diffInMonths($date) % $this->recurrence_interval === 0,
            'yearly' => $eventDate->month === $date->month && $eventDate->day === $date->day && $eventDate->diffInYears($date) % $this->recurrence_interval === 0,
            default => false,
        };
    }
}
