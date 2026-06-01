#!/usr/bin/env bash
# Optional: bake #f9f8f6 background into faith-signet.mp4 (requires ffmpeg).
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
IN="$ROOT/videos/faith-signet.mp4"
OUT="$ROOT/videos/faith-signet-cream.mp4"

ffmpeg -y -i "$IN" \
  -vf "format=rgba,geq=r='if(lte(abs(r(X,Y)-249)+abs(g(X,Y)-248)+abs(b(X,Y)-246),36),249,r(X,Y))':g='if(lte(abs(r(X,Y)-249)+abs(g(X,Y)-248)+abs(b(X,Y)-246),36),248,g(X,Y))':b='if(lte(abs(r(X,Y)-249)+abs(g(X,Y)-248)+abs(b(X,Y)-246),36),246,b(X,Y))'" \
  -c:v libx264 -pix_fmt yuv420p -movflags +faststart \
  "$OUT"

echo "Wrote $OUT — point products.js video to videos/faith-signet-cream.mp4 if you prefer a baked file."
