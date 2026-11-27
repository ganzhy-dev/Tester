# Poster Audit SMKP (versi HP, 1080×1920)

Poster pengumuman Audit SMKP Minerba untuk PT Juloi Coal, PT Kalteng Coal dan PT Sumber Barito Coal, 2–3 Desember 2026.

- `output/Poster_Audit_SMKP_HP.jpg`: siap dibagikan di WhatsApp/status (1080×1920)
- `output/Poster_Audit_SMKP_HP.png`: versi PNG 1080×1920
- `output/Poster_Audit_SMKP_HP_HD.png`: versi tajam 2160×3840 (anti pecah saat dikompres)

Gaya visual: kontras navy–toska dengan aksen oranye dan motif tetes (gradasi oranye → toska). Karakter pekerja memakai kemeja toska berstrip reflektif dan helm putih, terinspirasi foto pekerja di situs Alamtri. Ilustrasinya digambar sendiri dalam SVG, tanpa foto atau logo perusahaan.

Render ulang: `NODE_PATH=$(npm root -g) node render.js` (pakai Playwright + Chromium).
Isi teks ada di `poster.html`; karakter dan latar ada di `characters.js`.
