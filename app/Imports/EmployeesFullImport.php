<?php

namespace App\Imports;

use App\Models\Employee;
use App\Models\EmployeeStatus;
use App\Models\Store;
use App\Models\Tag;
use Carbon\Carbon;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Maatwebsite\Excel\Concerns\ToCollection;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Maatwebsite\Excel\Concerns\SkipsEmptyRows;

class EmployeesFullImport implements ToCollection, WithHeadingRow, SkipsEmptyRows
{
    private array $failures = [];
    private int $created = 0;
    private int $updated = 0;

    public function collection(Collection $rows)
    {
        $rowNumber = 1; // heading row is row 1
        foreach ($rows as $row) {
            $rowNumber++;

            // normalize headings to array
            $data = $row->toArray();

            // Completely empty row?
            if ($this->isRowEmpty($data)) {
                continue;
            }

            try {
                $this->importRow($data);
            } catch (\Throwable $e) {
                $this->failures[] = [
                    'row' => $rowNumber,
                    'error' => $e->getMessage(),
                    'data' => $data,
                ];
            }
        }
    }

    public function hasFailures(): bool
    {
        return !empty($this->failures);
    }

    public function failures(): array
    {
        return $this->failures;
    }

    public function summary(): array
    {
        return [
            'created' => $this->created,
            'updated' => $this->updated,
            'failed' => count($this->failures),
        ];
    }

