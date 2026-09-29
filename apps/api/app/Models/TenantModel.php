<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

abstract class TenantModel extends Model
{
    use HasUuids;

    /**
     * The database connection name for all tenant-scoped domain models.
     */
    protected $connection = 'tenant';
}
