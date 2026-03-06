import { PageShell } from '@/components/page-shell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import employees from '@/routes/employees';
import employeesImport from '@/routes/employees/import';
import type { BreadcrumbItem } from '@/types';
import { Link, router, usePage } from '@inertiajs/react';
import { useMemo, useState } from 'react';

type ImportResult = {
    ok: boolean;
    message: string;
    summary?: { created: number; updated: number; failed: number };
    failures?: { row: number; error: string }[];
};

export default function Import() {
    const { import_result } = usePage<{ import_result?: ImportResult }>().props;

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Employees', href: employees.index().url },
        { title: 'Import', href: employeesImport.create().url },
    ];

    const [file, setFile] = useState<File | null>(null);
    const canSubmit = useMemo(() => !!file, [file]);

    const submit = () => {
        if (!file) return;

        const form = new FormData();
        form.append('file', file);

        router.post(employeesImport.store().url, form, {
            forceFormData: true,
            preserveScroll: true,
        });
    };

    return (
        <PageShell title="Import Employees" breadcrumbs={breadcrumbs}>
            <div className="space-y-2">
                <h1 className="text-xl font-semibold">Import Employees</h1>
                <p className="text-sm text-muted-foreground">
                    Upload a CSV or Excel file (.csv, .xlsx). Status and tags
                    should be names, not IDs.
                </p>
            </div>

            <div className="mt-4 space-y-4 rounded-lg border p-4">
                <div className="space-y-2">
                    <Label>File</Label>
                    <Input
                        type="file"
                        accept=".csv,.xlsx,.xls"
                        onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                    />
                    <p className="text-xs text-muted-foreground">
                        Tip: use the template columns shown below.
                    </p>
                </div>

                <div className="flex gap-2">
                    <Button
                        type="button"
                        onClick={submit}
                        disabled={!canSubmit}
                    >
                        Upload & Import
                    </Button>

                    <Button variant="outline" asChild>
                        <a href={employeesImport.template().url}>
                            Download CSV template
                        </a>
                    </Button>

                    <Button variant="outline" asChild>
                        <Link href={employees.index().url}>Back</Link>
                    </Button>
                </div>

                {import_result && (
                    <div className="space-y-2 rounded-md border p-3 text-sm">
                        <div className="font-medium">
                            {import_result.ok ? '✅' : '❌'}{' '}
                            {import_result.message}
                        </div>

                        {import_result.summary && (
                            <div className="text-muted-foreground">
                                Created: {import_result.summary.created} •
                                Updated: {import_result.summary.updated} •
                                Failed: {import_result.summary.failed}
                            </div>
                        )}

                        {!!import_result.failures?.length && (
                            <div className="space-y-1">
                                <div className="font-medium">Failures</div>
                                <ul className="list-disc pl-5 text-muted-foreground">
                                    {import_result.failures
                                        .slice(0, 10)
                                        .map((f, idx) => (
                                            <li key={idx}>
                                                Row {f.row}: {f.error}
                                            </li>
                                        ))}
                                </ul>
                                {import_result.failures.length > 10 && (
                                    <div className="text-muted-foreground">
                                        Showing first 10 failures.
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}

                <div className="overflow-auto rounded-md bg-muted p-3 text-xs">
                    <div className="mb-2 font-medium">
                        Expected columns (heading row)
                    </div>
                    <pre className="whitespace-pre">
                        employee_id (optional), first_name, middle_name,
                        last_name, preferred_name, status, about_me,
                        store_manual_id (optional), store_name (optional),
                        hiring_date, date_of_birth, gender, marital_status,
                        veteran_status, social_security_number,
                        national_id_number, itin, paychex_id, work_email,
                        work_phone, address_line1, address_line2, city, state,
                        country, postal_code, tags
                    </pre>
                </div>
            </div>
        </PageShell>
    );
}
