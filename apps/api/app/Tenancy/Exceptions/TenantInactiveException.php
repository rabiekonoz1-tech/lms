<?php

namespace App\Tenancy\Exceptions;

use RuntimeException;

class TenantInactiveException extends RuntimeException
{
    public function __construct(string $message = 'Tenant is inactive, suspended, or archived.')
    {
        parent::__construct($message);
    }
}
