#!/bin/bash

# Script to execute the next incomplete story prompt from 6-story-prompts.md
# Usage: ./scripts/run-next-story-prompt.sh

PROMPTS_FILE="docs/1-product/6-story-prompts.md"

# Check if file exists
if [ ! -f "$PROMPTS_FILE" ]; then
    echo "Error: $PROMPTS_FILE not found"
    exit 1
fi

# Find the first ### heading that doesn't end with "- DONE"
# Extract line number and heading text
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

echo "Found next incomplete prompt at line $LINE_NUM:"
echo "$HEADING"
echo ""

# Extract the prompt content (everything between ```markdown and ``` after the heading)
PROMPT_CONTENT=$(awk -v start="$LINE_NUM" '
    NR > start && /^```markdown/ { capture=1; next }
    NR > start && capture && /^```/ { exit }
    capture { print }
' "$PROMPTS_FILE")

if [ -z "$PROMPT_CONTENT" ]; then
    echo "Error: Could not extract prompt content"
    exit 1
fi

echo "Prompt content:"
echo "----------------------------------------"
echo "$PROMPT_CONTENT"
echo "----------------------------------------"
echo ""

# Ask for confirmation before executing
read -p "Execute this prompt with Claude Code? (y/n) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Aborted."
    exit 0
fi

# Execute the prompt using Claude Code CLI
# Use -p to pass prompt, --dangerously-skip-permissions to allow file writes without confirmation
echo "Executing prompt..."
echo "$PROMPT_CONTENT" | claude -p --dangerously-skip-permissions

# Check if claude command succeeded
if [ $? -eq 0 ]; then
    echo ""
    read -p "Mark this prompt as DONE? (y/n) " -n 1 -r
    echo ""

    if [[ $REPLY =~ ^[Yy]$ ]]; then
        # Update the heading to append "- DONE"
        # Use sed to modify the specific line
        if [[ "$OSTYPE" == "darwin"* ]]; then
            # macOS sed requires empty string for -i
            sed -i '' "${LINE_NUM}s/$/ - DONE/" "$PROMPTS_FILE"
        else
            # GNU sed
            sed -i "${LINE_NUM}s/$/ - DONE/" "$PROMPTS_FILE"
        fi
        echo "Marked as DONE!"
    fi
else
    echo "Claude execution failed. Not marking as done."
    exit 1
fi
