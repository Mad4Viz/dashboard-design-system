#!/usr/bin/env bash
set -euo pipefail
SRC="$HOME/Library/Application Support/Open Design/namespaces/release-stable/data/design-systems/dashboard-design-system/"
DST="$HOME/Developer/Open_Design/workspace/dashboard-design-system/"
rsync -av --itemize-changes --delete \
  --exclude='.git/' --exclude='.gitignore' --exclude='media/' --exclude='bin/' --exclude='index.html' \
  --exclude='README.md' --exclude='GETTING_STARTED.md' --exclude='KIT_NOTES.md' \
  "$SRC" "$DST"
echo "Sync complete. Run: git status"
