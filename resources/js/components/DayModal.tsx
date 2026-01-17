// resources/js/components/DayModal.tsx - WITH ALERT DIALOG

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import dayNotes from '@/routes/day-notes';
import { router } from '@inertiajs/react';
import { format } from 'date-fns';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { EventForm } from './EventForm';

type Event = {
    id: string;
    employee_id?: number;
    date: string;
    name: string;
    type: string;
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

type DayModalProps = {
    isOpen: boolean;
    onClose: () => void;
    date: Date;
    events: Event[];
    note?: Note;
    employees: Array<{ id: number; name: string }>;
};

export function DayModal({
    isOpen,
    onClose,
    date,
    events,
    note,
    employees,
}: DayModalProps) {
    const [noteContent, setNoteContent] = useState(note?.content || '');
    const [isEditingNote, setIsEditingNote] = useState(false);
    const [showEventForm, setShowEventForm] = useState(false);
    const [editingEvent, setEditingEvent] = useState<Event | null>(null);
    const [deleteNoteOpen, setDeleteNoteOpen] = useState(false); // ✅ NEW
    const [deleteEventOpen, setDeleteEventOpen] = useState(false); // ✅ NEW
    const [eventToDelete, setEventToDelete] = useState<Event | null>(null); // ✅ NEW

    useEffect(() => {
        setNoteContent(note?.content || '');
        setIsEditingNote(false);
    }, [note]);

    const dateString = format(date, 'yyyy-MM-dd');
    const formattedDate = format(date, 'MMMM d, yyyy');

    const handleSaveNote = () => {
        router.post(
            dayNotes.store().url,
            {
                note_date: dateString,
                content: noteContent,
            },
            {
                preserveScroll: true,
                onSuccess: () => setIsEditingNote(false),
            },
        );
    };

    // ✅ UPDATED: Open alert dialog instead of window.confirm
    const handleDeleteNote = () => {
        if (!note?.id) return;

        router.delete(dayNotes.destroy({ note: note.id }).url, {
            preserveScroll: true,
            onSuccess: () => {
                setNoteContent('');
                setDeleteNoteOpen(false);
            },
        });
    };

    // ✅ UPDATED: Open alert dialog instead of window.confirm
    const handleDeleteEvent = (event: Event) => {
        if (!event.custom_event_id) return;

        router.delete(`/custom-events/${event.custom_event_id}`, {
            preserveScroll: true,
            onSuccess: () => {
                setDeleteEventOpen(false);
                setEventToDelete(null);
            },
        });
    };

    const customEvents = events.filter((e) => e.type === 'custom');
    const otherEvents = events.filter((e) => e.type !== 'custom');

    return (
        <>
            <Dialog open={isOpen} onOpenChange={onClose}>
                <DialogContent className="max-h-[80vh] max-w-2xl overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{formattedDate}</DialogTitle>
                    </DialogHeader>

                    <Tabs defaultValue="events" className="w-full">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="events">
                                Events ({events.length})
                            </TabsTrigger>
                            <TabsTrigger value="notes">Notes</TabsTrigger>
                        </TabsList>

                        <TabsContent value="events" className="space-y-4">
                            <Button
                                onClick={() => setShowEventForm(true)}
                                className="w-full"
                                variant="outline"
                            >
                                <Plus className="mr-2 h-4 w-4" />
                                Add Event
                            </Button>

                            {events.length === 0 ? (
                                <p className="py-8 text-center text-sm text-muted-foreground">
                                    No events on this day
                                </p>
                            ) : (
                                <div className="space-y-4">
                                    {otherEvents.length > 0 && (
                                        <div className="space-y-2">
                                            <h4 className="text-sm font-medium">
                                                Automatic Events
                                            </h4>
                                            {otherEvents.map((event) => (
                                                <EventCard
                                                    key={event.id}
                                                    event={event}
                                                    showActions={false}
                                                />
                                            ))}
                                        </div>
                                    )}

                                    {customEvents.length > 0 && (
                                        <div className="space-y-2">
                                            <h4 className="text-sm font-medium">
                                                Custom Events
                                            </h4>
                                            {customEvents.map((event) => (
                                                <EventCard
                                                    key={event.id}
                                                    event={event}
                                                    showActions={true}
                                                    onEdit={() => {
                                                        setEditingEvent(event);
                                                        setShowEventForm(true);
                                                    }}
                                                    onDelete={() => {
                                                        setEventToDelete(event);
                                                        setDeleteEventOpen(
                                                            true,
                                                        );
                                                    }}
                                                />
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </TabsContent>

                        <TabsContent value="notes" className="space-y-4">
                            {isEditingNote || !note ? (
                                <div className="space-y-2">
                                    <Textarea
                                        value={noteContent}
                                        onChange={(e) =>
                                            setNoteContent(e.target.value)
                                        }
                                        placeholder="Add notes for this day..."
                                        rows={6}
                                    />
                                    <div className="flex gap-2">
                                        <Button
                                            onClick={handleSaveNote}
                                            size="sm"
                                        >
                                            Save
                                        </Button>
                                        {note && (
                                            <Button
                                                onClick={() => {
                                                    setIsEditingNote(false);
                                                    setNoteContent(
                                                        note.content,
                                                    );
                                                }}
                                                size="sm"
                                                variant="outline"
                                            >
                                                Cancel
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    <div className="rounded-md border p-4">
                                        <p className="whitespace-pre-wrap">
                                            {note.content}
                                        </p>
                                        <p className="mt-2 text-xs text-muted-foreground">
                                            Last updated by {note.created_by} on{' '}
                                            {format(
                                                new Date(note.updated_at),
                                                'MMM d, yyyy h:mm a',
                                            )}
                                        </p>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button
                                            onClick={() =>
                                                setIsEditingNote(true)
                                            }
                                            size="sm"
                                            variant="outline"
                                        >
                                            <Pencil className="mr-2 h-4 w-4" />
                                            Edit
                                        </Button>
                                        <Button
                                            onClick={() =>
                                                setDeleteNoteOpen(true)
                                            }
                                            size="sm"
                                            variant="destructive"
                                        >
                                            <Trash2 className="mr-2 h-4 w-4" />
                                            Delete
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </TabsContent>
                    </Tabs>
                </DialogContent>
            </Dialog>

            {/* ✅ NEW: Event Form Dialog */}
            {showEventForm && (
                <EventForm
                    isOpen={showEventForm}
                    onClose={() => {
                        setShowEventForm(false);
                        setEditingEvent(null);
                    }}
                    initialDate={dateString}
                    editEvent={editingEvent}
                    employees={employees}
                />
            )}

            {/* ✅ NEW: Delete Note Alert Dialog */}
            <AlertDialog open={deleteNoteOpen} onOpenChange={setDeleteNoteOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Note</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete this note? This
                            action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteNote}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* ✅ NEW: Delete Event Alert Dialog */}
            <AlertDialog
                open={deleteEventOpen}
                onOpenChange={setDeleteEventOpen}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Event</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete "
                            {eventToDelete?.name}"?
                            {eventToDelete?.recurrence_type !== 'none' && (
                                <span className="mt-2 block font-medium">
                                    This will delete all occurrences of this
                                    recurring event.
                                </span>
                            )}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel
                            onClick={() => setEventToDelete(null)}
                        >
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() =>
                                eventToDelete &&
                                handleDeleteEvent(eventToDelete)
                            }
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}

function EventCard({ event, showActions, onEdit, onDelete }: any) {
    const typeColors = {
        birthday: '#22c55e',
        anniversary: '#3b82f6',
        holiday: '#6366f1',
        custom: '#8b5cf6',
    };

    const color =
        event.color || typeColors[event.type as keyof typeof typeColors];

    return (
        <div
            className="rounded-md border p-3"
            style={{ borderLeftWidth: 4, borderLeftColor: color }}
        >
            <div className="flex items-start justify-between">
                <div className="min-w-0 flex-1">
                    <p className="font-medium">{event.name}</p>
                    {event.description && (
                        <p className="mt-1 text-sm text-muted-foreground">
                            {event.description}
                        </p>
                    )}
                    <div className="mt-2 flex gap-2">
                        <Badge
                            variant="secondary"
                            className="text-xs capitalize"
                        >
                            {event.type}
                        </Badge>
                        {event.recurrence_type &&
                            event.recurrence_type !== 'none' && (
                                <Badge
                                    variant="outline"
                                    className="text-xs capitalize"
                                >
                                    {event.recurrence_type}
                                </Badge>
                            )}
                    </div>
                </div>
                {showActions && (
                    <div className="ml-2 flex gap-1">
                        <Button
                            onClick={onEdit}
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0"
                        >
                            <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                            onClick={onDelete}
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0"
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}
