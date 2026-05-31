<?php

namespace App\Http\Controllers;

use App\Jobs\DispatchAIJob;
use App\Models\Service;
use App\Models\UserJob;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class JobController extends Controller
{
    public function index(Request $request): Response
    {
        $jobs = UserJob::where('user_id', $request->user()->id)
            ->with('service:id,name,slug,engine')
            ->orderByDesc('created_at')
            ->paginate(20)
            ->through(fn(UserJob $j) => [
                'uuid'          => $j->uuid,
                'service_name'  => $j->service->name,
                'service_slug'  => $j->service->slug,
                'status'        => $j->status,
                'progress'      => $j->progress,
                'current_stage' => $j->current_stage,
                'created_at'    => $j->created_at->toDateTimeString(),
                'completed_at'  => $j->completed_at?->toDateTimeString(),
            ]);

        return Inertia::render('Jobs/Index', [
            'jobs' => $jobs,
        ]);
    }

    public function show(Request $request, string $uuid): Response
    {
        $job = UserJob::where('uuid', $uuid)
            ->where('user_id', $request->user()->id)
            ->with('service:id,name,slug,engine')
            ->firstOrFail();

        return Inertia::render('Jobs/Show', [
            'job' => [
                'uuid'          => $job->uuid,
                'status'        => $job->status,
                'progress'      => $job->progress,
                'current_stage' => $job->current_stage,
                'result_url'    => $job->result_url,
                'result_type'   => $job->result_type,
                'result_data'   => $job->result_data,
                'error_message' => $job->error_message,
                'started_at'    => $job->started_at?->toDateTimeString(),
                'completed_at'  => $job->completed_at?->toDateTimeString(),
                'created_at'    => $job->created_at->toDateTimeString(),
                'service_name'  => $job->service->name,
                'service_slug'  => $job->service->slug,
            ],
        ]);
    }

    public function store(Request $request, string $slug): RedirectResponse
    {
        $service = Service::active()->where('slug', $slug)->with('inputs')->firstOrFail();

        // Validación dinámica según los inputs del servicio
        $rules = [];
        foreach ($service->inputs as $input) {
            $rule = $input->required ? ['required'] : ['nullable'];

            if (in_array($input->type, ['file', 'image', 'video'])) {
                $rule[] = 'file';
                if ($input->type === 'image') $rule[] = 'image';
                if ($input->type === 'video') $rule[] = 'mimetypes:video/mp4,video/mpeg,video/quicktime,video/webm';
            } else {
                $rule[] = 'string';
                $rule[] = 'max:10000';
            }

            $rules[$input->key] = $rule;
        }

        $validated = $request->validate($rules);

        // Crear el UserJob para obtener el UUID antes de subir archivos
        $userJob = UserJob::create([
            'user_id'    => $request->user()->id,
            'service_id' => $service->id,
            'status'     => 'pending',
        ]);

        // Subir archivos y construir el mapa de inputs
        $inputs = [];
        foreach ($service->inputs as $input) {
            $value = $validated[$input->key] ?? null;

            if (is_null($value)) {
                continue;
            }

            if (in_array($input->type, ['file', 'image', 'video']) && $value instanceof \Illuminate\Http\UploadedFile) {
                $path = $value->store("jobs/{$userJob->uuid}/{$input->key}", 'local');
                $inputs[$input->key] = $path;
            } else {
                $inputs[$input->key] = $value;
            }
        }

        $userJob->update(['inputs' => $inputs]);

        DispatchAIJob::dispatch($userJob)->onQueue('default');

        return redirect()->route('jobs.show', $userJob->uuid)
            ->with('success', 'Job enviado a la cola. El resultado aparecerá aquí cuando esté listo.');
    }
}
