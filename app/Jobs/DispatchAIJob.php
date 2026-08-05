<?php

namespace App\Jobs;

use App\Models\UserJob;
use App\Services\R2Service;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Redis;
use Illuminate\Support\Facades\Storage;

class DispatchAIJob implements ShouldQueue
{
    use Queueable;

    public int $tries = 3;
    public int $timeout = 30;

    public function __construct(public readonly UserJob $userJob) {}

    public function handle(R2Service $r2): void
    {
        $job     = $this->userJob->fresh(['service.inputs']);
        $service = $job->service;
        $inputs  = $job->inputs ?? [];

        // Separar inputs de texto de paths de archivos
        $fileKeys  = $service->inputs
            ->whereIn('type', ['file', 'image', 'video'])
            ->pluck('key')
            ->flip()
            ->toArray();

        $textInputs = array_diff_key($inputs, $fileKeys);
        $fileInputs = array_intersect_key($inputs, $fileKeys);

        try {
            $job->markAsProcessing();

            // Subir cada archivo a R2 y reemplazarlo por su URL pública
            // (el worker de ComfyUI corre en una máquina remota sin acceso al disco local)
            $uploadedInputs = [];
            foreach ($fileInputs as $key => $relativePath) {
                $url = $r2->upload(
                    Storage::disk('local')->path($relativePath),
                    "jobs/{$job->uuid}/input/" . basename($relativePath),
                );
                $uploadedInputs["{$key}_url"] = $url;
                Storage::disk('local')->delete($relativePath);
            }

            $payload = [
                'job_uuid'         => $job->uuid,
                'service_slug'     => $service->slug,
                'engine'           => $service->engine,
                'workflow_file'    => $service->workflow_file,
                'inputs'           => array_merge($textInputs, $uploadedInputs),
                'chat_history'     => $job->chat_history ?? [],
                'callback_channel' => 'localia:results',
            ];

            Redis::rpush('localia:jobs', json_encode($payload));
        } catch (\Throwable $e) {
            $job->markAsFailed($e->getMessage());
            throw $e;
        }
    }

    public function failed(\Throwable $exception): void
    {
        $this->userJob->markAsFailed($exception->getMessage());
    }
}
