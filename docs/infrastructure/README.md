# Infrastructure Documentation

## 1. Overview
The infrastructure layout accommodates the multi-tenant architecture with Control Plane and per-tenant isolation patterns, automated CI validation, and standardized environment templates.

---

## 2. Directory Structure

```text
infrastructure/                 # IaC scripts, Docker configurations, deployment descriptors
packages/                       # Shared packages / TypeScript libraries (DTOs, utilities)
scripts/                        # Automation, provisioning, and maintenance scripts
tests/                          # System-wide, multi-tenant isolation, and E2E verification suites
.github/workflows/              # Continuous Integration (CI) definitions
├── ci.yml                      # Automated linting, typechecking, tests & build
```

---

## 3. Environment Templates

The project enforces strict environment separation:
- Root `.env.example`: Global project and database defaults
- `apps/api/.env.example`: Laravel backend configuration (DB, cache, queues, CORS)
- `apps/web/.env.example`: Next.js frontend configuration (API URLs, public keys)

> [!IMPORTANT]
> Real credentials and secret keys must **never** be committed to version control. All `.env` files with actual values are ignored by `.gitignore`.

---

## 4. Continuous Integration (CI)

The GitHub Actions workflow (`.github/workflows/ci.yml`) runs on push and pull requests for branches `main`, `master`, and `develop`:
1. **Backend Pipeline**:
   - PHP 8.3 setup with required extensions (`pdo_sqlite`, `intl`, `mbstring`, etc.)
   - Composer dependency installation
   - Application key generation
   - Pint code formatting check (`vendor/bin/pint --test`)
   - PHPUnit test suite execution (`vendor/bin/phpunit`)
2. **Frontend Pipeline**:
   - Node.js 22 setup
   - Dependency installation
   - TypeScript compilation check (`tsc --noEmit`)
   - ESLint validation (`npm run lint`)
   - Production bundle build (`npm run build`)
