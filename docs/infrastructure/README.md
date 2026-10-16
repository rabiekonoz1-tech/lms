# Infrastructure Documentation

## 1. Overview

The infrastructure layer provides everything required to deploy, operate, and maintain the Multi-Tenant LMS platform in production. It is organized around a containerized stack with automated CI/CD, health monitoring, encrypted backups, and operational runbooks.

---

## 2. Directory Structure

```text
infrastructure/
├── docker-compose.yml              # Full production stack (Nginx, API, Web, MySQL, Redis)
├── .env.production.example         # Secrets template (safe to commit — no real values)
├── RUNBOOK.md                      # Operations runbook: deploy, incidents, rollback, backup
├── certs/                          # TLS certificates (NOT committed — mounted at runtime)
│   ├── fullchain.pem
│   └── privkey.pem
├── docker/
│   ├── api/
│   │   ├── Dockerfile              # PHP 8.3 FPM multi-stage — non-root, OPcache + JIT
│   │   ├── fpm-pool.conf           # PHP-FPM pool — dynamic PM, structured logging
│   │   └── opcache.ini             # OPcache + JIT tuning for production
│   ├── nginx/
│   │   └── nginx.conf              # TLS, rate limiting, security headers, proxy routing
│   ├── mysql/
│   │   └── my.cnf                  # MySQL 8.4 InnoDB + binlog + slow query configuration
│   └── web/
│       └── Dockerfile              # Next.js 16 standalone multi-stage — non-root
└── scripts/
    ├── backup.sh                   # AES-256-CBC encrypted backup (control DB + tenant DBs + Redis)
    ├── restore.sh                  # Decrypt and restore from a timestamped backup set
    └── deploy.sh                   # Zero-downtime deployment with health-check verification

.github/
└── workflows/
    └── ci.yml                      # CI (Pint, PHPUnit, TSC, ESLint, Build) + CD (GHCR + Deploy)

apps/api/app/Console/Commands/
├── HealthReportCommand.php         # php artisan lms:health-report [--json]
└── TenantAuditCommand.php          # php artisan lms:tenant-audit [--json]
```

---

## 3. Production Stack

| Service | Image | Role |
|---------|-------|------|
| Nginx | `nginx:1.27-alpine` | TLS termination, rate limiting, reverse proxy |
| API | `php:8.3-fpm-alpine` (custom) | Laravel 13 PHP-FPM application |
| Worker | same as API | Queue worker (report jobs, async tasks) |
| Web | `node:22-alpine` (custom) | Next.js 16 standalone frontend |
| MySQL | `mysql:8.4` | Control plane + tenant databases |
| Redis | `redis:7.4-alpine` | Cache, sessions, queues |

All services run as **non-root** users and have **health checks** and **log rotation** configured.

---

## 4. Security Controls (Infrastructure Layer)

| Control | Implementation |
|---------|---------------|
| TLS | Nginx TLS 1.2/1.3, HSTS preload |
| Rate limiting | 60 req/min general, 10 req/min auth endpoints |
| Security headers | X-Frame-Options, NOSNIFF, XSS, Referrer-Policy, Permissions-Policy |
| Container isolation | Non-root users, read-only mounts where possible |
| Backup encryption | AES-256-CBC with PBKDF2 key derivation |
| Secret management | `.env` never committed; all secrets via environment variables |
| Dependency auditing | `composer audit` + `npm audit` in CI security job |

---

## 5. Environment Templates

| File | Purpose |
|------|---------|
| `infrastructure/.env.production.example` | Full production secrets template |
| `apps/api/.env.example` | Laravel-specific defaults |
| `apps/web/.env.example` | Next.js public variables |

> [!IMPORTANT]
> Real credentials and secret keys must **never** be committed to version control. All `.env` files with actual values are `.gitignore`d.

---

## 6. Continuous Integration & Deployment

The GitHub Actions workflow (`.github/workflows/ci.yml`) runs on push/PR to `main`, `master`, `develop`:

### CI Jobs (all branches)
1. **Backend CI**: PHP 8.3, Composer cache, Pint style check, PHPUnit (37 tests, 407 assertions)
2. **Frontend CI**: Node 22, npm cache, TypeScript strict check, ESLint, Next.js production build

### CD Jobs (main/master only)
3. **Security Scan**: `composer audit` + `npm audit`
4. **Build & Push**: Docker images pushed to GHCR with `latest` + SHA tags
5. **Deploy Production**: SSH deploy via `deploy.sh` — gated by GitHub environment approval

---

## 7. Backup Strategy

| Backup Target | Method | Retention |
|--------------|--------|-----------|
| Control plane DB | `mysqldump --single-transaction` | 30 days |
| All tenant DBs | `mysqldump` per tenant | 30 days |
| Redis | `BGSAVE` + RDB copy | 30 days |
| Encryption | AES-256-CBC + PBKDF2 | All backups |

Schedule: Daily at 02:00 via cron.

```bash
# Verify backup integrity (dry run)
bash infrastructure/scripts/restore.sh <TIMESTAMP> --dry-run
```

---

## 8. Observability

### Health Endpoint
```
GET /api/v1/health → 200 OK (healthy) | 503 (degraded)
```

### Artisan Commands
```bash
php artisan lms:health-report          # Table view
php artisan lms:health-report --json   # JSON for monitoring agents
php artisan lms:tenant-audit           # Tenant registry audit
php artisan lms:tenant-audit --json    # JSON output
```

### Recommended Monitoring Setup
- **Uptime probe**: Poll `/api/v1/health` every 30s
- **Log aggregation**: Ship Docker JSON logs to ELK/Loki
- **Alerting**: PagerDuty/Slack on non-200 health or failed backup
- **Metrics**: Expose `/api/v1/health` JSON to Prometheus via JSON exporter

---

## 9. Operations Runbook

See **[RUNBOOK.md](./RUNBOOK.md)** for:
- First-time deployment
- Standard deployments
- Backup & restore procedures
- Tenant management
- Incident response playbooks
- Rollback procedures
- Secrets rotation
- Scaling guidance
- Log access
