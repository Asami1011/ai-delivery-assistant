<?php

namespace App\Http\Controllers\Ai;

use App\Http\Controllers\Controller;
use App\Http\Requests\GenerateAiRequest;
use App\Services\OpenAiService;
use Illuminate\Http\JsonResponse;

class GenerateAiController extends Controller
{
    public function __invoke(GenerateAiRequest $request, OpenAiService $openAiService): JsonResponse
    {
        $result = $openAiService->generate(
            feature: $request->string('feature')->toString(),
            input: $request->string('input')->toString(),
        );

        return response()->json([
            'data' => $result,
            'meta' => [
                'stored' => false,
            ],
        ]);
    }
}
