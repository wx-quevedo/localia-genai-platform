<?php

namespace App\Services;

use Illuminate\Support\Facades\Storage;

class R2Service
{
    private string $baseUrl;

    public function __construct()
    {
        $this->baseUrl = rtrim(config('filesystems.disks.r2.url', ''), '/');
    }

    public function upload(string $localPath, string $remotePath): string
    {
        $contents = file_get_contents($localPath);

        Storage::disk('r2')->put($remotePath, $contents, 'public');

        return $this->getUrl($remotePath);
    }

    public function uploadFile(\Illuminate\Http\UploadedFile $file, string $remotePath): string
    {
        Storage::disk('r2')->putFileAs(
            dirname($remotePath),
            $file,
            basename($remotePath),
            'public',
        );

        return $this->getUrl($remotePath);
    }

    public function delete(string $remotePath): void
    {
        Storage::disk('r2')->delete($remotePath);
    }

    public function getUrl(string $remotePath): string
    {
        return $this->baseUrl . '/' . ltrim($remotePath, '/');
    }
}
