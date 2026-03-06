<?php

// use Illuminate\Support\Facades\Route;
// use App\Http\Controllers\Api\EmployeeController;
// use App\Http\Controllers\Api\EmployeeExpenseController;
// use App\Http\Controllers\Api\ExpenseTypeController;
// use App\Http\Controllers\Api\StoreExpenseController;
// use App\Http\Controllers\Api\TagController;
// use App\Http\Controllers\Api\DashboardController;
// use App\Http\Controllers\Api\CustomEventController;
// use App\Http\Controllers\Api\DayNoteController;
// use App\Http\Controllers\Api\MilestoneTemplateController;
// use App\Http\Controllers\Api\EmployeeImportController;
// use App\Http\Controllers\Api\AuthController;
// use Illuminate\Support\Facades\Storage;

// /*
// |--------------------------------------------------------------------------
// | API Routes
// |--------------------------------------------------------------------------
// | base url: /api/...
// */

// //login and register



// Route::get('/', fn () => response()->json(['message' => 'API is running']));

// Route::middleware(['AuthToken'])->group(function () {


//     /*
//     |--------------------------------------------------------------------------
//     | Dashboard
//     |--------------------------------------------------------------------------
//     */
//     Route::get('/dashboard', [DashboardController::class, 'index'])
//         ->name('api.dashboard');

//     /*
//     |--------------------------------------------------------------------------
//     | Employees
//     |--------------------------------------------------------------------------
//     */

//     Route::post('/employees/import', [EmployeeImportController::class, 'store'])
//         ->name('api.employees.import.store');

//     Route::get('/employees/import/template', [EmployeeImportController::class, 'template'])
//         ->name('api.employees.import.template');

//     Route::apiResource('/employees', EmployeeController::class);

//     /*
//     |--------------------------------------------------------------------------
//     | Employee Expenses
//     |--------------------------------------------------------------------------
//     */
//     Route::prefix('employees/{employee}')->group(function () {
//         Route::get('expenses/create', [EmployeeExpenseController::class, 'create'])
//             ->name('api.employees.expenses.create');

//         Route::post('expenses', [EmployeeExpenseController::class, 'store'])
//             ->name('api.employees.expenses.store');

//         Route::get('expenses/{expense}', [EmployeeExpenseController::class, 'show'])
//             ->name('api.employees.expenses.show');
//     });

//     /*
//     |--------------------------------------------------------------------------
//     | Expense Types
//     |--------------------------------------------------------------------------
//     */
//     Route::apiResource('expense-types', ExpenseTypeController::class)
//         ->except(['show']);

//     Route::patch('expense-types/{expenseType}/restore', [ExpenseTypeController::class, 'restore'])
//         ->name('api.expense-types.restore');

//     /*
//     |--------------------------------------------------------------------------
//     | Stores
//     |--------------------------------------------------------------------------
//     */

//     Route::prefix('stores/{store}')->group(function () {
//         Route::get('expenses/create', [StoreExpenseController::class, 'create'])
//             ->name('api.stores.expenses.create');

//         Route::post('expenses', [StoreExpenseController::class, 'store'])
//             ->name('api.stores.expenses.store');

//         Route::get('expenses/{expense}', [StoreExpenseController::class, 'show'])
//             ->name('api.stores.expenses.show');
//     });

//     /*
//     |--------------------------------------------------------------------------
//     | Tags
//     |--------------------------------------------------------------------------
//     */
//     Route::get('tags', [TagController::class, 'index'])->name('api.tags.index');
//     Route::post('tags', [TagController::class, 'store'])->name('api.tags.store');
//     Route::delete('tags/{tag}', [TagController::class, 'destroy'])->name('api.tags.destroy');

//     /*
//     |--------------------------------------------------------------------------
//     | Custom Events
//     |--------------------------------------------------------------------------
//     */
//     Route::post('custom-events', [CustomEventController::class, 'store'])
//         ->name('api.custom-events.store');

//     Route::put('custom-events/{event}', [CustomEventController::class, 'update'])
//         ->name('api.custom-events.update');

//     Route::delete('custom-events/{event}', [CustomEventController::class, 'destroy'])
//         ->name('api.custom-events.destroy');

//     /*
//     |--------------------------------------------------------------------------
//     | Day Notes
//     |--------------------------------------------------------------------------
//     */
//     Route::post('day-notes', [DayNoteController::class, 'store'])
//         ->name('api.day-notes.store');

//     Route::delete('day-notes/{note}', [DayNoteController::class, 'destroy'])
//         ->name('api.day-notes.destroy');

//     /*
//     |--------------------------------------------------------------------------
//     | Milestone Templates
//     |--------------------------------------------------------------------------
//     */
//     Route::prefix('milestone-templates')->name('api.milestone-templates.')->group(function () {
//         Route::get('/', [MilestoneTemplateController::class, 'index'])->name('index');
//         Route::post('/', [MilestoneTemplateController::class, 'store'])->name('store');
//         Route::put('{template}', [MilestoneTemplateController::class, 'update'])->name('update');
//         Route::delete('{template}', [MilestoneTemplateController::class, 'destroy'])->name('destroy');
//     });

// });
