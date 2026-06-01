<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\R2Service;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class UploadController extends Controller
{
    public function store(Request $request, R2Service $r2): JsonResponse
    {
        $request->validate([
            'job_uuid' => ['required', 'string', 'uuid'],
            'file'     => ['required', 'file', 'max:512000'], // 500 MB máx
            'type'     => ['required', 'in:image,video'],
        ]);

        $file      = $request->file('file');
        $uuid      = $request->input('job_uuid');
        $extension = $file->getClientOriginalExtension() ?: ($request->input('type') === 'video' ? 'mp4' : 'png');
        $filename  = $uuid . '.' . $extension;
        $remotePath = "jobs/{$uuid}/{$filename}";

        $url = $r2->uploadFile($file, $remotePath);

        return response()->json(['url' => $url]);
    }
}
