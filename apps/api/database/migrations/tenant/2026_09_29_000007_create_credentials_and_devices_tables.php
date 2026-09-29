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
        Schema::connection('tenant')->create('access_credentials', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('student_id')->constrained('students')->cascadeOnDelete();
            $table->string('credential_code')->unique();
            $table->string('secret_hash');
            $table->string('qr_payload')->nullable();
            $table->string('status', 50)->default('pending'); // pending, active, suspended, revoked, expired
            $table->foreignUuid('created_by_user_id')->nullable()->constrained('tenant_users')->nullOnDelete();
            $table->timestamp('issued_at')->useCurrent();
            $table->timestamp('activated_at')->nullable();
            $table->timestamp('expires_at')->nullable();
            $table->timestamp('revoked_at')->nullable();
            $table->text('revocation_reason')->nullable();
            $table->timestamps();
        });

        Schema::connection('tenant')->create('device_bindings', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('credential_id')->constrained('access_credentials')->cascadeOnDelete();
            $table->string('device_id');
            $table->string('device_name')->nullable();
            $table->string('device_fingerprint');
            $table->timestamp('bound_at')->useCurrent();
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->unique(['credential_id', 'device_id']);
        });

        Schema::connection('tenant')->create('device_change_logs', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('credential_id')->constrained('access_credentials')->cascadeOnDelete();
            $table->string('previous_device_id')->nullable();
            $table->string('new_device_id')->nullable();
            $table->text('reason');
            $table->foreignUuid('authorized_by_user_id')->constrained('tenant_users')->cascadeOnDelete();
            $table->timestamp('logged_at')->useCurrent();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::connection('tenant')->dropIfExists('device_change_logs');
        Schema::connection('tenant')->dropIfExists('device_bindings');
        Schema::connection('tenant')->dropIfExists('access_credentials');
    }
};
