<?php

namespace App\Http\Controllers;

use App\Mail\InvitationMail;
use App\Models\Invitation;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Inertia\Inertia;
use Inertia\Response;

class InvitationController extends Controller
{
    public function index(): Response
    {
        $invitations = Invitation::with('invitedBy:id,name')
            ->orderByDesc('created_at')
            ->get()
            ->map(fn(Invitation $inv) => [
                'id'          => $inv->id,
                'email'       => $inv->email,
                'invited_by'  => $inv->invitedBy?->name,
                'accepted_at' => $inv->accepted_at?->toDateTimeString(),
                'expires_at'  => $inv->expires_at->toDateTimeString(),
                'created_at'  => $inv->created_at->toDateTimeString(),
                'is_expired'  => $inv->isExpired(),
                'is_accepted' => $inv->isAccepted(),
            ]);

        return Inertia::render('Admin/Invitaciones', [
            'invitations' => $invitations,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'email' => ['required', 'email', 'unique:invitations,email', 'unique:users,email'],
        ], [
            'email.unique' => 'Ya existe una invitación o usuario con este correo.',
        ]);

        $invitation = Invitation::create([
            'email'      => $request->email,
            'invited_by' => $request->user()->id,
            'expires_at' => now()->addDays(7),
        ]);

        Mail::to($invitation->email)->send(new InvitationMail($invitation));

        return back()->with('success', 'Invitación enviada correctamente.');
    }

    public function show(string $token): Response|RedirectResponse
    {
        $invitation = Invitation::where('token', $token)->firstOrFail();

        if ($invitation->isAccepted()) {
            return redirect('/')->with('error', 'Esta invitación ya fue utilizada.');
        }

        if ($invitation->isExpired()) {
            return redirect('/')->with('error', 'Esta invitación ha expirado.');
        }

        return Inertia::render('Auth/Register', [
            'token' => $token,
            'email' => $invitation->email,
        ]);
    }

    public function register(Request $request, string $token): RedirectResponse
    {
        $invitation = Invitation::where('token', $token)->firstOrFail();

        if ($invitation->isAccepted() || $invitation->isExpired()) {
            return redirect('/')->with('error', 'Invitación inválida o expirada.');
        }

        $data = $request->validate([
            'name'                  => ['required', 'string', 'max:255'],
            'password'              => ['required', 'string', 'min:8', 'confirmed'],
        ]);

        $user = User::create([
            'name'      => $data['name'],
            'email'     => $invitation->email,
            'password'  => Hash::make($data['password']),
            'role'      => 'user',
            'is_active' => true,
        ]);

        $invitation->update(['accepted_at' => now()]);

        auth()->login($user);

        return redirect('/dashboard');
    }

    public function destroy(int $id): RedirectResponse
    {
        Invitation::findOrFail($id)->delete();

        return back()->with('success', 'Invitación eliminada.');
    }
}
