#!/bin/bash

################################################################################
# Restore Script for CodeLan LMS
# Restores PostgreSQL database and uploaded files from backup
# Usage: ./scripts/restore.sh <backup_timestamp>
################################################################################

set -e  # Exit on error

# Color output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
BACKUP_ROOT="${PROJECT_ROOT}/backups"
TIMESTAMP="${1}"

# Load environment variables
if [ -f "${PROJECT_ROOT}/.env" ]; then
    source "${PROJECT_ROOT}/.env"
else
    echo -e "${RED}❌ Error: .env file not found${NC}"
    exit 1
fi

# Database configuration
DB_HOST="${DATABASE_HOST:-localhost}"
DB_PORT="${DATABASE_PORT:-5432}"
DB_NAME="${DATABASE_NAME:-codelan}"
DB_USER="${DATABASE_USER:-postgres}"
DB_PASSWORD="${DATABASE_PASSWORD}"

################################################################################
# Functions
################################################################################

log_info() {
    echo -e "${BLUE}ℹ️  $@${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $@${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $@${NC}"
}

log_error() {
    echo -e "${RED}❌ $@${NC}"
}

list_available_backups() {
    echo "Available backups:"
    echo ""
    
    local count=0
    for backup in "${BACKUP_ROOT}"/backup_*.tar.gz; do
        if [ -f "${backup}" ]; then
            local size=$(du -h "${backup}" | cut -f1)
            local ts=$(basename "${backup}" | sed 's/backup_\(.*\)\.tar\.gz/\1/')
            echo "  ${count}. ${ts} - ${size}"
            ((count++))
        fi
    done
    
    if [ ${count} -eq 0 ]; then
        log_error "No backups found"
        exit 1
    fi
}

restore_backup() {
    local backup_archive="${BACKUP_ROOT}/backup_${TIMESTAMP}.tar.gz"
    
    if [ ! -f "${backup_archive}" ]; then
        log_error "Backup not found: ${backup_archive}"
        list_available_backups
        exit 1
    fi
    
    log_info "Restoring from: ${backup_archive}"
    
    # Extract archive
    local temp_dir="${BACKUP_ROOT}/restore_temp"
    rm -rf "${temp_dir}"
    mkdir -p "${temp_dir}"
    
    log_info "Extracting backup archive..."
    tar -xzf "${backup_archive}" -C "${temp_dir}"
    
    local extracted_dir="${temp_dir}/${TIMESTAMP}"
    
    # Restore database
    log_info "Restoring database..."
    local db_file=$(find "${extracted_dir}/database" -name "*.sql.gz" | head -1)
    
    if [ -f "${db_file}" ]; then
        export PGPASSWORD="${DB_PASSWORD}"
        
        log_warning "This will DROP and recreate the database. Continue? (yes/no)"
        read -r confirm
        
        if [ "${confirm}" != "yes" ]; then
            log_info "Restore cancelled"
            rm -rf "${temp_dir}"
            exit 0
        fi
        
        gunzip -c "${db_file}" | psql -h "${DB_HOST}" -p "${DB_PORT}" -U "${DB_USER}" -d "${DB_NAME}"
        
        unset PGPASSWORD
        log_success "Database restored successfully"
    else
        log_error "Database backup file not found"
    fi
    
    # Restore uploads
    log_info "Restoring uploads..."
    if [ -d "${extracted_dir}/uploads" ]; then
        rsync -av "${extracted_dir}/uploads/" "${PROJECT_ROOT}/uploads/"
        log_success "Uploads restored successfully"
    else
        log_warning "No uploads directory in backup"
    fi
    
    # Cleanup
    rm -rf "${temp_dir}"
    log_success "Restore completed!"
}

################################################################################
# Main
################################################################################

echo ""
echo "=================================="
echo "  CodeLan LMS Restore System"
echo "=================================="
echo ""

if [ -z "${TIMESTAMP}" ]; then
    log_error "Usage: $0 <backup_timestamp>"
    echo ""
    list_available_backups
    exit 1
fi

restore_backup
