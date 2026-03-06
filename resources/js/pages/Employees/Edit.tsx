import InputError from '@/components/input-error';
import { PageShell } from '@/components/page-shell';
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
import { Textarea } from '@/components/ui/textarea';
import { dashboard } from '@/routes';
import employees from '@/routes/employees';
import type { BreadcrumbItem } from '@/types';
import { Form, Link, usePage } from '@inertiajs/react';
import { useMemo, useState } from 'react';

type EmployeeStatus = { id: number; value: string };
type Tag = { id: number; tag_name: string };
type Store = { id: number; name: string; manual_id: string };

type Employment = {
    store_id?: number | null;
    hiring_date?: string | null;
};

type Demographics = {
    date_of_birth?: string | null;
    gender?: 'Male' | 'Female' | null;
    marital_status?: 'Single' | 'Divorced' | 'Married' | 'Widowed' | null;
    veteran_status?: boolean | null;
};

type Identifiers = {
    social_security_number?: string | null;
    national_id_number?: string | null;
    itin?: string | null;
    paychex_id?: string | null;
};

type ContactRow = {
    id?: number;
    contact_type: 'work_email' | 'work_phone';
    contact_value: string;
    is_primary: boolean;
};

type AddressRow = {
    id?: number;
    address_type: 'present';
    address_line1: string;
    address_line2?: string | null;
    city: string;
    state: string;
    country: string;
    postal_code: string;
};

type Employee = {
    id: number;
    first_name: string;
    middle_name?: string | null;
    last_name: string;
    preferred_name?: string | null;
    employee_status_id: number;
    about_me?: string | null;

    employment?: Employment | null;
    demographics?: Demographics | null;
    identifiers?: Identifiers | null;

    contacts?: ContactRow[];
    addresses?: AddressRow[];
    tags?: Tag[];
};

const dateOnly = (v?: string | null) => {
    if (!v) return '';
    const m = v.match(/^(\d{4}-\d{2}-\d{2})/);
    return m ? m[1] : '';
};

const RequiredMark = () => <span className="text-destructive"> *</span>;
const OptionalMark = () => (
    <span className="ml-1 text-xs text-muted-foreground">(optional)</span>
);

