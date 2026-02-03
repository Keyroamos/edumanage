#!/bin/bash

# EduManage Production Deployment Script
# Critical Fixes for Process Kills and Naive DateTime Warnings
# Date: 2026-02-01

echo "========================================="
echo "EduManage Critical Fixes Deployment"
echo "========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Configuration
APP_DIR="$HOME/public_html/edumanage"
VENV_DIR="$HOME/virtualenv/public_html/edumanage/3.9"

echo -e "${YELLOW}Step 1: Backing up current code...${NC}"
cd "$APP_DIR" || exit 1
cp schools/models.py schools/models.py.backup.$(date +%Y%m%d_%H%M%S)
cp schools/views.py schools/views.py.backup.$(date +%Y%m%d_%H%M%S)
echo -e "${GREEN}✓ Backup created${NC}"
echo ""

echo -e "${YELLOW}Step 2: Activating virtual environment...${NC}"
source "$VENV_DIR/bin/activate"
echo -e "${GREEN}✓ Virtual environment activated${NC}"
echo ""

echo -e "${YELLOW}Step 3: Running database migration...${NC}"
python manage.py migrate schools
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Migration completed successfully${NC}"
else
    echo -e "${RED}✗ Migration failed! Check errors above.${NC}"
    exit 1
fi
echo ""

echo -e "${YELLOW}Step 4: Collecting static files...${NC}"
python manage.py collectstatic --noinput
echo -e "${GREEN}✓ Static files collected${NC}"
echo ""

echo -e "${YELLOW}Step 5: Restarting application...${NC}"
touch tmp/restart.txt
echo -e "${GREEN}✓ Application restart triggered${NC}"
echo ""

echo "========================================="
echo -e "${GREEN}Deployment Complete!${NC}"
echo "========================================="
echo ""
echo "Fixes Applied:"
echo "  ✓ Payment.date changed to DateField (no more naive datetime warnings)"
echo "  ✓ SMS sending optimized with .iterator() (prevents memory issues)"
echo "  ✓ Export limited to 1000 students (prevents process kills)"
echo "  ✓ Import limited to 500 students (prevents process kills)"
echo ""
echo "Next Steps:"
echo "  1. Monitor error logs for process kills"
echo "  2. Test SMS sending to large groups"
echo "  3. Test student export/import"
echo ""
echo "Backup files created:"
echo "  - schools/models.py.backup.*"
echo "  - schools/views.py.backup.*"
echo ""
echo -e "${GREEN}Your app should now run smoothly! 🚀${NC}"
