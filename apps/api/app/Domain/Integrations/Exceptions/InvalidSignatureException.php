<?php

namespace App\Domain\Integrations\Exceptions;

class InvalidSignatureException extends ProviderException
{
    public function __construct(string $message = 'Invalid webhook signature', string $provider = '', int $code = 401, ?\Throwable $previous = null)
    {
        parent::__construct($message, $provider, $code, $previous);
    }
}
