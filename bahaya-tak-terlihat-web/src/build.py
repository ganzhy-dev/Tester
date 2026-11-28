#!/usr/bin/env python3
"""Membangun situs statis Bahaya Tak Terlihat ke folder ../site.

Pemakaian:  python3 src/build.py
Tanpa dependensi luar. Artikel ditulis di src/articles/*.md (frontmatter sederhana).
"""
from __future__ import annotations

import html
import json
import re
import shutil
from datetime import date
from pathlib import Path

from halus import halus_svg

ROOT = Path(__file__).resolve().parent
OUT = ROOT.parent / "site"

# ----------------------------------------------------------------- konfigurasi
# Ganti nilai bertanda PLACEHOLDER sebelum situs diterbitkan.
SITE = {
    "name": "Bahaya Tak Terlihat",
    "tagline": "Biar bahaya yang nggak kelihatan… jadi kelihatan.",
    "url": "https://bahayatakterlihat.id",  # PLACEHOLDER: domain usulan, belum dibeli
    "tiktok": "https://www.tiktok.com/@bahayataktelihat",
    "tiktok_handle": "@bahayataktelihat",
    "facebook": "",  # PLACEHOLDER: URL halaman Facebook belum diberikan
    "whatsapp_channel": "",  # PLACEHOLDER: saluran WhatsApp belum dibuat
    "email": "halo@bahayatakterlihat.id",  # PLACEHOLDER: contoh, belum aktif
    "lang": "id",
}

CATEGORIES = {
    "rumah": ("Rumah & Keluarga", "Dapur, kamar mandi, colokan, dan sudut rumah yang sering terlupa.", "lpg"),
    "kerja": ("Tempat Kerja & IHOH", "Bising, debu, panas, dan getaran: higiene industri untuk pekerja.", "noise"),
    "mental": ("Kesehatan Mental & Stres", "Stres kerja, burnout, dan cara pulih tanpa merasa bersalah.", "stress"),
    "gaya-hidup": ("Gaya Hidup & Olahraga", "Makan sehat, olahraga, dan kebiasaan harian yang lebih aman.", "finish"),
    "pertolongan": ("Pertolongan Pertama", "Langkah pertama yang tepat saat terjadi sesuatu di sekitar kita.", "steam"),
}

VIDEOS = [  # episode video TikTok terbaru dan artikel pendampingnya
    ("EP13", "Gas elpiji bocor", "lpg", "gas-elpiji-bocor"),
    ("EP14", "Botol yang menyamar", "bottle", "botol-bekas-cairan-kimia"),
    ("EP15", "Air panas di dapur", "steam", "luka-bakar-air-panas-anak"),
    ("EP16", "Salad yang licik", "salad", "salad-makanan-mentah"),
    ("EP17", "Garis finis & CPR", "finish", "persiapan-lari-dan-cpr"),
    ("EP18", "Bantal bara (powerbank)", "powerbank", "powerbank-mengecas-di-kasur"),
]

KANTOR_URL = "https://claude.ai/artifact/HkQxgkJwMmq8K46CX7oABZ"  # kantor virtual tim (artifact)

# Galeri video: (nomor, judul, musim, slug artikel terkait atau "", varian maskot)
# Video web (720p, terkompresi) ada di src/media/video/epN.mp4; poster di src/media/poster/epN.jpg.
EPISODES = [
    (13, "Cium bau gas? Tenang, lakuin ini", "rumah", "gas-elpiji-bocor", "lpg"),
    (14, "Botol air mineral isi cairan berbahaya", "rumah", "botol-bekas-cairan-kimia", "bottle"),
    (15, "Air panas di dapur", "rumah", "luka-bakar-air-panas-anak", "steam"),
    (10, "Tersetrum colokan", "rumah", "", "volt"),
    (11, "Beban ibu rumah tangga", "rumah", "", "stress"),
    (12, "Lantai kamar mandi licin", "rumah", "", "slip"),
    (7, "Psikosomatik: stres yang bicara lewat badan", "stres", "stres-kerja-psikosomatik", "stress"),
    (8, "Notifikasi malam dan burnout", "stres", "stres-kerja-psikosomatik", "stress"),
    (9, "Doomscrolling", "stres", "", "stress"),
    (1, "CO₂ di ruang rapat", "kerja", "", "co2"),
    (2, "Getaran alat kerja", "kerja", "", "volt"),
    (3, "Kebisingan", "kerja", "kebisingan-kesehatan-telinga", "noise"),
    (4, "Tekanan panas", "kerja", "", "lpg"),
    (5, "Debu silika", "kerja", "", "bottle"),
    (6, "Karbon monoksida", "kerja", "", "co2"),
]
SEASONS = {
    "rumah": ("Musim 3: Bahaya di rumah", "Dapur, kamar mandi, colokan, dan botol yang menyamar."),
    "stres": ("Musim 2: Bahaya di kepala", "Stres, burnout, dan kebiasaan layar yang diam-diam melelahkan."),
    "kerja": ("Musim 1: Bahaya di tempat kerja (IHOH)", "Udara, getaran, bising, panas, dan debu di lingkungan kerja."),
}
SOON = [(16, "Salad yang licik", "salad-makanan-mentah", "salad"), (17, "Siap lari, siap CPR", "persiapan-lari-dan-cpr", "finish"), (18, "Pindah ngecas ke meja", "powerbank-mengecas-di-kasur", "powerbank")]
MEDIA = ROOT / "media"

BULAN = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"]

FONTS = '<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Atkinson+Hyperlegible:ital,wght@0,400;0,700;1,400&family=Baloo+2:wght@700;800&display=swap">'

THEME_BOOT = "<script>(function(){try{var t=localStorage.getItem('btt-theme');if(t)document.documentElement.setAttribute('data-theme',t);if(localStorage.getItem('btt-fs')==='lg')document.documentElement.setAttribute('data-fs','lg');}catch(e){}})();</script>"

