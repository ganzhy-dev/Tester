#!/bin/bash
# Render 1080x1920@60 lalu encode final H.264 BT.709 (TikTok-ready)
set -e
cd "$(dirname "$0")/.."
declare -A NAME=([EP1-CO2]=EP1_CO2_RuangRapat [EP2-Getaran]=EP2_Getaran [EP3-Bising]=EP3_Kebisingan [EP4-Panas]=EP4_TekananPanas [EP5-DebuSilika]=EP5_DebuSilika [EP6-KarbonMonoksida]=EP6_KarbonMonoksida)
for id in "${@:-EP1-CO2 EP2-Getaran EP3-Bising EP4-Panas EP5-DebuSilika EP6-KarbonMonoksida}"; do
  for c in $id; do
    npx remotion render src/index.ts $c out/${c}_raw.mp4 --crf=8 --concurrency=4 --browser-executable=/opt/pw-browsers/chromium_headless_shell --log=error
    ffmpeg -v error -y -i out/${c}_raw.mp4 \
      -vf "scale=in_range=full:out_range=tv:in_color_matrix=bt601:out_color_matrix=bt709,format=yuv420p" \
      -c:v libx264 -preset slow -tune animation -crf 15 -r 60 -colorspace bt709 -color_primaries bt709 -color_trc bt709 -color_range tv \
      -c:a aac -b:a 320k -ar 48000 -movflags +faststart video/${NAME[$c]}_1080p60.mp4
    echo "done $c"
  done
done
