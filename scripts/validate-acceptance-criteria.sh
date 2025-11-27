#!/bin/bash

# Acceptance Criteria Validation Script
# Usage: ./scripts/validate-acceptance-criteria.sh [epic|story] <path-to-file>
#        ./scripts/validate-acceptance-criteria.sh epic docs/3-epics/0A.1-steel-thread/EPIC.md
#        ./scripts/validate-acceptance-criteria.sh story docs/3-epics/0A.1-steel-thread/S1-create-nextjs-app.md
#        ./scripts/validate-acceptance-criteria.sh all docs/3-epics/0A.1-steel-thread/
#
# Parses acceptance criteria from markdown and runs validation checks

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Symbols
PASS="✓"
FAIL="✗"
SKIP="○"
WARN="⚠"

# Counters
TOTAL=0
PASSED=0
FAILED=0
SKIPPED=0

# Configuration
VERBOSE=${VERBOSE:-false}
PROJECT_ROOT=$(git rev-parse --show-toplevel 2>/dev/null || pwd)
DEV_SERVER_URL=${DEV_SERVER_URL:-"http://localhost:3000"}
PROD_URL=${PROD_URL:-""}

# Logging functions
log_pass() {
    echo -e "${GREEN}${PASS}${NC} $1"
    PASSED=$((PASSED + 1))
    TOTAL=$((TOTAL + 1))
}

log_fail() {
    echo -e "${RED}${FAIL}${NC} $1"
    FAILED=$((FAILED + 1))
    TOTAL=$((TOTAL + 1))
}

log_skip() {
    echo -e "${YELLOW}${SKIP}${NC} $1 ${YELLOW}(skipped - not implemented)${NC}"
    SKIPPED=$((SKIPPED + 1))
    TOTAL=$((TOTAL + 1))
}

log_warn() {
    echo -e "${YELLOW}${WARN}${NC} $1"
}

log_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

log_header() {
    echo ""
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
}

# ============================================================================
# VALIDATION CHECK FUNCTIONS
# Each function returns 0 for pass, 1 for fail, 2 for skip
# ============================================================================

# Check if a file exists
check_file_exists() {
    local filepath="$1"
    if [[ -f "$PROJECT_ROOT/$filepath" ]]; then
        return 0
    else
        return 1
    fi
}

# Check if a directory exists
check_dir_exists() {
    local dirpath="$1"
    if [[ -d "$PROJECT_ROOT/$dirpath" ]]; then
        return 0
    else
        return 1
    fi
}

# Check if package.json has a specific dependency
check_dependency() {
    local pkg_name="$1"
    local version_pattern="${2:-}"
    local pkg_json="$PROJECT_ROOT/package.json"

    if [[ ! -f "$pkg_json" ]]; then
        return 1
    fi

    if command -v jq &>/dev/null; then
        local version
        version=$(jq -r ".dependencies[\"$pkg_name\"] // .devDependencies[\"$pkg_name\"] // empty" "$pkg_json" 2>/dev/null)
        if [[ -n "$version" ]]; then
            if [[ -z "$version_pattern" ]] || [[ "$version" =~ $version_pattern ]]; then
                return 0
            fi
        fi
    else
        # Fallback to grep
        if grep -q "\"$pkg_name\"" "$pkg_json" 2>/dev/null; then
            return 0
        fi
    fi
    return 1
}

# Check if package.json has a specific script
check_script_exists() {
    local script_name="$1"
    local pkg_json="$PROJECT_ROOT/package.json"

    if [[ ! -f "$pkg_json" ]]; then
        return 1
    fi

    if command -v jq &>/dev/null; then
        local script
        script=$(jq -r ".scripts[\"$script_name\"] // empty" "$pkg_json" 2>/dev/null)
        if [[ -n "$script" ]]; then
            return 0
        fi
    else
        if grep -q "\"$script_name\":" "$pkg_json" 2>/dev/null; then
            return 0
        fi
    fi
    return 1
}

