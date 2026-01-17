<?php
// app/Models/DayNote.php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DayNote extends Model
{
    protected $fillable = ['note_date', 'content', 'created_by', 'updated_by'];
    protected $casts = ['note_date' => 'date'];

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function updater(): BelongsTo
    {
        return $this->belongsTo(User::class, 'updated_by');
    }
}
