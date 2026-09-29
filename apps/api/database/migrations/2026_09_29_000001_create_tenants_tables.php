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
        Schema::create('tenants', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('type', 50)->default('individual_teacher'); // individual_teacher, educational_center
            $table->string('status', 50)->default('active'); // active, suspended, provisioning, archived
            $table->string('name');
            $table->string('slug')->unique();
            $table->timestamps();
        });

        Schema::create('tenant_domains', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('tenant_id')->constrained('tenants')->cascadeOnDelete();
            $table->string('domain')->unique();
            $table->string('type', 50)->default('subdomain'); // subdomain, custom
            $table->boolean('active')->default(true);
            $table->timestamps();
        });

        Schema::create('tenant_databases', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('tenant_id')->constrained('tenants')->cascadeOnDelete();
            $table->string('connection_identifier');
            $table->string('status', 50)->default('ready'); // ready, provisioning, migrating, offline
            $table->timestamps();
        });

        Schema::create('tenant_features', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('tenant_id')->constrained('tenants')->cascadeOnDelete();
            $table->string('feature_key');
            $table->boolean('enabled')->default(true);
            $table->timestamps();

            $table->unique(['tenant_id', 'feature_key']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tenant_features');
        Schema::dropIfExists('tenant_databases');
        Schema::dropIfExists('tenant_domains');
        Schema::dropIfExists('tenants');
    }
};
