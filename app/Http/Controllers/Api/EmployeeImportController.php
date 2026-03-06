<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\EmployeeImportRequest;
use App\Imports\EmployeesFullImport;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Response;
use Maatwebsite\Excel\Facades\Excel;
use Symfony\Component\HttpFoundation\StreamedResponse;

class EmployeeImportController extends Controller
{
    public function store(EmployeeImportRequest $request)
    {
        $file = $request->file('file');

        $import = new EmployeesFullImport();

        DB::beginTransaction();
        try {
            Excel::import($import, $file);

            if ($import->hasFailures()) {
                DB::rollBack();

                return response()->json([
                    'ok' => false,
                    'message' => 'Import failed. No rows were saved.',
                    'summary' => $import->summary(),
                    'failures' => $import->failures(),
                ], 422);
            }

            DB::commit();

            return response()->json([
                'ok' => true,
                'message' => 'Import completed successfully.',
                'summary' => $import->summary(),
            ], 200);

        } catch (\Throwable $e) {
            DB::rollBack();

            return response()->json([
                'ok' => false,
                'message' => 'Import crashed: ' . $e->getMessage(),
                'summary' => $import->summary(),
            ], 500);
        }
    }

    public function template(): StreamedResponse
    {
        $filename = 'employees_import_template.csv';

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

        $exampleRows = [
            [
                '',
                'John',
                '',
                'Doe',
                'Johnny',
                'Active',
                'Team lead',
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
        ];

        return response()->streamDownload(function () use ($headers, $exampleRows) {
            $out = fopen('php://output', 'w');

            fprintf($out, chr(0xEF) . chr(0xBB) . chr(0xBF));

            fputcsv($out, $headers);

            foreach ($exampleRows as $row) {
                fputcsv($out, $row);
            }

            fclose($out);
        }, $filename, [
            'Content-Type' => 'text/csv; charset=UTF-8',
        ]);
    }
}
