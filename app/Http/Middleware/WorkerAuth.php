<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class WorkerAuth
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $secret = env('WORKER_SECRET_TOKEN');

        if (! $secret || $request->header('X-Worker-Token') !== $secret) {
            return response()->json(['error' => 'No autorizado.'], 401);
        }

        return $next($request);
    }
}