    private function importRow(array $data): void
    {
        // --- REQUIRED CORE FIELDS ---
        $firstName = $this->trimOrNull($data['first_name'] ?? null);
        $lastName = $this->trimOrNull($data['last_name'] ?? null);

        if (!$firstName || !$lastName) {
            throw new \RuntimeException("first_name and last_name are required.");
        }

        // Identify record:
        // Option A: if you include an employee_id column, update that record.
        // Option B: else create new always.
        $employeeId = $this->intOrNull($data['employee_id'] ?? null);

        // --- STATUS by VALUE (not id) ---
        $statusValue = $this->trimOrNull($data['status'] ?? null);
        if (!$statusValue) {
            throw new \RuntimeException("status is required (use the employee_statuses.value).");
        }

        $status = EmployeeStatus::query()
            ->whereRaw('LOWER(value) = ?', [mb_strtolower($statusValue)])
            ->first();

        if (!$status) {
            throw new \RuntimeException("Unknown status '{$statusValue}'. Create it first or fix the file.");
        }

        // --- create/update employee ---
        $employeePayload = [
            'first_name' => $firstName,
            'middle_name' => $this->trimOrNull($data['middle_name'] ?? null),
            'last_name' => $lastName,
            'preferred_name' => $this->trimOrNull($data['preferred_name'] ?? null),
            'employee_status_id' => $status->id,
            'about_me' => $this->trimOrNull($data['about_me'] ?? null),
        ];

        /** @var Employee $employee */
        if ($employeeId) {
            $employee = Employee::query()->find($employeeId);
            if (!$employee) {
                throw new \RuntimeException("employee_id {$employeeId} not found.");
            }
            $employee->update($employeePayload);
            $this->updated++;
        } else {
            $employee = Employee::create($employeePayload);
            $this->created++;
        }

        // --- employment (store by manual_id or store name) ---
        $storeManualId = $this->trimOrNull($data['store_manual_id'] ?? null);
        $storeName = $this->trimOrNull($data['store_name'] ?? null);

        $storeId = null;
        if ($storeManualId) {
            $storeId = Store::query()->where('manual_id', $storeManualId)->value('id');
            if (!$storeId) {
                throw new \RuntimeException("store_manual_id '{$storeManualId}' not found.");
            }
        } elseif ($storeName) {
            $storeId = Store::query()
                ->whereRaw('LOWER(name) = ?', [mb_strtolower($storeName)])
                ->value('id');

            if (!$storeId) {
                throw new \RuntimeException("store_name '{$storeName}' not found.");
            }
        }

        $hiringDate = $this->dateOrNull($data['hiring_date'] ?? null);

        // If either is present, upsert. If neither, delete (optional—here we delete to match your update rules).
        if ($storeId || $hiringDate) {
            $employee->employment()->updateOrCreate(
                ['employee_id' => $employee->id],
                ['store_id' => $storeId, 'hiring_date' => $hiringDate]
            );
        } else {
            $employee->employment()->delete();
        }

        // --- demographics ---
        $dob = $this->dateOrNull($data['date_of_birth'] ?? null);
        $gender = $this->trimOrNull($data['gender'] ?? null);
        $marital = $this->trimOrNull($data['marital_status'] ?? null);
        $veteran = $this->boolOrNull($data['veteran_status'] ?? null);

        $demoAny = $dob || $gender || $marital || ($veteran === true);
        if ($demoAny) {
            $employee->demographics()->updateOrCreate(
                ['employee_id' => $employee->id],
                [
                    'date_of_birth' => $dob,
                    'gender' => $gender,
                    'marital_status' => $marital,
                    'veteran_status' => $veteran ?? false,
                ]
            );
        } else {
            $employee->demographics()->delete();
        }

        // --- identifiers ---
        $ssn = $this->trimOrNull($data['social_security_number'] ?? null);
        $nid = $this->trimOrNull($data['national_id_number'] ?? null);
        $itin = $this->trimOrNull($data['itin'] ?? null);
        $paychexId = $this->trimOrNull($data['paychex_id'] ?? null);

        if ($ssn || $nid || $itin || $paychexId) {
            $employee->identifiers()->updateOrCreate(
                ['employee_id' => $employee->id],
                [
                    'social_security_number' => $ssn,
                    'national_id_number' => $nid,
                    'itin' => $itin,
                    'paychex_id' => $paychexId,
                ]
            );
        } else {
            $employee->identifiers()->delete();
        }

        // --- contacts (work_email + work_phone) ---
        // We normalize to exactly these two types. Primary will be email if present, else phone.
        $workEmail = $this->trimOrNull($data['work_email'] ?? null);
        $workPhone = $this->trimOrNull($data['work_phone'] ?? null);

        // Delete all existing contacts and recreate (simple + consistent)
        // If you want “smart merge”, we can do that too, but this is clean for imports.
        $employee->contacts()->delete();

        $contactIds = [];
        if ($workEmail) {
            $contactIds[] = $employee->contacts()->create([
                'contact_type' => 'work_email',
                'contact_value' => $workEmail,
                'is_primary' => true,
            ])->id;
        }
        if ($workPhone) {
            $contactIds[] = $employee->contacts()->create([
                'contact_type' => 'work_phone',
                'contact_value' => $workPhone,
                'is_primary' => $workEmail ? false : true,
            ])->id;
        }

        // --- address (present) ---
        $line1 = $this->trimOrNull($data['address_line1'] ?? null);
        $city = $this->trimOrNull($data['city'] ?? null);
        $state = $this->trimOrNull($data['state'] ?? null);
        $country = $this->trimOrNull($data['country'] ?? null);
        $postal = $this->trimOrNull($data['postal_code'] ?? null);

        // If line1 exists, require the rest (because your DB requires them).
        $employee->addresses()->delete();

        if ($line1) {
            if (!$city || !$state || !$country || !$postal) {
                throw new \RuntimeException("Address is missing required fields (city/state/country/postal_code).");
            }

            $employee->addresses()->create([
                'address_type' => 'present',
                'address_line1' => $line1,
                'address_line2' => $this->trimOrNull($data['address_line2'] ?? null),
                'city' => $city,
                'state' => $state,
                'country' => $country,
                'postal_code' => $postal,
            ]);
        }

        // --- tags by name (create missing tags) ---
        // Example input: "Manager|Full Time|Night Shift"
        $tagString = $this->trimOrNull($data['tags'] ?? null);
        if ($tagString) {
            $names = collect(preg_split('/[|,]/', $tagString))
                ->map(fn($t) => trim($t))
                ->filter()
                ->values();

            $tagIds = [];
            foreach ($names as $name) {
                $tag = Tag::query()->firstOrCreate(['tag_name' => $name]);
                $tagIds[] = $tag->id;
            }

            $employee->tags()->sync($tagIds);
        } else {
            $employee->tags()->sync([]);
        }
    }

    private function isRowEmpty(array $data): bool
    {
        foreach ($data as $v) {
            if (is_string($v) && trim($v) !== '')
                return false;
            if (is_numeric($v))
                return false;
            if (is_bool($v) && $v === true)
                return false;
            if ($v !== null && $v !== '')
                return false;
        }
        return true;
    }

    private function trimOrNull($v): ?string
    {
        if ($v === null)
            return null;
        $s = trim((string) $v);
        return $s === '' ? null : $s;
    }

    private function intOrNull($v): ?int
    {
        if ($v === null || $v === '')
            return null;
        if (!is_numeric($v))
            return null;
        return (int) $v;
    }

    private function boolOrNull($v): ?bool
    {
        if ($v === null || $v === '')
            return null;

        if (is_bool($v))
            return $v;

        $s = mb_strtolower(trim((string) $v));
        if (in_array($s, ['1', 'true', 'yes', 'y'], true))
            return true;
        if (in_array($s, ['0', 'false', 'no', 'n'], true))
            return false;

        return null;
    }

    private function dateOrNull($v): ?string
    {
        if ($v === null || $v === '')
            return null;

        // Excel may pass Carbon/DateTime-like values depending on driver;
        // safest: try parse
        try {
            return Carbon::parse($v)->toDateString();
        } catch (\Throwable) {
            return null;
        }
    }
}
