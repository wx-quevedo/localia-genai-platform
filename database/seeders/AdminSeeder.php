<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminSeeder extends Seeder
{
    public function run(): void
    {
        $email = env('ADMIN_EMAIL');

        if (blank($email)) {
            throw new \RuntimeException('Define ADMIN_EMAIL en .env antes de correr AdminSeeder.');
        }

        $password = env('ADMIN_PASSWORD');

        if (blank($password)) {
            throw new \RuntimeException('Define ADMIN_PASSWORD en .env antes de correr AdminSeeder.');
        }

        User::updateOrCreate(
            ['email' => $email],
            [
                'name'      => 'Washington X. Quevedo',
                'password'  => Hash::make($password),
                'role'      => 'admin',
                'is_active' => true,
            ]
        );
    }
}