ICON = {
    "tiktok": '<svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor"><path d="M16.6 5.8A4.3 4.3 0 0 1 15.5 3h-3.1v12.4a2.6 2.6 0 1 1-2.6-2.6c.3 0 .5 0 .8.1V9.7a5.8 5.8 0 1 0 4.9 5.7V9.1a7.4 7.4 0 0 0 4.3 1.4V7.4a4.3 4.3 0 0 1-3.2-1.6Z"/></svg>',
    "facebook": '<svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor"><path d="M13.5 21v-7.6h2.6l.4-3h-3V8.5c0-.9.3-1.5 1.5-1.5h1.6V4.3A21 21 0 0 0 14.3 4c-2.3 0-3.9 1.4-3.9 4v2.4H7.8v3h2.6V21h3.1Z"/></svg>',
    "wa": '<svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor"><path d="M12 3a9 9 0 0 0-7.8 13.5L3 21l4.6-1.2A9 9 0 1 0 12 3Zm0 16.4a7.4 7.4 0 0 1-3.8-1l-.3-.2-2.7.7.7-2.6-.2-.3A7.4 7.4 0 1 1 12 19.4Zm4.1-5.5c-.2-.1-1.3-.7-1.6-.7-.2-.1-.4-.1-.5.1l-.7.9c-.1.2-.3.2-.5.1a6 6 0 0 1-3-2.6c-.2-.4.2-.4.6-1.2.1-.2 0-.3 0-.4l-.7-1.7c-.2-.4-.4-.4-.5-.4h-.5a.9.9 0 0 0-.6.3 2.7 2.7 0 0 0-.9 2c0 1.2.9 2.3 1 2.5.1.2 1.7 2.6 4.2 3.7 1.6.7 2.2.7 3 .6.5-.1 1.3-.6 1.5-1.1.2-.6.2-1 .1-1.1l-.4-.3Z"/></svg>',
    "link": '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/></svg>',
    "moon": '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5Z"/></svg>',
    "mail": '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m4 7 8 6 8-6"/></svg>',
}

# ----------------------------------------------------------------- markdown kecil


def esc(s: str) -> str:
    return html.escape(s, quote=True)


def slugify(s: str) -> str:
    s = s.lower()
    s = re.sub(r"[^a-z0-9\s-]", "", s)
    return re.sub(r"[\s-]+", "-", s).strip("-")[:60]


def inline(s: str) -> str:
    s = esc(s)
    s = re.sub(r"\[([^\]]+)\]\((https?://[^)\s]+)\)", r'<a href="\2" rel="noopener" target="_blank">\1</a>', s)
    s = re.sub(r"(?<![\"=>])(https?://[^\s<]+[^\s<.,;)])", r'<a href="\1" rel="noopener" target="_blank">\1</a>', s)
    s = re.sub(r"\*\*(.+?)\*\*", r"<strong>\1</strong>", s)
    s = re.sub(r"(?<![\w*])\*(?!\s)(.+?)(?<!\s)\*(?!\w)", r"<em>\1</em>", s)
    return s


def md_to_html(md: str) -> tuple[str, list[tuple[str, str]]]:
    lines = md.strip("\n").split("\n")
    out: list[str] = []
    toc: list[tuple[str, str]] = []
    para: list[str] = []
    lst: list[str] = []
    lst_type = ""
    in_refs = False

    def flush_para():
        if para:
            out.append(f"<p>{inline(' '.join(para))}</p>")
            para.clear()

    def flush_list():
        nonlocal lst_type
        if lst:
            cls = ' class="refs"' if in_refs else ""
            out.append(f"<{lst_type}{cls}>" + "".join(f"<li>{inline(i)}</li>" for i in lst) + f"</{lst_type}>")
            lst.clear()
            lst_type = ""

    for raw in lines:
        line = raw.rstrip()
        if not line.strip():
            flush_para(); flush_list(); continue
        m = re.match(r"^(#{2,3})\s+(.*)$", line)
        if m:
            flush_para(); flush_list()
            level = len(m.group(1)); text = m.group(2)
            hid = slugify(text)
            in_refs = text.lower() == "rujukan"
            if level == 2:
                toc.append((hid, text))
            out.append(f'<h{level} id="{hid}">{inline(text)}</h{level}>')
            continue
        m = re.match(r"^(\d+)\.\s+(.*)$", line)
        if m:
            flush_para()
            if lst_type and lst_type != "ol": flush_list()
            lst_type = "ol"; lst.append(m.group(2)); continue
        m = re.match(r"^-\s+(.*)$", line)
        if m:
            flush_para()
            if lst_type and lst_type != "ul": flush_list()
            lst_type = "ul"; lst.append(m.group(1)); continue
        if line.startswith("> "):
            flush_para(); flush_list()
            out.append(f"<blockquote><p>{inline(line[2:])}</p></blockquote>")
            continue
        flush_list()
        para.append(line.strip())
    flush_para(); flush_list()
    return "\n".join(out), toc


def parse_article(path: Path) -> dict:
    text = path.read_text(encoding="utf-8")
    _, fm, body = text.split("---", 2)
    meta: dict = {}
    key = None
    for line in fm.strip().split("\n"):
        if line.startswith("- ") and key:
            meta.setdefault(key, []).append(line[2:].strip())
            continue
        k, _, v = line.partition(":")
        key = k.strip()
        if v.strip():
            meta[key] = v.strip()
    html_body, toc = md_to_html(body)
    words = len(re.findall(r"\w+", body.split("## Rujukan")[0]))
    meta.update(html=html_body, toc=toc, words=words, minutes=max(1, round(words / 200)))
    first_p = re.search(r"<p>(.*?)</p>", html_body, re.S)
    meta["lead_end"] = first_p.end() if first_p else 0
    return meta


def tanggal(iso: str) -> str:
    y, m, d = map(int, iso.split("-"))
    return f"{d} {BULAN[m - 1]} {y}"

# ----------------------------------------------------------------- kerangka halaman


def head(title: str, desc: str, rel: str, path: str, og_type: str = "website", jsonld: list | None = None, full: bool = True, noindex: bool = False) -> str:
    canonical = SITE["url"] + "/" + path
    page_title = title if title == SITE["name"] else f"{title} · {SITE['name']}"
    ld = "".join(f'<script type="application/ld+json">{json.dumps(j, ensure_ascii=False)}</script>' for j in (jsonld or []))
    meta = (
        f'<title>{esc(page_title)}</title>'
        '<meta name="claude:viewport-fit-sides" content="cover">'
        f'<meta name="description" content="{esc(desc)}">'
        f'<link rel="canonical" href="{canonical}">'
        + ('<meta name="robots" content="noindex">' if noindex else "")
        + f'<meta property="og:site_name" content="{SITE["name"]}">'
        f'<meta property="og:locale" content="id_ID">'
        f'<meta property="og:type" content="{og_type}">'
        f'<meta property="og:title" content="{esc(title)}">'
        f'<meta property="og:description" content="{esc(desc)}">'
        f'<meta property="og:url" content="{canonical}">'
        f'<meta property="og:image" content="{SITE["url"]}/assets/og.png">'
        '<meta name="twitter:card" content="summary_large_image">'
        '<meta name="theme-color" content="#fff8f0" media="(prefers-color-scheme: light)">'
        '<meta name="theme-color" content="#1a1030" media="(prefers-color-scheme: dark)">'
        f'<link rel="icon" href="{rel}assets/favicon.svg" type="image/svg+xml">'
        f"{FONTS}"
        f'<link rel="stylesheet" href="{rel}assets/style.css">'
        f"{THEME_BOOT}{ld}"
        "<!-- Kode verifikasi/iklan (mis. Google AdSense) dipasang di sini setelah akun disetujui. -->"
    )
    if full:
        return f'<!doctype html>\n<html lang="id">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n{meta}\n</head>\n<body>\n'
    return meta + "\n"


