#!/usr/bin/env bash
# Headless Edge screenshot of the local preview. usage: edge-shot.sh <out.png> <sections> <height> [virtual ms] [extra query]
EDGE="/c/Program Files (x86)/Microsoft/Edge/Application/msedge.exe"
"$EDGE" --headless=new --disable-gpu --hide-scrollbars --force-device-scale-factor=1 \
  --window-size=900,"$3" --virtual-time-budget="${4:-4000}" \
  --screenshot="$1" "http://localhost:4173/scripts/preview.html?s=$2${5:+&$5}" >/dev/null 2>&1
ls -la "$1" | awk '{print $5, $9}'
