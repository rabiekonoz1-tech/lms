<?php

namespace App\Tenancy\Exceptions;

use RuntimeException;

class TenantNotFoundException extends RuntimeException
{
    public function __construct(string $message = 'Tenant could not be resolved from request.')
    {
        parent::__construct($message);
    }
}
