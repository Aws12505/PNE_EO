<?php

namespace App\Exports;

use App\Models\Employee;
use Maatwebsite\Excel\Concerns\FromQuery;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithHeadings;

class EmployeesFullExport implements FromQuery, WithMapping, WithHeadings
{
    public function query()
    {
        return Employee::query()->with([
            'status',
            'employment.store',
            'demographics',
            'identifiers',
            'contacts',
            'addresses',
            'tags',
        ]);
    }

    public function map($employee): array
    {
        $employment = $employee->employment;
        $store = $employment?->store;

        $demographics = $employee->demographics;
        $identifiers = $employee->identifiers;

        $email = $employee->contacts->firstWhere('contact_type', 'work_email');
        $phone = $employee->contacts->firstWhere('contact_type', 'work_phone');

        $address = $employee->addresses->firstWhere('address_type', 'present');

        $tags = $employee->tags
            ->pluck('tag_name')
            ->implode('|');

        return [
            $employee->id,
            $employee->first_name,
            $employee->middle_name,
            $employee->last_name,
            $employee->preferred_name,
            $employee->status?->value,
            $employee->about_me,

            $store?->manual_id,
            $store?->name,
            $employment?->hiring_date?->toDateString(),

            $demographics?->date_of_birth?->toDateString(),
            $demographics?->gender,
            $demographics?->marital_status,
            $demographics?->veteran_status ? '1' : '0',

            $identifiers?->social_security_number,
            $identifiers?->national_id_number,
            $identifiers?->itin,
            $identifiers?->paychex_id,

            $email?->contact_value,
            $phone?->contact_value,

            $address?->address_line1,
            $address?->address_line2,
            $address?->city,
            $address?->state,
            $address?->country,
            $address?->postal_code,

            $tags,
        ];
    }

    public function headings(): array
    {
        return [
            'employee_id',
            'first_name',
            'middle_name',
            'last_name',
            'preferred_name',
            'status',
            'about_me',
            'store_manual_id',
            'store_name',
            'hiring_date',
            'date_of_birth',
            'gender',
            'marital_status',
            'veteran_status',
            'social_security_number',
            'national_id_number',
            'itin',
            'paychex_id',
            'work_email',
            'work_phone',
            'address_line1',
            'address_line2',
            'city',
            'state',
            'country',
            'postal_code',
            'tags',
        ];
    }
}