<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\EmployeeController;
use App\Http\Controllers\EmployeeExpenseController;
use App\Http\Controllers\ExpenseTypeController;
use App\Http\Controllers\StoreController;
use App\Http\Controllers\StoreExpenseController;
use App\Http\Controllers\TagController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\CustomEventController;
use App\Http\Controllers\DayNoteController;
use App\Http\Controllers\MilestoneTemplateController;

Route::middleware(['auth', 'verified'])->group(function () {
    Route::resource('employees', EmployeeController::class);

    Route::resource('expense-types', ExpenseTypeController::class)->except(['show']);
    Route::patch('expense-types/{expenseType}/restore', [ExpenseTypeController::class, 'restore'])
        ->name('expense-types.restore');

    Route::resource('stores', StoreController::class);

    Route::prefix('employees/{employee}')->group(function () {
        Route::get('expenses/create', [EmployeeExpenseController::class, 'create'])->name('employees.expenses.create');
        Route::post('expenses', [EmployeeExpenseController::class, 'store'])->name('employees.expenses.store');
        Route::get('expenses/{expense}', [EmployeeExpenseController::class, 'show'])->name('employees.expenses.show');
    });

    Route::prefix('stores/{store}')->group(function () {
        Route::get('expenses/create', [StoreExpenseController::class, 'create'])->name('stores.expenses.create');
        Route::post('expenses', [StoreExpenseController::class, 'store'])->name('stores.expenses.store');
        Route::get('expenses/{expense}', [StoreExpenseController::class, 'show'])->name('stores.expenses.show');
    });

    Route::get('tags', [TagController::class, 'index'])->name('tags.index');
    Route::post('tags', [TagController::class, 'store'])->name('tags.store');
    Route::delete('tags/{tag}', [TagController::class, 'destroy'])->name('tags.destroy');
});


Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/', [DashboardController::class, 'index'])->name('dashboard');

    // Custom Events
    Route::post('/custom-events', [CustomEventController::class, 'store'])->name('custom-events.store');
    Route::put('/custom-events/{event}', [CustomEventController::class, 'update'])->name('custom-events.update');
    Route::delete('/custom-events/{event}', [CustomEventController::class, 'destroy'])->name('custom-events.destroy');

    // Day Notes
    Route::post('/day-notes', [DayNoteController::class, 'store'])->name('day-notes.store');
    Route::delete('/day-notes/{note}', [DayNoteController::class, 'destroy'])->name('day-notes.destroy');

    Route::prefix('milestone-templates')->name('milestone-templates.')->group(function () {
        Route::get('/', [MilestoneTemplateController::class, 'index'])->name('index');
        Route::post('/', [MilestoneTemplateController::class, 'store'])->name('store');
        Route::put('/{template}', [MilestoneTemplateController::class, 'update'])->name('update');
        Route::delete('/{template}', [MilestoneTemplateController::class, 'destroy'])->name('destroy');
    });
});

require __DIR__ . '/settings.php';
