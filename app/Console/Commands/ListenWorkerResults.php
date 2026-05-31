<?php

namespace App\Console\Commands;

use App\Events\JobProgressUpdated;
use App\Models\UserJob;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Redis;

class ListenWorkerResults extends Command
{
    protected $signature   = 'worker:listen-results';
    protected $description = 'Escucha resultados del worker Python en Redis';

    public function handle(): void
    {
        $this->info('[worker:listen-results] Escuchando canal localia:results...');

        // subscribe() bloquea indefinidamente — ideal para Supervisor
        Redis::subscribe(['localia:results'], function (string $message) {
            try {
                $payload = json_decode($message, true, flags: JSON_THROW_ON_ERROR);

                $uuid = $payload['job_uuid'] ?? null;
                if (! $uuid) {
                    return;
                }

                $job = UserJob::where('uuid', $uuid)->first();
                if (! $job) {
                    $this->warn("Job no encontrado: {$uuid}");
                    return;
                }

                $status  = $payload['status']        ?? 'processing';
                $stage   = $payload['stage']          ?? '';
                $pct     = (int) ($payload['progress'] ?? 0);

                match ($status) {
                    'completed' => $job->markAsCompleted(
                        $payload['result_url']  ?? null,
                        $payload['result_type'] ?? null,
                        $payload['result_data'] ?? null,
                    ),
                    'failed'    => $job->markAsFailed(
                        $payload['error_message'] ?? 'Error desconocido'
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
