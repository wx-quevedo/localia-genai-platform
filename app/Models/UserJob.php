<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

class UserJob extends Model
{
    protected $fillable = [
        'uuid',
        'user_id',
        'service_id',
        'status',
        'progress',
        'current_stage',
        'inputs',
        'chat_history',
        'result_url',
        'result_type',
        'result_data',
        'error_message',
        'started_at',
        'completed_at',
    ];

    protected function casts(): array
    {
        return [
            'inputs'       => 'array',
            'chat_history' => 'array',
            'started_at'   => 'datetime',
            'completed_at' => 'datetime',
        ];
    }

    protected static function boot(): void
    {
        parent::boot();

        static::creating(function (UserJob $job) {
            $job->uuid = (string) Str::uuid();
        });
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function service(): BelongsTo
    {
        return $this->belongsTo(Service::class);
    }

    // — Estado —

    public function isPending(): bool
    {
        return $this->status === 'pending';
    }

    public function isProcessing(): bool
    {
        return $this->status === 'processing';
    }

    public function isCompleted(): bool
    {
        return $this->status === 'completed';
    }

    public function isFailed(): bool
    {
        return $this->status === 'failed';
    }

    // — Transiciones —

    public function markAsProcessing(): void
    {
        $this->update([
            'status'     => 'processing',
            'started_at' => now(),
        ]);
    }

    public function markAsCompleted(?string $resultUrl, ?string $resultType, ?string $resultData): void
    {
        $this->update([
            'status'       => 'completed',
            'progress'     => 100,
            'completed_at' => now(),
            'result_url'   => $resultUrl,
            'result_type'  => $resultType,
            'result_data'  => $resultData,
        ]);
    }

    public function markAsFailed(string $errorMessage): void
    {
        $this->update([
            'status'        => 'failed',
            'error_message' => $errorMessage,
            'completed_at'  => now(),
        ]);
    }

    public function updateProgress(int $pct, ?string $stage = null): void
    {
        $this->update([
            'progress'      => min(100, max(0, $pct)),
            'current_stage' => $stage,
        ]);
    }
}
