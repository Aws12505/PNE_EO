<?php
// app/Models/MilestoneTemplate.php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MilestoneTemplate extends Model
{
    protected $fillable = ['milestone_type', 'value', 'unit', 'is_active', 'sort_order'];

    protected $casts = [
        'is_active' => 'boolean',
        'value' => 'integer',
        'sort_order' => 'integer',
    ];

    public function getDisplayNameAttribute(): string
    {
        $unitLabel = $this->value === 1 ? rtrim($this->unit, 's') : $this->unit;
        return "{$this->value} {$unitLabel}";
    }
}
