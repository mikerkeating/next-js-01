#!/bin/bash
# check-package-readmes.sh - Validate all packages have README.md files
#
# Documentation quality gate script
# See: docs/3-epics/1A.4-documentation-foundation/S7-docs-quality-gates.md
#
# Usage:
#   ./scripts/check-package-readmes.sh
#
# Exit codes:
#   0 - All packages have README.md files
#   1 - One or more packages missing README.md

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

# Counter for missing READMEs
missing_count=0
checked_count=0
missing_packages=()

echo "Checking for README.md files in packages..."
echo ""

# Check packages directory
if [ -d "packages" ]; then
  for pkg_dir in packages/*/; do
    if [ -d "$pkg_dir" ]; then
      pkg_name=$(basename "$pkg_dir")
      checked_count=$((checked_count + 1))

      if [ ! -f "${pkg_dir}README.md" ]; then
        echo -e "${RED}MISSING${NC}: ${pkg_dir}README.md"
        missing_count=$((missing_count + 1))
        missing_packages+=("$pkg_name")
      else
        echo -e "${GREEN}OK${NC}: ${pkg_dir}README.md"
      fi
    fi
  done
else
  echo -e "${YELLOW}WARNING${NC}: No packages/ directory found"
fi

# Check apps directory for README.md as well
if [ -d "apps" ]; then
  echo ""
  echo "Checking for README.md files in apps..."
  echo ""

  for app_dir in apps/*/; do
    if [ -d "$app_dir" ]; then
      app_name=$(basename "$app_dir")
      checked_count=$((checked_count + 1))

      if [ ! -f "${app_dir}README.md" ]; then
        echo -e "${RED}MISSING${NC}: ${app_dir}README.md"
        missing_count=$((missing_count + 1))
        missing_packages+=("$app_name")
      else
        echo -e "${GREEN}OK${NC}: ${app_dir}README.md"
      fi
    fi
  done
fi

echo ""
echo "----------------------------------------"
echo "Summary"
echo "----------------------------------------"
echo "Checked: $checked_count packages/apps"
echo "Missing: $missing_count README.md files"

if [ $missing_count -gt 0 ]; then
  echo ""
  echo -e "${RED}ERROR${NC}: The following packages/apps are missing README.md:"
  for pkg in "${missing_packages[@]}"; do
    echo "  - $pkg"
  done
  echo ""
  echo "Please create README.md files for each package/app."
  echo "See: docs/2-technical/2-tad-documentation.md#documentation-structure"
  exit 1
fi

echo ""
echo -e "${GREEN}All packages and apps have README.md files.${NC}"
exit 0
