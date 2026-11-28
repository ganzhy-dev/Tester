"""Si Halus versi statis (SVG) untuk situs web.

Diadaptasi dari komponen Remotion `SiHalus` di bahaya-tak-terlihat/src/Characters.tsx:
bentuk badan, palet per varian, dan garis tepi tebal tetap sama, tetapi wajahnya
dibuat ramah (mata besar, senyum, pipi merona) sesuai nada "tenang, gampang kok dikalahin".
"""

INK = "#1F1630"
WHITE = "#FFFFFF"

PAL = {
    "lpg": ("#FF9E6B", "#E8663D"),
    "bottle": ("#BFE8DA", "#7CC2AE"),
    "steam": ("#FF9DB0", "#E0566F"),
    "salad": ("#79D173", "#2E8B3E"),
    "finish": ("#FF8A6A", "#D9381F"),
    "powerbank": ("#FFB547", "#DB6414"),
    "noise": ("#FF7FA8", "#D93370"),
    "stress": ("#B9A6FF", "#8E76F0"),
    "slip": ("#9BE8F7", "#4FC3E0"),
    "volt": ("#FFE14D", "#F2B705"),
    "co2": ("#C9BCFF", "#8E76F0"),
}

S = f'stroke="{INK}" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"'


def _body_path() -> str:
    d = "M40 175 Q40 30 150 30 Q260 30 260 175 L260 290"
    bumps = 5
    for i in range(bumps):
        x0 = 260 - (220 / bumps) * i
        x1 = 260 - (220 / bumps) * (i + 1)
        amp = 26 if i % 2 == 0 else -26
        d += f" Q{(x0 + x1) / 2:.0f} {290 + amp} {x1:.0f} 290"
    return d + " Z"


BODY = _body_path()


def _prop(v: str, c2: str) -> str:
    """Aksesori kecil supaya tiap Si Halus mudah dibedakan."""
    if v == "lpg":  # kepulan gas
        return (
            f'<g opacity="0.85"><circle cx="292" cy="70" r="18" fill="#E7DED3" {S} stroke-width="5"/>'
            f'<circle cx="318" cy="40" r="12" fill="#E7DED3" {S} stroke-width="5"/>'
            f'<circle cx="336" cy="14" r="7" fill="#E7DED3" {S} stroke-width="4"/></g>'
        )
    if v == "bottle":  # tutup botol jadi topi
        return f'<rect x="118" y="2" width="64" height="34" rx="8" fill="#5AA2E0" {S} stroke-width="6"/><path d="M128 12 v16 M142 12 v16 M156 12 v16 M170 12 v16" stroke="{INK}" stroke-width="4"/>'
    if v == "steam":  # uap panas
        return "".join(
            f'<path d="M{x} 6 q10 -12 0 -24 q-10 -12 0 -24" fill="none" stroke="{c2}" stroke-width="9" stroke-linecap="round"/>'
            for x in (100, 150, 200)
        )
    if v == "salad":  # daun di kepala
        return f'<path d="M150 34 Q120 -10 160 -30 Q190 0 150 34 Z" fill="#B8F07A" {S} stroke-width="6"/><path d="M150 30 Q155 0 160 -24" fill="none" stroke="{INK}" stroke-width="4"/>'
    if v == "finish":  # ikat kepala pelari
        return f'<path d="M52 104 Q150 74 248 104 L246 126 Q150 98 54 126 Z" fill="{WHITE}" {S} stroke-width="6"/><path d="M246 112 l34 -14 l-8 26 Z" fill="{WHITE}" {S} stroke-width="5"/>'
    if v == "powerbank":  # petir di perut
        return f'<path d="M160 228 L136 262 L154 262 L144 292 L176 252 L158 252 L170 228 Z" fill="#FFF3B0" {S} stroke-width="5"/>'
    if v == "noise":  # mahkota zig-zag
        return f'<path d="M95 48 L110 8 L135 42 L150 0 L165 42 L190 8 L205 48" fill="{c2}" {S}/>'
    if v == "stress":  # tetes keringat
        return f'<path d="M244 76 Q262 104 252 116 Q238 126 232 110 Q230 96 244 76 Z" fill="#CFF3FF" {S} stroke-width="5"/>'
    if v == "slip":
        return f'<ellipse cx="150" cy="318" rx="150" ry="24" fill="#4FC3E0" opacity="0.45"/>'
    if v == "volt":
        return f'<path d="M286 60 L266 100 L284 100 L270 140 L306 92 L288 92 L300 60 Z" fill="#FFF3B0" {S} stroke-width="5"/>'
    return ""


def halus_svg(variant: str = "lpg", label: str = "", cls: str = "halus", size: int | None = None) -> str:
    c1, c2 = PAL.get(variant, PAL["lpg"])
    aria = f'role="img" aria-label="{label}"' if label else 'aria-hidden="true" focusable="false"'
    dims = f' width="{size}" height="{int(size * 400 / 380)}"' if size else ""
    face = (
        # mata ramah
        f'<ellipse cx="110" cy="140" rx="25" ry="29" fill="{WHITE}" {S}/>'
        f'<ellipse cx="190" cy="140" rx="25" ry="29" fill="{WHITE}" {S}/>'
        f'<circle cx="114" cy="146" r="12" fill="{INK}"/><circle cx="194" cy="146" r="12" fill="{INK}"/>'
        f'<circle cx="119" cy="140" r="4" fill="{WHITE}"/><circle cx="199" cy="140" r="4" fill="{WHITE}"/>'
        # pipi merona
        f'<ellipse cx="76" cy="190" rx="18" ry="11" fill="#FF6F91" opacity="0.45"/>'
        f'<ellipse cx="224" cy="190" rx="18" ry="11" fill="#FF6F91" opacity="0.45"/>'
        # senyum
        f'<path d="M112 192 Q150 238 188 192 Z" fill="#5A1030" {S}/>'
        f'<path d="M134 212 Q150 226 166 212 Q150 204 134 212 Z" fill="#FF8FA3"/>'
    )
    return (
        f'<svg class="{cls}" viewBox="-40 -40 400 400"{dims} {aria} xmlns="http://www.w3.org/2000/svg">'
        f'<ellipse cx="150" cy="335" rx="110" ry="14" fill="{INK}" opacity="0.12"/>'
        f'<path d="{BODY}" fill="{c1}" {S}/>'
        f'<path d="M70 120 Q76 70 120 56" fill="none" stroke="{WHITE}" stroke-width="10" stroke-linecap="round" opacity="0.55"/>'
        f"{face}{_prop(variant, c2)}</svg>"
    )
