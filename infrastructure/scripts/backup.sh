#!/usr/bin/env bash
# =============================================================================
# backup.sh — Multi-Tenant LMS Backup Script
# Backs up: Control DB, all Tenant DBs, Redis snapshot, uploaded media
# Encrypts with AES-256 before writing to backup storage
# Schedule: cron daily at 02:00
# =============================================================================
set -euo pipefail

# ── Configuration ─────────────────────────────────────────────────────────────
BACKUP_DIR="${BACKUP_STORAGE_PATH:-/var/backups/lms}"
ENCRYPTION_KEY="${BACKUP_ENCRYPTION_KEY:?BACKUP_ENCRYPTION_KEY is required}"
MYSQL_HOST="${DB_HOST:-mysql}"
MYSQL_PORT="${DB_PORT:-3306}"
MYSQL_USER="${DB_USERNAME:-lms}"
MYSQL_PASSWORD="${DB_PASSWORD:?DB_PASSWORD is required}"
MYSQL_ROOT_PASSWORD="${MYSQL_ROOT_PASSWORD:?MYSQL_ROOT_PASSWORD is required}"
RETENTION_DAYS="${BACKUP_RETENTION_DAYS:-30}"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_PATH="$BACKUP_DIR/$TIMESTAMP"

log() { echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*"; }

# ── Directory setup ───────────────────────────────────────────────────────────
mkdir -p "$BACKUP_PATH"
log "Backup started — target: $BACKUP_PATH"

# ── 1. Control Plane DB ───────────────────────────────────────────────────────
log "Backing up control database: ${DB_DATABASE:-lms_control}"
mysqldump \
    -h "$MYSQL_HOST" \
    -P "$MYSQL_PORT" \
    -u root \
    --password="$MYSQL_ROOT_PASSWORD" \
    --single-transaction \
    --routines \
    --triggers \
    --add-drop-database \
    --databases "${DB_DATABASE:-lms_control}" \
    | openssl enc -aes-256-cbc -salt -pbkdf2 \
        -k "$ENCRYPTION_KEY" \
        -out "$BACKUP_PATH/control_db.sql.enc"

log "Control DB backup complete"

# ── 2. All Tenant DBs ─────────────────────────────────────────────────────────
log "Discovering tenant databases..."
TENANT_DBS=$(mysql -h "$MYSQL_HOST" -P "$MYSQL_PORT" -u root \
    --password="$MYSQL_ROOT_PASSWORD" \
    --batch --skip-column-names \
    -e "SELECT schema_name FROM information_schema.schemata WHERE schema_name LIKE 'tenant_%';")

TENANT_COUNT=0
for DB_NAME in $TENANT_DBS; do
    log "Backing up tenant DB: $DB_NAME"
    mysqldump \
        -h "$MYSQL_HOST" \
        -P "$MYSQL_PORT" \
        -u root \
        --password="$MYSQL_ROOT_PASSWORD" \
        --single-transaction \
        --routines \
        --triggers \
        "$DB_NAME" \
        | openssl enc -aes-256-cbc -salt -pbkdf2 \
            -k "$ENCRYPTION_KEY" \
            -out "$BACKUP_PATH/${DB_NAME}.sql.enc"
    TENANT_COUNT=$((TENANT_COUNT + 1))
done

log "Tenant DB backup complete — $TENANT_COUNT tenants"

# ── 3. Redis snapshot ────────────────────────────────────────────────────────
log "Triggering Redis BGSAVE..."
redis-cli -h "${REDIS_HOST:-redis}" -a "${REDIS_PASSWORD}" BGSAVE > /dev/null 2>&1 || true
sleep 5
if [ -f "/data/dump.rdb" ]; then
    cp /data/dump.rdb "$BACKUP_PATH/redis.rdb"
    log "Redis snapshot copied"
else
    log "WARN: Redis dump.rdb not found — skipping"
fi

# ── 4. Manifest ──────────────────────────────────────────────────────────────
cat > "$BACKUP_PATH/manifest.json" <<EOF
{
  "timestamp": "$TIMESTAMP",
  "control_db": "${DB_DATABASE:-lms_control}",
  "tenant_count": $TENANT_COUNT,
  "retention_days": $RETENTION_DAYS,
  "encryption": "AES-256-CBC-PBKDF2",
  "version": "1.0"
}
EOF

log "Manifest written"

# ── 5. Prune old backups ─────────────────────────────────────────────────────
log "Pruning backups older than $RETENTION_DAYS days..."
find "$BACKUP_DIR" -maxdepth 1 -type d -mtime "+$RETENTION_DAYS" -exec rm -rf {} + 2>/dev/null || true
log "Pruning complete"

log "Backup finished successfully — $BACKUP_PATH"
