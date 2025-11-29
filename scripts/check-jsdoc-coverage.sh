#!/bin/bash
# check-jsdoc-coverage.sh - Validate JSDoc coverage for public functions
#
# Documentation quality gate script
# See: docs/3-epics/1A.4-documentation-foundation/S7-docs-quality-gates.md
#
# Requirements (from story AD-1A.4.S7.2):
#   - 80% of public functions must have JSDoc
#   - Scope: packages/*/src/**/*.{ts,tsx}
#   - Excluded: test files, type definition files, internal utils
#
# Usage:
#   ./scripts/check-jsdoc-coverage.sh [--warn-only]
#
# Exit codes:
#   0 - JSDoc coverage meets threshold
#   1 - JSDoc coverage below threshold (unless --warn-only)

set -euo pipefail

# Change to repository root (parent of scripts directory)
cd "$(dirname "$0")/.."

# Configuration
THRESHOLD=80  # Minimum JSDoc coverage percentage
WARN_ONLY=false

# Parse arguments
if [ "${1:-}" = "--warn-only" ]; then
  WARN_ONLY=true
fi

# Colors for output (works on most terminals)
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo "JSDoc Coverage Check"
echo "===================="
echo ""
echo "Threshold: ${THRESHOLD}%"
echo "Scope: packages/*/src/**/*.{ts,tsx}"
echo "Excludes: test files, type definitions, internal utils"
echo ""

# Counters
total_exports=0
documented_exports=0
packages_checked=0

# Check if packages directory exists
if [ ! -d "packages" ]; then
  echo -e "${YELLOW}WARNING${NC}: No packages/ directory found"
  echo ""
  echo -e "${GREEN}SUCCESS${NC}: No packages to check - coverage meets threshold by default"
  exit 0
fi

# Check if there are any package directories
pkg_count=$(find packages -maxdepth 1 -mindepth 1 -type d 2>/dev/null | wc -l | tr -d ' ')
if [ "$pkg_count" = "0" ]; then
  echo -e "${YELLOW}INFO${NC}: No packages found in packages/ directory"
  echo ""
  echo -e "${GREEN}SUCCESS${NC}: No packages to check - coverage meets threshold by default"
  exit 0
fi

