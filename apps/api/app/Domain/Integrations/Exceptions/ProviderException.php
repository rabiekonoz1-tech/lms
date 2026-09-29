<?php

namespace App\Domain\Integrations\Exceptions;

use Exception;

class ProviderException extends Exception
{
    protected string $provider;

    public function __construct(string $message, string $provider = '', int $code = 0, ?\Throwable $previous = null)
    {
        $this->provider = $provider;
        parent::__construct($message, $code, $previous);
    }

    public function getProvider(): string
    {
        return $this->provider;
    }
}
