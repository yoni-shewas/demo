#!/bin/bash

################################################################################
# Backup Script for CodeLan LMS
# Backs up PostgreSQL database and uploaded files
# Usage: ./scripts/backup.sh [manual|auto]
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
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_DIR="${BACKUP_ROOT}/${TIMESTAMP}"
LOG_FILE="${BACKUP_ROOT}/backup.log"

# Load environment variables
if [ -f "${PROJECT_ROOT}/.env" ]; then
    source "${PROJECT_ROOT}/.env"
else
    echo -e "${RED}❌ Error: .env file not found${NC}"
    exit 1
fi

# Database configuration from .env
DB_HOST="${DATABASE_HOST:-localhost}"
DB_PORT="${DATABASE_PORT:-5432}"
DB_NAME="${DATABASE_NAME:-codelan}"
DB_USER="${DATABASE_USER:-postgres}"
DB_PASSWORD="${DATABASE_PASSWORD}"

# Backup retention (days)
RETENTION_DAYS="${BACKUP_RETENTION_DAYS:-7}"

# Backup mode
BACKUP_MODE="${1:-auto}"

################################################################################
# Functions
################################################################################

log_message() {
    local level=$1
    shift
    local message="$@"
    local timestamp=$(date +"%Y-%m-%d %H:%M:%S")
    echo -e "${timestamp} [${level}] ${message}" | tee -a "${LOG_FILE}"
}

log_info() {
    log_message "INFO" "${BLUE}ℹ️  $@${NC}"
}

log_success() {
    log_message "SUCCESS" "${GREEN}✅ $@${NC}"
}

log_warning() {
    log_message "WARNING" "${YELLOW}⚠️  $@${NC}"
}

log_error() {
    log_message "ERROR" "${RED}❌ $@${NC}"
}

check_dependencies() {
    log_info "Checking dependencies..."
    
    if ! command -v pg_dump &> /dev/null; then
        log_error "pg_dump not found. Please install PostgreSQL client tools."
        exit 1
    fi
    
    if ! command -v rsync &> /dev/null; then
        log_warning "rsync not found. Will use cp instead (slower)."
    fi
    
    log_success "Dependencies check passed"
}

create_backup_directory() {
    log_info "Creating backup directory: ${BACKUP_DIR}"
    
    mkdir -p "${BACKUP_DIR}/database"
    mkdir -p "${BACKUP_DIR}/uploads"
    mkdir -p "${BACKUP_ROOT}/logs"
    
    log_success "Backup directories created"
}

backup_database() {
    log_info "Starting database backup..."
    
    local db_backup_file="${BACKUP_DIR}/database/${DB_NAME}_${TIMESTAMP}.sql"
    local db_backup_compressed="${db_backup_file}.gz"
    
    # Set password for pg_dump
    export PGPASSWORD="${DB_PASSWORD}"
    
    # Perform database dump
    if pg_dump -h "${DB_HOST}" -p "${DB_PORT}" -U "${DB_USER}" -d "${DB_NAME}" \
        --clean --if-exists --verbose > "${db_backup_file}" 2>> "${LOG_FILE}"; then
        
        # Compress the backup
        gzip "${db_backup_file}"
        
        local size=$(du -h "${db_backup_compressed}" | cut -f1)
        log_success "Database backup completed: ${db_backup_compressed} (${size})"
        
        # Create a metadata file
        cat > "${BACKUP_DIR}/database/metadata.json" <<EOF
{
  "timestamp": "${TIMESTAMP}",
  "database": "${DB_NAME}",
  "host": "${DB_HOST}",
  "port": "${DB_PORT}",
  "backup_file": "$(basename ${db_backup_compressed})",
  "size": "${size}",
  "mode": "${BACKUP_MODE}"
}
EOF
        
        return 0
    else
        log_error "Database backup failed"
        return 1
    fi
    
    unset PGPASSWORD
}

backup_uploads() {
    log_info "Starting uploads backup..."
    
    local uploads_dir="${PROJECT_ROOT}/uploads"
    local uploads_backup="${BACKUP_DIR}/uploads"
    
    if [ ! -d "${uploads_dir}" ]; then
        log_warning "Uploads directory not found: ${uploads_dir}"
        return 0
    fi
    
    # Count files
    local file_count=$(find "${uploads_dir}" -type f 2>/dev/null | wc -l)
    
    if [ ${file_count} -eq 0 ]; then
        log_info "No files to backup in uploads directory"
        return 0
    fi
    
    log_info "Found ${file_count} files to backup"
    
    # Use rsync if available, otherwise use cp
    if command -v rsync &> /dev/null; then
        if rsync -av --progress "${uploads_dir}/" "${uploads_backup}/" 2>> "${LOG_FILE}"; then
            local size=$(du -sh "${uploads_backup}" | cut -f1)
            log_success "Uploads backup completed: ${file_count} files (${size})"
            return 0
        else
            log_error "Uploads backup failed (rsync)"
            return 1
        fi
    else
        if cp -r "${uploads_dir}/"* "${uploads_backup}/" 2>> "${LOG_FILE}"; then
            local size=$(du -sh "${uploads_backup}" | cut -f1)
            log_success "Uploads backup completed: ${file_count} files (${size})"
            return 0
        else
            log_error "Uploads backup failed (cp)"
            return 1
        fi
    fi
}