def header(rel: str, current: str) -> str:
    def nav(href, label, key):
        cur = ' aria-current="page"' if key == current else ""
        return f'<a href="{rel}{href}"{cur}>{label}</a>'
    home = rel if rel else "./"
    return f"""<a class="skip" href="#isi">Langsung ke isi</a>
<header class="site-header"><div class="wrap">
<a class="brand" href="{home}" aria-label="{SITE['name']}, ke beranda">{halus_svg('lpg')}<span><b>Bahaya Tak Terlihat</b><small>Edukasi K3 &amp; kesehatan sehari-hari</small></span></a>
<nav class="nav" aria-label="Menu utama">{nav('' if rel else './', 'Beranda', 'home').replace('href=""', f'href="{home}"')}{nav('artikel/index.html', 'Artikel', 'artikel')}{nav('video.html', 'Video', 'video')}{nav('tentang.html', 'Tentang', 'tentang')}{nav('kolaborasi.html', 'Kolaborasi', 'kolaborasi')}</nav>
<div class="tools"><button class="icon-btn" id="fs-toggle" type="button" aria-label="Perbesar huruf" aria-pressed="false">A+</button><button class="icon-btn" id="theme-toggle" type="button" aria-label="Ganti mode gelap" aria-pressed="false">{ICON['moon']}</button></div>
</div></header>
<main id="isi">
"""


def social_buttons(size: str = "") -> str:
    fb = SITE["facebook"]
    fb_btn = (
        f'<a class="btn" href="{fb}" target="_blank" rel="noopener">{ICON["facebook"]} Ikuti di Facebook</a>'
        if fb else
        f'<a class="btn" href="#facebook-belum-diisi" aria-disabled="true" title="Tautan Facebook belum diisi">{ICON["facebook"]} Facebook <span class="ph">tautan menyusul</span></a>'
    )
    return (
        f'<div class="btn-row"><a class="btn btn-scan" href="{SITE["tiktok"]}" target="_blank" rel="noopener">{ICON["tiktok"]} Follow TikTok {SITE["tiktok_handle"]}</a>'
        f"{fb_btn}</div>"
    )


def footer(rel: str) -> str:
    year = date.today().year
    fb = SITE["facebook"]
    fb_link = f'<a href="{fb}" target="_blank" rel="noopener">Facebook</a>' if fb else 'Facebook <span class="ph">menyusul</span>'
    cats = "".join(f'<li><a href="{rel}artikel/index.html#{k}">{esc(v[0])}</a></li>' for k, v in CATEGORIES.items())
    return f"""</main>
<footer class="site-footer"><div class="wrap">
<div class="grid">
<div><h2>Bahaya Tak Terlihat</h2><p class="tagline">{SITE['tagline']}</p>
<p>Edukasi keselamatan dan kesehatan kerja (K3) serta higiene industri (IHOH) untuk kehidupan sehari-hari. Tulisan di situs ini bersifat edukasi umum dan tidak menggantikan pemeriksaan tenaga kesehatan.</p>
<p style="margin-top:10px"><b>Darurat:</b> 112 · Ambulans 119 · Damkar 113</p></div>
<div><h2>Kategori</h2><ul>{cats}</ul></div>
<div><h2>Ikuti &amp; hubungi</h2><ul>
<li><a href="{SITE['tiktok']}" target="_blank" rel="noopener">TikTok {SITE['tiktok_handle']}</a></li>
<li>{fb_link}</li>
<li><a href="{rel}kolaborasi.html">Kolaborasi &amp; kontak</a></li>
<li><a href="{rel}tentang.html">Tentang kami</a></li>
<li><a href="{rel}kebijakan-privasi.html">Kebijakan privasi</a></li>
<li><a href="{rel}disclaimer.html">Disclaimer</a></li>
</ul></div>
</div>
<p class="fine">© {year} Bahaya Tak Terlihat. Konten boleh dibagikan untuk keperluan edukasi nonkomersial dengan menyebut sumber.</p>
</div></footer>
<script src="{rel}assets/main.js" defer></script>
"""


def ad_slot(label: str = "Ruang iklan") -> str:
    return f'<aside class="ad-slot" aria-label="{label}"><b>Iklan</b><span>Ruang iklan responsif · placeholder (aktif setelah persetujuan AdSense)</span></aside>'


def close(full: bool) -> str:
    return "</body>\n</html>\n" if full else ""


def org_ld() -> dict:
    same = [SITE["tiktok"]] + ([SITE["facebook"]] if SITE["facebook"] else [])
    return {"@context": "https://schema.org", "@type": "Organization", "name": SITE["name"], "url": SITE["url"],
            "logo": SITE["url"] + "/assets/og.png", "sameAs": same}

# ----------------------------------------------------------------- komponen


def card(a: dict, rel: str) -> str:
    cat = CATEGORIES[a["category"]][0]
    return f"""<li class="card"><div class="art">{halus_svg(a['halus'])}</div><div class="body">
<a class="chip" href="{rel}artikel/index.html#{a['category']}">{esc(cat)}</a>
<h3><a href="{rel}artikel/{a['slug']}.html">{esc(a['title'])}</a></h3>
<p>{esc(a['description'])}</p>
<div class="meta"><span>{a['minutes']} menit baca</span><span>{tanggal(a['date'])}</span></div></div></li>"""


def page(path: str, title: str, desc: str, current: str, content: str, depth: int = 0, full: bool = True, jsonld=None, og_type="website", noindex=False) -> str:
    rel = "../" * depth
    return head(title, desc, rel, path, og_type, jsonld, full, noindex) + header(rel, current) + content + footer(rel) + close(full)

# ----------------------------------------------------------------- halaman


def has_video(n: int) -> bool:
    return (MEDIA / "video" / f"ep{n}.mp4").exists()


