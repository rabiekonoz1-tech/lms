<?php

namespace App\Support\Authorization;

use App\Models\TenantUser;

class AbacEngine
{
    /**
     * @var array<string, AbacRule[]>
     */
    protected array $policies = [];

    /**
     * Register a rule for a specific action or resource class.
     */
    public function registerRule(string $target, AbacRule $rule): void
    {
        if (! isset($this->policies[$target])) {
            $this->policies[$target] = [];
        }
        $this->policies[$target][] = $rule;
    }

    /**
     * Evaluate whether a user is authorized for an action on a resource.
     * Evaluates RBAC first, then applies ABAC rules.
     * DENY has precedence over ALLOW. INHERIT falls back.
     */
    public function authorize(TenantUser $user, string $action, mixed $resource = null, array $context = []): bool
    {
        // 1. RBAC Baseline (Implicit Allow if they have the specific permission)
        // This satisfies backwards compatibility with the existing system
        $isAllowedByRbac = $user->hasPermissionTo($action);

        // 2. Identify target for rules (either the action name, or the resource class name)
        $targets = [$action];
        if (is_object($resource)) {
            $targets[] = get_class($resource);
        }

        // 3. Evaluate ABAC Rules
        $hasExplicitAllow = false;
        $hasExplicitDeny = false;

        foreach ($targets as $target) {
            if (isset($this->policies[$target])) {
                foreach ($this->policies[$target] as $rule) {
                    $decision = $rule->evaluate($user, $action, $resource, $context);

                    if ($decision === AccessDecision::DENY) {
                        $hasExplicitDeny = true;

                        // BRULE-012 — Deny Precedence: immediate halt if Deny is encountered
                        return false;
                    }

                    if ($decision === AccessDecision::ALLOW) {
                        $hasExplicitAllow = true;
                    }
                }
            }
        }

        // 4. Resolution
        if ($hasExplicitDeny) {
            return false;
        }

        if ($hasExplicitAllow) {
            return true;
        }

        // 5. Fallback to Inherit/RBAC
        return $isAllowedByRbac;
    }
}
