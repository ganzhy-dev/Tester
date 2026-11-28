#!/bin/bash
# Setelah antrean EP11-15 selesai: render EP16, lalu kompres video > 95 MB agar bisa diunduh.
cd "$(dirname "$0")/.."
until grep -q SELESAI out/antre_capcut.log; do sleep 30; done
./scripts/render_all.sh EP16-SaladLicik 2>&1 | tail -1; echo "RENDER EP16-SaladLicik"
for f in video/EP1[1-6]_*_1080p60.mp4; do
  s=$(stat -c %s "$f"); if [ "$s" -gt 95000000 ]; then
    raw=out/$(basename "$f" _1080p60.mp4 | sed 's/_/-/')_raw.mp4
    ffmpeg -v error -y -i "$raw" -i "$f" -map 0:v -map 1:a -vf scale=in_range=full:out_range=tv:in_color_matrix=bt601:out_color_matrix=bt709,format=yuv420p -c:v libx264 -preset slow -tune animation -crf 17 -maxrate 5800k -bufsize 11600k -r 60 -colorspace bt709 -color_primaries bt709 -color_trc bt709 -color_range tv -c:a copy -movflags +faststart out/kecil.mp4 && mv out/kecil.mp4 "$f" && echo "KECIL $f"
  fi
done
echo SELESAI16
