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
        Schema::connection('tenant')->create('tenant_users', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name');
            $table->string('phone')->nullable()->index();
            $table->string('email')->nullable()->index();
            $table->string('password');
            $table->string('type', 50)->default('student'); // staff, student, parent
            $table->string('status', 50)->default('active'); // active, suspended, pending_verification
            $table->rememberToken();
            $table->timestamps();
        });

        Schema::connection('tenant')->create('students', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('user_id')->constrained('tenant_users')->cascadeOnDelete();
            $table->uuid('global_identity_id')->nullable()->index();
            $table->string('student_code')->unique();
            $table->string('grade_level')->nullable();
            $table->string('status', 50)->default('active'); // active, suspended, graduated
            $table->timestamps();
        });

        Schema::connection('tenant')->create('staff', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('user_id')->constrained('tenant_users')->cascadeOnDelete();
            $table->string('staff_type', 50)->default('teacher'); // teacher, assistant, admin
            $table->string('status', 50)->default('active'); // active, inactive
            $table->timestamps();
        });

        Schema::connection('tenant')->create('parents', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('user_id')->constrained('tenant_users')->cascadeOnDelete();
            $table->string('status', 50)->default('active'); // active, inactive
            $table->timestamps();
        });

        Schema::connection('tenant')->create('student_parent', function (Blueprint $table) {
            $table->foreignUuid('student_id')->constrained('students')->cascadeOnDelete();
            $table->foreignUuid('parent_id')->constrained('parents')->cascadeOnDelete();
            $table->string('relation_type', 50)->default('guardian'); // father, mother, guardian
            $table->timestamps();

            $table->primary(['student_id', 'parent_id']);
        });

        Schema::connection('tenant')->create('roles', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name')->unique();
            $table->string('label');
            $table->boolean('is_system')->default(false);
            $table->string('description')->nullable();
            $table->timestamps();
        });

        Schema::connection('tenant')->create('permissions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name')->unique();
            $table->string('module', 50);
            $table->string('description')->nullable();
            $table->timestamps();
        });

        Schema::connection('tenant')->create('role_permission', function (Blueprint $table) {
            $table->foreignUuid('role_id')->constrained('roles')->cascadeOnDelete();
            $table->foreignUuid('permission_id')->constrained('permissions')->cascadeOnDelete();
            $table->timestamps();

            $table->primary(['role_id', 'permission_id']);
        });

        Schema::connection('tenant')->create('user_roles', function (Blueprint $table) {
            $table->foreignUuid('user_id')->constrained('tenant_users')->cascadeOnDelete();
            $table->foreignUuid('role_id')->constrained('roles')->cascadeOnDelete();
            $table->timestamps();

            $table->primary(['user_id', 'role_id']);
        });

        Schema::connection('tenant')->create('tenant_tokens', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('user_id')->constrained('tenant_users')->cascadeOnDelete();
            $table->string('token', 64)->unique();
            $table->string('name')->default('default');
            $table->text('abilities')->nullable();
            $table->timestamp('last_used_at')->nullable();
            $table->timestamp('expires_at')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::connection('tenant')->dropIfExists('tenant_tokens');
        Schema::connection('tenant')->dropIfExists('user_roles');
        Schema::connection('tenant')->dropIfExists('role_permission');
        Schema::connection('tenant')->dropIfExists('permissions');
        Schema::connection('tenant')->dropIfExists('roles');
        Schema::connection('tenant')->dropIfExists('student_parent');
        Schema::connection('tenant')->dropIfExists('parents');
        Schema::connection('tenant')->dropIfExists('staff');
        Schema::connection('tenant')->dropIfExists('students');
        Schema::connection('tenant')->dropIfExists('tenant_users');
    }
};
