<?php

namespace App\Exceptions;

use RuntimeException;

class AiGenerationException extends RuntimeException
{
    public function __construct(string $message = 'AI generation failed.')
    {
        parent::__construct($message);
    }
}
