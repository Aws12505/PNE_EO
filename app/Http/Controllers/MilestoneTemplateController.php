<?php
// app/Http/Controllers/MilestoneTemplateController.php

namespace App\Http\Controllers;

use App\Models\MilestoneTemplate;
use Illuminate\Http\Request;
use Inertia\Inertia;

class MilestoneTemplateController extends Controller
{
    public function index()
    {
        $templates = MilestoneTemplate::orderBy('milestone_type')
            ->orderBy('sort_order')
            ->get()
            ->map(fn($t) => [
                'id' => $t->id,
                'milestone_type' => $t->milestone_type,
                'value' => $t->value,
                'unit' => $t->unit,
                'is_active' => $t->is_active,
                'sort_order' => $t->sort_order,
                'display_name' => $t->display_name,
            ]);

        return Inertia::render('MilestoneTemplates/Index', [
            'templates' => $templates,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'milestone_type' => 'required|in:birthday,hiring_anniversary',
            'value' => 'required|integer|min:1',
            'unit' => 'required|in:days,weeks,months,years',
            'is_active' => 'boolean',
            'sort_order' => 'nullable|integer|min:0',
        ]);

        // Check for duplicates
        $exists = MilestoneTemplate::where('milestone_type', $validated['milestone_type'])
            ->where('value', $validated['value'])
            ->where('unit', $validated['unit'])
            ->exists();

        if ($exists) {
            return back()->withErrors(['duplicate' => 'This milestone already exists.']);
        }

        // Auto-assign sort order if not provided
        if (!isset($validated['sort_order'])) {
            $maxSort = MilestoneTemplate::where('milestone_type', $validated['milestone_type'])
                ->max('sort_order');
            $validated['sort_order'] = ($maxSort ?? 0) + 1;
        }

        MilestoneTemplate::create($validated);

        return redirect()->route('milestone-templates.index')
            ->with('success', 'Milestone template created successfully.');
    }

    public function update(Request $request, MilestoneTemplate $template)
    {
        $validated = $request->validate([
            'milestone_type' => 'required|in:birthday,hiring_anniversary',
            'value' => 'required|integer|min:1',
            'unit' => 'required|in:days,weeks,months,years',
            'is_active' => 'boolean',
            'sort_order' => 'nullable|integer|min:0',
        ]);

        // Check for duplicates (excluding current template)
        $exists = MilestoneTemplate::where('milestone_type', $validated['milestone_type'])
            ->where('value', $validated['value'])
            ->where('unit', $validated['unit'])
            ->where('id', '!=', $template->id)
            ->exists();

        if ($exists) {
            return back()->withErrors(['duplicate' => 'This milestone already exists.']);
        }

        $template->update($validated);

        return redirect()->route('milestone-templates.index')
            ->with('success', 'Milestone template updated successfully.');
    }

    public function destroy(MilestoneTemplate $template)
    {
        $template->delete();

        return redirect()->route('milestone-templates.index')
            ->with('success', 'Milestone template deleted successfully.');
    }
}
