<?php

use App\Http\Controllers\Ai\GenerateAiController;
use Illuminate\Support\Facades\Route;

Route::get('/health', function () {
    return response()->json([
        'status' => 'ok',
        'service' => 'ai-delivery-assistant-api',
    ]);
});

Route::post('/ai/generate', GenerateAiController::class);