# Check if a command runs successfully
check_command_succeeds() {
    local cmd="$1"
    if (cd "$PROJECT_ROOT" && eval "$cmd" &>/dev/null); then
        return 0
    else
        return 1
    fi
}

# Check HTTP endpoint returns expected status code
check_http_status() {
    local url="$1"
    local expected_status="${2:-200}"

    if ! command -v curl &>/dev/null; then
        return 2  # skip
    fi

    local status
    status=$(curl -s -o /dev/null -w "%{http_code}" --connect-timeout 5 "$url" 2>/dev/null || echo "000")

    if [[ "$status" == "$expected_status" ]]; then
        return 0
    else
        return 1
    fi
}

# Check HTTP response contains JSON field
check_json_field() {
    local url="$1"
    local field="$2"

    if ! command -v curl &>/dev/null || ! command -v jq &>/dev/null; then
        return 2  # skip
    fi

    local response
    response=$(curl -s --connect-timeout 5 "$url" 2>/dev/null)

    if echo "$response" | jq -e ".$field" &>/dev/null; then
        return 0
    else
        return 1
    fi
}

# Check file contains pattern
check_file_contains() {
    local filepath="$1"
    local pattern="$2"

    if [[ ! -f "$PROJECT_ROOT/$filepath" ]]; then
        return 1
    fi

    if grep -q "$pattern" "$PROJECT_ROOT/$filepath" 2>/dev/null; then
        return 0
    else
        return 1
    fi
}

# Check tsconfig has strict mode
check_typescript_strict() {
    local tsconfig="$PROJECT_ROOT/tsconfig.json"

    if [[ ! -f "$tsconfig" ]]; then
        return 1
    fi

    if command -v jq &>/dev/null; then
        local strict
        strict=$(jq -r '.compilerOptions.strict // false' "$tsconfig" 2>/dev/null)
        if [[ "$strict" == "true" ]]; then
            return 0
        fi
    else
        if grep -q '"strict".*true' "$tsconfig" 2>/dev/null; then
            return 0
        fi
    fi
    return 1
}

# Check .nvmrc has expected Node version
check_node_version() {
    local expected_pattern="$1"
    local nvmrc="$PROJECT_ROOT/.nvmrc"

    if [[ ! -f "$nvmrc" ]]; then
        return 1
    fi

    local version
    version=$(cat "$nvmrc" | tr -d '[:space:]')

    if [[ "$version" =~ $expected_pattern ]]; then
        return 0
    else
        return 1
    fi
}

# Check GitHub workflow file exists and contains job
check_gh_workflow_job() {
    local workflow_file="$1"
    local job_name="$2"

    if [[ ! -f "$PROJECT_ROOT/$workflow_file" ]]; then
        return 1
    fi

    if grep -q "^\s*$job_name:" "$PROJECT_ROOT/$workflow_file" 2>/dev/null; then
        return 0
    else
        return 1
    fi
}

# Check environment file exists with required vars
check_env_example() {
    local env_file="$PROJECT_ROOT/.env.example"
    local var_name="$1"

    if [[ ! -f "$env_file" ]]; then
        return 1
    fi

    if grep -q "^$var_name=" "$env_file" 2>/dev/null; then
        return 0
    else
        return 1
    fi
}

# ============================================================================
# CRITERION MATCHING AND VALIDATION
# Maps acceptance criteria text to validation functions
# ============================================================================

