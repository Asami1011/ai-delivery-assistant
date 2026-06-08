<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class GenerateAiRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'feature' => [
                'required',
                'string',
                Rule::in([
                    'requirements',
                    'task_breakdown',
                    'code_review',
                    'business_improvement',
                ]),
            ],
            'input' => ['required', 'string', 'max:20000'],
        ];
    }

}