def video_card(e, rel: str, by_slug: dict) -> str:
    n, title, _season, slug, variant = e
    poster = f"{rel}media/poster/ep{n}.jpg"
    if has_video(n):
        media = (f'<video controls preload="none" playsinline poster="{poster}" aria-label="Video EP{n}: {esc(title)}">'
                 f'<source src="{rel}media/video/ep{n}.mp4" type="video/mp4"></video>')
    else:
        media = (f'<a class="reel-tiktok" href="{SITE["tiktok"]}" target="_blank" rel="noopener" aria-label="Tonton EP{n} di TikTok">'
                 f'<img src="{poster}" alt="" loading="lazy" width="360" height="640"><span class="play">{ICON["tiktok"]} Tonton di TikTok</span></a>')
    art = by_slug.get(slug)
    links = f'<a href="{rel}artikel/{slug}.html">Baca artikelnya</a>' if art else ""
    links += f'<a href="{SITE["tiktok"]}" target="_blank" rel="noopener">Buka di TikTok</a>'
    return f'<li class="reel"><div class="frame">{media}</div><span class="ep">EP{n:02d}</span><b>{esc(title)}</b><div class="links">{links}</div></li>'


def kantor_block(rel: str = "") -> str:
    return f"""<section class="section"><div class="wrap kantor">
<a class="kantor-shot" href="{KANTOR_URL}" target="_blank" rel="noopener"><img src="{rel}media/kantor.jpg" alt="Kantor pixel-art Bahaya Tak Terlihat: tim riset, copywriter, art director, motion designer, booth VO, ruang rapat, pantry kopi, dan Kopi si kucing kantor" loading="lazy" width="1148" height="720"></a>
<div><span class="eyebrow">Di balik layar</span><h2>Mampir ke kantor kami</h2>
<p>Setiap episode lahir dari kantor virtual ini: Dika mengecek fakta, Laras menulis naskah, Bima menggambar Si Halus, Sekar menganimasikan, Yoga merekam suara, Nina memeriksa, Fajar menyiapkan caption. Klik orangnya untuk melihat apa yang sedang ia kerjakan. Jangan bangunkan Kopi, kucing kantor yang sedang tidur di karpet.</p>
<div class="btn-row"><a class="btn btn-scan" href="{KANTOR_URL}" target="_blank" rel="noopener">Masuk ke kantor</a></div>
<p class="form-note">Kantor dibuka di tab baru.</p></div>
</div></section>"""


def build_videos(arts: list[dict]) -> str:
    by_slug = {a["slug"]: a for a in arts}
    secs = []
    for key, (name, blurb) in SEASONS.items():
        cards = "".join(video_card(e, "", by_slug) for e in EPISODES if e[2] == key)
        secs.append(f'<section class="cat-section" id="{key}"><h2>{esc(name)}</h2><p>{esc(blurb)}</p><ul class="reels">{cards}</ul></section>')
    soon = "".join(
        f'<li class="reel"><div class="frame soon">{halus_svg(v)}<span class="ph">segera tayang</span></div><span class="ep">EP{n}</span><b>{esc(t)}</b><div class="links"><a href="artikel/{slug}.html">Baca artikelnya dulu</a></div></li>'
        for n, t, slug, v in SOON)
    secs.insert(0, f'<section class="cat-section" id="segera"><h2>Segera tayang</h2><p>Naskah dan cover sudah jadi, videonya sedang diproduksi.</p><ul class="reels">{soon}</ul></section>')
    nav = '<a href="#segera">Segera</a>' + "".join(f'<a href="#{k}">{esc(v[0].split(": ")[1])}</a>' for k, v in SEASONS.items())
    content = f"""<div class="wrap"><div class="page-head"><h1>Video</h1><p>Semua episode Si Halus, dari bahaya di tempat kerja sampai di dapur sendiri. Yang bertanda putar bisa ditonton langsung di sini.</p>
<div class="btn-row" style="margin-top:18px"><a class="btn btn-scan" href="{SITE['tiktok']}" target="_blank" rel="noopener">{ICON['tiktok']} Follow {SITE['tiktok_handle']}</a></div></div>
<nav class="cat-nav" aria-label="Musim video">{nav}</nav>
{''.join(secs)}
{ad_slot()}
</div>{kantor_block()}"""
    return page("video.html", "Video", "Galeri video edukasi K3 Si Halus: bahaya di rumah, stres, dan tempat kerja, lengkap dengan artikel pendamping.", "video", content)


