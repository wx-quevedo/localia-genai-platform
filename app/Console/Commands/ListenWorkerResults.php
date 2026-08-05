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
        $host       = config('database.redis.default.host', '127.0.0.1');
        $port       = (int) config('database.redis.default.port', 6379);
        $password   = config('database.redis.default.password') ?: null;
        $channel    = 'localia-database-localia:results';
        $processing = $channel . ':processing';

        $this->info("[worker:listen-results] Iniciando. Canal: {$channel}");

        $redis = $this->makeConnection($host, $port, $password);

        // Si el proceso murió a mitad de un mensaje la vez anterior, queda
        // parado en la lista de procesamiento — lo recuperamos antes de seguir.
        $this->recoverPending($redis, $processing);

        while (true) {
            try {
                $message = $redis->blmove($channel, $processing, 'LEFT', 'RIGHT', 5);

                if ($message === false) {
                    continue;
                }

                $this->processMessage($message);
                $redis->lRem($processing, $message, 1);

            } catch (\RedisException $e) {
                $this->error('Redis error: ' . $e->getMessage() . ' — reconectando...');
                sleep(2);
                $redis = $this->makeConnection($host, $port, $password);
                $this->recoverPending($redis, $processing);

            } catch (\Throwable $e) {
                $this->error('Error: ' . $e->getMessage());
                sleep(1);
            }
        }
    }

    private function recoverPending(\Redis $redis, string $processing): void
    {
        foreach ($redis->lRange($processing, 0, -1) as $message) {
            $this->warn('[worker:listen-results] Reprocesando mensaje pendiente de una corrida anterior');
            $this->processMessage($message);
            $redis->lRem($processing, $message, 1);
        }
    }

    private function makeConnection(string $host, int $port, ?string $password): \Redis
    {
        $redis = new \Redis();
        $redis->connect($host, $port, 300); // 5 min connection timeout
        $redis->setOption(\Redis::OPT_READ_TIMEOUT, 10); // 10s read timeout
        $redis->setOption(\Redis::OPT_TCP_KEEPALIVE, true); // detecta conexiones muertas por NAT/firewall

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
