<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\InvitationController;
use App\Http\Controllers\JobController;
use App\Http\Controllers\ServiceController;
use App\Http\Controllers\Admin\JobController as AdminJobController;
use App\Http\Controllers\Admin\ServiceController as AdminServiceController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// Públicas
Route::get('/', [AuthController::class, 'showLogin'])->name('login');
Route::post('/login', [AuthController::class, 'login']);
Route::post('/logout', [AuthController::class, 'logout'])->middleware('auth');

// Invitaciones públicas (para el invitado)
Route::get('/invitacion/{token}', [InvitationController::class, 'show']);
Route::post('/invitacion/{token}', [InvitationController::class, 'register']);

// Autenticadas
Route::middleware('auth')->group(function () {
    Route::get('/dashboard', fn () => Inertia::render('Dashboard'))->name('dashboard');

    // Servicios (usuarios autenticados)
    Route::get('/servicios', [ServiceController::class, 'index'])->name('services.index');
    Route::get('/servicios/{slug}', [ServiceController::class, 'show'])->name('services.show');

    // Jobs de usuario
    Route::get('/jobs', [JobController::class, 'index'])->name('jobs.index');
    Route::get('/jobs/{uuid}', [JobController::class, 'show'])->name('jobs.show');
    Route::post('/servicios/{slug}/lanzar', [JobController::class, 'store'])->name('jobs.store');

    // Solo admin
    Route::middleware('admin')->group(function () {
        Route::get('/admin/invitaciones', [InvitationController::class, 'index'])->name('admin.invitaciones');
        Route::post('/admin/invitaciones', [InvitationController::class, 'store']);
        Route::delete('/admin/invitaciones/{id}', [InvitationController::class, 'destroy']);
    });

    // Admin — jobs
    Route::middleware('admin')->group(function () {
        Route::get('/admin/jobs', [AdminJobController::class, 'index'])->name('admin.jobs.index');
    });

    // Admin — servicios
    Route::middleware('admin')->prefix('admin')->group(function () {
        Route::get('/servicios', [AdminServiceController::class, 'index'])->name('admin.services.index');
        Route::get('/servicios/crear', [AdminServiceController::class, 'create'])->name('admin.services.create');
        Route::post('/servicios', [AdminServiceController::class, 'store'])->name('admin.services.store');
        Route::get('/servicios/{id}/editar', [AdminServiceController::class, 'edit'])->name('admin.services.edit');
        Route::put('/servicios/{id}', [AdminServiceController::class, 'update'])->name('admin.services.update');
        Route::delete('/servicios/{id}', [AdminServiceController::class, 'destroy'])->name('admin.services.destroy');
        Route::patch('/servicios/{id}/toggle', [AdminServiceController::class, 'toggleActive'])->name('admin.services.toggle');
    });
});
