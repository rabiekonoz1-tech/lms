#!/usr/bin/env bash
# =============================================================================
# restore.sh — Multi-Tenant LMS Restore Script
# Restores a specific timestamped backup set
# Usage: ./restore.sh <TIMESTAMP> [--dry-run]
# Example: ./restore.sh 20261015_020000
# =============================================================================
set -euo pipefail

TIMESTAMP="${1:?Usage: ./restore.sh <TIMESTAMP> [--dry-run]}"
DRY_RUN="${2:-}"
BACKUP_DIR="${BACKUP_STORAGE_PATH:-/var/backups/lms}"
BACKUP_PATH="$BACKUP_DIR/$TIMESTAMP"
ENCRYPTION_KEY="${BACKUP_ENCRYPTION_KEY:?BACKUP_ENCRYPTION_KEY is required}"
MYSQL_HOST="${DB_HOST:-mysql}"
MYSQL_PORT="${DB_PORT:-3306}"
MYSQL_ROOT_PASSWORD="${MYSQL_ROOT_PASSWORD:?MYSQL_ROOT_PASSWORD is required}"

log() { echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*"; }

# ── Validate backup set ───────────────────────────────────────────────────────
if [ ! -d "$BACKUP_PATH" ]; then
    echo "ERROR: Backup not found: $BACKUP_PATH"
    exit 1
fi

if [ ! -f "$BACKUP_PATH/manifest.json" ]; then
    echo "ERROR: manifest.json missing in $BACKUP_PATH"
    exit 1
fi

log "Restoring backup: $TIMESTAMP"
cat "$BACKUP_PATH/manifest.json"

if [ "$DRY_RUN" = "--dry-run" ]; then
    log "DRY RUN — listing encrypted files that would be restored:"
    ls -lh "$BACKUP_PATH/"*.enc 2>/dev/null || log "No encrypted files found"
    log "DRY RUN complete — no data was changed"
    exit 0
fi

# ── Confirmation ─────────────────────────────────────────────────────────────
read -r -p "WARNING: This will overwrite existing databases. Type 'yes' to confirm: " CONFIRM
if [ "$CONFIRM" != "yes" ]; then
    log "Restore cancelled"
    exit 1
fi

# ── Restore control DB ────────────────────────────────────────────────────────
CONTROL_ENC="$BACKUP_PATH/control_db.sql.enc"
if [ -f "$CONTROL_ENC" ]; then
    log "Restoring control database..."
    openssl enc -d -aes-256-cbc -pbkdf2 \
        -k "$ENCRYPTION_KEY" \
        -in "$CONTROL_ENC" \
        | mysql -h "$MYSQL_HOST" -P "$MYSQL_PORT" -u root \
            --password="$MYSQL_ROOT_PASSWORD"
    log "Control database restored"
fi

# ── Restore tenant DBs ────────────────────────────────────────────────────────
TENANT_COUNT=0
for ENC_FILE in "$BACKUP_PATH"/tenant_*.sql.enc; do
    [ -f "$ENC_FILE" ] || continue
    DB_NAME=$(basename "$ENC_FILE" .sql.enc)
    log "Restoring tenant database: $DB_NAME"
    mysql -h "$MYSQL_HOST" -P "$MYSQL_PORT" -u root \
        --password="$MYSQL_ROOT_PASSWORD" \
        -e "CREATE DATABASE IF NOT EXISTS \`$DB_NAME\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
    openssl enc -d -aes-256-cbc -pbkdf2 \
        -k "$ENCRYPTION_KEY" \
        -in "$ENC_FILE" \
        | mysql -h "$MYSQL_HOST" -P "$MYSQL_PORT" -u root \
            --password="$MYSQL_ROOT_PASSWORD" "$DB_NAME"
    TENANT_COUNT=$((TENANT_COUNT + 1))
done

log "Tenant database restore complete — $TENANT_COUNT tenants"
log "Restore finished. Run application migrations if schema has changed."
log "  php artisan migrate --force"
