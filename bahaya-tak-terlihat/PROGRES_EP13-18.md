# Progres revisi EP13–18 (nada menyemangati) — DIJEDA

Dijeda atas permintaan, dilanjut setelah limit tersedia lagi.

| EP | Naskah baru | Cover baru | VO baru | Animasi | Video |
|---|---|---|---|---|---|
| 13 | ✅ | ✅ | ✅ | ✅ | ✅ `video/EP13_GasBocor_1080p60.mp4` (75 dtk) |
| 14 | ✅ | ✅ | ⏸️ (terhenti di baris 7/17, ulang dari awal) | — | versi lama |
| 15 | ✅ | ✅ | — | — | versi lama |
| 16 | ✅ | ✅ | — | stub | — |
| 17 | ✅ | ✅ | — | stub | — |
| 18 | ✅ | ✅ | — | stub | — |

## Cara lanjut
```bash
cd bahaya-tak-terlihat
REF_WAV=data/voice/narator_ref.wav REF_TEXT="Pernah nggak, habis seharian pegang HP, kepala kamu kayak diiket? Itu bukan cuma capek biasa, lho." \
HF_HUB_DISABLE_XET=1 nohup /home/user/voicebox/backend/venv/bin/python scripts/omnivoice_vo.py 14 15 16 17 18 > out/omni_vo_rev.log 2>&1 &
# per EP setelah VO jadi:
python3 scripts/process_vo.py out/epN_omni_raw.wav data/epN_omni_words.json N
python3 scripts/split_vo.py N "<teks komentar CTA>"
python3 scripts/prep_words.py N
# lalu bangun ulang src/ep/EpN.tsx + data/epN_sfx.json, make_audio.py N, render_all.sh
```
Teks komentar CTA:
- 14: `Botol di rumah aman? Komen "botol aman" ✅`
- 15: `Gagang panci udah ke dalam? Komen ✅`
- 16: `Udah cuci sayur? Komen "salad bersih" 🥗`
- 17: `Siap belajar CPR? Komen "siap nolong" 💪`
- 18: `Udah pindah ke meja? Komen ✅`