validate_criterion() {
    local criterion="$1"
    local result=2  # Default to skip

    # Normalize criterion (lowercase, trim whitespace)
    local criterion_lower
    criterion_lower=$(echo "$criterion" | tr '[:upper:]' '[:lower:]' | sed 's/^[[:space:]]*//;s/[[:space:]]*$//')

    # -------------------------------------------------------------------------
    # File/Directory Existence Checks
    # -------------------------------------------------------------------------

    if [[ "$criterion_lower" =~ "package.json" && "$criterion_lower" =~ "exists" ]]; then
        check_file_exists "package.json" && result=0 || result=1

    elif [[ "$criterion_lower" =~ ".nvmrc" ]]; then
        check_file_exists ".nvmrc" && result=0 || result=1

    elif [[ "$criterion_lower" =~ ".env.example" ]]; then
        check_file_exists ".env.example" && result=0 || result=1

    elif [[ "$criterion_lower" =~ "src/app" || "$criterion_lower" =~ "app router" ]]; then
        check_dir_exists "src/app" && result=0 || result=1

    elif [[ "$criterion_lower" =~ "playwright.config" ]]; then
        check_file_exists "playwright.config.ts" && result=0 || result=1

    elif [[ "$criterion_lower" =~ ".github/workflows" ]]; then
        check_dir_exists ".github/workflows" && result=0 || result=1

    elif [[ "$criterion_lower" =~ "readme.md" && "$criterion_lower" =~ "document" ]]; then
        check_file_exists "README.md" && result=0 || result=1

    elif [[ "$criterion_lower" =~ "codeowners" ]]; then
        check_file_exists ".github/CODEOWNERS" || check_file_exists "CODEOWNERS"
        result=$?

    # -------------------------------------------------------------------------
    # Next.js / Framework Checks
    # -------------------------------------------------------------------------

    elif [[ "$criterion_lower" =~ "next.js" && "$criterion_lower" =~ "16" ]]; then
        check_dependency "next" "^16" && result=0 || result=1

    elif [[ "$criterion_lower" =~ "react" && "$criterion_lower" =~ "19" ]]; then
        check_dependency "react" "^19" && result=0 || result=1

    elif [[ "$criterion_lower" =~ "typescript" && "$criterion_lower" =~ "strict" ]]; then
        check_typescript_strict && result=0 || result=1

    elif [[ "$criterion_lower" =~ "node" && "$criterion_lower" =~ "22" ]]; then
        check_node_version "^22" && result=0 || result=1

    elif [[ "$criterion_lower" =~ "pnpm" && "$criterion_lower" =~ "10" ]]; then
        if command -v pnpm &>/dev/null; then
            pnpm --version | grep -q "^10\." && result=0 || result=1
        else
            result=1
        fi

    # -------------------------------------------------------------------------
    # Script/Command Checks
    # -------------------------------------------------------------------------

    elif [[ "$criterion_lower" =~ "pnpm dev" && "$criterion_lower" =~ "runs" ]]; then
        check_script_exists "dev" && result=0 || result=1

    elif [[ "$criterion_lower" =~ "pnpm build" && "$criterion_lower" =~ "success" ]]; then
        check_script_exists "build"
        if [[ $? -eq 0 ]]; then
            check_command_succeeds "pnpm build" && result=0 || result=1
        else
            result=1
        fi

    elif [[ "$criterion_lower" =~ "pnpm lint" && "$criterion_lower" =~ "pass" ]]; then
        check_script_exists "lint"
        if [[ $? -eq 0 ]]; then
            check_command_succeeds "pnpm lint" && result=0 || result=1
        else
            result=1
        fi

    elif [[ "$criterion_lower" =~ "pnpm test" ]]; then
        check_script_exists "test" && result=0 || result=1

    # -------------------------------------------------------------------------
    # Health Endpoint Checks
    # -------------------------------------------------------------------------

    elif [[ "$criterion_lower" =~ "/api/health" && "$criterion_lower" =~ "200" ]]; then
        check_http_status "${DEV_SERVER_URL}/api/health" "200" && result=0 || result=1

    elif [[ "$criterion_lower" =~ "/api/health" && "$criterion_lower" =~ "status" ]]; then
        check_json_field "${DEV_SERVER_URL}/api/health" "status" && result=0 || result=1

    elif [[ "$criterion_lower" =~ "/api/health" && "$criterion_lower" =~ "timestamp" ]]; then
        check_json_field "${DEV_SERVER_URL}/api/health" "timestamp" && result=0 || result=1

    elif [[ "$criterion_lower" =~ "/api/health" && "$criterion_lower" =~ "version" ]]; then
        check_json_field "${DEV_SERVER_URL}/api/health" "version" && result=0 || result=1

    # -------------------------------------------------------------------------
    # ESLint Configuration
    # -------------------------------------------------------------------------

    elif [[ "$criterion_lower" =~ "eslint" && "$criterion_lower" =~ "next.js" ]]; then
        check_file_contains "eslint.config.mjs" "next" || \
        check_file_contains ".eslintrc.json" "next"
        result=$?

    # -------------------------------------------------------------------------
    # Environment Variable Checks
    # -------------------------------------------------------------------------

    elif [[ "$criterion_lower" =~ "next_public_app_url" ]]; then
        check_env_example "NEXT_PUBLIC_APP_URL" && result=0 || result=1

    elif [[ "$criterion_lower" =~ "environment variable" && "$criterion_lower" =~ "fail" ]]; then
        # Check for env validation (t3-oss/env-nextjs or similar)
        check_file_exists "src/env.ts" || check_file_exists "src/env.mjs"
        result=$?

    # -------------------------------------------------------------------------
    # GitHub/CI Checks
    # -------------------------------------------------------------------------

    elif [[ "$criterion_lower" =~ "github actions" && "$criterion_lower" =~ "ci" ]]; then
        check_file_exists ".github/workflows/ci.yml" && result=0 || result=1

    elif [[ "$criterion_lower" =~ ".github/workflows" ]]; then
        check_dir_exists ".github/workflows" && result=0 || result=1

    elif [[ "$criterion_lower" =~ "workflow" && "$criterion_lower" =~ "e2e" ]]; then
        # Check if CI workflow has e2e job
        check_gh_workflow_job ".github/workflows/ci.yml" "e2e" || \
        check_gh_workflow_job ".github/workflows/ci.yml" "e2e-smoke"
        result=$?

    elif [[ "$criterion_lower" =~ "workflow" && "$criterion_lower" =~ "smoke" ]]; then
        check_file_contains ".github/workflows/ci.yml" "smoke" && result=0 || result=1

    elif [[ "$criterion_lower" =~ "pull request template" ]]; then
        check_file_exists ".github/pull_request_template.md" || \
        check_file_exists ".github/PULL_REQUEST_TEMPLATE.md"
        result=$?

    elif [[ "$criterion_lower" =~ "branch protection" ]]; then
        # This requires GitHub API - skip for now
        result=2

    # -------------------------------------------------------------------------
    # Vercel Checks
    # -------------------------------------------------------------------------

    elif [[ "$criterion_lower" =~ "vercel.json" ]]; then
        check_file_exists "vercel.json" && result=0 || result=1

    elif [[ "$criterion_lower" =~ "vercel" && "$criterion_lower" =~ "project" ]]; then
        # This requires Vercel API - skip for now
        result=2

    elif [[ "$criterion_lower" =~ "hsts" ]]; then
        # Check vercel.json for HSTS header configuration
        if check_file_exists "vercel.json"; then
            check_file_contains "vercel.json" "Strict-Transport-Security" && result=0 || result=1
        else
            result=1
        fi

    elif [[ "$criterion_lower" =~ "preview deployment" ]]; then
        # This requires Vercel API - skip for now
        result=2

    elif [[ "$criterion_lower" =~ "ssl certificate" ]]; then
        # This requires network checks - skip for now
        result=2

    elif [[ "$criterion_lower" =~ "automatic deployment" ]]; then
        # This requires Vercel API - skip for now
        result=2

    # -------------------------------------------------------------------------
    # Testing Checks
    # -------------------------------------------------------------------------

    elif [[ "$criterion_lower" =~ "playwright" && "$criterion_lower" =~ "config" ]]; then
        check_file_exists "playwright.config.ts" && result=0 || result=1

    elif [[ "$criterion_lower" =~ "playwright" ]]; then
        check_dependency "@playwright/test" && result=0 || result=1

    elif [[ "$criterion_lower" =~ "smoke test" && "$criterion_lower" =~ "exists" ]]; then
        check_file_exists "tests/e2e/smoke.spec.ts" && result=0 || result=1

    elif [[ "$criterion_lower" =~ "smoke test" ]]; then
        check_file_exists "e2e/smoke.spec.ts" || \
        check_file_exists "tests/e2e/smoke.spec.ts"
        result=$?

    elif [[ "$criterion_lower" =~ "vitest" ]]; then
        check_dependency "vitest" && result=0 || result=1

    # -------------------------------------------------------------------------
    # Environment Checks
    # -------------------------------------------------------------------------

    elif [[ "$criterion_lower" =~ ".env.local" ]]; then
        check_file_exists ".env.local" && result=0 || result=1

    elif [[ "$criterion_lower" =~ "src/env" ]]; then
        check_file_exists "src/env.ts" || check_file_exists "src/env.mjs"
        result=$?

    elif [[ "$criterion_lower" =~ "t3-oss" || "$criterion_lower" =~ "@t3-oss/env" ]]; then
        check_dependency "@t3-oss/env-nextjs" && result=0 || result=1

    elif [[ "$criterion_lower" =~ "zod" && "$criterion_lower" =~ "schema" ]]; then
        check_dependency "zod" && result=0 || result=1

    # -------------------------------------------------------------------------
    # Build/Run Checks
    # -------------------------------------------------------------------------

    elif [[ "$criterion_lower" =~ "pnpm start" ]]; then
        check_script_exists "start" && result=0 || result=1

    elif [[ "$criterion_lower" =~ "pnpm type" || "$criterion_lower" =~ "type-check" ]]; then
        check_script_exists "type-check" || check_script_exists "typecheck"
        result=$?

    # -------------------------------------------------------------------------
    # Documentation Checks
    # -------------------------------------------------------------------------

    elif [[ "$criterion_lower" =~ "readme" && "$criterion_lower" =~ "branch" && "$criterion_lower" =~ "strategy" ]]; then
        check_file_contains "README.md" "main" && \
        check_file_contains "README.md" "development"
        result=$?

    elif [[ "$criterion_lower" =~ "readme" && "$criterion_lower" =~ "rollback" ]]; then
        check_file_contains "README.md" -i "rollback" && result=0 || result=1

    elif [[ "$criterion_lower" =~ "readme" && "$criterion_lower" =~ "links" ]]; then
        # Check README has links to docs
        check_file_contains "README.md" "docs/" && result=0 || result=1

    # -------------------------------------------------------------------------
    # Default: Mark as needing manual validation
    # -------------------------------------------------------------------------

    else
        result=2  # Skip - requires manual validation or not implemented
    fi

    return $result
}

