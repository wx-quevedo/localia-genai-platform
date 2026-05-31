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
    }
}
