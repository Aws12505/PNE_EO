<?php
// app/Http/Controllers/DayNoteController.php

namespace App\Http\Controllers;

use App\Models\DayNote;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class DayNoteController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'note_date' => 'required|date',
            'content' => 'required|string',
        ]);

        DayNote::updateOrCreate(
            ['note_date' => $validated['note_date']],
            [
                'content' => $validated['content'],
                'created_by' => Auth::id(),
                'updated_by' => Auth::id(),
            ]
        );

        return redirect()->route('dashboard')->with('success', 'Note saved successfully');
    }

    public function destroy(DayNote $note)
    {
        $note->delete();
        return redirect()->route('dashboard')->with('success', 'Note deleted successfully');
    }
}
