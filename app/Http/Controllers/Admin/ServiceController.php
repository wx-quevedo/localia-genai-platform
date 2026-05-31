<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Service;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class ServiceController extends Controller
{
    public function index(): Response
    {
        $services = Service::with('inputs')
            ->withCount('inputs')
            ->orderBy('sort_order')
            ->orderBy('name')
            ->get()
            ->map(fn(Service $s) => [
                'id'           => $s->id,
                'name'         => $s->name,
                'slug'         => $s->slug,
                'engine'       => $s->engine,
                'is_active'    => $s->is_active,
                'inputs_count' => $s->inputs_count,
                'sort_order'   => $s->sort_order,
            ]);

        return Inertia::render('Admin/Servicios/Index', [
            'services' => $services,
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Admin/Servicios/Form', [
            'service' => null,
            'inputs'  => [],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'name'          => ['required', 'string', 'max:255'],
            'description'   => ['nullable', 'string'],
            'engine'        => ['required', 'in:comfyui,lmstudio'],
            'workflow_file' => ['nullable', 'string', 'max:255'],
            'is_active'     => ['boolean'],
            'sort_order'    => ['integer'],
            'inputs'        => ['array'],
            'inputs.*.label'       => ['required', 'string', 'max:255'],
            'inputs.*.key'         => ['required', 'string', 'max:100', 'regex:/^[a-z0-9_]+$/'],
            'inputs.*.type'        => ['required', 'in:text,textarea,file,image,video'],
            'inputs.*.required'    => ['boolean'],
            'inputs.*.placeholder' => ['nullable', 'string', 'max:255'],
            'inputs.*.help_text'   => ['nullable', 'string', 'max:255'],
            'inputs.*.sort_order'  => ['integer'],
        ]);

        $service = Service::create([
            'name'          => $data['name'],
            'description'   => $data['description'] ?? null,
            'engine'        => $data['engine'],
            'workflow_file' => $data['workflow_file'] ?? null,
            'is_active'     => $data['is_active'] ?? true,
            'sort_order'    => $data['sort_order'] ?? 0,
            'created_by'    => $request->user()->id,
        ]);

        foreach ($data['inputs'] ?? [] as $i => $input) {
            $service->inputs()->create([
                'label'       => $input['label'],
                'key'         => $input['key'],
                'type'        => $input['type'],
                'required'    => $input['required'] ?? true,
                'placeholder' => $input['placeholder'] ?? null,
                'help_text'   => $input['help_text'] ?? null,
                'sort_order'  => $input['sort_order'] ?? $i,
            ]);
        }

        return redirect()->route('admin.services.index')
            ->with('success', 'Servicio creado correctamente.');
    }

    public function edit(int $id): Response
    {
        $service = Service::with('inputs')->findOrFail($id);

        return Inertia::render('Admin/Servicios/Form', [
            'service' => [
                'id'            => $service->id,
                'name'          => $service->name,
                'description'   => $service->description,
                'engine'        => $service->engine,
                'workflow_file' => $service->workflow_file,
                'is_active'     => $service->is_active,
                'sort_order'    => $service->sort_order,
            ],
            'inputs' => $service->inputs->map(fn($inp) => [
                'id'          => $inp->id,
                'label'       => $inp->label,
                'key'         => $inp->key,
                'type'        => $inp->type,
                'required'    => $inp->required,
                'placeholder' => $inp->placeholder,
                'help_text'   => $inp->help_text,
                'sort_order'  => $inp->sort_order,
            ])->values(),
        ]);
    }

    public function update(Request $request, int $id): RedirectResponse
    {
        $service = Service::findOrFail($id);

        $data = $request->validate([
            'name'          => ['required', 'string', 'max:255'],
            'description'   => ['nullable', 'string'],
            'engine'        => ['required', 'in:comfyui,lmstudio'],
            'workflow_file' => ['nullable', 'string', 'max:255'],
            'is_active'     => ['boolean'],
            'sort_order'    => ['integer'],
            'inputs'        => ['array'],
            'inputs.*.label'       => ['required', 'string', 'max:255'],
            'inputs.*.key'         => ['required', 'string', 'max:100', 'regex:/^[a-z0-9_]+$/'],
            'inputs.*.type'        => ['required', 'in:text,textarea,file,image,video'],
            'inputs.*.required'    => ['boolean'],
            'inputs.*.placeholder' => ['nullable', 'string', 'max:255'],
            'inputs.*.help_text'   => ['nullable', 'string', 'max:255'],
            'inputs.*.sort_order'  => ['integer'],
        ]);

        // Re-generate slug if name changed
        $slug = $service->name !== $data['name']
            ? Str::slug($data['name'])
            : $service->slug;

        $service->update([
            'name'          => $data['name'],
            'slug'          => $slug,
            'description'   => $data['description'] ?? null,
            'engine'        => $data['engine'],
            'workflow_file' => $data['workflow_file'] ?? null,
            'is_active'     => $data['is_active'] ?? true,
            'sort_order'    => $data['sort_order'] ?? 0,
        ]);

        // Replace all inputs
        $service->inputs()->delete();
        foreach ($data['inputs'] ?? [] as $i => $input) {
            $service->inputs()->create([
                'label'       => $input['label'],
                'key'         => $input['key'],
                'type'        => $input['type'],
                'required'    => $input['required'] ?? true,
                'placeholder' => $input['placeholder'] ?? null,
                'help_text'   => $input['help_text'] ?? null,
                'sort_order'  => $input['sort_order'] ?? $i,
            ]);
        }

        return redirect()->route('admin.services.index')
            ->with('success', 'Servicio actualizado correctamente.');
    }

    public function destroy(int $id): RedirectResponse
    {
        Service::findOrFail($id)->delete();

        return back()->with('success', 'Servicio eliminado.');
    }

    public function toggleActive(int $id): RedirectResponse
    {
        $service = Service::findOrFail($id);
        $service->update(['is_active' => ! $service->is_active]);

        return back()->with('success', $service->is_active
            ? 'Servicio activado.'
            : 'Servicio desactivado.'
        );
    }
}
