<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\EmployeeStoreRequest;
use App\Http\Requests\EmployeeUpdateRequest;
use App\Models\Employee;
use App\Models\EmployeeStatus;
use App\Models\Store;
use App\Models\Tag;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class EmployeeController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->string('search')->toString();
        $statusId = $request->integer('status_id') ?: null;
        $tagId = $request->integer('tag_id') ?: null;
        $storeId = $request->integer('store_id') ?: null;

        $employees = Employee::query()
            ->with(['status', 'tags', 'employment.store'])
            ->when($search !== '', function ($q) use ($search) {
                $q->where(function ($qq) use ($search) {
                    $qq->where('first_name', 'like', "%{$search}%")
                        ->orWhere('middle_name', 'like', "%{$search}%")
                        ->orWhere('last_name', 'like', "%{$search}%")
                        ->orWhere('preferred_name', 'like', "%{$search}%");
                });
            })
            ->when($statusId, fn($q) => $q->where('employee_status_id', $statusId))
            ->when($tagId, function ($q) use ($tagId) {
                $q->whereHas('tags', fn($tq) => $tq->where('tags.id', $tagId));
            })
            ->when($storeId, function ($q) use ($storeId) {
                $q->whereHas('employment', fn($eq) => $eq->where('store_id', $storeId));
            })
            ->orderBy('last_name')
            ->orderBy('first_name')
            ->paginate(20)
            ->withQueryString();

        return response()->json([
            'data' => $employees,
            'meta' => [
                'statuses' => EmployeeStatus::orderBy('value')->get(['id', 'value']),
                'tags' => Tag::orderBy('tag_name')->get(['id', 'tag_name']),
                'stores' => Store::orderBy('name')->get(['id', 'name', 'manual_id']),
                'filters' => [
                    'search' => $search,
                    'status_id' => $statusId,
                    'tag_id' => $tagId,
                    'store_id' => $storeId,
                ],
            ],
        ]);
    }

    public function store(EmployeeStoreRequest $request)
    {
        $data = $request->validated();

        $employee = DB::transaction(function () use ($data) {
            $employee = Employee::create([
                'first_name' => $data['first_name'],
                'middle_name' => $data['middle_name'] ?? null,
                'last_name' => $data['last_name'],
                'preferred_name' => $data['preferred_name'] ?? null,
                'employee_status_id' => $data['employee_status_id'],
                'about_me' => $data['about_me'] ?? null,
            ]);

            $this->persistOneToOne($employee, $data);
            $this->persistHasMany($employee, $data);

            $employee->tags()->sync($data['tag_ids'] ?? []);

            return $employee->load([
                'status',
                'contacts',
                'employment.store',
                'demographics',
                'identifiers',
                'addresses',
                'tags',
            ]);
        });

        return response()->json([
            'message' => 'Employee created successfully',
            'data' => $employee,
        ], 201);
    }

    public function show(Employee $employee)
    {
        $employee->load([
            'status',
            'contacts',
            'employment.store',
            'demographics',
            'identifiers',
            'addresses',
            'tags',
            'expenses.expenseType',
        ]);

        return response()->json([
            'data' => $employee,
        ]);
    }

    public function update(EmployeeUpdateRequest $request, Employee $employee)
    {
        $data = $request->validated();

        DB::transaction(function () use ($employee, $data) {
            $employee->update([
                'first_name' => $data['first_name'],
                'middle_name' => $data['middle_name'] ?? null,
                'last_name' => $data['last_name'],
                'preferred_name' => $data['preferred_name'] ?? null,
                'employee_status_id' => $data['employee_status_id'],
                'about_me' => $data['about_me'] ?? null,
            ]);

            $this->persistOneToOne($employee, $data, true);
            $this->persistHasMany($employee, $data, true);

            $employee->tags()->sync($data['tag_ids'] ?? []);
        });

        return response()->json([
            'message' => 'Employee updated successfully',
            'data' => $employee->load([
                'status',
                'contacts',
                'employment.store',
                'demographics',
                'identifiers',
                'addresses',
                'tags',
            ]),
        ]);
    }

    public function destroy(Employee $employee)
    {
        DB::transaction(function () use ($employee) {
            // many-to-many
            $employee->tags()->detach();

            // hasMany
            $employee->contacts()->delete();
            $employee->addresses()->delete();
            $employee->expenses()->delete();

            // hasOne
            $employee->employment()->delete();
            $employee->demographics()->delete();
            $employee->identifiers()->delete();

            // finally delete employee
            $employee->delete();
        });

        return response()->json([
            'message' => 'Employee deleted successfully',
        ]);
    }

    private function persistOneToOne(Employee $employee, array $data, bool $isUpdate = false): void
    {
        if (array_key_exists('employment', $data)) {
            $payload = $data['employment'] ?? [];

            $payload = [
                'store_id' => $payload['store_id'] ?? null,
                'hiring_date' => $payload['hiring_date'] ?? null,
            ];

            if ($this->hasAnyFilled($payload)) {
                $employee->employment()->updateOrCreate(
                    ['employee_id' => $employee->id],
                    $payload
                );
            } elseif ($isUpdate) {
                $employee->employment()->delete();
            }
        }

        if (array_key_exists('demographics', $data)) {
            $payload = $data['demographics'] ?? [];

            $payload = [
                'date_of_birth' => $payload['date_of_birth'] ?? null,
                'gender' => $payload['gender'] ?? null,
                'marital_status' => $payload['marital_status'] ?? null,
                'veteran_status' => $payload['veteran_status'] ?? false,
            ];

            if ($this->hasAnyFilled($payload)) {
                $employee->demographics()->updateOrCreate(
                    ['employee_id' => $employee->id],
                    $payload
                );
            } elseif ($isUpdate) {
                $employee->demographics()->delete();
            }
        }

        if (array_key_exists('identifiers', $data)) {
            $payload = $data['identifiers'] ?? [];

            $payload = [
                'social_security_number' => $payload['social_security_number'] ?? null,
                'national_id_number' => $payload['national_id_number'] ?? null,
                'itin' => $payload['itin'] ?? null,
                'paychex_id' => $payload['paychex_id'] ?? null,
            ];

            if ($this->hasAnyFilled($payload)) {
                $employee->identifiers()->updateOrCreate(
                    ['employee_id' => $employee->id],
                    $payload
                );
            } elseif ($isUpdate) {
                $employee->identifiers()->delete();
            }
        }
    }

    private function persistHasMany(Employee $employee, array $data, bool $isUpdate = false): void
    {
        if (array_key_exists('contacts', $data)) {
            $items = $data['contacts'] ?? [];
            $keptIds = [];
            $primaryCandidateId = null;

            foreach ($items as $item) {
                if (!$this->hasAnyFilled($item)) {
                    continue;
                }

                $payload = [
                    'contact_type' => $item['contact_type'] ?? null,
                    'contact_value' => $item['contact_value'] ?? null,
                    'is_primary' => (bool) ($item['is_primary'] ?? false),
                ];

                if (!empty($item['id'])) {
                    $contact = $employee->contacts()->whereKey($item['id'])->first();
                    if ($contact) {
                        $contact->update($payload);
                        $keptIds[] = $contact->id;

                        if ($payload['is_primary'] && $primaryCandidateId === null) {
                            $primaryCandidateId = $contact->id;
                        }
                    }
                } else {
                    $contact = $employee->contacts()->create($payload);
                    $keptIds[] = $contact->id;

                    if ($payload['is_primary'] && $primaryCandidateId === null) {
                        $primaryCandidateId = $contact->id;
                    }
                }
            }

            if ($isUpdate) {
                $employee->contacts()->whereNotIn('id', $keptIds)->delete();
            }

            if (!empty($keptIds)) {
                $chosen = $primaryCandidateId ?? $keptIds[0];

                $employee->contacts()
                    ->whereIn('id', $keptIds)
                    ->update(['is_primary' => 0]);

                $employee->contacts()
                    ->whereKey($chosen)
                    ->update(['is_primary' => 1]);
            }
        }

        if (array_key_exists('addresses', $data)) {
            $items = $data['addresses'] ?? [];
            $keptIds = [];

            foreach ($items as $item) {
                if (!$this->hasAnyFilled($item)) {
                    continue;
                }

                $payload = [
                    'address_type' => $item['address_type'] ?? null,
                    'address_line1' => $item['address_line1'] ?? null,
                    'address_line2' => $item['address_line2'] ?? null,
                    'city' => $item['city'] ?? null,
                    'state' => $item['state'] ?? null,
                    'country' => $item['country'] ?? null,
                    'postal_code' => $item['postal_code'] ?? null,
                ];

                if (!empty($item['id'])) {
                    $address = $employee->addresses()->whereKey($item['id'])->first();
                    if ($address) {
                        $address->update($payload);
                        $keptIds[] = $address->id;
                    }
                } else {
                    $address = $employee->addresses()->create($payload);
                    $keptIds[] = $address->id;
                }
            }

            if ($isUpdate) {
                $employee->addresses()->whereNotIn('id', $keptIds)->delete();
            }
        }
    }

    private function hasAnyFilled(array $payload): bool
    {
        foreach ($payload as $k => $v) {
            if ($k === 'id')
                continue;

            if (is_bool($v)) {
                if ($v === true)
                    return true;
                continue;
            }

            if (is_string($v)) {
                $trim = trim($v);
                if ($trim === '' || $trim === '0') {
                    continue;
                }
                return true;
            }

            if ($v !== null && $v !== '')
                return true;
        }

        return false;
    }
}
