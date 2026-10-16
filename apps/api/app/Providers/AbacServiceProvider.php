<?php

namespace App\Providers;

use App\Models\Course;
use App\Support\Authorization\AbacEngine;
use App\Support\Authorization\Rules\TeacherCourseRule;
use Illuminate\Support\ServiceProvider;

class AbacServiceProvider extends ServiceProvider
{
    /**
     * Register services.
     */
    public function register(): void
    {
        $this->app->singleton(AbacEngine::class, function ($app) {
            return new AbacEngine;
        });
    }

    /**
     * Bootstrap services.
     */
    public function boot(AbacEngine $engine): void
    {
        $engine->registerRule(Course::class, new TeacherCourseRule);
    }
}
