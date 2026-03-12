import { PageShell } from '@/components/page-shell';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { dashboard } from '@/routes';
import employees from '@/routes/employees';
import employeesImport from '@/routes/employees/import';
import type { BreadcrumbItem } from '@/types';
import { Link, router, usePage } from '@inertiajs/react';
import { useEffect, useMemo, useState } from 'react';

type EmployeeStatus = { id: number; value: string };
type Tag = { id: number; tag_name: string };

type Store = { id: number; name: string; manual_id: string };

type Employment = {
    store_id?: number | null;
    store?: Store | null;
};

type EmployeeRow = {
    id: number;
    first_name: string;
    middle_name?: string | null;
    last_name: string;
    preferred_name?: string | null;
    status?: EmployeeStatus | null;
    tags?: Tag[];
    employment?: Employment | null;
};

type Pagination<T> = {
    data: T[];
    links: { url: string | null; label: string; active: boolean }[];
    total: number;
};

type Filters = {
    search?: string;
    status_id?: number | null;
    tag_id?: number | null;
    store_id?: number | null;
};

const ALL = 'all';

export default function Index() {
    const {
        employees: paged,
        statuses,
        tags,
        stores,
        filters,
    } = usePage<{
        employees: Pagination<EmployeeRow>;
        statuses: EmployeeStatus[];
        tags: Tag[];
        stores: Store[];
        filters: Filters;
    }>().props;

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: dashboard().url },
        { title: 'Employees', href: employees.index().url },
    ];

    const [search, setSearch] = useState(filters.search ?? '');
    const [statusId, setStatusId] = useState<string>(
        filters.status_id ? String(filters.status_id) : ALL,
    );
    const [tagId, setTagId] = useState<string>(
        filters.tag_id ? String(filters.tag_id) : ALL,
    );
    const [storeId, setStoreId] = useState<string>(
        filters.store_id ? String(filters.store_id) : ALL,
    );

    const query = useMemo(() => {
        const q: Record<string, any> = {};
        if (search.trim()) q.search = search.trim();
        if (statusId !== ALL) q.status_id = statusId;
        if (tagId !== ALL) q.tag_id = tagId;
        if (storeId !== ALL) q.store_id = storeId;
        return q;
    }, [search, statusId, tagId, storeId]);

    useEffect(() => {
        const t = setTimeout(() => {
            router.get(employees.index().url, query, {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            });
        }, 250);

        return () => clearTimeout(t);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [query]);

    const clearFilters = () => {
        setSearch('');
        setStatusId(ALL);
        setTagId(ALL);
        setStoreId(ALL);

        router.get(
            employees.index().url,
            {},
            { preserveState: true, replace: true },
        );
    };

    return (
        <PageShell title="Employees" breadcrumbs={breadcrumbs}>
            <div className="flex items-center justify-between gap-2">
                <div>
                    <h1 className="text-xl font-semibold">Employees</h1>
                    <p className="text-sm text-muted-foreground">
                        Total: {paged.total}
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <Button variant="outline" asChild>
                        <Link href={employeesImport.create().url}>
                            Import/Export
                        </Link>
                    </Button>

                    <Button asChild>
                        <Link href={employees.create().url}>
                            Create Employee
                        </Link>
                    </Button>
                </div>
            </div>

            {/* Filters */}
            <div className="mt-4 rounded-lg border p-4">
                <div className="grid gap-4 md:grid-cols-3">
                    <div className="space-y-2">
                        <Label>Search</Label>
                        <Input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Name / preferred name…"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Status</Label>
                        <Select value={statusId} onValueChange={setStatusId}>
                            <SelectTrigger>
                                <SelectValue placeholder="Any status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value={ALL}>Any</SelectItem>
                                {statuses.map((s) => (
                                    <SelectItem key={s.id} value={String(s.id)}>
                                        {s.value}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label>Tag</Label>
                        <Select value={tagId} onValueChange={setTagId}>
                            <SelectTrigger>
                                <SelectValue placeholder="Any tag" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value={ALL}>Any</SelectItem>
                                {tags.map((t) => (
                                    <SelectItem key={t.id} value={String(t.id)}>
                                        {t.tag_name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2 md:col-span-3">
                        <Label>Store</Label>
                        <Select value={storeId} onValueChange={setStoreId}>
                            <SelectTrigger>
                                <SelectValue placeholder="Any store" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value={ALL}>Any</SelectItem>
                                {stores.map((s) => (
                                    <SelectItem key={s.id} value={String(s.id)}>
                                        {s.name} (#{s.manual_id})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="mt-4 flex gap-2">
                    <Button
                        variant="outline"
                        type="button"
                        onClick={clearFilters}
                    >
                        Clear
                    </Button>
                </div>
            </div>

            <div className="mt-4 rounded-lg border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Preferred</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Employment</TableHead>
                            <TableHead>Tags</TableHead>
                            <TableHead className="w-[1%] text-right">
                                Actions
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {paged.data.map((e) => {
                            const fullName = [
                                e.first_name,
                                e.middle_name,
                                e.last_name,
                            ]
                                .filter(Boolean)
                                .join(' ');

                            const storeName = e.employment?.store?.name ?? null;
                            const storeManual =
                                e.employment?.store?.manual_id ?? null;

                            return (
                                <TableRow key={e.id}>
                                    <TableCell className="font-medium">
                                        {fullName}
                                    </TableCell>
                                    <TableCell>
                                        {e.preferred_name ?? '—'}
                                    </TableCell>
                                    <TableCell>
                                        {e.status?.value ? (
                                            <Badge variant="secondary">
                                                {e.status.value}
                                            </Badge>
                                        ) : (
                                            '—'
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        {storeName ? (
                                            <span className="text-sm">
                                                {storeName}
                                                {storeManual
                                                    ? ` • #${storeManual}`
                                                    : ''}
                                            </span>
                                        ) : (
                                            '—'
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-wrap gap-1">
                                            {(e.tags ?? []).length
                                                ? (e.tags ?? []).map((t) => (
                                                      <Badge
                                                          key={t.id}
                                                          variant="outline"
                                                      >
                                                          {t.tag_name}
                                                      </Badge>
                                                  ))
                                                : '—'}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                asChild
                                            >
                                                <Link
                                                    href={employees.show(e).url}
                                                >
                                                    View
                                                </Link>
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                asChild
                                            >
                                                <Link
                                                    href={employees.edit(e).url}
                                                >
                                                    Edit
                                                </Link>
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            );
                        })}

                        {paged.data.length === 0 && (
                            <TableRow>
                                <TableCell
                                    colSpan={6}
                                    className="py-10 text-center text-sm text-muted-foreground"
                                >
                                    No employees found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
                {paged.links.map((l, idx) => (
                    <Button
                        key={idx}
                        variant={l.active ? 'default' : 'outline'}
                        size="sm"
                        asChild
                        disabled={!l.url}
                    >
                        <Link href={l.url ?? '#'} preserveScroll preserveState>
                            <span
                                dangerouslySetInnerHTML={{ __html: l.label }}
                            />
                        </Link>
                    </Button>
                ))}
            </div>
        </PageShell>
    );
}
