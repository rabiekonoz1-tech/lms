<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations on the tenant database.
     */
    public function up(): void
    {
        Schema::connection('tenant')->create('courses', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('teacher_staff_id')->nullable()->constrained('staff')->nullOnDelete();
            $table->string('title');
            $table->string('code')->nullable();
            $table->text('description')->nullable();
            $table->string('status', 50)->default('draft'); // draft, published, archived
            $table->timestamps();
        });

        Schema::connection('tenant')->create('lessons', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('course_id')->constrained('courses')->cascadeOnDelete();
            $table->string('title');
            $table->text('content')->nullable();
            $table->integer('sort_order')->default(0);
            $table->string('status', 50)->default('published'); // draft, published
            $table->timestamps();
        });

        Schema::connection('tenant')->create('enrollments', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('student_id')->constrained('students')->cascadeOnDelete();
            $table->foreignUuid('course_id')->constrained('courses')->cascadeOnDelete();
            $table->string('status', 50)->default('active'); // active, completed, cancelled, suspended
            $table->timestamp('enrolled_at')->useCurrent();
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();

            $table->unique(['student_id', 'course_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::connection('tenant')->dropIfExists('enrollments');
        Schema::connection('tenant')->dropIfExists('lessons');
        Schema::connection('tenant')->dropIfExists('courses');
    }
};
