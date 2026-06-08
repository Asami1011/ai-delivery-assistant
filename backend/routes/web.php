<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return response()->json([
        'service' => 'ai-delivery-assistant-api',
        'status' => 'ok',
    ]);
});
