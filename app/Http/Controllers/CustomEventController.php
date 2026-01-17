<?php
// app/Http/Controllers/CustomEventController.php

namespace App\Http\Controllers;

use App\Models\CustomEvent;
use App\Models\Employee;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class CustomEventController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'event_date' => 'required|date',
            'event_time' => 'nullable|date_format:H:i',
            'recurrence_type' => 'required|in:none,daily,weekly,monthly,yearly',
            'recurrence_interval' => 'nullable|integer|min:1',
            'recurrence_end_date' => 'nullable|date|after:event_date',
            'employee_id' => 'nullable|exists:employees,id',
            'color' => 'nullable|string|regex:/^#[0-9A-Fa-f]{6}$/',
            'notes' => 'nullable|string',
        ]);

        $validated['created_by'] = Auth::id();
        $validated['recurrence_interval'] = $validated['recurrence_interval'] ?? 1;

        CustomEvent::create($validated);

        return redirect()->route('dashboard')->with('success', 'Event created successfully');
    }

    public function update(Request $request, CustomEvent $event)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'event_date' => 'required|date',
            'event_time' => 'nullable|date_format:H:i',
            'recurrence_type' => 'required|in:none,daily,weekly,monthly,yearly',
            'recurrence_interval' => 'nullable|integer|min:1',
            'recurrence_end_date' => 'nullable|date|after:event_date',
            'employee_id' => 'nullable|exists:employees,id',
            'color' => 'nullable|string|regex:/^#[0-9A-Fa-f]{6}$/',
            'notes' => 'nullable|string',
        ]);

        $event->update($validated);

        return redirect()->route('dashboard')->with('success', 'Event updated successfully');
    }

    public function destroy(CustomEvent $event)
    {
        $event->delete();
        return redirect()->route('dashboard')->with('success', 'Event deleted successfully');
    }
}
