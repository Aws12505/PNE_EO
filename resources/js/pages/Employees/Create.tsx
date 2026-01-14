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
import { useState } from 'react';

type EmployeeStatus = { id: number; value: string };
type Tag = { id: number; tag_name: string };
type Store = { id: number; name: string; manual_id: string };

type ContactRow = {
    id?: number;
    contact_type: string;
    contact_value: string;
    is_primary: boolean;
};

type AddressRow = {
    id?: number;
    address_type: string;
    address_line1: string;
    address_line2?: string;
    city?: string;
    state?: string;
    country?: string;
    postal_code?: string;
};

export default function Create() {
    const { statuses, tags, stores } = usePage<{
        statuses: EmployeeStatus[];
        tags: Tag[];
        stores: Store[];
    }>().props;

    const [statusId, setStatusId] = useState<string>('');
    const [employmentStoreId, setEmploymentStoreId] = useState<string>('');

    // hasMany: contacts
    const [contacts, setContacts] = useState<ContactRow[]>([
        { contact_type: 'email', contact_value: '', is_primary: true },
    ]);

    // hasMany: addresses
    const [addresses, setAddresses] = useState<AddressRow[]>([
        {
            address_type: 'home',
            address_line1: '',
            address_line2: '',
            city: '',
            state: '',
            country: '',
            postal_code: '',
        },
    ]);

    // tags pivot
    const [tagIds, setTagIds] = useState<number[]>([]);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: dashboard().url },
        { title: 'Employees', href: employees.index().url },
        { title: 'Create', href: employees.create().url },
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
                contact_type: 'phone',
                contact_value: '',
                is_primary: prev.length === 0,
            },
        ]);
    };

    const removeContact = (idx: number) => {
        setContacts((prev) => {
            const next = prev.filter((_, i) => i !== idx);
            // ensure at least one primary if any contacts remain
            if (next.length && !next.some((c) => c.is_primary))
                next[0].is_primary = true;
            return next.length
                ? next
                : [
                      {
                          contact_type: 'email',
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
                address_type: 'home',
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
                          address_type: 'home',
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
        <PageShell title="Create Employee" breadcrumbs={breadcrumbs}>
            <div>
                <h1 className="text-xl font-semibold">Create Employee</h1>
                <p className="text-sm text-muted-foreground">
                    Employee + related records in one request.
                </p>
            </div>

            <Form
                {...employees.store.form()}
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
                                    </Label>
                                    <Input
                                        id="first_name"
                                        name="first_name"
                                        required
                                    />
                                    <InputError message={errors.first_name} />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="middle_name">
                                        Middle name
                                    </Label>
                                    <Input
                                        id="middle_name"
                                        name="middle_name"
                                    />
                                    <InputError message={errors.middle_name} />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="last_name">Last name</Label>
                                    <Input
                                        id="last_name"
                                        name="last_name"
                                        required
                                    />
                                    <InputError message={errors.last_name} />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="preferred_name">
                                        Preferred name
                                    </Label>
                                    <Input
                                        id="preferred_name"
                                        name="preferred_name"
                                    />
                                    <InputError
                                        message={errors.preferred_name}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Status</Label>
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
                                <Label htmlFor="about_me">About</Label>
                                <Textarea
                                    id="about_me"
                                    name="about_me"
                                    rows={4}
                                />
                                <InputError message={errors.about_me} />
                            </div>
                        </section>

                        {/* Employment */}
                        <section className="space-y-4">
                            <h2 className="text-sm font-medium text-muted-foreground">
                                Employment
                            </h2>

                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2 md:col-span-2">
                                    <Label>Store</Label>
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
                                    <Label htmlFor="employment_hiring_date">
                                        Hiring date
                                    </Label>
                                    <Input
                                        id="employment_hiring_date"
                                        name="employment[hiring_date]"
                                        type="date"
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

                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label>Date of birth</Label>
                                    <Input
                                        type="date"
                                        name="demographics[date_of_birth]"
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
                                    <Label>Gender</Label>
                                    <Input name="demographics[gender]" />
                                    <InputError
                                        message={
                                            (errors as any)[
                                                'demographics.gender'
                                            ]
                                        }
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>Marital status</Label>
                                    <Input name="demographics[marital_status]" />
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
                                        id="veteran"
                                        type="checkbox"
                                        name="demographics[veteran_status]"
                                        value="1"
                                    />
                                    <Label htmlFor="veteran">Veteran</Label>
                                    <InputError
                                        message={
                                            (errors as any)[
                                                'demographics.veteran_status'
                                            ]
                                        }
                                    />
                                </div>
                            </div>
                        </section>

                        {/* Identifiers */}
                        <section className="space-y-4">
                            <h2 className="text-sm font-medium text-muted-foreground">
                                Identifiers
                            </h2>

                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label>SSN</Label>
                                    <Input name="identifiers[social_security_number]" />
                                    <InputError
                                        message={
                                            (errors as any)[
                                                'identifiers.social_security_number'
                                            ]
                                        }
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>National ID</Label>
                                    <Input name="identifiers[national_id_number]" />
                                    <InputError
                                        message={
                                            (errors as any)[
                                                'identifiers.national_id_number'
                                            ]
                                        }
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>ITIN</Label>
                                    <Input name="identifiers[itin]" />
                                    <InputError
                                        message={
                                            (errors as any)['identifiers.itin']
                                        }
                                    />
                                </div>
                            </div>
                        </section>

                        {/* Contacts */}
                        <section className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h2 className="text-sm font-medium text-muted-foreground">
                                    Contacts
                                </h2>
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
                                        {/* hidden id for edit parity (won't exist here, but harmless) */}
                                        <input
                                            type="hidden"
                                            name={`contacts[${idx}][id]`}
                                            value={c.id ?? ''}
                                        />

                                        <div className="grid gap-4 md:grid-cols-3">
                                            <div className="space-y-2">
                                                <Label>Type</Label>
                                                <select
                                                    className="w-full rounded-md border px-3 py-2 text-sm"
                                                    value={c.contact_type}
                                                    onChange={(e) =>
                                                        setContacts((prev) =>
                                                            prev.map((x, i) =>
                                                                i === idx
                                                                    ? {
                                                                          ...x,
                                                                          contact_type:
                                                                              e
                                                                                  .target
                                                                                  .value,
                                                                      }
                                                                    : x,
                                                            ),
                                                        )
                                                    }
                                                >
                                                    <option value="email">
                                                        email
                                                    </option>
                                                    <option value="phone">
                                                        phone
                                                    </option>
                                                    <option value="sms">
                                                        sms
                                                    </option>
                                                    <option value="other">
                                                        other
                                                    </option>
                                                </select>

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
                                                <Label>Value</Label>
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

                                        {/* actual field sent to backend */}
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
                                <h2 className="text-sm font-medium text-muted-foreground">
                                    Addresses
                                </h2>
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
                                                <Label>Type</Label>
                                                <select
                                                    className="w-full rounded-md border px-3 py-2 text-sm"
                                                    value={a.address_type}
                                                    onChange={(e) =>
                                                        setAddresses((prev) =>
                                                            prev.map((x, i) =>
                                                                i === idx
                                                                    ? {
                                                                          ...x,
                                                                          address_type:
                                                                              e
                                                                                  .target
                                                                                  .value,
                                                                      }
                                                                    : x,
                                                            ),
                                                        )
                                                    }
                                                >
                                                    <option value="home">
                                                        home
                                                    </option>
                                                    <option value="work">
                                                        work
                                                    </option>
                                                    <option value="other">
                                                        other
                                                    </option>
                                                </select>
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
                                                <Label>Address line 1</Label>
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
                                                <Label>Address line 2</Label>
                                                <Input
                                                    value={
                                                        a.address_line2 ?? ''
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
                                                        a.address_line2 ?? ''
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
                                                <Label>City</Label>
                                                <Input
                                                    value={a.city ?? ''}
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
                                                    value={a.city ?? ''}
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
                                                <Label>State</Label>
                                                <Input
                                                    value={a.state ?? ''}
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
                                                    value={a.state ?? ''}
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
                                                <Label>Country</Label>
                                                <Input
                                                    value={a.country ?? ''}
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
                                                    value={a.country ?? ''}
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
                                                <Label>Postal code</Label>
                                                <Input
                                                    value={a.postal_code ?? ''}
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
                                                    value={a.postal_code ?? ''}
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
                            </h2>

                            {/* send tag_ids[] array */}
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
                                Create
                            </Button>
                            <Button variant="outline" asChild type="button">
                                <Link href={employees.index().url}>Cancel</Link>
                            </Button>
                        </div>
                    </>
                )}
            </Form>
        </PageShell>
    );
}
