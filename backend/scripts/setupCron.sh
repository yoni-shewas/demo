#!/bin/bash

################################################################################
# Setup Cron Jobs for CodeLan LMS
# Configures automated daily backups
################################################################################

set -e

# Color output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
BACKUP_SCRIPT="${SCRIPT_DIR}/backup.sh"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  CodeLan LMS Cron Setup${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Check if backup script exists
if [ ! -f "${BACKUP_SCRIPT}" ]; then
    echo -e "${RED}❌ Error: Backup script not found: ${BACKUP_SCRIPT}${NC}"
    exit 1
fi

# Check if backup script is executable
if [ ! -x "${BACKUP_SCRIPT}" ]; then
    echo -e "${YELLOW}⚠️  Making backup script executable...${NC}"
    chmod +x "${BACKUP_SCRIPT}"
fi

echo -e "${BLUE}ℹ️  Current cron jobs:${NC}"
crontab -l 2>/dev/null || echo "No cron jobs configured"
echo ""

echo -e "${YELLOW}📋 Backup Schedule Options:${NC}"
echo "  1. Daily at 2:00 AM"
echo "  2. Daily at 3:00 AM"
echo "  3. Daily at 4:00 AM"
echo "  4. Every 12 hours (2 AM and 2 PM)"
echo "  5. Custom schedule"
echo "  6. Remove backup cron job"
echo "  7. Cancel"
echo ""

read -p "Select option (1-7): " option

case $option in
    1)
        CRON_SCHEDULE="0 2 * * *"
        DESCRIPTION="Daily at 2:00 AM"
        ;;
    2)
        CRON_SCHEDULE="0 3 * * *"
        DESCRIPTION="Daily at 3:00 AM"
        ;;
    3)
        CRON_SCHEDULE="0 4 * * *"
        DESCRIPTION="Daily at 4:00 AM"
        ;;
    4)
        CRON_SCHEDULE="0 2,14 * * *"
        DESCRIPTION="Every 12 hours (2 AM and 2 PM)"
        ;;
    5)
        echo ""
        echo -e "${BLUE}Enter cron schedule (e.g., '0 2 * * *' for daily at 2 AM):${NC}"
        read -p "Schedule: " CRON_SCHEDULE
        DESCRIPTION="Custom: ${CRON_SCHEDULE}"
        ;;
    6)
        # Remove existing cron job
        echo ""
        echo -e "${YELLOW}⚠️  Removing backup cron job...${NC}"
        crontab -l 2>/dev/null | grep -v "${BACKUP_SCRIPT}" | crontab - 2>/dev/null || true
        echo -e "${GREEN}✅ Backup cron job removed${NC}"
        exit 0
        ;;
    7)
        echo -e "${BLUE}ℹ️  Cancelled${NC}"
        exit 0
        ;;
    *)
        echo -e "${RED}❌ Invalid option${NC}"
        exit 1
        ;;
esac

echo ""
echo -e "${BLUE}ℹ️  Configuring backup cron job...${NC}"
echo -e "${BLUE}    Schedule: ${DESCRIPTION}${NC}"
echo -e "${BLUE}    Command: ${BACKUP_SCRIPT}${NC}"
echo ""

# Create cron job entry
CRON_JOB="${CRON_SCHEDULE} cd ${PROJECT_ROOT} && ${BACKUP_SCRIPT} auto >> ${PROJECT_ROOT}/backups/cron.log 2>&1"

# Remove existing backup cron job if any
crontab -l 2>/dev/null | grep -v "${BACKUP_SCRIPT}" | crontab - 2>/dev/null || true

# Add new cron job
(crontab -l 2>/dev/null; echo "${CRON_JOB}") | crontab -

echo -e "${GREEN}✅ Cron job configured successfully!${NC}"
echo ""
echo -e "${BLUE}📋 Current cron jobs:${NC}"
crontab -l
echo ""
echo -e "${GREEN}✅ Automated backups are now enabled${NC}"
echo -e "${BLUE}ℹ️  Backup logs will be saved to: ${PROJECT_ROOT}/backups/cron.log${NC}"
echo ""
echo -e "${YELLOW}💡 Tip: You can manually run the backup with:${NC}"
echo -e "${BLUE}    ${BACKUP_SCRIPT}${NC}"
echo ""
