<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StudentIdentityLink extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'student_identity_links';

    protected $fillable = [
        'global_identity_id',
        'tenant_id',
        'tenant_student_id',
    ];

    public function globalIdentity(): BelongsTo
    {
        return $this->belongsTo(GlobalIdentity::class, 'global_identity_id');
    }

    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class, 'tenant_id');
    }
}
