<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Service;
use App\Models\UserJob;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class JobController extends Controller
{
    public function index(Request $request): Response
    {
        $query = UserJob::with(['user:id,name,email', 'service:id,name,slug'])
            ->orderByDesc('created_at');

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('service_id')) {
            $query->where('service_id', $request->service_id);
        }

        $jobs = $query->paginate(30)->through(fn(UserJob $j) => [
            'uuid'          => $j->uuid,
            'user_name'     => $j->user->name,
            'user_email'    => $j->user->email,
            'service_name'  => $j->service->name,
            'service_slug'  => $j->service->slug,
            'status'        => $j->status,
            'progress'      => $j->progress,
            'current_stage' => $j->current_stage,
            'error_message' => $j->error_message,
            'started_at'    => $j->started_at?->toDateTimeString(),
            'completed_at'  => $j->completed_at?->toDateTimeString(),
            'created_at'    => $j->created_at->toDateTimeString(),
        ]);

        $services = Service::orderBy('name')->get(['id', 'name']);

        return Inertia::render('Admin/Jobs/Index', [
            'jobs'     => $jobs,
            'services' => $services,
            'filters'  => $request->only(['status', 'service_id']),
        ]);
    }
}