def build_home(arts: list[dict], full: bool = True) -> str:
    rel = ""
    latest = "".join(card(a, rel) for a in arts[:6])
    by_slug = {a["slug"]: a for a in arts}
    cast = "".join(
        f'<li><a href="artikel/{a["slug"]}.html">{halus_svg(a["halus"])}<b>{esc(a["halus_name"])}</b><span>{esc(a["title"].split(":")[0])}</span></a></li>'
        for a in arts
    )
    featured = "".join(video_card(e, "", by_slug) for e in EPISODES if e[0] in (13, 14, 15))
    counts = {k: sum(1 for a in arts if a["category"] == k) for k in CATEGORIES}
    cats = "".join(
        f'<li><a href="artikel/index.html#{k}"><b>{esc(v[0])}</b><span>{esc(v[1])}</span><em>{counts[k]} artikel</em></a></li>'
        for k, v in CATEGORIES.items()
    )
    wa = SITE["whatsapp_channel"]
    wa_btn = (f'<a class="btn" href="{wa}" target="_blank" rel="noopener">{ICON["wa"]} Saluran WhatsApp</a>' if wa
              else f'<a class="btn" href="#saluran-wa-belum-ada" aria-disabled="true">{ICON["wa"]} Saluran WhatsApp <span class="ph">segera</span></a>')
    content = f"""
<section class="hero"><div class="wrap">
<div><span class="eyebrow">Edukasi K3 &amp; IHOH untuk sehari-hari</span>
<h1>Bahaya yang tak terlihat, kita bikin <mark>kelihatan</mark>.</h1>
<p class="lede">Panduan singkat tentang keselamatan di rumah, di tempat kerja, dan di jalan. Bahasanya ringan, sumbernya jelas. Tenang, gampang kok dikalahin.</p>
<div class="btn-row"><a class="btn btn-primary" href="artikel/index.html">Baca artikel</a><a class="btn btn-scan" href="{SITE['tiktok']}" target="_blank" rel="noopener">{ICON['tiktok']} Follow TikTok</a></div></div>
<div class="scanner" aria-hidden="true">{halus_svg('lpg')}<div class="readout"><span>PINDAI: DAPUR</span><span>1 TERDETEKSI</span></div></div>
</div></section>

<section class="section band"><div class="wrap">
<div class="section-head"><h2>Kenapa kami ada</h2><p>Banyak kecelakaan berawal dari hal yang tidak kelihatan: gas yang tidak berbau kuat, panas yang terperangkap di kasur, bising yang terasa "sudah biasa".</p></div>
<div class="mission">
<div><span class="num">1</span><h3>Membuat yang samar jadi jelas</h3><p>Setiap bahaya kami beri wajah: Si Halus, makhluk halus lucu yang gampang diingat anak-anak sampai kakek-nenek.</p></div>
<div><span class="num">2</span><h3>Menyemangati, bukan menakuti</h3><p>Kami fokus pada langkah kecil yang bisa langsung dilakukan hari ini, bukan cerita seram.</p></div>
<div><span class="num">3</span><h3>Bersumber dan dicek ulang</h3><p>Angka dan anjuran kami ambil dari WHO, Kemenkes, ESDM, IDAI, AHA, dan regulasi K3 Indonesia, lengkap dengan rujukannya.</p></div>
</div></div></section>

<section class="section"><div class="wrap">
<div class="section-head"><h2>Kenalan dengan para Si Halus</h2><p>Setiap Si Halus mewakili satu bahaya. Ketuk salah satunya untuk tahu cara mengalahkannya.</p></div>
<ul class="cast">{cast}</ul>
</div></section>

<div class="wrap">{ad_slot()}</div>

<section class="section"><div class="wrap">
<div class="section-head"><h2>Tonton Si Halus beraksi</h2><p>Satu menit, satu bahaya, satu cara mengatasinya. Putar langsung di sini, lalu baca artikel pendampingnya.</p></div>
<ul class="reels">{featured}</ul>
<div class="btn-row" style="margin-top:20px"><a class="btn btn-primary" href="video.html">Semua video</a><a class="btn btn-scan" href="{SITE['tiktok']}" target="_blank" rel="noopener">{ICON['tiktok']} Lebih banyak di TikTok</a></div>
</div></section>

<section class="section band"><div class="wrap">
<div class="section-head"><h2>Artikel terbaru</h2><a class="btn" href="artikel/index.html">Semua artikel</a></div>
<ul class="cards">{latest}</ul>
</div></section>

<section class="section"><div class="wrap">
<div class="section-head"><h2>Jelajahi menurut kategori</h2></div>
<ul class="cats">{cats}</ul>
</div></section>

{kantor_block()}

<section class="section band" id="ikuti"><div class="wrap follow">
<div><h2>Ikuti supaya tidak ketinggalan</h2><p>Episode baru dan tips singkat terbit di TikTok. Halaman Facebook dan saluran WhatsApp sedang disiapkan untuk keluarga yang lebih nyaman membaca di sana.</p>
{social_buttons()}<div class="btn-row" style="margin-top:12px">{wa_btn}</div></div>
<form class="newsletter" data-demo="Terima kasih! Formulir ini masih pratinjau dan belum tersambung ke layanan buletin, jadi alamat Anda belum tersimpan.">
<h3>Buletin bulanan</h3><p class="form-note">Satu surel sebulan: ringkasan artikel baru dan daftar periksa keselamatan. <span class="ph">belum aktif</span></p>
<div class="field"><label for="nl-email">Alamat surel</label><input id="nl-email" name="email" type="email" autocomplete="email" placeholder="nama@contoh.com" required></div>
<button class="btn btn-primary" type="submit">Daftar buletin</button>
<p class="form-status" role="status" tabindex="-1" hidden></p>
</form>
</div></section>
"""
    ld = [org_ld(), {"@context": "https://schema.org", "@type": "WebSite", "name": SITE["name"], "url": SITE["url"], "inLanguage": "id-ID"}]
    return page("", SITE["name"], "Edukasi keselamatan dan kesehatan kerja (K3) dan IHOH untuk kehidupan sehari-hari: rumah, tempat kerja, olahraga, dan pertolongan pertama.", "home", content, 0, full, ld)


def build_index(arts: list[dict]) -> str:
    rel = "../"
    nav = "".join(f'<a href="#{k}">{esc(v[0])}</a>' for k, v in CATEGORIES.items())
    secs = []
    for k, (name, blurb, _) in CATEGORIES.items():
        items = [a for a in arts if a["category"] == k]
        inner = f'<ul class="cards">{"".join(card(a, rel) for a in items)}</ul>' if items else '<p class="empty">Artikel untuk kategori ini sedang ditulis. Sementara itu, intip videonya di TikTok.</p>'
        secs.append(f'<section class="cat-section" id="{k}"><h2>{esc(name)}</h2><p>{esc(blurb)}</p>{inner}</section>')
    content = f"""<div class="wrap"><div class="page-head"><h1>Artikel</h1><p>Panduan praktis tentang bahaya yang sering tidak terlihat, disusun per kategori. Pilih yang paling dekat dengan keseharian Anda.</p></div>
<nav class="cat-nav" aria-label="Kategori artikel">{nav}</nav>
{ad_slot()}
{''.join(secs)}
</div>"""
    return page("artikel/", "Artikel", "Kumpulan artikel K3 dan IHOH: rumah dan keluarga, tempat kerja, kesehatan mental, gaya hidup, dan pertolongan pertama.", "artikel", content, 1)