# ============================================================================
# PARSER FUNCTIONS
# ============================================================================

# Extract acceptance criteria from markdown file using awk
extract_criteria() {
    local file="$1"
    awk '
        /^##[[:space:]]*Acceptance[[:space:]]*Criteria/ { in_section=1; next }
        in_section && /^##[[:space:]]/ && !/Acceptance/ { in_section=0; next }
        in_section && /^[[:space:]]*-[[:space:]]\[/ {
            # Remove the checkbox prefix: "- [ ] " or "- [x] "
            sub(/^[[:space:]]*-[[:space:]]\[[[:space:]x]\][[:space:]]*/, "")
            print
        }
    ' "$file"
}

# ============================================================================
# MAIN FUNCTIONS
# ============================================================================

validate_file() {
    local file="$1"
    local filename
    filename=$(basename "$file")

    log_header "Validating: $filename"
    log_info "File: $file"
    echo ""

    # Extract and validate each criterion
    while IFS= read -r criterion; do
        [[ -z "$criterion" ]] && continue

        # Use || true to prevent set -e from triggering on non-zero returns
        local status=0
        validate_criterion "$criterion" || status=$?

        case $status in
            0) log_pass "$criterion" ;;
            1) log_fail "$criterion" ;;
            2) log_skip "$criterion" ;;
        esac
    done < <(extract_criteria "$file")
}

