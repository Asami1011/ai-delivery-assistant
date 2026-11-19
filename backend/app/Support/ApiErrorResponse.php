<?php

namespace App\Support;

use Illuminate\Http\JsonResponse;

class ApiErrorResponse
{
    /**
     * @param  array<string, mixed>  $errors
     */
    public static function make(string $message, int $status, array $errors = [], array $headers = []): JsonResponse
    {
        return response()->json([
            'message' => $message,
            'errors' => (object) $errors,
        ], $status, $headers);
    }
}
