#!/bin/bash

# Non-interactive script to execute the next incomplete story prompt
# Usage: ./scripts/run-next-story-prompt-auto-wip.sh
#
# This version runs without confirmation prompts - use with caution!
# Add --dry-run flag to preview without executing
#
# Features:
# - Timestamped logging to logs/ directory
# - Verbose output for progress visibility
# - Turn limits for safety (prevents runaway executions)
# - JSON output capture for metadata (cost, duration, session ID)

PROMPTS_FILE="docs/1-product/6-story-prompts.md"
DRY_RUN=false
MAX_TURNS=33
LOG_DIR="logs"

# Logging function with timestamps
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*"
}

# Parse arguments
while [[ "$#" -gt 0 ]]; do
    case $1 in
        --dry-run) DRY_RUN=true ;;
        --max-turns) MAX_TURNS="$2"; shift ;;
        *) echo "Unknown parameter: $1"; exit 1 ;;
    esac
    shift
done

# Create logs directory
mkdir -p "$LOG_DIR"
LOG_FILE="$LOG_DIR/story-$(date '+%Y%m%d-%H%M%S').log"

log "=== Story Prompt Execution Started ===" | tee "$LOG_FILE"

# Check if file exists
if [ ! -f "$PROMPTS_FILE" ]; then
    log "Error: $PROMPTS_FILE not found" | tee -a "$LOG_FILE"
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
    log "All prompts are marked as DONE!" | tee -a "$LOG_FILE"
    exit 0
fi

LINE_NUM=$(echo "$NEXT_PROMPT_INFO" | cut -d: -f1)
HEADING=$(echo "$NEXT_PROMPT_INFO" | cut -d: -f2-)

log "=== Next Story Prompt ===" | tee -a "$LOG_FILE"
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

if [ "$DRY_RUN" = true ]; then
    log "=== DRY RUN - Would execute: ===" | tee -a "$LOG_FILE"
    echo "$PROMPT_CONTENT" | tee -a "$LOG_FILE"
    log "================================" | tee -a "$LOG_FILE"
    log "Log file: $LOG_FILE"
    exit 0
fi

log "Executing prompt with Claude Code..." | tee -a "$LOG_FILE"
log "Max turns: $MAX_TURNS" | tee -a "$LOG_FILE"
log "Log file: $LOG_FILE" | tee -a "$LOG_FILE"
echo "" | tee -a "$LOG_FILE"

# Record start time
START_TIME=$(date +%s)

# Execute the prompt using Claude Code CLI
# --verbose: Show full turn-by-turn output for visibility
# --max-turns: Limit iterations to prevent runaway executions
# --output-format json: Capture metadata (cost, duration, session ID)
# --allowedTools: Pre-authorize specific tools (more surgical than --dangerously-skip-permissions)
#
# The output is piped through awk to detect turn boundaries and log turn numbers.
# Claude CLI verbose output includes "assistant" turns which we count.
RESPONSE=$(echo "$PROMPT_CONTENT" | claude -p \
    --verbose \
    --max-turns "$MAX_TURNS" \
    --output-format json \
    --allowedTools "Read(*) Edit(*) Write(*) Bash(*) Glob(*) Grep(*) Task(*) TodoWrite(*)" \
    2>&1 | awk -v max_turns="$MAX_TURNS" '
    BEGIN { turn = 0 }
    /"role"[[:space:]]*:[[:space:]]*"assistant"/ {
        turn++
        cmd = "date \"+%Y-%m-%d %H:%M:%S\""
        cmd | getline timestamp
        close(cmd)
        print "[" timestamp "] Turn " turn " of " max_turns
    }
    { print }
    ' | tee -a "$LOG_FILE")

EXIT_CODE=$?

# Record end time and calculate duration
END_TIME=$(date +%s)
ELAPSED=$((END_TIME - START_TIME))

echo "" | tee -a "$LOG_FILE"
log "=== Execution Summary ===" | tee -a "$LOG_FILE"
log "Duration: ${ELAPSED}s" | tee -a "$LOG_FILE"

# Try to extract JSON metadata if available
# The response might have verbose output mixed in, so we try to find the JSON at the end
JSON_LINE=$(echo "$RESPONSE" | grep -E '^\{.*"type".*\}$' | tail -1)

if [ -n "$JSON_LINE" ]; then
    COST=$(echo "$JSON_LINE" | jq -r '.cost_usd // .cost // "unknown"' 2>/dev/null)
    SESSION_ID=$(echo "$JSON_LINE" | jq -r '.session_id // "unknown"' 2>/dev/null)
    DURATION_MS=$(echo "$JSON_LINE" | jq -r '.duration_ms // "unknown"' 2>/dev/null)

    log "Cost: \$$COST" | tee -a "$LOG_FILE"
    log "Session ID: $SESSION_ID" | tee -a "$LOG_FILE"
    log "API Duration: ${DURATION_MS}ms" | tee -a "$LOG_FILE"
fi

# Check if claude command succeeded
if [ $EXIT_CODE -eq 0 ]; then
    # Update the heading to append "- DONE"
    if [[ "$OSTYPE" == "darwin"* ]]; then
        sed -i '' "${LINE_NUM}s/$/ - DONE/" "$PROMPTS_FILE"
    else
        sed -i "${LINE_NUM}s/$/ - DONE/" "$PROMPTS_FILE"
    fi
    log "=== SUCCESS: Marked as DONE ===" | tee -a "$LOG_FILE"
    log "Heading: $HEADING" | tee -a "$LOG_FILE"
else
    log "=== FAILED: Claude execution error (exit code: $EXIT_CODE) ===" | tee -a "$LOG_FILE"
    exit 1
fi

log "=== Story Prompt Execution Completed ===" | tee -a "$LOG_FILE"
log "Full log available at: $LOG_FILE"
