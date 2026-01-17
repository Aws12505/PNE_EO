// resources/js/pages/dashboard.tsx - FIXED COLOR MAPPING

import { DayModal } from '@/components/DayModal';
import {
    CalendarBody,
    CalendarDate,
    CalendarDatePagination,
    CalendarHeader,
    CalendarMonthPicker,
    CalendarProvider,
    CalendarYearPicker,
    type Feature,
    type Status,
} from '@/components/kibo-ui/Index';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import employees from '@/routes/employees';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { useState } from 'react';

type DashboardEvent = {
    id: string;
    employee_id?: number;
    date: string;
    name: string;
    type: 'birthday' | 'anniversary' | 'holiday' | 'custom';
    color?: string;
    description?: string;
    notes?: string;
    custom_event_id?: number;
    recurrence_type?: string;
};

type Note = {
    id: number;
    date: string;
    content: string;
    created_by: string;
    updated_at: string;
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: dashboard().url },
];

type FeatureWithEmployee = Feature & { employee_id?: number; clickData: any };

export default function Dashboard() {
    const {
        calendarEvents,
        upcomingEvents,
        dayNotes,
        employees: employeesList,
        yearWindow,
    } = usePage<{
        calendarEvents: DashboardEvent[];
        upcomingEvents: DashboardEvent[];
        dayNotes: Record<string, Note>;
        employees: Array<{ id: number; name: string }>;
        yearWindow: { start: number; end: number };
    }>().props;

    const [modalOpen, setModalOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);

    const statusMap: Record<string, Status> = {
        birthday: { id: 'birthday', name: 'Birthday', color: '#22c55e' },
        anniversary: {
            id: 'anniversary',
            name: 'Anniversary',
            color: '#3b82f6',
        },
        holiday: { id: 'holiday', name: 'Holiday', color: '#6366f1' },
        custom: { id: 'custom', name: 'Custom', color: '#8b5cf6' },
    };

    const features: FeatureWithEmployee[] = (calendarEvents ?? []).map((e) => {
        const d = new Date(`${e.date}T00:00:00`);

        // ✅ FIXED: Use event's custom color if available, otherwise fall back to type color
        const status = statusMap[e.type] || statusMap.custom;
        const eventColor = e.color || status.color;

        return {
            id: e.id,
            name: e.name,
            startAt: d,
            endAt: d,
            status: {
                ...status,
                color: eventColor, // ✅ Use the custom color here
            },
            employee_id: e.employee_id,
            clickData: e,
        };
    });

    const handleDayClick = (date: Date) => {
        setSelectedDate(date);
        setModalOpen(true);
    };

    const getEventsForDate = (date: Date): DashboardEvent[] => {
        const dateStr = date.toISOString().split('T')[0];
        return calendarEvents.filter((e) => e.date === dateStr);
    };

    const getNoteForDate = (date: Date): Note | undefined => {
        const dateStr = date.toISOString().split('T')[0];
        return dayNotes[dateStr];
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="grid auto-rows-min gap-4 md:grid-cols-3">
                    <Card className="md:col-span-3">
                        <CardHeader>
                            <CardTitle>Upcoming</CardTitle>
                        </CardHeader>

                        <CardContent>
                            {(upcomingEvents ?? []).length === 0 ? (
                                <div className="text-sm text-muted-foreground">
                                    No upcoming events found.
                                </div>
                            ) : (
                                <div className="max-h-[300px] space-y-2 overflow-y-auto pr-2">
                                    {upcomingEvents.map((e) => (
                                        <div
                                            key={e.id}
                                            className="flex flex-col gap-1 rounded-md border p-3 md:flex-row md:items-center md:justify-between"
                                        >
                                            <div className="min-w-0">
                                                <div className="truncate font-medium">
                                                    {e.name}
                                                </div>
                                                <div className="text-sm text-muted-foreground">
                                                    {e.date}
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <Badge
                                                    variant="secondary"
                                                    className="capitalize"
                                                >
                                                    {e.type}
                                                </Badge>
                                                {e.employee_id && (
                                                    <Link
                                                        className="text-sm underline"
                                                        href={
                                                            employees.show(
                                                                e.employee_id,
                                                            ).url
                                                        }
                                                    >
                                                        Go to employee
                                                    </Link>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                <div className="relative flex-1 overflow-hidden rounded-xl border border-sidebar-border/70 p-2 dark:border-sidebar-border">
                    <CalendarProvider className="h-full">
                        <div className="rounded-lg border">
                            <CalendarDate>
                                <div className="flex items-center gap-2">
                                    <CalendarMonthPicker />
                                    <CalendarYearPicker
                                        start={
                                            yearWindow?.start ??
                                            new Date().getFullYear() - 1
                                        }
                                        end={
                                            yearWindow?.end ??
                                            new Date().getFullYear() + 1
                                        }
                                    />
                                </div>

                                <CalendarDatePagination />
                            </CalendarDate>

                            <CalendarHeader />

                            <CalendarBody
                                features={features}
                                maxVisible={3}
                                onDayClick={handleDayClick}
                            >
                                {({ feature }) => (
                                    <CalendarEventCard
                                        feature={feature as FeatureWithEmployee}
                                    />
                                )}
                            </CalendarBody>
                        </div>
                    </CalendarProvider>
                </div>
            </div>

            {modalOpen && selectedDate && (
                <DayModal
                    isOpen={modalOpen}
                    onClose={() => setModalOpen(false)}
                    date={selectedDate}
                    events={getEventsForDate(selectedDate)}
                    note={getNoteForDate(selectedDate)}
                    employees={employeesList}
                />
            )}
        </AppLayout>
    );
}

function CalendarEventCard({ feature }: { feature: FeatureWithEmployee }) {
    return (
        <div
            className="group flex w-full cursor-pointer items-start gap-2 rounded-md border bg-background/60 p-1.5 text-[11px] leading-tight shadow-sm transition hover:bg-background"
            style={{
                borderLeftWidth: 4,
                borderLeftColor: feature.status.color,
            }}
        >
            <div className="min-w-0 flex-1">
                <div className="truncate font-medium text-foreground">
                    {feature.name}
                </div>
                <div className="mt-0.5">
                    <Badge
                        variant="secondary"
                        className="h-5 px-1.5 text-[10px] capitalize"
                    >
                        {feature.status.name}
                    </Badge>
                </div>
            </div>
        </div>
    );
}