def build_article(a: dict, arts: list[dict]) -> str:
    rel = "../"
    cat_name = CATEGORIES[a["category"]][0]
    toc_items = "".join(f'<li><a href="#{hid}">{esc(t)}</a></li>' for hid, t in a["toc"])
    save_items = "".join(f"<li>{inline(s)}</li>" for s in a["simpan"])
    save_box = f"""<aside class="save-box" id="simpan-{a['slug']}" aria-labelledby="simpan-judul">
<h2 id="simpan-judul"><span class="tag">Simpan ini</span> {esc(a['halus_name'])} kalah dengan langkah ini</h2>
<p>Ringkasan untuk disimpan atau dikirim ke keluarga.</p><ol>{save_items}</ol>
<button class="btn" type="button" data-copy-save="simpan-{a['slug']}">{ICON['link']} Salin ringkasan</button></aside>"""
    body = a["html"]
    # kotak "simpan ini" setelah paragraf pembuka; slot iklan sebelum subjudul ketiga
    first_h2 = body.find("<h2")
    body = body[:first_h2] + save_box + "\n" + body[first_h2:]
    h2s = [m.start() for m in re.finditer(r"<h2 ", body)]
    if len(h2s) >= 4:
        body = body[: h2s[3]] + ad_slot() + body[h2s[3]:]
    related = [x for x in arts if x["slug"] != a["slug"] and x["category"] == a["category"]]
    related += [x for x in arts if x["slug"] != a["slug"] and x not in related]
    rel_cards = "".join(card(x, rel) for x in related[:3])
    url = f"{SITE['url']}/artikel/{a['slug']}.html"
    ld = [
        {"@context": "https://schema.org", "@type": "Article", "headline": a["title"], "description": a["description"],
         "inLanguage": "id-ID", "datePublished": a["date"], "dateModified": a["date"], "mainEntityOfPage": url,
         "image": SITE["url"] + "/assets/og.png", "wordCount": a["words"], "articleSection": cat_name,
         "author": {"@type": "Organization", "name": "Tim Bahaya Tak Terlihat", "url": SITE["url"] + "/tentang.html"},
         "publisher": org_ld()},
        {"@context": "https://schema.org", "@type": "BreadcrumbList", "itemListElement": [
            {"@type": "ListItem", "position": 1, "name": "Beranda", "item": SITE["url"] + "/"},
            {"@type": "ListItem", "position": 2, "name": "Artikel", "item": SITE["url"] + "/artikel/"},
            {"@type": "ListItem", "position": 3, "name": a["title"], "item": url}]},
    ]
    content = f"""<div class="wrap">
<nav class="crumbs" aria-label="Jejak halaman"><ol><li><a href="../">Beranda</a></li><li><a href="index.html">Artikel</a></li><li><a href="index.html#{a['category']}">{esc(cat_name)}</a></li></ol></nav>
<header class="article-head"><div><a class="chip" href="index.html#{a['category']}">{esc(cat_name)}</a>
<h1>{esc(a['title'])}</h1><p class="desc">{esc(a['description'])}</p>
<div class="meta"><span>Tim Bahaya Tak Terlihat</span><span>{tanggal(a['date'])}</span><span>{a['minutes']} menit baca</span></div></div>
{halus_svg(a['halus'], label=a['halus_name'])}</header>
<div class="article-layout">
<article class="prose">
{body}
<p class="note">Tulisan ini adalah edukasi umum, bukan pengganti pemeriksaan atau nasihat tenaga kesehatan. Dalam keadaan darurat, hubungi 112 atau ambulans 119. Baca juga <a href="../disclaimer.html">disclaimer</a> kami.</p>
<div class="share"><b>Bagikan:</b>
<a class="btn" data-share="wa" href="https://wa.me/?text={esc(a['title'])}%20{url}" target="_blank" rel="noopener">{ICON['wa']} WhatsApp</a>
<a class="btn" data-share="fb" href="https://www.facebook.com/sharer/sharer.php?u={url}" target="_blank" rel="noopener">{ICON['facebook']} Facebook</a>
<button class="btn" type="button" data-copy-link>{ICON['link']} Salin tautan</button></div>
</article>
<details class="toc" open><summary>Daftar isi</summary><ol>{toc_items}</ol></details>
</div>
{ad_slot()}
<section class="section" style="padding-top:8px"><div class="section-head"><h2>Baca juga</h2></div><ul class="cards">{rel_cards}</ul></section>
<section class="section band" style="border-radius:var(--radius);padding-inline:24px;margin-bottom:24px"><div class="follow"><div><h2>Versi satu menitnya ada di TikTok</h2><p>Tonton Si Halus beraksi, lalu bagikan ke grup keluarga.</p></div>{social_buttons()}</div></section>
</div>"""
    return page(f"artikel/{a['slug']}.html", a["title"], a["description"], "artikel", content, 1, jsonld=ld, og_type="article")


def build_about() -> str:
    content = f"""<div class="wrap"><div class="page-head"><h1>Tentang kami</h1><p>Bahaya Tak Terlihat berawal dari seri video TikTok tentang keselamatan kerja yang jarang dibahas, lalu tumbuh ke bahaya di rumah dan keseharian.</p></div>
<div class="two-col">
<div class="prose">
<h2 id="cerita">Cerita singkat</h2>
<p>Kami percaya sebagian besar kecelakaan bukan karena orang ceroboh, melainkan karena bahayanya memang sulit dilihat. Karbon dioksida di ruang rapat, debu silika dari potongan keramik, panas yang terperangkap di bawah bantal. Semua itu tidak terlihat sampai ada yang menyorotnya.</p>
<p>Maka lahirlah Si Halus, "makhluk halus" versi K3. Setiap episode, Si Halus muncul sebagai satu bahaya dan kalah oleh satu kebiasaan sederhana. Situs ini adalah rumah bagi versi panjangnya: artikel yang bisa dibaca pelan-pelan, disimpan, dan dibagikan.</p>
<h2 id="cara-menulis">Cara kami menulis</h2>
<ul>
<li>Setiap angka dan anjuran kami ambil dari sumber resmi atau ilmiah, misalnya WHO, Kementerian Kesehatan, Kementerian ESDM, IDAI, American Heart Association, dan regulasi K3 Indonesia. Daftar rujukan selalu ada di akhir artikel.</li>
<li>Kasus nyata kami sebutkan seperlunya, tanpa nama korban. Penyebab yang belum dipastikan kami tulis sebagai "diduga".</li>
<li>Bahasa kami mengikuti kaidah EYD dengan gaya yang hangat, supaya nyaman dibaca anak sekolah sampai kakek-nenek.</li>
<li>Setiap tulisan dibaca ulang dan disunting manusia sebelum terbit. Kalau menemukan kekeliruan, kabari kami lewat halaman <a href="kolaborasi.html#kontak">kontak</a> dan kami akan memperbaikinya.</li>
</ul>
</div>
<div class="panel" style="align-self:start;display:grid;gap:14px;justify-items:start">{halus_svg('volt', size=150)}<h2>Tim redaksi</h2>
<p>Penulis, pemeriksa fakta, dan ilustrator dari latar belakang K3, kesehatan masyarakat, dan desain. <span class="ph">profil penulis menyusul</span></p>
<p>Untuk konten kesehatan, kami berencana bekerja sama dengan tenaga kesehatan sebagai peninjau. Nama peninjau akan dicantumkan di setiap artikel yang sudah ditinjau.</p>
{social_buttons()}</div>
</div></div>{kantor_block()}"""
    return page("tentang.html", "Tentang kami", "Tentang Bahaya Tak Terlihat: misi, cara menulis, dan tim di balik edukasi K3 dan IHOH sehari-hari.", "tentang", content)


