#!/usr/bin/env bash
# Antrean VO CapCut: proses EP 12–16 (EP11 sedang jalan terpisah), lalu render EP11–15 setelah render EP10 selesai.
cd "$(dirname "$0")/.."
PY=/home/user/voicebox/backend/venv/bin/python
declare -A CTA=([11]='Ambil satu kerjaan rumah, tulis di komen 🤍' [12]='Cek kamar mandi, tag saudaramu 🛁' [13]='Udah cek selang gas? Tulis "udah dicek" ✅' [14]='Botol di rumah aman? Tulis "botol aman" ✅' [15]='Gagang panci ke dalam? Tulis "gagang aman" ✅' [16]='Udah cuci sayur? Tulis "salad bersih" 🥗')
while pgrep -f "user_vo.py data/voice/capcut/ep11" >/dev/null; do sleep 20; done
python3 scripts/post_capcut.py 11 && python3 scripts/words_warp.py 11 && python3 scripts/prep_words.py 11 && python3 scripts/make_audio.py 11 && echo "SIAP ep11"
for n in 12 13 14 15 16; do
  HF_HUB_DISABLE_XET=1 $PY scripts/user_vo.py data/voice/capcut/ep${n}_capcut_vo.m4a $n "${CTA[$n]}" 2>&1 | grep -E "^ep|warp|tidak" | tail -2
  python3 scripts/post_capcut.py $n
  if [ "$n" != "16" ]; then python3 scripts/words_warp.py $n; fi
  python3 scripts/prep_words.py $n
  if [ "$n" != "16" ]; then python3 scripts/make_audio.py $n; fi
  echo "SIAP ep$n"
done
while pgrep -f "render_all.sh EP10" >/dev/null || pgrep -f "remotion render" >/dev/null; do sleep 30; done
for id in EP11-BebanIbu EP12-LantaiLicin EP13-GasBocor EP14-BotolNyaru EP15-AirPanas; do
  ./scripts/render_all.sh $id 2>&1 | tail -1; echo "RENDER $id"
done
echo SELESAI
