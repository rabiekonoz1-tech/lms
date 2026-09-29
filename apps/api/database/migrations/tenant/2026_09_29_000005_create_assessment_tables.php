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
        Schema::connection('tenant')->create('assignments', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('course_id')->constrained('courses')->cascadeOnDelete();
            $table->foreignUuid('lesson_id')->nullable()->constrained('lessons')->nullOnDelete();
            $table->string('title');
            $table->text('description')->nullable();
            $table->decimal('points_possible', 8, 2)->default(100.00);
            $table->timestamp('due_at')->nullable();
            $table->string('status', 50)->default('published'); // draft, published, archived
            $table->timestamps();
        });

        Schema::connection('tenant')->create('assignment_submissions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('assignment_id')->constrained('assignments')->cascadeOnDelete();
            $table->foreignUuid('student_id')->constrained('students')->cascadeOnDelete();
            $table->text('content')->nullable();
            $table->timestamp('submitted_at')->useCurrent();
            $table->boolean('is_late')->default(false);
            $table->decimal('score', 8, 2)->nullable();
            $table->text('feedback')->nullable();
            $table->foreignUuid('graded_by_user_id')->nullable()->constrained('tenant_users')->nullOnDelete();
            $table->timestamp('graded_at')->nullable();
            $table->boolean('is_grade_published')->default(false);
            $table->string('status', 50)->default('submitted'); // submitted, graded
            $table->timestamps();

            $table->unique(['assignment_id', 'student_id']);
        });

        Schema::connection('tenant')->create('exams', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('course_id')->constrained('courses')->cascadeOnDelete();
            $table->string('title');
            $table->text('description')->nullable();
            $table->integer('duration_minutes')->nullable();
            $table->decimal('total_points', 8, 2)->default(100.00);
            $table->boolean('is_published')->default(true);
            $table->boolean('is_grades_published')->default(false);
            $table->string('status', 50)->default('published'); // draft, published, archived
            $table->timestamps();
        });

        Schema::connection('tenant')->create('questions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('exam_id')->constrained('exams')->cascadeOnDelete();
            $table->text('question_text');
            $table->string('question_type', 50)->default('multiple_choice'); // multiple_choice, essay, true_false
            $table->decimal('points', 8, 2)->default(10.00);
            $table->json('options')->nullable();
            $table->string('correct_answer')->nullable();
            $table->integer('sort_order')->default(0);
            $table->timestamps();
        });

        Schema::connection('tenant')->create('exam_attempts', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('exam_id')->constrained('exams')->cascadeOnDelete();
            $table->foreignUuid('student_id')->constrained('students')->cascadeOnDelete();
            $table->timestamp('started_at')->useCurrent();
            $table->timestamp('submitted_at')->nullable();
            $table->decimal('score', 8, 2)->nullable();
            $table->string('status', 50)->default('in_progress'); // in_progress, submitted, graded
            $table->timestamps();

            $table->unique(['exam_id', 'student_id']);
        });

        Schema::connection('tenant')->create('exam_answers', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('attempt_id')->constrained('exam_attempts')->cascadeOnDelete();
            $table->foreignUuid('question_id')->constrained('questions')->cascadeOnDelete();
            $table->text('answer_text');
            $table->boolean('is_correct')->nullable();
            $table->decimal('awarded_points', 8, 2)->nullable();
            $table->timestamps();

            $table->unique(['attempt_id', 'question_id']);
        });

        Schema::connection('tenant')->create('grades', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('student_id')->constrained('students')->cascadeOnDelete();
            $table->string('gradable_type'); // assignment, exam
            $table->uuid('gradable_id');
            $table->decimal('score', 8, 2);
            $table->decimal('max_score', 8, 2);
            $table->decimal('percentage', 5, 2);
            $table->boolean('is_published')->default(false);
            $table->timestamp('graded_at')->useCurrent();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::connection('tenant')->dropIfExists('grades');
        Schema::connection('tenant')->dropIfExists('exam_answers');
        Schema::connection('tenant')->dropIfExists('exam_attempts');
        Schema::connection('tenant')->dropIfExists('questions');
        Schema::connection('tenant')->dropIfExists('exams');
        Schema::connection('tenant')->dropIfExists('assignment_submissions');
        Schema::connection('tenant')->dropIfExists('assignments');
    }
};
