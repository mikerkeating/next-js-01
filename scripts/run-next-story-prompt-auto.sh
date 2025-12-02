#!/bin/bash

# Non-interactive script to execute story prompts until MAX_TURNS is reached
# Usage: ./scripts/run-next-story-prompt-auto.sh [PROMPTS_FILE]
#        ./scripts/run-next-story-prompt-auto.sh --prompts-file <file>
#        ./scripts/run-next-story-prompt-auto.sh --max-epics 5 --claude-max-turns 30
#        ./scripts/run-next-story-prompt-auto.sh --prompts-file <your-file.md> --max-epics 5  
#
# Environment variables (can be overridden by command-line arguments):
#   MAX_EPICS          - Maximum number of epics to process (default: 20)
#   CLAUDE_MAX_TURNS   - Maximum turns per Claude session (default: 50)
#
# This version runs without confirmation prompts - use with caution!
# Add --dry-run flag to preview all prompts (marks items as DONE to iterate)
# Add --dry-run-no-mark flag to preview first prompt only (no file modifications)
#
# Features:
# - Loops through epics until MAX_TURNS budget is exhausted
# - Timestamped logging to logs/ directory
# - Verbose output for progress visibility
# - Turn limits for safety (prevents runaway executions)
# - JSON output capture for metadata (cost, duration, session ID)

PROMPTS_FILE=""
DRY_RUN=false
DRY_RUN_NO_MARK=false
MAX_EPICS="${MAX_EPICS:-80}"
CLAUDE_MAX_TURNS="${CLAUDE_MAX_TURNS:-50}"
LOG_DIR="logs"

# Logging function with timestamps
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*"
}

# Mark a prompt line as done (cross-platform sed)
mark_prompt_as_done() {
    local line_num="$1"
    local file_path="$2"
    if [[ "$OSTYPE" == "darwin"* ]]; then
        sed -i '' "${line_num}s/$/ - DONE/" "$file_path"
    else
        sed -i "${line_num}s/$/ - DONE/" "$file_path"
    fi
}

# Parse arguments
while [[ "$#" -gt 0 ]]; do
    case $1 in
        --dry-run) DRY_RUN=true ;;
        --dry-run-no-mark) DRY_RUN_NO_MARK=true ;;
        --max-epics) MAX_EPICS="$2"; shift ;;
        --claude-max-turns) CLAUDE_MAX_TURNS="$2"; shift ;;
        --prompts-file) PROMPTS_FILE="$2"; shift ;;
        -*)
            echo "Unknown parameter: $1"
            echo "Usage: $0 [PROMPTS_FILE] [--prompts-file <file>] [--dry-run] [--dry-run-no-mark] [--max-epics <n>] [--claude-max-turns <n>]"
            exit 1
            ;;
        *)
            # Positional argument - treat as prompts file
            if [ -z "$PROMPTS_FILE" ]; then
                PROMPTS_FILE="$1"
            else
                echo "Error: Multiple prompts files specified"
                exit 1
            fi
            ;;
    esac
    shift
done

# Default prompts file if not specified
if [ -z "$PROMPTS_FILE" ]; then
    PROMPTS_FILE="docs/0-process/epic-generation-commands.md"
fi

# Create logs directory
mkdir -p "$LOG_DIR"
LOG_FILE="$LOG_DIR/story-$(date '+%Y%m%d-%H%M%S').log"

log "=== Story Prompt Execution Started ===" | tee "$LOG_FILE"
log "Max epics to process: $MAX_EPICS" | tee -a "$LOG_FILE"
log "Claude max turns per epic: $CLAUDE_MAX_TURNS" | tee -a "$LOG_FILE"

# Check if file exists
if [ ! -f "$PROMPTS_FILE" ]; then
    log "Error: $PROMPTS_FILE not found" | tee -a "$LOG_FILE"
    exit 1
fi

# Track epics processed
EPICS_COMPLETED=0

