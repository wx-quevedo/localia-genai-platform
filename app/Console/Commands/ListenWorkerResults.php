<?php

namespace App\Console\Commands;

use App\Events\JobProgressUpdated;
use App\Models\UserJob;
use Illuminate\Console\Command;
use Predis\Client as PredisClient;

class ListenWorkerResults extends Command
{
    protected $signature   = 'worker:listen-results';
    protected $description = 'Escucha resultados del worker Python en Redis';

    public function handle(): void
    {
        $this->info('[worker:listen-results] Iniciando conexión Predis...');

        $client = new PredisClient([
            'scheme'   => 'tcp',
            'host'     => env('REDIS_HOST', '127.0.0.1'),
            'port'     => (int) env('REDIS_PORT', 6379),
            'password' => env('REDIS_PASSWORD') ?: null,
            'database' => (int) env('REDIS_DB', 0),
        ], [
            'read_write_timeout' => 0, // sin timeout — conexión persistente
        ]);

        $channel = env('REDIS_PREFIX', 'localia-database-') . 'localia:results';

        // pubSubLoop() devuelve un Consumer iterable (API correcta de Predis 3.x).
        // El callback-based subscribe() pasaba el array raw de Redis como tercer
        // parámetro, causando "Array to string conversion" en json_decode().
        $pubsub = $client->pubSubLoop();
        $pubsub->subscribe($channel);

        $this->info("[worker:listen-results] Suscrito a {$channel}");

        foreach ($pubsub as $message) {
            // Filtrar confirmaciones de suscripción (kind = 'subscribe')
            if ($message->kind !== 'message') {
                continue;
            }

            try {
                $payload = json_decode($message->payload, true, 512, JSON_THROW_ON_ERROR);

                $uuid = $payload['job_uuid'] ?? null;
                if (! $uuid) {
                    continue;
                }

                $job = UserJob::where('uuid', $uuid)->first();
                if (! $job) {
                    $this->warn('Job no encontrado: ' . (string) $uuid);
                    continue;
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
        }
    }
}
