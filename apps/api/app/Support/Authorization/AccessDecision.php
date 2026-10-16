<?php

namespace App\Support\Authorization;

enum AccessDecision: string
{
    case ALLOW = 'allow';
    case DENY = 'deny';
    case INHERIT = 'inherit';
}
