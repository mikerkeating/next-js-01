#!/bin/bash

# Non-interactive script to execute the next incomplete story prompt
# Usage: ./scripts/run-next-story-prompt-auto.sh
#
# This version runs without confirmation prompts - use with caution!
# Add --dry-run flag to preview without executing

PROMPTS_FILE="docs/1-product/6-story-prompts.md"
DRY_RUN=false

# Parse arguments
while [[ "$#" -gt 0 ]]; do
    case $1 in
        --dry-run) DRY_RUN=true ;;
        *) echo "Unknown parameter: $1"; exit 1 ;;
    esac
    shift
done

# Check if file exists
if [ ! -f "$PROMPTS_FILE" ]; then
    echo "Error: $PROMPTS_FILE not found"
    exit 1
fi

# Find the first ### heading that doesn't end with "- DONE"
NEXT_PROMPT_INFO=$(awk '
    /^### / && !/- DONE[[:space:]]*$/ {
        print NR ":" $0
        exit
    }
' "$PROMPTS_FILE")

if [ -z "$NEXT_PROMPT_INFO" ]; then
    echo "All prompts are marked as DONE!"
    exit 0
fi

LINE_NUM=$(echo "$NEXT_PROMPT_INFO" | cut -d: -f1)
HEADING=$(echo "$NEXT_PROMPT_INFO" | cut -d: -f2-)

echo "=== Next Story Prompt ==="
echo "Line: $LINE_NUM"
echo "Heading: $HEADING"
echo ""

# Extract the prompt content
PROMPT_CONTENT=$(awk -v start="$LINE_NUM" '
    NR > start && /^```markdown/ { capture=1; next }
    NR > start && capture && /^```/ { exit }
    capture { print }
' "$PROMPTS_FILE")

if [ -z "$PROMPT_CONTENT" ]; then
    echo "Error: Could not extract prompt content"
    exit 1
fi

if [ "$DRY_RUN" = true ]; then
    echo "=== DRY RUN - Would execute: ==="
    echo "$PROMPT_CONTENT"
    echo "================================"
    exit 0
fi

echo "Executing prompt with Claude Code..."
echo ""

# Execute the prompt using Claude Code CLI
# Use -p to pass prompt via stdin, --dangerously-skip-permissions to allow file writes
echo "$PROMPT_CONTENT" | claude -p --dangerously-skip-permissions

# Check if claude command succeeded
if [ $? -eq 0 ]; then
    # Update the heading to append "- DONE"
    if [[ "$OSTYPE" == "darwin"* ]]; then
        sed -i '' "${LINE_NUM}s/$/ - DONE/" "$PROMPTS_FILE"
    else
        sed -i "${LINE_NUM}s/$/ - DONE/" "$PROMPTS_FILE"
    fi
    echo ""
    echo "=== Marked as DONE: $HEADING ==="
else
    echo ""
    echo "=== FAILED: Claude execution error ==="
    exit 1
fi
