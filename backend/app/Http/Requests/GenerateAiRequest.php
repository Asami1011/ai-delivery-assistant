<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

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

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator): void {
            $feature = $this->string('feature')->toString();
            $input = $this->string('input')->toString();

            if ($feature !== 'code_review') {
                return;
            }

            $decoded = json_decode($input, true);

            if (! is_array($decoded)) {
                $validator->errors()->add('input', 'input は JSON文字列で指定してください。');
                return;
            }

            $this->validateCodeReviewInput($validator, $decoded);
        });
    }

    /**
     * @param array<string, mixed> $decoded
     */
    private function validateCodeReviewInput(Validator $validator, array $decoded): void
    {
        $rules = [
            'review_type' => ['required', 'string', Rule::in(['requirements', 'task_breakdown', 'code_diff', 'design_note', 'other'])],
            'technology' => ['required', 'string', 'min:1', 'max:200'],
            'review_target' => ['required', 'string', 'min:20', 'max:12000'],
            'review_focus' => ['required', 'string', 'min:2', 'max:2000'],
            'context' => ['nullable', 'string', 'max:3000'],
            'output_level' => ['nullable', 'string', Rule::in(['short', 'standard', 'detailed'])],
            'notes' => ['nullable', 'string', 'max:2000'],
        ];

        $messages = [
            'review_type.required' => 'レビュー対象の種類は必須です。',
            'review_type.in' => 'レビュー対象の種類が不正です。',
            'technology.required' => '技術スタックは必須です。',
            'review_target.required' => 'レビュー対象は必須です。',
            'review_target.min' => 'レビュー対象は20文字以上で入力してください。',
            'review_target.max' => 'レビュー対象は12000文字以内で入力してください。',
            'review_focus.required' => '何をどうレビューしてほしいかは必須です。',
            'review_focus.min' => '何をどうレビューしてほしいかは2文字以上で入力してください。',
            'review_focus.max' => '何をどうレビューしてほしいかは2000文字以内で入力してください。',
            'context.max' => '背景・前提は3000文字以内で入力してください。',
            'output_level.in' => '出力の詳しさは short, standard, detailed のいずれかで指定してください。',
            'notes.max' => '補足情報は2000文字以内で入力してください。',
        ];

        $nestedValidator = \Validator::make($decoded, $rules, $messages);

        if ($nestedValidator->fails()) {
            foreach ($nestedValidator->errors()->messages() as $field => $fieldMessages) {
                foreach ($fieldMessages as $message) {
                    $validator->errors()->add($field, $message);
                }
            }
        }
    }

}
