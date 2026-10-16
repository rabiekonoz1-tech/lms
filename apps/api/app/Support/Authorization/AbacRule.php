<?php

namespace App\Support\Authorization;

use App\Models\TenantUser;

interface AbacRule
{
    /**
     * Evaluate the rule against a user, action, and optional resource context.
     */
    public function evaluate(TenantUser $user, string $action, mixed $resource = null, array $context = []): AccessDecision;
}
