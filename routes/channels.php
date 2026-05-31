<?php

use App\Models\UserJob;
use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('App.Models.User.{id}', function ($user, $id) {
    return (int) $user->id === (int) $id;
});

Broadcast::channel('jobs.{uuid}', function ($user, string $uuid) {
    $job = UserJob::where('uuid', $uuid)->first();

    return $job && ($job->user_id === $user->id || $user->isAdmin());
});
