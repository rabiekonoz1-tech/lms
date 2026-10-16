<?php

namespace Tests\Feature;

use App\Models\AccessCredential;
use App\Models\Student;
use App\Models\Tenant;
use App\Models\TenantDatabase;
use App\Models\TenantDomain;
use App\Models\TenantUser;
use App\Tenancy\TenantDatabaseManager;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Tests\TestCase;

class ConfigurableAuthModeGateTest extends TestCase
{
    use RefreshDatabase;

    protected Tenant $tenant;

    protected TenantUser $user;

    protected Student $student;

    protected AccessCredential $credential;

    protected string $plainSecret;

    protected function setUp(): void
    {
        parent::setUp();

        $slug = 'auth-'.Str::random(6);

        $this->tenant = Tenant::create([
            'slug' => $slug,
            'name' => 'Auth Mode Test Academy',
            'type' => 'school',
            'auth_mode' => 'hybrid',
            'status' => 'active',
        ]);

        TenantDomain::create([
            'tenant_id' => $this->tenant->id,
            'domain' => 'auth-test.localhost',
            'active' => true,
        ]);

        TenantDatabase::create([
            'tenant_id' => $this->tenant->id,
            'connection_identifier' => 'tenant_'.$this->tenant->slug,
            'status' => 'ready',
        ]);

        $dbManager = app(TenantDatabaseManager::class);
        $dbManager->migrateTenant($this->tenant);
        $dbManager->configureConnection($this->tenant);

        // Create student user with password
        $this->user = TenantUser::create([
            'name' => 'Sara Student',
            'email' => 'sara@auth-test.com',
            'password' => Hash::make('secret123'),
            'type' => 'student',
            'status' => 'active',
        ]);

        $this->student = Student::create([
            'user_id' => $this->user->id,
            'student_code' => 'STU-001',
            'status' => 'active',
        ]);

        // Generate credential for student
        $res = AccessCredential::generate($this->student, $this->user);
        $this->credential = $res['credential'];
        $this->plainSecret = $res['plainTextSecret'];
        $this->credential->status = 'active';
        $this->credential->save();
    }

    protected function tearDown(): void
    {
        DB::disconnect('tenant_'.$this->tenant->slug);
        $dbPath = database_path('tenants/tenant_'.$this->tenant->slug.'.sqlite');
        if (file_exists($dbPath)) {
            @unlink($dbPath);
        }
        parent::tearDown();
    }

    public function test_hybrid_mode_allows_both_password_and_coupon_logins()
    {
        // 1. Password login
        $pwRes = $this->withHeaders(['X-Tenant' => $this->tenant->slug])->postJson('/api/v1/auth/login', [
            'identifier' => 'sara@auth-test.com',
            'password' => 'secret123',
        ]);
        $pwRes->assertStatus(200)
            ->assertJsonPath('data.auth_method', 'password')
            ->assertJsonStructure(['data' => ['token', 'user']]);

        // 2. Coupon login
        $cpRes = $this->withHeaders(['X-Tenant' => $this->tenant->slug])->postJson('/api/v1/auth/login', [
            'coupon_code' => $this->credential->credential_code,
            'secret' => $this->plainSecret,
            'device_id' => 'device-123',
            'device_fingerprint' => 'fp-abc-456',
        ]);
        $cpRes->assertStatus(200)
            ->assertJsonPath('data.auth_method', 'coupon')
            ->assertJsonStructure(['data' => ['token', 'user']]);
    }

    public function test_coupon_only_mode_prohibits_password_login()
    {
        $this->tenant->update(['auth_mode' => 'coupon']);

        $response = $this->withHeaders(['X-Tenant' => $this->tenant->slug])->postJson('/api/v1/auth/login', [
            'identifier' => 'sara@auth-test.com',
            'password' => 'secret123',
        ]);

        $response->assertStatus(403)
            ->assertJsonPath('error.code', 'AUTH_MODE_PASSWORD_DISABLED');
    }

    public function test_password_only_mode_prohibits_coupon_login()
    {
        $this->tenant->update(['auth_mode' => 'password']);

        $response = $this->withHeaders(['X-Tenant' => $this->tenant->slug])->postJson('/api/v1/auth/login', [
            'coupon_code' => $this->credential->credential_code,
            'secret' => $this->plainSecret,
            'device_id' => 'device-123',
            'device_fingerprint' => 'fp-abc-456',
        ]);

        $response->assertStatus(403)
            ->assertJsonPath('error.code', 'AUTH_MODE_COUPON_DISABLED');
    }
}
