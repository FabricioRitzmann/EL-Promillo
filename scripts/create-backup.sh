#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BACKUP_DIR="$ROOT_DIR/backups"
DATE_STAMP="${1:-$(date -u +%F)}"
ARCHIVE_NAME="EL-Promillo-backup-${DATE_STAMP}.tar.gz"
ARCHIVE_PATH="$BACKUP_DIR/$ARCHIVE_NAME"
CHECKSUM_PATH="$ARCHIVE_PATH.sha256"

mkdir -p "$BACKUP_DIR"

tar \
  --exclude='./.git' \
  --exclude='./backups' \
  -czf "$ARCHIVE_PATH" \
  -C "$ROOT_DIR" .

sha256sum "$ARCHIVE_PATH" > "$CHECKSUM_PATH"

echo "Backup erstellt: $ARCHIVE_PATH"
echo "Prüfsumme erstellt: $CHECKSUM_PATH"
