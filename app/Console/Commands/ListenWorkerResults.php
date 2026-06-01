<?php

namespace App\Console\Commands;

use App\Events\JobProgressUpdated;
use App\Models\UserJob;
use Illuminate\Console\Command;

class ListenWorkerResults extends Command
{
    protected $signature   = 'worker:listen-results';
    protected $description = 'Escucha resultados del worker Python en Redis';

    public function handle(): void
    {
        $host     = env('REDIS_HOST', '127.0.0.1');
        $port     = (int) env('REDIS_PORT', 6379);
        $password = env('REDIS_PASSWORD') ?: null;
        $database = (int) env('REDIS_DB', 0);
        $channel  = env('REDIS_PREFIX', 'localia-database-') . 'localia:results';

        $this->info("[worker:listen-results] Conectando a {$host}:{$port}...");

        $redis = new \Redis();

        // pconnect mantiene la conexión persistente; sin timeout (0)
        $redis->pconnect($host, $port, 0);

        if ($password) {
            $redis->auth($password);
        }

        if ($database !== 0) {
            $redis->select($database);
        }

        // subscribe() de phpredis bloquea indefinidamente hasta que la
        // conexión se cierre; es la solución más robusta para un listener
        // de larga duración bajo Supervisor.
        $this->info("[worker:listen-results] Suscrito a {$channel}");

        $redis->subscribe([$channel], function (\Redis $redis, string $chan, string $message) {
            try {
                $payload = json_decode($message, true, 512, JSON_THROW_ON_ERROR);

                $uuid = $payload['job_uuid'] ?? null;
                if (! $uuid) {
                    return;
                }

                $job = UserJob::where('uuid', $uuid)->first();
                if (! $job) {
                    $this->warn('Job no encontrado: ' . (string) $uuid);
                    return;
                }

                $status = (string) ($payload['status']   ?? 'processing');
                $stage  = (string) ($payload['stage']    ?? '');
                $pct    = (int)    ($payload['progress'] ?? 0);

                match ($status) {
                    'completed' => $job->markAsCompleted(
                        isset($payload['result_url'])  ? (string) $payload['result_url']  : null,
                        isset($payload['result_type']) ? (string) $payload['result_type'] : null,
                        isset($payload['result_data']) ? (string) $payload['result_data'] : null,
                    ),
                    'failed'    => $job->markAsFailed(
                        (string) ($payload['error_message'] ?? 'Error desconocido')
                    ),
                    default     => $job->updateProgress($pct, $stage ?: null),
                };

                JobProgressUpdated::dispatch($job, $stage);

                $this->line("[{$uuid}] status={$status} progress={$pct}% stage={$stage}");
            } catch (\Throwable $e) {
                $this->error('Error procesando mensaje: ' . $e->getMessage());
                // No relanzar — el loop debe continuar
            }
        });
    }
}
