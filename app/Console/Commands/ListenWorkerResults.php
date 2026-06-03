<?php

namespace App\Console\Commands;

use App\Events\JobProgressUpdated;
use App\Models\UserJob;
use Illuminate\Console\Command;

class ListenWorkerResults extends Command
{
    protected $signature   = 'worker:listen-results';
    protected $description = 'Escucha resultados del worker Python via BLPOP en Redis';

    public function handle(): void
    {
        $host     = env('REDIS_HOST', '127.0.0.1');
        $port     = (int) env('REDIS_PORT', 6379);
        $password = env('REDIS_PASSWORD') ?: null;
        $channel  = 'localia-database-localia:results';

        $this->info("[worker:listen-results] Iniciando. Canal: {$channel}");

        $redis = $this->makeConnection($host, $port, $password);

        while (true) {
            try {
                $result = $redis->blpop([$channel], 5);

                if (!$result) {
                    continue;
                }

                $this->processMessage($result[1]);

            } catch (\RedisException $e) {
                $this->error('Redis error: ' . $e->getMessage() . ' — reconectando...');
                sleep(2);
                $redis = $this->makeConnection($host, $port, $password);

            } catch (\Throwable $e) {
                $this->error('Error: ' . $e->getMessage());
                sleep(1);
            }
        }
    }

    private function makeConnection(string $host, int $port, ?string $password): \Redis
    {
        $redis = new \Redis();
        $redis->connect($host, $port, 300); // 5 min connection timeout
        $redis->setOption(\Redis::OPT_READ_TIMEOUT, 10); // 10s read timeout

        if ($password) {
            $redis->auth($password);
        }

        $this->info('[worker:listen-results] Conectado a Redis OK');

        return $redis;
    }

    private function processMessage(string $message): void
    {
        $payload = json_decode($message, true, 512, JSON_THROW_ON_ERROR);

        $uuid = $payload['job_uuid'] ?? null;
        if (!$uuid) {
            return;
        }

        $job = UserJob::where('uuid', $uuid)->first();
        if (!$job) {
            $this->warn("Job no encontrado: {$uuid}");
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
            'failed' => $job->markAsFailed(
                (string) ($payload['error_message'] ?? 'Error desconocido')
            ),
            default => $job->updateProgress($pct, $stage ?: null),
        };

        JobProgressUpdated::dispatch($job, $stage);

        $this->line("[{$uuid}] status={$status} progress={$pct}% stage={$stage}");
    }
}
