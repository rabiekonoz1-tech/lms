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
        Schema::table('tenants', function (Blueprint $table) {
            $table->string('logo_url')->nullable()->after('slug');
            $table->string('primary_color', 30)->nullable()->default('#04c3c9')->after('logo_url');
            $table->string('secondary_color', 30)->nullable()->default('#0284c7')->after('primary_color');
            $table->string('brand_tagline')->nullable()->after('secondary_color');
            $table->json('brand_settings')->nullable()->after('brand_tagline');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tenants', function (Blueprint $table) {
            $table->dropColumn([
                'logo_url',
                'primary_color',
                'secondary_color',
                'brand_tagline',
                'brand_settings',
            ]);
        });
    }
};
