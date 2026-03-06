<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class EmployeeStoreRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            // Employee (DB: required)
            'first_name' => ['required', 'string', 'max:100'],
            'middle_name' => ['nullable', 'string', 'max:100'],
            'last_name' => ['required', 'string', 'max:100'],
            'preferred_name' => ['nullable', 'string', 'max:100'],
            'employee_status_id' => ['required', 'exists:employee_statuses,id'],
            'about_me' => ['nullable', 'string'],

            // hasOne: employment (DB allows nulls)
            'employment' => ['nullable', 'array'],
            'employment.store_id' => ['nullable', 'integer', 'exists:stores,id'],
            'employment.hiring_date' => ['nullable', 'date'],

            // hasOne: demographics (DB enums)
            'demographics' => ['nullable', 'array'],
            'demographics.date_of_birth' => ['nullable', 'date'],
            'demographics.gender' => ['nullable', Rule::in(['Male', 'Female'])],
            'demographics.marital_status' => ['nullable', Rule::in(['Single', 'Divorced', 'Married', 'Widowed'])],
            'demographics.veteran_status' => ['nullable', 'boolean'],

            // hasOne: identifiers (DB allows nulls)
            'identifiers' => ['nullable', 'array'],
            'identifiers.social_security_number' => ['nullable', 'string', 'max:25'],
            'identifiers.national_id_number' => ['nullable', 'string', 'max:50'],
            'identifiers.itin' => ['nullable', 'string', 'max:50'],
            'identifiers.paychex_id' => ['nullable', 'string', 'max:50'],
            // hasMany: contacts (DB enum + NOT NULL fields)
            'contacts' => ['nullable', 'array'],
            'contacts.*.id' => ['nullable', 'integer', 'exists:employee_contacts,id'],
            'contacts.*.contact_type' => [
                'required_with:contacts.*.contact_value',
                'nullable',
                Rule::in(['work_email', 'work_phone']),
            ],
            'contacts.*.contact_value' => ['required_with:contacts.*.contact_type', 'nullable', 'string', 'max:255'],
            'contacts.*.is_primary' => ['nullable', 'boolean'],

            // hasMany: addresses (DB requires many NOT NULL fields; enum is only "present")
            'addresses' => ['nullable', 'array'],
            'addresses.*.id' => ['nullable', 'integer', 'exists:employee_addresses,id'],
            'addresses.*.address_type' => ['required_with:addresses.*.address_line1', 'nullable', Rule::in(['present'])],

            // If you start an address row (line1 present), require the DB-required fields.
            'addresses.*.address_line1' => ['required_with:addresses.*.address_type', 'nullable', 'string', 'max:255'],
            'addresses.*.address_line2' => ['nullable', 'string', 'max:255'],
            'addresses.*.city' => ['required_with:addresses.*.address_line1', 'nullable', 'string', 'max:100'],
            'addresses.*.state' => ['required_with:addresses.*.address_line1', 'nullable', 'string', 'max:100'],
            'addresses.*.country' => ['required_with:addresses.*.address_line1', 'nullable', 'string', 'max:100'],
            'addresses.*.postal_code' => ['required_with:addresses.*.address_line1', 'nullable', 'string', 'max:30'],

            // tags (pivot)
            'tag_ids' => ['nullable', 'array'],
            'tag_ids.*' => ['integer', 'exists:tags,id'],
        ];
    }

    protected function prepareForValidation(): void
    {
        // Normalize tag_ids if it arrives as a single string
        if (is_string($this->input('tag_ids'))) {
            $this->merge([
                'tag_ids' => array_values(array_filter(explode(',', $this->input('tag_ids')))),
            ]);
        }
    }
}
