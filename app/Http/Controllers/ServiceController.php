<?php

namespace App\Http\Controllers;

use App\Models\Service;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class ServiceController extends Controller
{
    public function index(): Response
    {
        $services = Service::active()
            ->orderBy('sort_order')
            ->orderBy('name')
            ->get()
            ->map(fn(Service $s) => [
                'id'          => $s->id,
                'name'        => $s->name,
                'slug'        => $s->slug,
                'description' => $s->description,
                'engine'      => $s->engine,
            ]);

        return Inertia::render('Servicios/Index', [
            'services' => $services,
        ]);
    }

    public function show(string $slug): Response|RedirectResponse
    {
        $service = Service::active()
            ->where('slug', $slug)
            ->with('inputs')
            ->firstOrFail();

        return Inertia::render('Servicios/Show', [
            'service' => [
                'id'          => $service->id,
                'name'        => $service->name,
                'slug'        => $service->slug,
                'description' => $service->description,
                'engine'      => $service->engine,
            ],
            'inputs' => $service->inputs->map(fn($inp) => [
                'id'          => $inp->id,
                'label'       => $inp->label,
                'key'         => $inp->key,
                'type'        => $inp->type,
                'required'    => $inp->required,
                'placeholder' => $inp->placeholder,
                'help_text'   => $inp->help_text,
            ])->values(),
        ]);
    }
}