def build_collab() -> str:
    email = SITE["email"]
    content = f"""<div class="wrap"><div class="page-head"><h1>Kolaborasi &amp; kontak</h1><p>Kami terbuka untuk kerja sama dengan brand, perusahaan, sekolah, dan lembaga yang ingin keselamatan terasa dekat dan menyenangkan.</p></div>

<section class="section" style="padding-top:12px"><div class="section-head"><h2>Media kit singkat</h2><p>Angka audiens diperbarui setiap bulan. Minta versi PDF lengkap lewat surel.</p></div>
<div class="table-wrap"><table class="stats"><thead><tr><th scope="col">Kanal</th><th scope="col">Pengikut</th><th scope="col">Rata-rata tayangan per video</th><th scope="col">Catatan</th></tr></thead>
<tbody><tr><td>TikTok {SITE['tiktok_handle']}</td><td><span class="ph">isi angka</span></td><td><span class="ph">isi angka</span></td><td>Seri video motion 60–75 detik</td></tr>
<tr><td>Facebook</td><td><span class="ph">isi angka</span></td><td><span class="ph">isi angka</span></td><td>Halaman menyusul</td></tr>
<tr><td>Situs web</td><td>—</td><td><span class="ph">isi kunjungan bulanan</span></td><td>Artikel panjang dengan rujukan</td></tr></tbody></table></div>
<p class="form-note" style="margin-top:10px">Audiens utama: keluarga muda, pekerja, pelajar, dan komunitas K3 di Indonesia.</p>
</section>

<section class="section" style="padding-top:0"><div class="section-head"><h2>Bentuk kerja sama</h2></div>
<ul class="offer">
<li><b>Video edukasi bersponsor</b><p>Satu episode Si Halus tentang topik yang relevan dengan produk atau program Anda. Selalu diberi label "bersponsor".</p></li>
<li><b>Artikel bersponsor</b><p>Artikel panjang dengan rujukan, ditulis oleh tim kami, diberi label jelas, dan tetap mengikuti standar cek fakta.</p></li>
<li><b>Edukasi K3 internal</b><p>Video atau poster Si Halus untuk safety induction, safety talk, dan kampanye K3 di perusahaan.</p></li>
<li><b>Sekolah &amp; komunitas</b><p>Materi keselamatan untuk anak dan keluarga, bisa dicetak atau ditayangkan di kelas.</p></li>
</ul>
<p class="note" style="margin-top:18px">Kami tidak menerima kerja sama dengan produk yang membahayakan kesehatan (rokok, rokok elektrik, alkohol, judi, pinjaman ilegal) atau klaim kesehatan yang tidak berdasar. Konten bersponsor tidak mengubah isi anjuran keselamatan.</p>
</section>

<section class="section band" id="kontak" style="border-radius:var(--radius);padding-inline:24px"><div class="two-col">
<div><h2 style="font-size:var(--step-3);margin-bottom:10px">Hubungi kami</h2>
<p style="color:var(--muted);margin-bottom:16px">Untuk kerja sama, koreksi artikel, atau usulan topik. Kami berusaha membalas dalam tiga hari kerja.</p>
<div class="copy-row"><code>{email}</code><button class="btn" type="button" data-copy-text="{email}">{ICON['mail']} Salin alamat</button></div>
<p class="form-note" style="margin-top:8px"><span class="ph">placeholder</span> Alamat ini contoh dan belum aktif. Ganti dengan surel resmi sebelum terbit.</p>
<div style="margin-top:20px">{social_buttons()}</div></div>
<form class="form-grid" data-demo="Pesan belum terkirim: formulir ini masih pratinjau tanpa server. Untuk sementara, kirim pesan langsung ke alamat surel di samping.">
<div class="field"><label for="c-nama">Nama</label><input id="c-nama" name="nama" autocomplete="name" required></div>
<div class="field"><label for="c-email">Surel</label><input id="c-email" name="email" type="email" autocomplete="email" required></div>
<div class="field"><label for="c-jenis">Keperluan</label><select id="c-jenis" name="jenis"><option>Kerja sama brand</option><option>Edukasi K3 perusahaan</option><option>Sekolah atau komunitas</option><option>Koreksi artikel</option><option>Usulan topik</option></select></div>
<div class="field"><label for="c-pesan">Pesan</label><textarea id="c-pesan" name="pesan" required></textarea></div>
<button class="btn btn-primary" type="submit">Kirim pesan</button>
<p class="form-status" role="status" tabindex="-1" hidden></p>
</form></div></section>
</div>"""
    return page("kolaborasi.html", "Kolaborasi & kontak", "Media kit, bentuk kerja sama, dan kontak Bahaya Tak Terlihat untuk brand, perusahaan, sekolah, dan komunitas.", "kolaborasi", content)


def text_page(path: str, title: str, desc: str, intro: str, md: str) -> str:
    body, _ = md_to_html(md)
    content = f'<div class="wrap"><div class="page-head"><h1>{esc(title)}</h1><p>{esc(intro)}</p></div><div class="prose">{body}</div></div>'
    return page(path, title, desc, "", content)


PRIVACY = f"""
Terakhir diperbarui: {tanggal(date.today().isoformat())}.

## Data yang kami kumpulkan

Situs ini dapat dibaca tanpa membuat akun. Kami hanya mengumpulkan data yang Anda berikan sendiri, misalnya alamat surel saat mendaftar buletin atau nama dan pesan saat mengisi formulir kontak. Saat ini formulir tersebut masih dalam tahap pratinjau dan belum menyimpan data apa pun.

Server dan penyedia hosting dapat mencatat data teknis standar, seperti alamat IP, jenis peramban, dan halaman yang dikunjungi, untuk keperluan keamanan dan statistik.

## Penyimpanan di peramban

Kami menyimpan dua pengaturan kecil di peramban Anda (localStorage): pilihan mode terang atau gelap dan ukuran huruf. Data ini tidak dikirim ke mana pun dan bisa dihapus dengan membersihkan data situs di peramban.

## Kuki pihak ketiga dan iklan

Ke depan, situs ini dapat menampilkan iklan melalui pihak ketiga seperti Google AdSense dan memakai layanan analitik. Pihak ketiga tersebut, termasuk Google, dapat menggunakan kuki untuk menayangkan iklan berdasarkan kunjungan Anda ke situs ini dan situs lain. Anda dapat mengatur iklan yang dipersonalisasi melalui Setelan Iklan Google di https://adssettings.google.com, dan mempelajari cara Google memakai data di https://policies.google.com/technologies/partner-sites.

Ketika iklan atau analitik diaktifkan, halaman ini akan diperbarui dan, bila diwajibkan, kami akan meminta persetujuan Anda terlebih dahulu.

## Tautan ke situs lain

Artikel kami memuat tautan ke sumber rujukan dan media sosial. Kebijakan privasi situs tersebut berlaku saat Anda mengunjunginya.

## Hak Anda

Sesuai Undang-Undang Nomor 27 Tahun 2022 tentang Pelindungan Data Pribadi, Anda berhak meminta akses, perbaikan, atau penghapusan data pribadi yang pernah Anda berikan kepada kami. Kirim permintaan ke alamat surel di halaman kontak.

## Anak-anak

Konten kami cocok untuk semua usia, tetapi kami tidak sengaja mengumpulkan data pribadi anak. Anak di bawah 17 tahun sebaiknya meminta izin orang tua sebelum mengisi formulir.

## Perubahan kebijakan

Kebijakan ini dapat berubah sewaktu-waktu. Tanggal pembaruan terakhir selalu tercantum di bagian atas halaman.
"""

