/* Bahaya Tak Terlihat — skrip ringan (tema, ukuran huruf, bagikan, formulir). */
(function () {
  var root = document.documentElement;
  function get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function set(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }

  // Tema terang/gelap
  var themeBtn = document.getElementById("theme-toggle");
  function currentDark() {
    var t = root.getAttribute("data-theme");
    if (t) return t === "dark";
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  }
  function syncThemeLabel() {
    if (!themeBtn) return;
    var dark = currentDark();
    themeBtn.setAttribute("aria-pressed", dark ? "true" : "false");
    themeBtn.setAttribute("aria-label", dark ? "Ganti ke mode terang" : "Ganti ke mode gelap");
    themeBtn.title = dark ? "Mode terang" : "Mode gelap";
  }
  if (themeBtn) {
    themeBtn.addEventListener("click", function () {
      var next = currentDark() ? "light" : "dark";
      root.setAttribute("data-theme", next);
      set("btt-theme", next);
      syncThemeLabel();
    });
    syncThemeLabel();
  }

  // Ukuran huruf
  var fsBtn = document.getElementById("fs-toggle");
  function syncFs() {
    if (!fsBtn) return;
    var big = root.getAttribute("data-fs") === "lg";
    fsBtn.setAttribute("aria-pressed", big ? "true" : "false");
    fsBtn.title = big ? "Kembalikan ukuran huruf" : "Perbesar huruf";
  }
  if (fsBtn) {
    fsBtn.addEventListener("click", function () {
      var big = root.getAttribute("data-fs") === "lg";
      if (big) { root.removeAttribute("data-fs"); set("btt-fs", "normal"); }
      else { root.setAttribute("data-fs", "lg"); set("btt-fs", "lg"); }
      syncFs();
    });
    syncFs();
  }

  // Tautan bagikan memakai alamat halaman yang sedang dibuka
  var url = location.href.split("#")[0];
  if (!/^https?:/.test(url)) url = document.querySelector('link[rel="canonical"]') ? document.querySelector('link[rel="canonical"]').href : url;
  var title = document.title;
  document.querySelectorAll("[data-share]").forEach(function (a) {
    var kind = a.getAttribute("data-share");
    if (kind === "wa") a.href = "https://wa.me/?text=" + encodeURIComponent(title + " " + url);
    if (kind === "fb") a.href = "https://www.facebook.com/sharer/sharer.php?u=" + encodeURIComponent(url);
  });

  function flash(el, text) {
    var old = el.getAttribute("data-label") || el.textContent;
    el.setAttribute("data-label", old);
    el.textContent = text;
    setTimeout(function () { el.textContent = old; }, 2200);
  }
  function copyText(text, btn, okMsg) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () { flash(btn, okMsg); }, function () { fallback(); });
    } else { fallback(); }
    function fallback() {
      var ta = document.createElement("textarea");
      ta.value = text; document.body.appendChild(ta); ta.select();
      var ok = false; try { ok = document.execCommand("copy"); } catch (e) {}
      document.body.removeChild(ta);
      flash(btn, ok ? okMsg : "Salin manual, ya");
    }
  }
  document.querySelectorAll("[data-copy-link]").forEach(function (b) {
    b.addEventListener("click", function () { copyText(url, b, "Tautan tersalin"); });
  });
  document.querySelectorAll("[data-copy-save]").forEach(function (b) {
    b.addEventListener("click", function () {
      var box = document.getElementById(b.getAttribute("data-copy-save"));
      if (!box) return;
      var items = Array.prototype.map.call(box.querySelectorAll("li"), function (li, i) { return (i + 1) + ". " + li.textContent.trim(); });
      copyText(box.querySelector("h2").textContent.replace("Simpan ini", "").trim() + "\n" + items.join("\n") + "\n\nSelengkapnya: " + url, b, "Ringkasan tersalin");
    });
  });
  document.querySelectorAll("[data-copy-text]").forEach(function (b) {
    b.addEventListener("click", function () { copyText(b.getAttribute("data-copy-text"), b, "Tersalin"); });
  });

  // Satu video diputar pada satu waktu
  var vids = document.querySelectorAll("video");
  vids.forEach(function (v) {
    v.addEventListener("play", function () { vids.forEach(function (o) { if (o !== v) o.pause(); }); });
  });

  // Formulir pratinjau (belum tersambung ke layanan apa pun)
  document.querySelectorAll("form[data-demo]").forEach(function (f) {
    f.addEventListener("submit", function (e) {
      e.preventDefault();
      var s = f.querySelector(".form-status");
      if (s) { s.hidden = false; s.textContent = f.getAttribute("data-demo"); s.focus(); }
    });
  });
})();
