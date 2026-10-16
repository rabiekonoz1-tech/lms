<?php

namespace App\Support\Authorization\Rules;

use App\Models\Course;
use App\Models\TenantUser;
use App\Support\Authorization\AbacRule;
use App\Support\Authorization\AccessDecision;

class TeacherCourseRule implements AbacRule
{
    public function evaluate(TenantUser $user, string $action, mixed $resource = null, array $context = []): AccessDecision
    {
        if (! $resource instanceof Course) {
            return AccessDecision::INHERIT;
        }

        if ($action === 'courses.update' || $action === 'courses.delete') {
            // A teacher can only modify their own courses
            if ($user->hasRole('teacher')) {
                if ($user->staff && $resource->teacher_staff_id === $user->staff->id) {
                    return AccessDecision::ALLOW;
                }

                // If they are a teacher but don't own this course, explicitly deny
                return AccessDecision::DENY;
            }
        }

        return AccessDecision::INHERIT;
    }
}
