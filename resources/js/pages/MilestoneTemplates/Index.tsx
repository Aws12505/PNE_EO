// resources/js/pages/MilestoneTemplates/Index.tsx

import { MilestoneTemplateForm } from '@/components/MilestoneTemplateForm';
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
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import milestoneTemplates from '@/routes/milestone-templates';
import { type BreadcrumbItem } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import { ArrowDown, ArrowUp, Pencil, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';

type MilestoneTemplate = {
    id: number;
    milestone_type: 'birthday' | 'hiring_anniversary';
    value: number;
    unit: 'days' | 'weeks' | 'months' | 'years';
    is_active: boolean;
    sort_order: number;
    display_name: string;
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: dashboard().url },
    { title: 'Milestone Templates', href: milestoneTemplates.index().url },
];

export default function Index() {
    const { templates } = usePage<{
        templates: MilestoneTemplate[];
    }>().props;

    const [showForm, setShowForm] = useState(false);
    const [editingTemplate, setEditingTemplate] =
        useState<MilestoneTemplate | null>(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [templateToDelete, setTemplateToDelete] =
        useState<MilestoneTemplate | null>(null);

    const birthdayTemplates = templates.filter(
        (t) => t.milestone_type === 'birthday',
    );
    const anniversaryTemplates = templates.filter(
        (t) => t.milestone_type === 'hiring_anniversary',
    );

    const handleDelete = () => {
        if (!templateToDelete) return;

        router.delete(
            milestoneTemplates.destroy({ template: templateToDelete.id }).url,
            {
                preserveScroll: true,
                onSuccess: () => {
                    setDeleteDialogOpen(false);
                    setTemplateToDelete(null);
                },
            },
        );
    };

    const handleToggleActive = (template: MilestoneTemplate) => {
        router.put(
            milestoneTemplates.update({ template: template.id }).url,
            {
                ...template,
                is_active: !template.is_active,
            },
            {
                preserveScroll: true,
            },
        );
    };

    const handleReorder = (
        template: MilestoneTemplate,
        direction: 'up' | 'down',
    ) => {
        const sameType = templates.filter(
            (t) => t.milestone_type === template.milestone_type,
        );
        const currentIndex = sameType.findIndex((t) => t.id === template.id);

        if (
            (direction === 'up' && currentIndex === 0) ||
            (direction === 'down' && currentIndex === sameType.length - 1)
        ) {
            return;
        }

        const swapIndex =
            direction === 'up' ? currentIndex - 1 : currentIndex + 1;
        const swapTemplate = sameType[swapIndex];

        router.put(
            milestoneTemplates.update({ template: template.id }).url,
            {
                ...template,
                sort_order: swapTemplate.sort_order,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    router.put(
                        milestoneTemplates.update({ template: swapTemplate.id })
                            .url,
                        {
                            ...swapTemplate,
                            sort_order: template.sort_order,
                        },
                        {
                            preserveScroll: true,
                        },
                    );
                },
            },
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Milestone Templates" />

            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-semibold">
                            Milestone Templates
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Configure when to display employee milestones
                        </p>
                    </div>

                    <Button onClick={() => setShowForm(true)}>
                        <Plus className="mr-2 h-4 w-4" />
                        Create Template
                    </Button>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    {/* Birthday Templates */}
                    <div className="rounded-lg border">
                        <div className="border-b bg-muted/50 p-4">
                            <h2 className="font-medium">Birthday Milestones</h2>
                            <p className="text-sm text-muted-foreground">
                                Show birthdays at these intervals
                            </p>
                        </div>

                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Milestone</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">
                                        Actions
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {birthdayTemplates.length === 0 ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={3}
                                            className="py-8 text-center text-sm text-muted-foreground"
                                        >
                                            No birthday milestones configured
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    birthdayTemplates.map((template, idx) => (
                                        <TableRow key={template.id}>
                                            <TableCell className="font-medium">
                                                {template.display_name}
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant={
                                                        template.is_active
                                                            ? 'default'
                                                            : 'secondary'
                                                    }
                                                    className="cursor-pointer"
                                                    onClick={() =>
                                                        handleToggleActive(
                                                            template,
                                                        )
                                                    }
                                                >
                                                    {template.is_active
                                                        ? 'Active'
                                                        : 'Inactive'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-1">
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        className="h-8 w-8 p-0"
                                                        onClick={() =>
                                                            handleReorder(
                                                                template,
                                                                'up',
                                                            )
                                                        }
                                                        disabled={idx === 0}
                                                    >
                                                        <ArrowUp className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        className="h-8 w-8 p-0"
                                                        onClick={() =>
                                                            handleReorder(
                                                                template,
                                                                'down',
                                                            )
                                                        }
                                                        disabled={
                                                            idx ===
                                                            birthdayTemplates.length -
                                                                1
                                                        }
                                                    >
                                                        <ArrowDown className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        className="h-8 w-8 p-0"
                                                        onClick={() => {
                                                            setEditingTemplate(
                                                                template,
                                                            );
                                                            setShowForm(true);
                                                        }}
                                                    >
                                                        <Pencil className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        className="h-8 w-8 p-0"
                                                        onClick={() => {
                                                            setTemplateToDelete(
                                                                template,
                                                            );
                                                            setDeleteDialogOpen(
                                                                true,
                                                            );
                                                        }}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Anniversary Templates */}
                    <div className="rounded-lg border">
                        <div className="border-b bg-muted/50 p-4">
                            <h2 className="font-medium">
                                Anniversary Milestones
                            </h2>
                            <p className="text-sm text-muted-foreground">
                                Show hiring anniversaries at these intervals
                            </p>
                        </div>

                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Milestone</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">
                                        Actions
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {anniversaryTemplates.length === 0 ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={3}
                                            className="py-8 text-center text-sm text-muted-foreground"
                                        >
                                            No anniversary milestones configured
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    anniversaryTemplates.map(
                                        (template, idx) => (
                                            <TableRow key={template.id}>
                                                <TableCell className="font-medium">
                                                    {template.display_name}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge
                                                        variant={
                                                            template.is_active
                                                                ? 'default'
                                                                : 'secondary'
                                                        }
                                                        className="cursor-pointer"
                                                        onClick={() =>
                                                            handleToggleActive(
                                                                template,
                                                            )
                                                        }
                                                    >
                                                        {template.is_active
                                                            ? 'Active'
                                                            : 'Inactive'}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end gap-1">
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            className="h-8 w-8 p-0"
                                                            onClick={() =>
                                                                handleReorder(
                                                                    template,
                                                                    'up',
                                                                )
                                                            }
                                                            disabled={idx === 0}
                                                        >
                                                            <ArrowUp className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            className="h-8 w-8 p-0"
                                                            onClick={() =>
                                                                handleReorder(
                                                                    template,
                                                                    'down',
                                                                )
                                                            }
                                                            disabled={
                                                                idx ===
                                                                anniversaryTemplates.length -
                                                                    1
                                                            }
                                                        >
                                                            <ArrowDown className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            className="h-8 w-8 p-0"
                                                            onClick={() => {
                                                                setEditingTemplate(
                                                                    template,
                                                                );
                                                                setShowForm(
                                                                    true,
                                                                );
                                                            }}
                                                        >
                                                            <Pencil className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            className="h-8 w-8 p-0"
                                                            onClick={() => {
                                                                setTemplateToDelete(
                                                                    template,
                                                                );
                                                                setDeleteDialogOpen(
                                                                    true,
                                                                );
                                                            }}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ),
                                    )
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            </div>

            {/* Form Modal */}
            {showForm && (
                <MilestoneTemplateForm
                    isOpen={showForm}
                    onClose={() => {
                        setShowForm(false);
                        setEditingTemplate(null);
                    }}
                    editTemplate={editingTemplate}
                />
            )}

            {/* Delete Confirmation */}
            <AlertDialog
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Milestone</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete the "
                            {templateToDelete?.display_name}" milestone? This
                            will remove it from all future calendar displays.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel
                            onClick={() => setTemplateToDelete(null)}
                        >
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AppLayout>
    );
}
