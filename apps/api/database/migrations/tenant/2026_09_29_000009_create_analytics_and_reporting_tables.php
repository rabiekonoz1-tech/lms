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
        Schema::connection('tenant')->create('metric_definitions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('key')->unique();
            $table->string('name');
            $table->text('description')->nullable();
            $table->string('category', 50)->default('academic'); // academic, attendance, engagement, custom
            $table->integer('current_version')->default(1);
            $table->string('calculation_formula')->nullable();
            $table->foreignUuid('created_by_staff_id')->nullable()->constrained('staff')->nullOnDelete();
            $table->timestamps();
        });

        Schema::connection('tenant')->create('metric_versions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('metric_definition_id')->constrained('metric_definitions')->cascadeOnDelete();
            $table->integer('version');
            $table->json('formula_definition')->nullable();
            $table->timestamp('effective_from')->nullable();
            $table->text('changelog')->nullable();
            $table->timestamps();

            $table->unique(['metric_definition_id', 'version']);
        });

        Schema::connection('tenant')->create('metric_measurements', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('student_id')->constrained('students')->cascadeOnDelete();
            $table->foreignUuid('metric_definition_id')->constrained('metric_definitions')->cascadeOnDelete();
            $table->foreignUuid('metric_version_id')->constrained('metric_versions')->cascadeOnDelete();
            $table->decimal('value', 8, 2);
            $table->date('period_start')->nullable();
            $table->date('period_end')->nullable();
            $table->string('context_type', 50)->nullable();
            $table->uuid('context_id')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamp('recorded_at');
            $table->timestamps();
        });

        Schema::connection('tenant')->create('student_analytics_snapshots', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('student_id')->constrained('students')->cascadeOnDelete();
            $table->foreignUuid('course_id')->nullable()->constrained('courses')->cascadeOnDelete();
            $table->decimal('attendance_rate', 5, 2)->default(0.00);
            $table->decimal('assignment_completion_rate', 5, 2)->default(0.00);
            $table->decimal('exam_average', 5, 2)->default(0.00);
            $table->decimal('overall_score', 5, 2)->default(0.00);
            $table->json('custom_metrics_summary')->nullable();
            $table->timestamp('last_calculated_at')->nullable();
            $table->timestamps();

            $table->unique(['student_id', 'course_id']);
        });

        Schema::connection('tenant')->create('report_definitions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('key')->unique();
            $table->string('name');
            $table->text('description')->nullable();
            $table->string('type', 50)->default('student_transcript');
            $table->json('supported_formats')->nullable();
            $table->timestamps();
        });

        Schema::connection('tenant')->create('report_instances', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('report_definition_id')->nullable()->constrained('report_definitions')->nullOnDelete();
            $table->string('title');
            $table->foreignUuid('requested_by_user_id')->constrained('tenant_users')->cascadeOnDelete();
            $table->string('status', 50)->default('queued'); // queued, processing, completed, failed
            $table->string('format', 20)->default('json');
            $table->json('parameters')->nullable();
            $table->json('data_payload')->nullable();
            $table->string('file_path')->nullable();
            $table->text('error_message')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::connection('tenant')->dropIfExists('report_instances');
        Schema::connection('tenant')->dropIfExists('report_definitions');
        Schema::connection('tenant')->dropIfExists('student_analytics_snapshots');
        Schema::connection('tenant')->dropIfExists('metric_measurements');
        Schema::connection('tenant')->dropIfExists('metric_versions');
        Schema::connection('tenant')->dropIfExists('metric_definitions');
    }
};
