<?php

namespace App\Events;

use App\Models\UserJob;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class JobProgressUpdated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public readonly UserJob $job,
        public readonly string  $stage = '',
    ) {}

    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('jobs.' . $this->job->uuid),
        ];
    }

    public function broadcastAs(): string
    {
        return 'job.progress';
    }

    public function broadcastWith(): array
    {
        return [
            'uuid'          => $this->job->uuid,
            'status'        => $this->job->status,
            'progress'      => $this->job->progress,
            'current_stage' => $this->job->current_stage,
            'result_url'    => $this->job->result_url,
            'result_type'   => $this->job->result_type,
            'result_data'   => $this->job->result_data,
            'error_message' => $this->job->error_message,
        ];
    }
}
