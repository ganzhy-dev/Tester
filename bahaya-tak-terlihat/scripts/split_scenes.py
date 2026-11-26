"""Pindahkan isi EpN ke komponen EpNScenes agar waktunya ikut ter-warp."""
import re, sys
n = sys.argv[1]
p = f"src/ep/Ep{n}.tsx"
s = open(p).read()
if f"Ep{n}Scenes" in s:
    print("already split"); sys.exit()
head = f"export const Ep{n}: React.FC = () => {{"
assert s.count(head) == 1
s = s.replace(head, f"const Ep{n}Scenes: React.FC = () => {{")
m = re.search(r"<Episode [^>]*>", s)
open_tag = m.group(0)
s = s.replace(open_tag, "<>", 1)
assert s.count("</Episode>") == 1
s = s.replace("</Episode>", "</>")
s += f"\nexport const Ep{n}: React.FC = () => (\n  {open_tag}\n    <Ep{n}Scenes />\n  </Episode>\n);\n"
open(p, "w").write(s)
print("split ok:", open_tag[:80])
