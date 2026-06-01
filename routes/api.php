<?php

use App\Http\Controllers\Api\UploadController;
use Illuminate\Support\Facades\Route;

Route::post('/upload-result', [UploadController::class, 'store'])
    ->middleware('worker.auth');
