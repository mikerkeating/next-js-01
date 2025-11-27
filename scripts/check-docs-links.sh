#!/usr/bin/env bash
#
# check-docs-links.sh
# Validates markdown links in /docs directory
# Outputs a sorted list of failing links
#

set -uo pipefail

DOCS_DIR="${1:-docs}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
DOCS_PATH="$PROJECT_ROOT/$DOCS_DIR"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
NC='\033[0m' # No Color

# Temp files for tracking
FAILURES_FILE=$(mktemp)
LINKS_COUNT_FILE=$(mktemp)
echo "0" > "$LINKS_COUNT_FILE"
trap "rm -f $FAILURES_FILE $LINKS_COUNT_FILE" EXIT

FILE_COUNT=0

# Extract heading anchors from a markdown file
get_anchors_from_file() {
    local file="$1"
    if [[ ! -f "$file" ]]; then
        return
    fi

    # Extract headings and convert to anchors
    grep -E '^#{1,6} ' "$file" 2>/dev/null | while read -r line; do
        # Remove the # prefix and trim
        heading=$(echo "$line" | sed 's/^#* //')
        # Convert to anchor format: lowercase, replace spaces with hyphens, remove special chars
        anchor=$(echo "$heading" | \
                 tr '[:upper:]' '[:lower:]' | \
                 sed 's/ /-/g' | \
                 sed 's/[^a-z0-9-]//g' | \
                 sed 's/--*/-/g' | \
                 sed 's/^-//' | \
                 sed 's/-$//')
        echo "$anchor"
    done
}

# Check if an anchor exists in a file
check_anchor_in_file() {
    local file="$1"
    local anchor="$2"

    get_anchors_from_file "$file" | grep -q "^${anchor}$"
}

# Check a single link
check_link() {
    local source_file="$1"
    local link="$2"
    local link_text="$3"
    local relative_source="${source_file#$PROJECT_ROOT/}"

    # Increment link counter (using file to persist across subshells)
    count=$(<"$LINKS_COUNT_FILE")
    echo $((count + 1)) > "$LINKS_COUNT_FILE"

    # Skip external URLs
    if [[ "$link" =~ ^https?:// ]] || [[ "$link" =~ ^mailto: ]]; then
        return 0
    fi

    # Skip empty links
    if [[ -z "$link" ]]; then
        return 0
    fi

    local source_dir
    source_dir=$(dirname "$source_file")

    # Handle anchor-only links (e.g., #overview)
    if [[ "$link" =~ ^# ]]; then
        local anchor="${link#\#}"
        if ! check_anchor_in_file "$source_file" "$anchor"; then
            echo "$relative_source: [$link_text]($link) - anchor not found in file" >> "$FAILURES_FILE"
            return 1
        fi
        return 0
    fi

    # Split link into path and anchor
    local path="${link%%#*}"
    local anchor=""
    if [[ "$link" == *"#"* ]]; then
        anchor="${link#*#}"
    fi

    # Handle empty path with anchor (already handled above, but be safe)
    if [[ -z "$path" ]]; then
        return 0
    fi

    # Resolve the target path
    local target_path
    if [[ "$path" =~ ^/ ]]; then
        # Absolute path from project root
        target_path="$PROJECT_ROOT${path}"
    else
        # Relative path from source file directory
        target_path="$source_dir/$path"
    fi

    # Normalize the path (resolve .., ., etc)
    if command -v realpath &> /dev/null; then
        target_path=$(realpath -m "$target_path" 2>/dev/null || echo "$target_path")
    fi

    # Check if target exists (file or directory)
    if [[ ! -e "$target_path" ]]; then
        # Try adding .md extension if not present
        if [[ ! "$path" =~ \.md$ ]] && [[ -f "${target_path}.md" ]]; then
            target_path="${target_path}.md"
        else
            echo "$relative_source: [$link_text]($link) - target not found" >> "$FAILURES_FILE"
            return 1
        fi
    fi

    # If there's an anchor, check it exists in the target file
    if [[ -n "$anchor" ]] && [[ -f "$target_path" ]]; then
        if ! check_anchor_in_file "$target_path" "$anchor"; then
            echo "$relative_source: [$link_text]($link) - anchor #$anchor not found in target" >> "$FAILURES_FILE"
            return 1
        fi
    fi

    return 0
}

# Extract and check links from a markdown file
process_file() {
    local file="$1"

    # Extract markdown links: [text](url)
    # Read file and find links
    grep -oE '\[[^]]+\]\([^)]+\)' "$file" 2>/dev/null | while read -r match; do
        if [[ -n "$match" ]]; then
            # Extract text and link using sed
            link_text=$(echo "$match" | sed 's/\[\([^]]*\)\].*/\1/')
            link=$(echo "$match" | sed 's/.*](\([^)]*\)).*/\1/')

            if [[ -n "$link" ]]; then
                check_link "$file" "$link" "$link_text"
            fi
        fi
    done
}

# Main script
main() {
    echo "Checking markdown links in $DOCS_PATH"
    echo "========================================"
    echo ""

    if [[ ! -d "$DOCS_PATH" ]]; then
        echo -e "${RED}Error: Directory $DOCS_PATH does not exist${NC}"
        exit 1
    fi

    # Find all markdown files and process them
    while IFS= read -r file; do
        ((FILE_COUNT++)) || true
        process_file "$file"
    done < <(find "$DOCS_PATH" -type f -name "*.md" | sort)

    echo ""
    echo "========================================"
    echo "Summary"
    echo "========================================"
    echo "Files checked: $FILE_COUNT"

    TOTAL_LINKS=$(<"$LINKS_COUNT_FILE")
    echo "Total links checked: $TOTAL_LINKS"
    echo ""

    FAILED_COUNT=$(wc -l < "$FAILURES_FILE" | tr -d ' ')

    if [[ "$FAILED_COUNT" -eq 0 ]]; then
        echo -e "${GREEN}✓ All links are valid!${NC}"
        exit 0
    else
        echo -e "${RED}✗ Found $FAILED_COUNT broken links:${NC}"
        echo ""
        echo "Failing Links (sorted):"
        echo "------------------------"

        # Sort and print failing links
        sort "$FAILURES_FILE"

        echo ""
        exit 1
    fi
}

main "$@"
