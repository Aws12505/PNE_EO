<?php

namespace App\Http\Controllers;

use App\Http\Requests\EmployeeImportRequest;
use App\Imports\EmployeesFullImport;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Redirect;
use Inertia\Inertia;
use Maatwebsite\Excel\Facades\Excel;
use Symfony\Component\HttpFoundation\StreamedResponse;

class EmployeeImportController extends Controller
{
    public function create()
    {
        return Inertia::render('Employees/Import', [
            // you can pass anything else you want here (like sample headers)
        ]);
    }

    public function store(EmployeeImportRequest $request)
    {
        $file = $request->file('file');

        $import = new EmployeesFullImport();
        // Wrap the whole import in a transaction if you want "all-or-nothing".
        // If you prefer "best effort" (import what can be imported), do NOT use a single transaction here.
        DB::beginTransaction();
        try {
            Excel::import($import, $file);

            // If any row failed and you want to rollback everything:
            if ($import->hasFailures()) {
                DB::rollBack();
                return Redirect::back()->with([
                    'import_result' => [
                        'ok' => false,
                        'message' => 'Import failed. No rows were saved.',
                        'summary' => $import->summary(),
                        'failures' => $import->failures(), // array
                    ],
                ]);
            }

            DB::commit();

            return redirect()
                ->route('employees.index')
                ->with([
                    'import_result' => [
                        'ok' => true,
                        'message' => 'Import completed successfully.',
                        'summary' => $import->summary(),
                    ],
                ]);
        } catch (\Throwable $e) {
            DB::rollBack();

            return Redirect::back()->with([
                'import_result' => [
                    'ok' => false,
                    'message' => 'Import crashed: ' . $e->getMessage(),
                    'summary' => $import->summary(),
                ],
            ]);
        }
    }

    public function template(): StreamedResponse
    {
        $filename = 'employees_import_template.csv';

        // Headings must match what your importer expects.
        $headers = [
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

        // Provide 1–2 example rows (optional but helpful)
        $exampleRows = [
            [
                '',
                'John',
                '',
                'Doe',
                'Johnny',
                'Active',
                'Team lead for inventory',
                'S-001',
                '',
                '2024-06-10',
                '1990-01-15',
                'Male',
                'Married',
                '0',
                '',
                '',
                '',
                '',
                'john.doe@company.com',
                '+15551234567',
                '123 Main St',
                '',
                'New York',
                'NY',
                'USA',
                '10001',
                'Manager|Full Time'
            ],
            [
                '',
                'Jane',
                'A.',
                'Smith',
                '',
                'Onboarding',
                'New hire - training',
                '',
                'Downtown Store',
                '2025-01-05',
                '',
                'Female',
                'Single',
                '0',
                '',
                '',
                '',
                '',
                'jane.smith@company.com',
                '',
                '45 Park Ave',
                'Apt 2B',
                'New York',
                'NY',
                'USA',
                '10016',
                'Seasonal'
            ],
        ];

        return response()->streamDownload(function () use ($headers, $exampleRows) {
            $out = fopen('php://output', 'w');

            // Excel plays nicer with UTF-8 BOM sometimes
            fprintf($out, chr(0xEF) . chr(0xBB) . chr(0xBF));

            fputcsv($out, $headers);

            foreach ($exampleRows as $row) {
                fputcsv($out, $row);
            }

            fclose($out);
        }, $filename, [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Cache-Control' => 'no-store, no-cache, must-revalidate, max-age=0',
        ]);
    }
}
