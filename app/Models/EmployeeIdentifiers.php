<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EmployeeIdentifiers extends Model
{
    protected $table = 'employee_identifiers';
    protected $primaryKey = 'employee_id';
    public $incrementing = false;

    protected $fillable = [
        'employee_id',
        'social_security_number',
        'national_id_number',
        'itin',
        'paychex_id'
    ];

    public function employee(): BelongsTo
    {
        return $this->belongsTo(Employee::class);
    }
}
