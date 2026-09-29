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
        Schema::connection('tenant')->create('meetings', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('title');
            $table->text('description')->nullable();
            $table->string('provider', 50)->default('mock');
            $table->string('external_meeting_id')->index();
            $table->text('join_url');
            $table->text('host_url')->nullable();
            $table->string('passcode')->nullable();
            $table->string('idempotency_key')->nullable()->index();
            $table->timestamp('start_time')->nullable();
            $table->integer('duration_minutes')->default(60);
            $table->string('status', 50)->default('scheduled'); // scheduled, in_progress, completed, cancelled
            $table->foreignUuid('course_id')->nullable()->constrained('courses')->nullOnDelete();
            $table->foreignUuid('session_id')->nullable()->constrained('sessions')->nullOnDelete();
            $table->foreignUuid('host_staff_id')->nullable()->constrained('staff')->nullOnDelete();
            $table->json('metadata')->nullable();
            $table->timestamps();
        });

        Schema::connection('tenant')->create('media_assets', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('title');
            $table->string('provider', 50)->default('mock');
            $table->string('external_media_id')->index();
            $table->string('media_type', 50)->default('video'); // video, audio, document
            $table->text('embed_url')->nullable();
            $table->text('playback_url')->nullable();
            $table->string('status', 50)->default('ready'); // uploading, processing, ready, failed
            $table->foreignUuid('course_id')->nullable()->constrained('courses')->nullOnDelete();
            $table->foreignUuid('lesson_id')->nullable()->constrained('lessons')->nullOnDelete();
            $table->unsignedBigInteger('size_bytes')->nullable();
            $table->integer('duration_seconds')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamps();
        });

        Schema::connection('tenant')->create('integration_webhook_logs', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('provider', 50);
            $table->string('event_type', 100);
            $table->json('payload');
            $table->text('signature')->nullable();
            $table->string('status', 50)->default('processed'); // processed, invalid_signature, failed
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::connection('tenant')->dropIfExists('integration_webhook_logs');
        Schema::connection('tenant')->dropIfExists('media_assets');
        Schema::connection('tenant')->dropIfExists('meetings');
    }
};