DISCLAIMER = """
## Edukasi, bukan nasihat medis

Semua konten di Bahaya Tak Terlihat, baik artikel, video, maupun gambar, disusun untuk edukasi umum tentang keselamatan dan kesehatan. Konten ini tidak menggantikan diagnosis, pengobatan, atau nasihat dari dokter, psikolog, ahli K3, atau tenaga profesional lainnya. Untuk kondisi pribadi, selalu konsultasikan dengan tenaga kesehatan.

## Dalam keadaan darurat

Jangan menunggu membaca artikel. Hubungi nomor darurat 112, ambulans 119, atau pemadam kebakaran 113, atau segera ke IGD terdekat. Untuk dukungan kesehatan jiwa, tersedia layanan Kementerian Kesehatan Healing119.id dan telepon 119 ekstensi 8.

## Akurasi informasi

Kami berusaha memakai sumber yang tepercaya dan terbaru, mencantumkan rujukan, dan menandai informasi yang belum pasti sebagai "diduga". Meski begitu, pedoman dan regulasi bisa berubah. Kalau menemukan kekeliruan, kabari kami agar segera diperbaiki.

## Regulasi dan tempat kerja

Pembahasan regulasi K3 di situs ini bersifat ringkasan. Untuk kepatuhan di tempat kerja, rujuk teks resmi peraturan dan konsultasikan dengan ahli K3 atau instansi terkait.

## Konten bersponsor dan iklan

Situs ini dapat menampilkan iklan dan konten bersponsor. Konten bersponsor selalu diberi label yang jelas. Iklan yang tampil tidak berarti kami merekomendasikan produk tersebut.

## Tautan luar

Kami tidak bertanggung jawab atas isi situs lain yang ditautkan dari halaman kami.
"""

# ----------------------------------------------------------------- utilitas berkas


def write(rel_path: str, content: str):
    p = OUT / rel_path
    p.parent.mkdir(parents=True, exist_ok=True)
    p.write_text(content, encoding="utf-8")


def main():
    arts = sorted((parse_article(p) for p in (ROOT / "articles").glob("*.md")), key=lambda a: a["date"], reverse=True)
    if OUT.exists():
        for child in OUT.iterdir():
            if child.name == "assets" and (child / "og.png").exists():
                og = (child / "og.png").read_bytes()
                shutil.rmtree(child); child.mkdir(); (child / "og.png").write_bytes(og)
            elif child.is_dir():
                shutil.rmtree(child)
            else:
                child.unlink()
    OUT.mkdir(exist_ok=True)
    (OUT / "assets").mkdir(exist_ok=True)
    if MEDIA.exists():
        shutil.copytree(MEDIA, OUT / "media")
    for f in ("style.css", "main.js"):
        shutil.copy(ROOT / "assets" / f, OUT / "assets" / f)
    (OUT / "assets" / "favicon.svg").write_text(halus_svg("lpg"), encoding="utf-8")

    write("index.html", build_home(arts))
    write("artikel/index.html", build_index(arts))
    for a in arts:
        write(f"artikel/{a['slug']}.html", build_article(a, arts))
    write("tentang.html", build_about())
    write("video.html", build_videos(arts))
    write("kolaborasi.html", build_collab())
    write("kebijakan-privasi.html", text_page("kebijakan-privasi.html", "Kebijakan privasi", "Kebijakan privasi Bahaya Tak Terlihat: data yang dikumpulkan, kuki, iklan pihak ketiga, dan hak Anda.", "Bagaimana kami memperlakukan data Anda di situs ini.", PRIVACY))
    write("disclaimer.html", text_page("disclaimer.html", "Disclaimer", "Disclaimer Bahaya Tak Terlihat: konten edukasi umum, bukan pengganti nasihat medis atau profesional.", "Hal-hal yang perlu Anda ketahui sebelum memakai informasi di situs ini.", DISCLAIMER))
    write("404.html", page("404.html", "Halaman tidak ditemukan", "Halaman tidak ditemukan.", "",
          f'<div class="wrap"><div class="page-head" style="display:grid;gap:16px;justify-items:start">{halus_svg("co2", size=160)}<h1>Halaman ini menghilang</h1><p>Sepertinya ada Si Halus yang menyembunyikannya. Coba kembali ke beranda atau buka daftar artikel.</p><div class="btn-row"><a class="btn btn-primary" href="/">Ke beranda</a><a class="btn" href="/artikel/">Lihat artikel</a></div></div></div>', noindex=True)
          .replace('href="assets/', 'href="/assets/').replace('src="assets/', 'src="/assets/')
          .replace('href="artikel/', 'href="/artikel/').replace('href="tentang', 'href="/tentang').replace('href="kolaborasi', 'href="/kolaborasi')
          .replace('href="kebijakan', 'href="/kebijakan').replace('href="disclaimer', 'href="/disclaimer').replace('href="./"', 'href="/"'))

    # artefak pratinjau: beranda tanpa kerangka <html> (dibungkus otomatis saat publikasi)
    write("_preview_index.html", build_home(arts, full=False))

    urls = ["", "artikel/", "video.html", "tentang.html", "kolaborasi.html", "kebijakan-privasi.html", "disclaimer.html"] + [f"artikel/{a['slug']}.html" for a in arts]
    today = date.today().isoformat()
    sm = "".join(f"<url><loc>{SITE['url']}/{u}</loc><lastmod>{today}</lastmod></url>" for u in urls)
    write("sitemap.xml", f'<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">{sm}</urlset>\n')
    write("robots.txt", f"User-agent: *\nAllow: /\nDisallow: /_preview_index.html\n\nSitemap: {SITE['url']}/sitemap.xml\n")
    write("ads.txt", "# Isi baris dari Google AdSense setelah akun disetujui, contoh:\n# google.com, pub-XXXXXXXXXXXXXXXX, DIRECT, f08c47fec0942fa0\n")
    print(f"Selesai: {len(arts)} artikel → {OUT}")


if __name__ == "__main__":
    main()