export default function Edit() {
    const { employee, statuses, tags, stores } = usePage<{
        employee: Employee;
        statuses: EmployeeStatus[];
        tags: Tag[];
        stores: Store[];
    }>().props;

    const [statusId, setStatusId] = useState<string>(
        String(employee.employee_status_id ?? ''),
    );

    const [employmentStoreId, setEmploymentStoreId] = useState<string>(
        employee.employment?.store_id
            ? String(employee.employment.store_id)
            : '',
    );

    // demographics
    const [gender, setGender] = useState<string>(
        employee.demographics?.gender ?? '',
    );
    const [maritalStatus, setMaritalStatus] = useState<string>(
        employee.demographics?.marital_status ?? '',
    );

    const [contacts, setContacts] = useState<ContactRow[]>(
        (employee.contacts?.length
            ? employee.contacts
            : [
                  {
                      contact_type: 'work_email',
                      contact_value: '',
                      is_primary: true,
                  },
              ]
        ).map((c: any) => ({
            id: c.id,
            contact_type: (c.contact_type ??
                'work_email') as ContactRow['contact_type'],
            contact_value: c.contact_value ?? '',
            is_primary: !!c.is_primary,
        })),
    );

    const [addresses, setAddresses] = useState<AddressRow[]>(
        (employee.addresses?.length
            ? employee.addresses
            : [
                  {
                      address_type: 'present',
                      address_line1: '',
                      address_line2: '',
                      city: '',
                      state: '',
                      country: '',
                      postal_code: '',
                  },
              ]
        ).map((a: any) => ({
            id: a.id,
            address_type: 'present',
            address_line1: a.address_line1 ?? '',
            address_line2: a.address_line2 ?? '',
            city: a.city ?? '',
            state: a.state ?? '',
            country: a.country ?? '',
            postal_code: a.postal_code ?? '',
        })),
    );

    const initialTagIds = useMemo(
        () => (employee.tags ?? []).map((t) => t.id),
        [employee.tags],
    );
    const [tagIds, setTagIds] = useState<number[]>(initialTagIds);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: dashboard().url },
        { title: 'Employees', href: employees.index().url },
        { title: 'Edit', href: employees.edit(employee).url },
    ];

    const toggleTag = (id: number) => {
        setTagIds((prev) =>
            prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
        );
    };

    const setPrimaryContact = (idx: number) => {
        setContacts((prev) =>
            prev.map((c, i) => ({ ...c, is_primary: i === idx })),
        );
    };

    const addContact = () => {
        setContacts((prev) => [
            ...prev,
            {
                contact_type: 'work_phone',
                contact_value: '',
                is_primary: false,
            },
        ]);
    };

    const removeContact = (idx: number) => {
        setContacts((prev) => {
            const next = prev.filter((_, i) => i !== idx);
            if (next.length && !next.some((c) => c.is_primary))
                next[0].is_primary = true;
            return next.length
                ? next
                : [
                      {
                          contact_type: 'work_email',
                          contact_value: '',
                          is_primary: true,
                      },
                  ];
        });
    };

    const addAddress = () => {
        setAddresses((prev) => [
            ...prev,
            {
                address_type: 'present',
                address_line1: '',
                address_line2: '',
                city: '',
                state: '',
                country: '',
                postal_code: '',
            },
        ]);
    };

    const removeAddress = (idx: number) => {
        setAddresses((prev) => {
            const next = prev.filter((_, i) => i !== idx);
            return next.length
                ? next
                : [
                      {
                          address_type: 'present',
                          address_line1: '',
                          address_line2: '',
                          city: '',
                          state: '',
                          country: '',
                          postal_code: '',
                      },
                  ];
        });
    };

    return (
        <PageShell title="Edit Employee" breadcrumbs={breadcrumbs}>
            <div>
                <h1 className="text-xl font-semibold">Edit Employee</h1>
            </div>

            <Form
                {...employees.update.form(employee)}
                className="mt-6 max-w-3xl space-y-8"
            >
                {({ processing, errors }) => (
                    <>
                        {/* Basic */}
                        <section className="space-y-4">
                            <h2 className="text-sm font-medium text-muted-foreground">
                                Basic
                            </h2>

                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="first_name">
                                        First name
                                        <RequiredMark />
                                    </Label>
                                    <Input
                                        id="first_name"
                                        name="first_name"
                                        required
                                        defaultValue={employee.first_name ?? ''}
                                    />
                                    <InputError message={errors.first_name} />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="middle_name">
                                        Middle name
                                        <OptionalMark />
                                    </Label>
                                    <Input
                                        id="middle_name"
                                        name="middle_name"
                                        defaultValue={
                                            employee.middle_name ?? ''
                                        }
                                    />
                                    <InputError message={errors.middle_name} />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="last_name">
                                        Last name
                                        <RequiredMark />
                                    </Label>
                                    <Input
                                        id="last_name"
                                        name="last_name"
                                        required
                                        defaultValue={employee.last_name ?? ''}
                                    />
                                    <InputError message={errors.last_name} />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="preferred_name">
                                        Preferred name
                                        <OptionalMark />
                                    </Label>
                                    <Input
                                        id="preferred_name"
                                        name="preferred_name"
                                        defaultValue={
                                            employee.preferred_name ?? ''
                                        }
                                    />
                                    <InputError
                                        message={errors.preferred_name}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>
                                    Status
                                    <RequiredMark />
                                </Label>
                                <input
                                    type="hidden"
                                    name="employee_status_id"
                                    value={statusId}
                                />
                                <Select
                                    value={statusId}
                                    onValueChange={setStatusId}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {statuses.map((s) => (
                                            <SelectItem
                                                key={s.id}
                                                value={String(s.id)}
                                            >
                                                {s.value}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <InputError
                                    message={errors.employee_status_id}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="about_me">
                                    About
                                    <OptionalMark />
                                </Label>
                                <Textarea
                                    id="about_me"
                                    name="about_me"
                                    rows={4}
                                    defaultValue={employee.about_me ?? ''}
                                />
                                <InputError message={errors.about_me} />
                            </div>
                        </section>

                        {/* Employment */}
                        <section className="space-y-4">
                            <h2 className="text-sm font-medium text-muted-foreground">
                                Employment
                            </h2>
                            <p className="text-xs text-muted-foreground">
                                Optional. If you clear all fields, the
                                employment record will be removed.
                            </p>

                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2 md:col-span-2">
                                    <Label>
                                        Store
                                        <OptionalMark />
                                    </Label>

                                    <input
                                        type="hidden"
                                        name="employment[store_id]"
                                        value={employmentStoreId}
                                    />

                                    <Select
                                        value={employmentStoreId || 'none'}
                                        onValueChange={(v) =>
                                            setEmploymentStoreId(
                                                v === 'none' ? '' : v,
                                            )
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select store" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="none">
                                                —
                                            </SelectItem>
                                            {stores.map((s) => (
                                                <SelectItem
                                                    key={s.id}
                                                    value={String(s.id)}
                                                >
                                                    {s.name} (#{s.manual_id})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>

                                    <InputError
                                        message={
                                            (errors as any)[
                                                'employment.store_id'
                                            ]
                                        }
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>
                                        Hiring date
                                        <OptionalMark />
                                    </Label>
                                    <Input
                                        type="date"
                                        name="employment[hiring_date]"
                                        defaultValue={dateOnly(
                                            employee.employment?.hiring_date,
                                        )}
                                    />
                                    <InputError
                                        message={
                                            (errors as any)[
                                                'employment.hiring_date'
                                            ]
                                        }
                                    />
                                </div>
                            </div>
                        </section>

                        {/* Demographics */}
                        <section className="space-y-4">
                            <h2 className="text-sm font-medium text-muted-foreground">
                                Demographics
                            </h2>
                            <p className="text-xs text-muted-foreground">
                                Optional. Values are limited to what the
                                database accepts.
                            </p>

                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label>
                                        Date of birth
                                        <OptionalMark />
                                    </Label>
                                    <Input
                                        type="date"
                                        name="demographics[date_of_birth]"
                                        defaultValue={dateOnly(
                                            employee.demographics
                                                ?.date_of_birth,
                                        )}
                                    />
                                    <InputError
                                        message={
                                            (errors as any)[
                                                'demographics.date_of_birth'
                                            ]
                                        }
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>
                                        Gender
                                        <OptionalMark />
                                    </Label>
                                    <input
                                        type="hidden"
                                        name="demographics[gender]"
                                        value={gender}
                                    />
                                    <Select
                                        value={gender || 'none'}
                                        onValueChange={(v) =>
                                            setGender(v === 'none' ? '' : v)
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select gender" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="none">
                                                —
                                            </SelectItem>
                                            <SelectItem value="Male">
                                                Male
                                            </SelectItem>
                                            <SelectItem value="Female">
                                                Female
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <InputError
                                        message={
                                            (errors as any)[
                                                'demographics.gender'
                                            ]
                                        }
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>
                                        Marital status
                                        <OptionalMark />
                                    </Label>
                                    <input
                                        type="hidden"
                                        name="demographics[marital_status]"
                                        value={maritalStatus}
                                    />
                                    <Select
                                        value={maritalStatus || 'none'}
                                        onValueChange={(v) =>
                                            setMaritalStatus(
                                                v === 'none' ? '' : v,
                                            )
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select marital status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="none">
                                                —
                                            </SelectItem>
                                            <SelectItem value="Single">
                                                Single
                                            </SelectItem>
                                            <SelectItem value="Married">
                                                Married
                                            </SelectItem>
                                            <SelectItem value="Divorced">
                                                Divorced
                                            </SelectItem>
                                            <SelectItem value="Widowed">
                                                Widowed
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <InputError
                                        message={
                                            (errors as any)[
                                                'demographics.marital_status'
                                            ]
                                        }
                                    />
                                </div>

                                <div className="flex items-center gap-2 pt-6">
                                    <input
                                        type="hidden"
                                        name="demographics[veteran_status]"
                                        value="0"
                                    />
                                    <input
                                        id="veteran"
                                        type="checkbox"
                                        name="demographics[veteran_status]"
                                        value="1"
                                        defaultChecked={
                                            !!employee.demographics
                                                ?.veteran_status
                                        }
                                    />
                                    <Label htmlFor="veteran">
                                        Veteran
                                        <OptionalMark />
                                    </Label>
                                </div>

                                <InputError
                                    message={
                                        (errors as any)[
                                            'demographics.veteran_status'
                                        ]
                                    }
                                />
                            </div>
                        </section>

                        {/* Identifiers */}
                        <section className="space-y-4">
                            <h2 className="text-sm font-medium text-muted-foreground">
                                Identifiers
                            </h2>

                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label>
                                        SSN
                                        <OptionalMark />
                                    </Label>
                                    <Input
                                        name="identifiers[social_security_number]"
                                        defaultValue={
                                            employee.identifiers
                                                ?.social_security_number ?? ''
                                        }
                                    />
                                    <InputError
                                        message={
                                            (errors as any)[
                                                'identifiers.social_security_number'
                                            ]
                                        }
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>
                                        National ID
                                        <OptionalMark />
                                    </Label>
                                    <Input
                                        name="identifiers[national_id_number]"
                                        defaultValue={
                                            employee.identifiers
                                                ?.national_id_number ?? ''
                                        }
                                    />
                                    <InputError
                                        message={
                                            (errors as any)[
                                                'identifiers.national_id_number'
                                            ]
                                        }
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>
                                        ITIN
                                        <OptionalMark />
                                    </Label>
                                    <Input
                                        name="identifiers[itin]"
                                        defaultValue={
                                            employee.identifiers?.itin ?? ''
                                        }
                                    />
                                    <InputError
                                        message={
                                            (errors as any)['identifiers.itin']
                                        }
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>
                                        PayChex ID
                                        <OptionalMark />
                                    </Label>
                                    <Input
                                        name="identifiers[paychex_id]"
                                        defaultValue={
                                            employee.identifiers?.itin ?? ''
                                        }
                                    />
                                    <InputError
                                        message={
                                            (errors as any)[
                                                'identifiers.paychex_id'
                                            ]
                                        }
                                    />
                                </div>
                            </div>
                        </section>

                        {/* Contacts */}
                        <section className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-sm font-medium text-muted-foreground">
                                        Contacts
                                    </h2>
                                    <p className="text-xs text-muted-foreground">
                                        Optional. If a row is present,{' '}
                                        <span className="font-medium">
                                            Type
                                        </span>{' '}
                                        and{' '}
                                        <span className="font-medium">
                                            Value
                                        </span>{' '}
                                        are required.
                                    </p>
                                </div>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={addContact}
                                >
                                    Add contact
                                </Button>
                            </div>

                            <div className="space-y-4">
                                {contacts.map((c, idx) => (
                                    <div
                                        key={idx}
                                        className="rounded-md border p-4"
                                    >
                                        <input
                                            type="hidden"
                                            name={`contacts[${idx}][id]`}
                                            value={c.id ?? ''}
                                        />

                                        <div className="grid gap-4 md:grid-cols-3">
                                            <div className="space-y-2">
                                                <Label>
                                                    Type
                                                    <RequiredMark />
                                                </Label>
                                                <Select
                                                    value={c.contact_type}
                                                    onValueChange={(v) =>
                                                        setContacts((prev) =>
                                                            prev.map((x, i) =>
                                                                i === idx
                                                                    ? {
                                                                          ...x,
                                                                          contact_type:
                                                                              v as ContactRow['contact_type'],
                                                                      }
                                                                    : x,
                                                            ),
                                                        )
                                                    }
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="work_email">
                                                            Work email
                                                        </SelectItem>
                                                        <SelectItem value="work_phone">
                                                            Work phone
                                                        </SelectItem>
                                                    </SelectContent>
                                                </Select>

                                                <input
                                                    type="hidden"
                                                    name={`contacts[${idx}][contact_type]`}
                                                    value={c.contact_type}
                                                />
                                                <InputError
                                                    message={
                                                        (errors as any)[
                                                            `contacts.${idx}.contact_type`
                                                        ]
                                                    }
                                                />
                                            </div>

                                            <div className="space-y-2 md:col-span-2">
                                                <Label>
                                                    Value
                                                    <RequiredMark />
                                                </Label>
                                                <Input
                                                    value={c.contact_value}
                                                    onChange={(e) =>
                                                        setContacts((prev) =>
                                                            prev.map((x, i) =>
                                                                i === idx
                                                                    ? {
                                                                          ...x,
                                                                          contact_value:
                                                                              e
                                                                                  .target
                                                                                  .value,
                                                                      }
                                                                    : x,
                                                            ),
                                                        )
                                                    }
                                                />
                                                <input
                                                    type="hidden"
                                                    name={`contacts[${idx}][contact_value]`}
                                                    value={c.contact_value}
                                                />
                                                <InputError
                                                    message={
                                                        (errors as any)[
                                                            `contacts.${idx}.contact_value`
                                                        ]
                                                    }
                                                />
                                            </div>
                                        </div>

                                        <div className="mt-4 flex items-center justify-between">
                                            <label className="flex items-center gap-2 text-sm">
                                                <input
                                                    type="radio"
                                                    name="__primary_contact"
                                                    checked={c.is_primary}
                                                    onChange={() =>
                                                        setPrimaryContact(idx)
                                                    }
                                                />
                                                Primary
                                            </label>

                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={() =>
                                                    removeContact(idx)
                                                }
                                            >
                                                Remove
                                            </Button>
                                        </div>

                                        <input
                                            type="hidden"
                                            name={`contacts[${idx}][is_primary]`}
                                            value={c.is_primary ? '1' : '0'}
                                        />
                                        <InputError
                                            message={
                                                (errors as any)[
                                                    `contacts.${idx}.is_primary`
                                                ]
                                            }
                                        />
                                    </div>
                                ))}
                            </div>

                            <InputError message={(errors as any)['contacts']} />
                        </section>

                        {/* Addresses */}
                        <section className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-sm font-medium text-muted-foreground">
                                        Addresses
                                    </h2>
                                    <p className="text-xs text-muted-foreground">
                                        Optional. If you keep a row, the
                                        database requires:
                                        <span className="font-medium">
                                            {' '}
                                            line 1, city, state, country, postal
                                            code
                                        </span>
                                        .
                                    </p>
                                </div>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={addAddress}
                                >
                                    Add address
                                </Button>
                            </div>

                            <div className="space-y-4">
                                {addresses.map((a, idx) => (
                                    <div
                                        key={idx}
                                        className="rounded-md border p-4"
                                    >
                                        <input
                                            type="hidden"
                                            name={`addresses[${idx}][id]`}
                                            value={a.id ?? ''}
                                        />

                                        <div className="grid gap-4 md:grid-cols-2">
                                            <div className="space-y-2">
                                                <Label>
                                                    Type
                                                    <RequiredMark />
                                                </Label>
                                                <Select
                                                    value={a.address_type}
                                                    onValueChange={() => {}}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="present">
                                                            Present
                                                        </SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <input
                                                    type="hidden"
                                                    name={`addresses[${idx}][address_type]`}
                                                    value={a.address_type}
                                                />
                                                <InputError
                                                    message={
                                                        (errors as any)[
                                                            `addresses.${idx}.address_type`
                                                        ]
                                                    }
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <Label>
                                                    Address line 1
                                                    <RequiredMark />
                                                </Label>
                                                <Input
                                                    value={a.address_line1}
                                                    onChange={(e) =>
                                                        setAddresses((prev) =>
                                                            prev.map((x, i) =>
                                                                i === idx
                                                                    ? {
                                                                          ...x,
                                                                          address_line1:
                                                                              e
                                                                                  .target
                                                                                  .value,
                                                                      }
                                                                    : x,
                                                            ),
                                                        )
                                                    }
                                                />
                                                <input
                                                    type="hidden"
                                                    name={`addresses[${idx}][address_line1]`}
                                                    value={a.address_line1}
                                                />
                                                <InputError
                                                    message={
                                                        (errors as any)[
                                                            `addresses.${idx}.address_line1`
                                                        ]
                                                    }
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <Label>
                                                    Address line 2
                                                    <OptionalMark />
                                                </Label>
                                                <Input
                                                    value={
                                                        (a.address_line2 ??
                                                            '') as string
                                                    }
                                                    onChange={(e) =>
                                                        setAddresses((prev) =>
                                                            prev.map((x, i) =>
                                                                i === idx
                                                                    ? {
                                                                          ...x,
                                                                          address_line2:
                                                                              e
                                                                                  .target
                                                                                  .value,
                                                                      }
                                                                    : x,
                                                            ),
                                                        )
                                                    }
                                                />
                                                <input
                                                    type="hidden"
                                                    name={`addresses[${idx}][address_line2]`}
                                                    value={
                                                        (a.address_line2 ??
                                                            '') as string
                                                    }
                                                />
                                                <InputError
                                                    message={
                                                        (errors as any)[
                                                            `addresses.${idx}.address_line2`
                                                        ]
                                                    }
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <Label>
                                                    City
                                                    <RequiredMark />
                                                </Label>
                                                <Input
                                                    value={
                                                        (a.city ?? '') as string
                                                    }
                                                    onChange={(e) =>
                                                        setAddresses((prev) =>
                                                            prev.map((x, i) =>
                                                                i === idx
                                                                    ? {
                                                                          ...x,
                                                                          city: e
                                                                              .target
                                                                              .value,
                                                                      }
                                                                    : x,
                                                            ),
                                                        )
                                                    }
                                                />
                                                <input
                                                    type="hidden"
                                                    name={`addresses[${idx}][city]`}
                                                    value={
                                                        (a.city ?? '') as string
                                                    }
                                                />
                                                <InputError
                                                    message={
                                                        (errors as any)[
                                                            `addresses.${idx}.city`
                                                        ]
                                                    }
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <Label>
                                                    State
                                                    <RequiredMark />
                                                </Label>
                                                <Input
                                                    value={
                                                        (a.state ??
                                                            '') as string
                                                    }
                                                    onChange={(e) =>
                                                        setAddresses((prev) =>
                                                            prev.map((x, i) =>
                                                                i === idx
                                                                    ? {
                                                                          ...x,
                                                                          state: e
                                                                              .target
                                                                              .value,
                                                                      }
                                                                    : x,
                                                            ),
                                                        )
                                                    }
                                                />
                                                <input
                                                    type="hidden"
                                                    name={`addresses[${idx}][state]`}
                                                    value={
                                                        (a.state ??
                                                            '') as string
                                                    }
                                                />
                                                <InputError
                                                    message={
                                                        (errors as any)[
                                                            `addresses.${idx}.state`
                                                        ]
                                                    }
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <Label>
                                                    Country
                                                    <RequiredMark />
                                                </Label>
                                                <Input
                                                    value={
                                                        (a.country ??
                                                            '') as string
                                                    }
                                                    onChange={(e) =>
                                                        setAddresses((prev) =>
                                                            prev.map((x, i) =>
                                                                i === idx
                                                                    ? {
                                                                          ...x,
                                                                          country:
                                                                              e
                                                                                  .target
                                                                                  .value,
                                                                      }
                                                                    : x,
                                                            ),
                                                        )
                                                    }
                                                />
                                                <input
                                                    type="hidden"
                                                    name={`addresses[${idx}][country]`}
                                                    value={
                                                        (a.country ??
                                                            '') as string
                                                    }
                                                />
                                                <InputError
                                                    message={
                                                        (errors as any)[
                                                            `addresses.${idx}.country`
                                                        ]
                                                    }
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <Label>
                                                    Postal code
                                                    <RequiredMark />
                                                </Label>
                                                <Input
                                                    value={
                                                        (a.postal_code ??
                                                            '') as string
                                                    }
                                                    onChange={(e) =>
                                                        setAddresses((prev) =>
                                                            prev.map((x, i) =>
                                                                i === idx
                                                                    ? {
                                                                          ...x,
                                                                          postal_code:
                                                                              e
                                                                                  .target
                                                                                  .value,
                                                                      }
                                                                    : x,
                                                            ),
                                                        )
                                                    }
                                                />
                                                <input
                                                    type="hidden"
                                                    name={`addresses[${idx}][postal_code]`}
                                                    value={
                                                        (a.postal_code ??
                                                            '') as string
                                                    }
                                                />
                                                <InputError
                                                    message={
                                                        (errors as any)[
                                                            `addresses.${idx}.postal_code`
                                                        ]
                                                    }
                                                />
                                            </div>
                                        </div>

                                        <div className="mt-4 flex justify-end">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={() =>
                                                    removeAddress(idx)
                                                }
                                            >
                                                Remove
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <InputError
                                message={(errors as any)['addresses']}
                            />
                        </section>

                        {/* Tags */}
                        <section className="space-y-4">
                            <h2 className="text-sm font-medium text-muted-foreground">
                                Tags
                                <OptionalMark />
                            </h2>

                            {tagIds.map((id) => (
                                <input
                                    key={id}
                                    type="hidden"
                                    name="tag_ids[]"
                                    value={String(id)}
                                />
                            ))}

                            <div className="grid gap-2 md:grid-cols-2">
                                {tags.map((t) => {
                                    const checked = tagIds.includes(t.id);
                                    return (
                                        <label
                                            key={t.id}
                                            className="flex items-center gap-2 text-sm"
                                        >
                                            <input
                                                type="checkbox"
                                                checked={checked}
                                                onChange={() => toggleTag(t.id)}
                                            />
                                            {t.tag_name}
                                        </label>
                                    );
                                })}
                            </div>

                            <InputError message={(errors as any)['tag_ids']} />
                        </section>

                        <div className="flex gap-2">
                            <Button type="submit" disabled={processing}>
                                Save
                            </Button>
                            <Button variant="outline" asChild type="button">
                                <Link href={employees.show(employee).url}>
                                    Cancel
                                </Link>
                            </Button>
                        </div>
                    </>
                )}
            </Form>
        </PageShell>
    );
}