validate_directory() {
    local dir="$1"

    # Validate EPIC.md first if it exists
    if [[ -f "$dir/EPIC.md" ]]; then
        validate_file "$dir/EPIC.md"
    fi

    # Validate all story files (S1-*.md, S2-*.md, etc.)
    for story_file in "$dir"/S[0-9]*.md; do
        if [[ -f "$story_file" ]]; then
            validate_file "$story_file"
        fi
    done
}

print_summary() {
    echo ""
    log_header "VALIDATION SUMMARY"
    echo ""
    echo -e "  Total:   $TOTAL"
    echo -e "  ${GREEN}Passed:  $PASSED${NC}"
    echo -e "  ${RED}Failed:  $FAILED${NC}"
    echo -e "  ${YELLOW}Skipped: $SKIPPED${NC}"
    echo ""

    if [[ $FAILED -eq 0 ]]; then
        echo -e "${GREEN}All implemented checks passed!${NC}"
    else
        echo -e "${RED}$FAILED check(s) failed.${NC}"
    fi

    if [[ $SKIPPED -gt 0 ]]; then
        echo -e "${YELLOW}$SKIPPED check(s) require manual validation or are not yet implemented.${NC}"
    fi
    echo ""
}

show_usage() {
    echo "Acceptance Criteria Validation Script"
    echo ""
    echo "Usage:"
    echo "  $0 epic <path-to-epic.md>    Validate a single epic file"
    echo "  $0 story <path-to-story.md>  Validate a single story file"
    echo "  $0 all <path-to-epic-dir>    Validate epic and all stories in directory"
    echo ""
    echo "Options:"
    echo "  VERBOSE=true              Enable verbose output"
    echo "  DEV_SERVER_URL=<url>      Set dev server URL (default: http://localhost:3000)"
    echo "  PROD_URL=<url>            Set production URL for live checks"
    echo ""
    echo "Examples:"
    echo "  $0 epic docs/3-epics/0A.1-steel-thread/EPIC.md"
    echo "  $0 story docs/3-epics/0A.1-steel-thread/S1-create-nextjs-app.md"
    echo "  $0 all docs/3-epics/0A.1-steel-thread/"
    echo "  VERBOSE=true $0 all docs/3-epics/0A.1-steel-thread/"
}

# ============================================================================
# ENTRY POINT
# ============================================================================

main() {
    if [[ $# -lt 2 ]]; then
        show_usage
        exit 1
    fi

    local mode="$1"
    local path="$2"

    echo ""
    echo "╔══════════════════════════════════════════════════════════════╗"
    echo "║         ACCEPTANCE CRITERIA VALIDATION SCRIPT                ║"
    echo "╚══════════════════════════════════════════════════════════════╝"
    echo ""
    log_info "Project root: $PROJECT_ROOT"
    log_info "Dev server URL: $DEV_SERVER_URL"

    case "$mode" in
        epic|story)
            if [[ ! -f "$path" ]]; then
                echo "Error: File not found: $path"
                exit 1
            fi
            validate_file "$path"
            ;;
        all)
            if [[ ! -d "$path" ]]; then
                echo "Error: Directory not found: $path"
                exit 1
            fi
            validate_directory "$path"
            ;;
        *)
            echo "Error: Unknown mode: $mode"
            show_usage
            exit 1
            ;;
    esac

    print_summary

    # Exit with failure if any checks failed
    [[ $FAILED -eq 0 ]]
}

main "$@"