# Loop until we hit max epics or all epics are done
while [ $EPICS_COMPLETED -lt $MAX_EPICS ]; do

    # Find the first ### heading that doesn't end with "- DONE"
    NEXT_PROMPT_INFO=$(awk '
        /^### / && !/- DONE[[:space:]]*$/ {
            print NR ":" $0
            exit
        }
    ' "$PROMPTS_FILE")

    if [ -z "$NEXT_PROMPT_INFO" ]; then
        log "All prompts are marked as DONE!" | tee -a "$LOG_FILE"
        break
    fi

    LINE_NUM=$(echo "$NEXT_PROMPT_INFO" | cut -d: -f1)
    HEADING=$(echo "$NEXT_PROMPT_INFO" | cut -d: -f2-)

    log "" | tee -a "$LOG_FILE"
    log "========================================" | tee -a "$LOG_FILE"
    log "=== Epic $((EPICS_COMPLETED + 1)) of $MAX_EPICS ===" | tee -a "$LOG_FILE"
    log "========================================" | tee -a "$LOG_FILE"
    log "Line: $LINE_NUM" | tee -a "$LOG_FILE"
    log "Heading: $HEADING" | tee -a "$LOG_FILE"

    # Extract the prompt content
    PROMPT_CONTENT=$(awk -v start="$LINE_NUM" '
        NR > start && /^```markdown/ { capture=1; next }
        NR > start && capture && /^```/ { exit }
        capture { print }
    ' "$PROMPTS_FILE")

    if [ -z "$PROMPT_CONTENT" ]; then
        log "Error: Could not extract prompt content" | tee -a "$LOG_FILE"
        exit 1
    fi

    PROMPT_LENGTH=${#PROMPT_CONTENT}
    log "Prompt length: $PROMPT_LENGTH characters" | tee -a "$LOG_FILE"

    if [ "$DRY_RUN_NO_MARK" = true ]; then
        log "=== DRY RUN (no-mark) - Would execute: ===" | tee -a "$LOG_FILE"
        echo "$PROMPT_CONTENT" | tee -a "$LOG_FILE"
        log "================================" | tee -a "$LOG_FILE"
        # Exit after showing first prompt to avoid infinite loop
        log "=== DRY RUN (no-mark): Exiting after first prompt preview ===" | tee -a "$LOG_FILE"
        break
    fi

    if [ "$DRY_RUN" = true ]; then
        log "=== DRY RUN - Would execute: ===" | tee -a "$LOG_FILE"
        echo "$PROMPT_CONTENT" | tee -a "$LOG_FILE"
        log "================================" | tee -a "$LOG_FILE"
        # Mark as DONE in dry-run mode to prevent infinite loop
        mark_prompt_as_done "$LINE_NUM" "$PROMPTS_FILE"
        log "=== DRY RUN: Marked as DONE ===" | tee -a "$LOG_FILE"
        EPICS_COMPLETED=$((EPICS_COMPLETED + 1))
        continue
    fi

    log "Executing prompt with Claude Code..." | tee -a "$LOG_FILE"
    log "Claude max turns: $CLAUDE_MAX_TURNS" | tee -a "$LOG_FILE"
    echo "" | tee -a "$LOG_FILE"

    # Record start time
    START_TIME=$(date +%s)

    # Execute the prompt using Claude Code CLI
    # --verbose: Show full turn-by-turn output for visibility
    # --max-turns: Limit iterations to prevent runaway executions
    # --dangerously-skip-permissions: Skip all permission prompts for full automation
    #
    # Using pipefail to capture claude exit code through the pipe chain
    # Output streams directly to terminal AND log file via tee
    set -o pipefail

    echo "$PROMPT_CONTENT" | claude -p \
        --verbose \
        --max-turns "$CLAUDE_MAX_TURNS" \
        --dangerously-skip-permissions \
        2>&1 | tee -a "$LOG_FILE"

    EXIT_CODE=${PIPESTATUS[1]}
    set +o pipefail

    # Record end time and calculate duration
    END_TIME=$(date +%s)
    ELAPSED=$((END_TIME - START_TIME))

    echo "" | tee -a "$LOG_FILE"
    log "=== Epic Execution Summary ===" | tee -a "$LOG_FILE"
    log "Duration: ${ELAPSED}s" | tee -a "$LOG_FILE"

    # Check if claude command succeeded
    if [ $EXIT_CODE -eq 0 ]; then
        # Update the heading to append "- DONE"
        mark_prompt_as_done "$LINE_NUM" "$PROMPTS_FILE"
        log "=== SUCCESS: Marked as DONE ===" | tee -a "$LOG_FILE"
        log "Heading: $HEADING" | tee -a "$LOG_FILE"
        EPICS_COMPLETED=$((EPICS_COMPLETED + 1))
    else
        log "=== FAILED: Claude execution error (exit code: $EXIT_CODE) ===" | tee -a "$LOG_FILE"
        log "Stopping execution due to error" | tee -a "$LOG_FILE"
        break
    fi

    log "Epics completed so far: $EPICS_COMPLETED of $MAX_EPICS" | tee -a "$LOG_FILE"
done

echo "" | tee -a "$LOG_FILE"
log "========================================" | tee -a "$LOG_FILE"
log "=== Final Summary ===" | tee -a "$LOG_FILE"
log "========================================" | tee -a "$LOG_FILE"
log "Epics completed: $EPICS_COMPLETED of $MAX_EPICS" | tee -a "$LOG_FILE"
log "Full log available at: $LOG_FILE"
