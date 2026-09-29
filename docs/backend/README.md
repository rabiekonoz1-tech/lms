# Backend Documentation

## 1. Overview
The backend application is built with **Laravel 13** on **PHP 8.3**, adhering strictly to clean modular architecture principles and domain boundaries defined in `docs/master/MASTER-SPECIFICATION.md` and `AGENTS.md`.

- **Location**: `apps/api/`
- **PHP Version**: 8.3.35+
- **Laravel Framework**: 13.34.0
- **Test Framework**: PHPUnit 11
- **Code Style & Linting**: Laravel Pint

---

## 2. Directory Structure

```text
apps/api/
├── app/
│   ├── Http/Controllers/       # Thin controllers
│   ├── Models/                 # Domain/Control models
│   └── Providers/              # Service providers
├── bootstrap/                  # Application bootstrap (app.php)
├── config/                     # Configuration files
├── database/                   # Migrations, seeders, factories
├── routes/                     # API routes (api.php, console.php)
├── storage/                    # Logs and framework caches
├── tests/                      # Feature & Unit test suites
├── .env.example                # Standard environment configuration
├── phpunit.xml                 # PHPUnit test runner configuration
└── pint.json                   # Code style configuration (Pint)
```

---

## 3. Verification & Development Commands

From `apps/api/`:

```bash
# Check application status & boot
php artisan about

# Run unit and feature tests
vendor/bin/phpunit
# or
php artisan test

# Check code style with Pint
vendor/bin/pint --test

# Fix code style automatically
vendor/bin/pint
```

---

## 4. Architectural Invariants
- Thin controllers: delegate business logic to domain/application services.
- Provider abstraction: external services (Google Meet, Vimeo, Google Drive) must sit behind adapters.
- Multi-tenancy: tenant context must be resolved server-side before accessing tenant database connections.
