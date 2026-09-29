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
        Schema::connection('tenant')->create('branches', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name');
            $table->string('code')->nullable();
            $table->string('status', 50)->default('active');
            $table->timestamps();
        });

        Schema::connection('tenant')->create('classrooms', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('branch_id')->nullable()->constrained('branches')->nullOnDelete();
            $table->string('name');
            $table->integer('capacity')->default(30);
            $table->string('status', 50)->default('active');
            $table->timestamps();
        });

        Schema::connection('tenant')->create('classes', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('teacher_staff_id')->nullable()->constrained('staff')->nullOnDelete();
            $table->string('name');
            $table->string('code')->nullable();
            $table->string('status', 50)->default('active');
            $table->timestamps();
        });

        Schema::connection('tenant')->create('class_students', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('class_id')->constrained('classes')->cascadeOnDelete();
            $table->foreignUuid('student_id')->constrained('students')->cascadeOnDelete();
            $table->string('status', 50)->default('active');
            $table->timestamp('enrolled_at')->useCurrent();
            $table->timestamps();

            $table->unique(['class_id', 'student_id']);
        });

        Schema::connection('tenant')->create('sessions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('class_id')->constrained('classes')->cascadeOnDelete();
            $table->foreignUuid('classroom_id')->nullable()->constrained('classrooms')->nullOnDelete();
            $table->string('title')->nullable();
            $table->timestamp('starts_at')->useCurrent();
            $table->timestamp('ends_at')->nullable();
            $table->string('attendance_mode', 50)->default('both'); // manual, qr, both
            $table->string('status', 50)->default('scheduled'); // scheduled, in_progress, completed, cancelled
            $table->timestamps();
        });

        Schema::connection('tenant')->create('attendance_records', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('session_id')->constrained('sessions')->cascadeOnDelete();
            $table->foreignUuid('student_id')->constrained('students')->cascadeOnDelete();
            $table->foreignUuid('recorded_by_user_id')->nullable()->constrained('tenant_users')->nullOnDelete();
            $table->string('status', 50)->default('present'); // present, absent, late, excused
            $table->string('attendance_mode', 50)->default('manual'); // manual, qr
            $table->text('notes')->nullable();
            $table->timestamp('recorded_at')->useCurrent();
            $table->timestamps();

            $table->unique(['session_id', 'student_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::connection('tenant')->dropIfExists('attendance_records');
        Schema::connection('tenant')->dropIfExists('sessions');
        Schema::connection('tenant')->dropIfExists('class_students');
        Schema::connection('tenant')->dropIfExists('classes');
        Schema::connection('tenant')->dropIfExists('classrooms');
        Schema::connection('tenant')->dropIfExists('branches');
    }
};
