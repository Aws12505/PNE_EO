// resources/js/components/EventForm.tsx - FIXED TO LOAD TIME AND END DATE

import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
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
import customEvents from '@/routes/custom-events';
import { router, useForm } from '@inertiajs/react';

type EventFormProps = {
    isOpen: boolean;
    onClose: () => void;
    initialDate: string;
    editEvent?: any;
    employees: Array<{ id: number; name: string }>;
};

export function EventForm({
    isOpen,
    onClose,
    initialDate,
    editEvent,
    employees,
}: EventFormProps) {
    const { data, setData, post, put, processing, errors, reset } = useForm({
        title: editEvent?.name?.split(' • ')[1] || editEvent?.name || '',
        description: editEvent?.description || '',
        event_date: editEvent?.date || initialDate,
        event_time: editEvent?.event_time || '', // ✅ FIXED: Load existing time
        recurrence_type: editEvent?.recurrence_type || 'none',
        recurrence_interval: editEvent?.recurrence_interval || 1, // ✅ FIXED: Load existing interval
        recurrence_end_date: editEvent?.recurrence_end_date || '', // ✅ FIXED: Load existing end date
        employee_id: editEvent?.employee_id || '',
        color: editEvent?.color || '#8b5cf6',
        notes: editEvent?.notes || '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (editEvent?.custom_event_id) {
            router.put(
                customEvents.update({ event: editEvent.custom_event_id }).url,
                data,
                {
                    preserveScroll: true,
                    onSuccess: () => {
                        reset();
                        onClose();
                    },
                },
            );
        } else {
            router.post(customEvents.store().url, data, {
                preserveScroll: true,
                onSuccess: () => {
                    reset();
                    onClose();
                },
            });
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-h-[80vh] max-w-md overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>
                        {editEvent ? 'Edit Event' : 'Create Event'}
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="title">Title *</Label>
                        <Input
                            id="title"
                            value={data.title}
                            onChange={(e) => setData('title', e.target.value)}
                            required
                        />
                        {errors.title && (
                            <p className="text-sm text-destructive">
                                {errors.title}
                            </p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            value={data.description}
                            onChange={(e) =>
                                setData('description', e.target.value)
                            }
                            rows={3}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="event_date">Date *</Label>
                            <Input
                                id="event_date"
                                type="date"
                                value={data.event_date}
                                onChange={(e) =>
                                    setData('event_date', e.target.value)
                                }
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="event_time">Time</Label>
                            <Input
                                id="event_time"
                                type="time"
                                value={data.event_time}
                                onChange={(e) =>
                                    setData('event_time', e.target.value)
                                }
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Employee (Optional)</Label>
                        <Select
                            value={String(data.employee_id)}
                            onValueChange={(v) =>
                                setData(
                                    'employee_id',
                                    v === 'none' ? '' : Number(v),
                                )
                            }
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select employee" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="none">None</SelectItem>
                                {employees.map((e) => (
                                    <SelectItem key={e.id} value={String(e.id)}>
                                        {e.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label>Recurrence</Label>
                        <Select
                            value={data.recurrence_type}
                            onValueChange={(v) =>
                                setData('recurrence_type', v as any)
                            }
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="none">
                                    Does not repeat
                                </SelectItem>
                                <SelectItem value="daily">Daily</SelectItem>
                                <SelectItem value="weekly">Weekly</SelectItem>
                                <SelectItem value="monthly">Monthly</SelectItem>
                                <SelectItem value="yearly">Yearly</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {data.recurrence_type !== 'none' && (
                        <>
                            <div className="space-y-2">
                                <Label htmlFor="recurrence_interval">
                                    Repeat every
                                </Label>
                                <div className="flex items-center gap-2">
                                    <Input
                                        id="recurrence_interval"
                                        type="number"
                                        min="1"
                                        value={data.recurrence_interval}
                                        onChange={(e) =>
                                            setData(
                                                'recurrence_interval',
                                                parseInt(e.target.value),
                                            )
                                        }
                                        className="w-20"
                                    />
                                    <span className="text-sm text-muted-foreground">
                                        {data.recurrence_type}
                                    </span>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="recurrence_end_date">
                                    End date (optional)
                                </Label>
                                <Input
                                    id="recurrence_end_date"
                                    type="date"
                                    value={data.recurrence_end_date}
                                    onChange={(e) =>
                                        setData(
                                            'recurrence_end_date',
                                            e.target.value,
                                        )
                                    }
                                />
                            </div>
                        </>
                    )}

                    <div className="space-y-2">
                        <Label htmlFor="color">Color</Label>
                        <Input
                            id="color"
                            type="color"
                            value={data.color}
                            onChange={(e) => setData('color', e.target.value)}
                            className="h-10 w-20"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="notes">Notes</Label>
                        <Textarea
                            id="notes"
                            value={data.notes}
                            onChange={(e) => setData('notes', e.target.value)}
                            rows={3}
                        />
                    </div>

                    <div className="flex gap-2 pt-4">
                        <Button
                            type="submit"
                            className="flex-1"
                            disabled={processing}
                        >
                            {editEvent ? 'Update' : 'Create'}
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                        >
                            Cancel
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
