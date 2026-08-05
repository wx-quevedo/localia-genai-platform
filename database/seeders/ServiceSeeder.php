<?php

namespace Database\Seeders;

use App\Models\Service;
use App\Models\User;
use Illuminate\Database\Seeder;

class ServiceSeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::where('role', 'admin')->firstOrFail();

        $chat = Service::updateOrCreate(
            ['slug' => 'chat-con-ia'],
            [
                'name'        => 'Chat con IA',
                'description' => 'Conversa con la inteligencia artificial',
                'engine'      => 'lmstudio',
                'is_active'   => true,
                'sort_order'  => 1,
                'created_by'  => $admin->id,
            ]
        );

        $chat->inputs()->updateOrCreate(
            ['key' => 'prompt'],
            [
                'label'       => 'Tu mensaje',
                'type'        => 'textarea',
                'required'    => true,
                'placeholder' => 'Escribe tu mensaje aquí...',
                'sort_order'  => 0,
            ]
        );

        $imagen = Service::updateOrCreate(
            ['slug' => 'generar-imagen'],
            [
                'name'        => 'Generar imagen',
                'description' => 'Genera imágenes con inteligencia artificial',
                'engine'      => 'comfyui',
                'is_active'   => true,
                'sort_order'  => 2,
                'created_by'  => $admin->id,
            ]
        );

        $imagen->inputs()->updateOrCreate(
            ['key' => 'prompt'],
            [
                'label'       => 'Descripción',
                'type'        => 'textarea',
                'required'    => true,
                'placeholder' => 'Describe la imagen que quieres generar...',
                'sort_order'  => 0,
            ]
        );

        $flux = Service::updateOrCreate(
            ['slug' => 'generar-imagen-flux'],
            [
                'name'          => 'Generar imagen (FLUX 2 Klein)',
                'description'   => 'Genera una imagen a partir de una imagen de referencia y un prompt',
                'engine'        => 'comfyui',
                'workflow_file' => 'flux2_klein.json',
                'is_active'     => true,
                'sort_order'    => 3,
                'created_by'    => $admin->id,
            ]
        );

        $flux->inputs()->updateOrCreate(
            ['key' => 'image'],
            [
                'label'       => 'Imagen de referencia',
                'type'        => 'image',
                'required'    => true,
                'help_text'   => 'Sube la imagen que quieres usar como referencia',
                'sort_order'  => 0,
            ]
        );

        $flux->inputs()->updateOrCreate(
            ['key' => 'prompt'],
            [
                'label'       => 'Prompt',
                'type'        => 'textarea',
                'required'    => true,
                'placeholder' => 'Describe el resultado que quieres generar...',
                'sort_order'  => 1,
            ]
        );
    }
}