# Process each package
for pkg_dir in packages/*/; do
  if [ ! -d "$pkg_dir" ]; then
    continue
  fi

  pkg_name=$(basename "$pkg_dir")
  pkg_src="${pkg_dir}src"

  # Skip if no src directory
  if [ ! -d "$pkg_src" ]; then
    echo -e "${YELLOW}SKIP${NC}: $pkg_name (no src/ directory)"
    continue
  fi

  packages_checked=$((packages_checked + 1))
  pkg_total=0
  pkg_documented=0

  # Find TypeScript files
  ts_files=$(find "$pkg_src" -type f \( -name "*.ts" -o -name "*.tsx" \) 2>/dev/null || true)

  if [ -z "$ts_files" ]; then
    echo -e "${BLUE}INFO${NC}: $pkg_name - No TypeScript files found"
    continue
  fi

  # Process each file
  echo "$ts_files" | while IFS= read -r file; do
    # Skip if file is empty
    [ -z "$file" ] && continue

    # Skip test files
    case "$file" in
      *.test.* | *.spec.* | */test/* | */__tests__/*)
        continue
        ;;
    esac

    # Skip type definition files
    case "$file" in
      *.d.ts)
        continue
        ;;
    esac

    # Skip internal utils
    case "$file" in
      */internal/* | */_internal/*)
        continue
        ;;
    esac

    # -------------------------------------------------------------------------
    # Export Detection Heuristic
    # -------------------------------------------------------------------------
    # Counted as exports:
    #   - export function / export async function
    #   - export const / export let / export var
    #   - export class / export abstract class
    #   - export interface / export type
    #   - export default (function, class, const, etc.)
    #   - export { ... } from '...' (re-exports)
    #
    # Intentionally excluded:
    #   - Inline exports within object literals or function bodies
    #   - Dynamic exports (module.exports, exports.foo)
    #   - export = syntax (legacy TypeScript)
    #
    # JSDoc detection accepts up to 3 blank/whitespace-only lines between
    # the closing */ and the export statement.
    # -------------------------------------------------------------------------

    # Count exported functions/classes/constants including default and re-exports
    file_exports=$(grep -cE "^export (async )?(function |const |let |var |class |abstract class |interface |type |default )|^export \{[^}]+\} from " "$file" 2>/dev/null || echo "0")

    # Count documented exports (JSDoc ending with */ followed by export,
    # allowing up to 3 blank/whitespace-only lines between them)
    documented_in_file=0
    lines_since_jsdoc=999  # Large number = no recent JSDoc

    while IFS= read -r line; do
      # Check for JSDoc end (line ending with */)
      case "$line" in
        *"*/")
          lines_since_jsdoc=0
          continue
          ;;
      esac

      # Check if this is a blank/whitespace-only line
      trimmed="${line#"${line%%[![:space:]]*}"}"
      if [ -z "$trimmed" ]; then
        # Blank line: increment counter but stay in "after JSDoc" window
        if [ "$lines_since_jsdoc" -lt 999 ]; then
          lines_since_jsdoc=$((lines_since_jsdoc + 1))
        fi
        continue
      fi

      # Check for export after JSDoc (within 3-line window)
      if [ "$lines_since_jsdoc" -le 3 ]; then
        case "$line" in
          export\ * | "export	"*)
            documented_in_file=$((documented_in_file + 1))
            ;;
        esac
      fi

      # Non-blank line resets the JSDoc window
      lines_since_jsdoc=999
    done < "$file"

    # Write to temp files for aggregation (subshell can't modify parent vars)
    echo "$file_exports" >> /tmp/jsdoc_pkg_total_$$
    echo "$documented_in_file" >> /tmp/jsdoc_pkg_doc_$$

  done

  # Read aggregated values from temp files
  if [ -f /tmp/jsdoc_pkg_total_$$ ]; then
    while read -r num; do
      pkg_total=$((pkg_total + num))
    done < /tmp/jsdoc_pkg_total_$$
    rm -f /tmp/jsdoc_pkg_total_$$
  fi

  if [ -f /tmp/jsdoc_pkg_doc_$$ ]; then
    while read -r num; do
      pkg_documented=$((pkg_documented + num))
    done < /tmp/jsdoc_pkg_doc_$$
    rm -f /tmp/jsdoc_pkg_doc_$$
  fi

  # Calculate package coverage
  if [ "$pkg_total" -gt 0 ]; then
    pkg_coverage=$((pkg_documented * 100 / pkg_total))

    if [ "$pkg_coverage" -ge "$THRESHOLD" ]; then
      echo -e "${GREEN}PASS${NC}: $pkg_name - $pkg_documented/$pkg_total exports documented ($pkg_coverage%)"
    else
      echo -e "${RED}FAIL${NC}: $pkg_name - $pkg_documented/$pkg_total exports documented ($pkg_coverage%)"
    fi
  else
    echo -e "${BLUE}INFO${NC}: $pkg_name - No exported functions found"
  fi

  total_exports=$((total_exports + pkg_total))
  documented_exports=$((documented_exports + pkg_documented))
done

# Calculate overall coverage
if [ "$total_exports" -gt 0 ]; then
  overall_coverage=$((documented_exports * 100 / total_exports))
else
  overall_coverage=100
fi

echo ""
echo "----------------------------------------"
echo "Summary"
echo "----------------------------------------"
echo "Packages checked: $packages_checked"
echo "Total exports: $total_exports"
echo "Documented exports: $documented_exports"
echo "Overall coverage: ${overall_coverage}%"
echo "Required threshold: ${THRESHOLD}%"
echo ""

# Determine result
if [ "$overall_coverage" -lt "$THRESHOLD" ]; then
  if [ "$WARN_ONLY" = "true" ]; then
    echo -e "${YELLOW}WARNING${NC}: JSDoc coverage ($overall_coverage%) is below threshold ($THRESHOLD%)"
    echo "This is a warning only. Add JSDoc comments to improve coverage."
    exit 0
  else
    echo -e "${RED}ERROR${NC}: JSDoc coverage ($overall_coverage%) is below threshold ($THRESHOLD%)"
    echo ""
    echo "To fix this, add JSDoc comments to exported functions:"
    echo ""
    echo "  /**"
    echo "   * Description of what this function does."
    echo "   * @param paramName - Description of parameter"
    echo "   * @returns Description of return value"
    echo "   */"
    echo "  export function myFunction(paramName: string): void { ... }"
    echo ""
    echo "See: docs/2-technical/references/coding-standards.md"
    exit 1
  fi
fi

echo -e "${GREEN}SUCCESS${NC}: JSDoc coverage meets threshold (${overall_coverage}% >= ${THRESHOLD}%)"
exit 0
