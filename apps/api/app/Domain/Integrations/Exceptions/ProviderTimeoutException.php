<?php

namespace App\Domain\Integrations\Exceptions;

class ProviderTimeoutException extends ProviderException
{
    public function __construct(string $message = 'Provider operation timed out', string $provider = '', int $code = 504, ?\Throwable $previous = null)
    {
        parent::__construct($message, $provider, $code, $previous);
    }
}