backup_logs() {
    log_info "Backing up application logs..."
    
    local logs_dir="${PROJECT_ROOT}/logs"
    local logs_backup="${BACKUP_DIR}/logs"
    
    if [ ! -d "${logs_dir}" ]; then
        log_info "No logs directory found"
        return 0
    fi
    
    mkdir -p "${logs_backup}"
    
    if cp -r "${logs_dir}/"*.log "${logs_backup}/" 2>/dev/null; then
        log_success "Logs backed up successfully"
    else
        log_info "No log files to backup"
    fi
}

create_backup_archive() {
    log_info "Creating compressed archive..."
    
    local archive_file="${BACKUP_ROOT}/backup_${TIMESTAMP}.tar.gz"
    
    cd "${BACKUP_ROOT}"
    if tar -czf "${archive_file}" "${TIMESTAMP}" 2>> "${LOG_FILE}"; then
        local size=$(du -h "${archive_file}" | cut -f1)
        log_success "Archive created: ${archive_file} (${size})"
        
        # Remove uncompressed backup directory
        rm -rf "${BACKUP_DIR}"
        log_info "Uncompressed backup directory removed"
    else
        log_error "Failed to create archive"
        return 1
    fi
}

cleanup_old_backups() {
    log_info "Cleaning up backups older than ${RETENTION_DAYS} days..."
    
    local deleted_count=0
    
    # Find and delete old backup archives
    find "${BACKUP_ROOT}" -name "backup_*.tar.gz" -type f -mtime +${RETENTION_DAYS} -print0 | while IFS= read -r -d '' file; do
        log_info "Deleting old backup: $(basename ${file})"
        rm -f "${file}"
        ((deleted_count++))
    done
    
    # Find and delete old backup directories (in case archive failed)
    find "${BACKUP_ROOT}" -maxdepth 1 -type d -name "20*" -mtime +${RETENTION_DAYS} -print0 | while IFS= read -r -d '' dir; do
        log_info "Deleting old backup directory: $(basename ${dir})"
        rm -rf "${dir}"
        ((deleted_count++))
    done
    
    if [ ${deleted_count} -gt 0 ]; then
        log_success "Cleaned up ${deleted_count} old backup(s)"
    else
        log_info "No old backups to clean up"
    fi
}

list_backups() {
    log_info "Available backups:"
    echo ""
    
    if [ ! -d "${BACKUP_ROOT}" ]; then
        log_info "No backups found"
        return
    fi
    
    local backup_count=0
    
    for backup in "${BACKUP_ROOT}"/backup_*.tar.gz; do
        if [ -f "${backup}" ]; then
            local size=$(du -h "${backup}" | cut -f1)
            local date=$(basename "${backup}" | sed 's/backup_\(.*\)\.tar\.gz/\1/')
            echo "  📦 ${date} - ${size}"
            ((backup_count++))
        fi
    done
    
    if [ ${backup_count} -eq 0 ]; then
        log_info "No backups found"
    else
        echo ""
        log_info "Total backups: ${backup_count}"
    fi
}

################################################################################
# Main execution
################################################################################

main() {
    echo ""
    echo "=================================="
    echo "  CodeLan LMS Backup System"
    echo "=================================="
    echo ""
    
    log_info "Backup started (mode: ${BACKUP_MODE})"
    log_info "Timestamp: ${TIMESTAMP}"
    
    # Check dependencies
    check_dependencies
    
    # Create backup directory
    create_backup_directory
    
    # Perform backups
    local backup_success=true
    
    if ! backup_database; then
        backup_success=false
    fi
    
    if ! backup_uploads; then
        backup_success=false
    fi
    
    backup_logs
    
    # Create archive if backups succeeded
    if [ "$backup_success" = true ]; then
        create_backup_archive
    else
        log_error "Some backups failed. Archive not created."
    fi
    
    # Cleanup old backups
    cleanup_old_backups
    
    # List available backups
    list_backups
    
    echo ""
    if [ "$backup_success" = true ]; then
        log_success "Backup completed successfully!"
    else
        log_error "Backup completed with errors. Check log: ${LOG_FILE}"
        exit 1
    fi
    
    echo "=================================="
    echo ""
}

# Run main function
main
