<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\InvitationController;
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

    // Solo admin
    Route::middleware('admin')->group(function () {
        Route::get('/admin/invitaciones', [InvitationController::class, 'index'])->name('admin.invitaciones');
        Route::post('/admin/invitaciones', [InvitationController::class, 'store']);
        Route::delete('/admin/invitaciones/{id}', [InvitationController::class, 'destroy']);
    });
});
