// resources/js/pages/MilestoneTemplates/components/MilestoneTemplateForm.tsx

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
import { Switch } from '@/components/ui/switch';
import milestoneTemplates from '@/routes/milestone-templates';
import { router, useForm, usePage } from '@inertiajs/react'; // ✅ ADD usePage

type MilestoneTemplate = {
    id: number;
    milestone_type: 'birthday' | 'hiring_anniversary';
    value: number;
    unit: 'days' | 'weeks' | 'months' | 'years';
    is_active: boolean;
    sort_order: number;
};

type FormProps = {
    isOpen: boolean;
    onClose: () => void;
    editTemplate?: MilestoneTemplate | null;
};

export function MilestoneTemplateForm({
    isOpen,
    onClose,
    editTemplate,
}: FormProps) {
    const { data, setData, processing, errors } = useForm({
        milestone_type: editTemplate?.milestone_type || 'hiring_anniversary',
        value: editTemplate?.value || 1,
        unit: editTemplate?.unit || 'months',
        is_active: editTemplate?.is_active ?? true,
        sort_order: editTemplate?.sort_order || 0,
    });

    // ✅ GET PAGE ERRORS (includes custom error keys like 'duplicate')
    const { errors: pageErrors } = usePage<{
        errors: Record<string, string>;
    }>().props;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (editTemplate) {
            router.put(
                milestoneTemplates.update({ template: editTemplate.id }).url,
                data,
                {
                    preserveScroll: true,
                    onSuccess: () => onClose(),
                },
            );
        } else {
            router.post(milestoneTemplates.store().url, data, {
                preserveScroll: true,
                onSuccess: () => onClose(),
            });
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>
                        {editTemplate
                            ? 'Edit Milestone Template'
                            : 'Create Milestone Template'}
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label>Milestone Type *</Label>
                        <Select
                            value={data.milestone_type}
                            onValueChange={(v) =>
                                setData('milestone_type', v as any)
                            }
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="birthday">
                                    Birthday
                                </SelectItem>
                                <SelectItem value="hiring_anniversary">
                                    Hiring Anniversary
                                </SelectItem>
                            </SelectContent>
                        </Select>
                        {errors.milestone_type && (
                            <p className="text-sm text-destructive">
                                {errors.milestone_type}
                            </p>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="value">Value *</Label>
                            <Input
                                id="value"
                                type="number"
                                min="1"
                                value={data.value}
                                onChange={(e) =>
                                    setData('value', parseInt(e.target.value))
                                }
                                required
                            />
                            {errors.value && (
                                <p className="text-sm text-destructive">
                                    {errors.value}
                                </p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label>Unit *</Label>
                            <Select
                                value={data.unit}
                                onValueChange={(v) => setData('unit', v as any)}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="days">Days</SelectItem>
                                    <SelectItem value="weeks">Weeks</SelectItem>
                                    <SelectItem value="months">
                                        Months
                                    </SelectItem>
                                    <SelectItem value="years">Years</SelectItem>
                                </SelectContent>
                            </Select>
                            {errors.unit && (
                                <p className="text-sm text-destructive">
                                    {errors.unit}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                            <Label>Active</Label>
                            <p className="text-sm text-muted-foreground">
                                Show this milestone on the calendar
                            </p>
                        </div>
                        <Switch
                            checked={data.is_active}
                            onCheckedChange={(checked) =>
                                setData('is_active', checked)
                            }
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="sort_order">Sort Order</Label>
                        <Input
                            id="sort_order"
                            type="number"
                            min="0"
                            value={data.sort_order}
                            onChange={(e) =>
                                setData('sort_order', parseInt(e.target.value))
                            }
                        />
                        <p className="text-xs text-muted-foreground">
                            Lower numbers appear first
                        </p>
                    </div>

                    {/* ✅ FIXED: Use pageErrors instead of errors */}
                    {pageErrors?.duplicate && (
                        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                            {pageErrors.duplicate}
                        </div>
                    )}

                    <div className="flex gap-2 pt-4">
                        <Button
                            type="submit"
                            className="flex-1"
                            disabled={processing}
                        >
                            {editTemplate ? 'Update' : 'Create'}
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
