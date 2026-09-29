<?php

namespace App\Models;

class TenantCourse extends TenantModel
{
    protected $table = 'tenant_courses';

    protected $fillable = [
        'title',
        'code',
    ];
}
