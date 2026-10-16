<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('support_access_logs', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignId('platform_user_id')->constrained('users')->cascadeOnDelete();
            $table->uuid('tenant_id');
            $table->foreign('tenant_id')->references('id')->on('tenants')->cascadeOnDelete();
            $table->string('reason');
            $table->ipAddress('ip_address')->nullable();
            $table->timestamp('accessed_at');
            $table->timestamp('expires_at');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('support_access_logs');
    }
};
