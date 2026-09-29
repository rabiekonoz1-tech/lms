<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations on the control database.
     */
    public function up(): void
    {
        Schema::create('global_identities', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('phone')->nullable()->index();
            $table->string('email')->nullable()->index();
            $table->string('name');
            $table->string('type', 50)->default('student'); // student, platform_admin, support
            $table->string('status', 50)->default('active'); // active, suspended, pending_verification
            $table->timestamps();
        });

        Schema::create('student_identity_links', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('global_identity_id')->constrained('global_identities')->cascadeOnDelete();
            $table->foreignUuid('tenant_id')->constrained('tenants')->cascadeOnDelete();
            $table->uuid('tenant_student_id')->index();
            $table->timestamps();

            $table->unique(['global_identity_id', 'tenant_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('student_identity_links');
        Schema::dropIfExists('global_identities');
    }
};
