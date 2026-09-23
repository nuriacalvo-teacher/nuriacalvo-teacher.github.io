/* ==========================================================================
   tema/tema.js · «Around the English-speaking world»
   Añade la capa decorativa del portal SIN tocar el contenido: horizonte con
   paralaje (Londres · Nueva York · Toronto · Sídney), autobús de dos pisos,
   taxi amarillo, canguro, avioneta con pancarta, saludos flotantes, hojas de
   arce, iconos de fondo, barra de progreso, música y efectos.
   Todo va envuelto en try/catch: si algo fallase, el portal sigue igual.
   ========================================================================== */
(function () {
  "use strict";
  try {
    var doc = document, root = doc.documentElement;
    var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
    var fine = window.matchMedia && matchMedia("(pointer: fine)").matches;
    var SND = window.Sonido || { sfx: function () {}, setMode: function () {}, setPrefs: function () {} };
    function el(tag, cls, html) { var e = doc.createElement(tag); if (cls) e.className = cls; if (html) e.innerHTML = html; return e; }
    function rnd(a, b) { return a + Math.random() * (b - a); }

    // ------------------------------------------------------------------ horizonte
    // Tres capas SVG (lejana, media y cercana) sobre un suelo común (y = 260).
    var FAR = '<svg viewBox="0 0 1600 260" preserveAspectRatio="xMidYMax slice" aria-hidden="true">' +
      // bloques de ciudad de fondo
      '<path class="f" d="M0 260V190h40v-30h36v50h30v-70h44v90h26v-40h30v40h40v-60h30v60h420v-50h28v-40h34v90h40v-110h36v110h30v-60h44v60h250v-70h30v-30h40v100h36v-60h30v60h210v-80h40v80h36v-50h40v50h24V260Z"/>' +
      // London Eye (gira)
      '<g transform="translate(300 140)"><g class="tm-eye"><circle class="s" r="84" stroke-width="5"/><circle class="s" r="76" stroke-width="1.5"/>' +
      '<path class="s" stroke-width="1.5" d="M-84 0H84M0-84V84M-59-59L59 59M-59 59L59-59M-78-32L78 32M-78 32L78-32M-32-78L32 78M-32 78L32-78"/>' +
      '<g class="f"><circle cx="0" cy="-84" r="5"/><circle cx="84" cy="0" r="5"/><circle cx="0" cy="84" r="5"/><circle cx="-84" cy="0" r="5"/><circle cx="59" cy="59" r="5"/><circle cx="-59" cy="-59" r="5"/><circle cx="59" cy="-59" r="5"/><circle cx="-59" cy="59" r="5"/></g></g>' +
      '<path class="s" stroke-width="6" d="M0 0L-38 120M0 0L38 120"/></g>' +
      // Sydney Harbour Bridge
      '<path class="s" stroke-width="9" d="M1262 250Q1405 120 1548 250"/><path class="s" stroke-width="3" d="M1262 250Q1405 150 1548 250"/>' +
      '<path class="f" d="M1236 212h338v7H1236zM1236 196h28v64h-28zM1546 196h28v64h-28z"/>' +
      '<path class="s" stroke-width="2" d="M1300 219V200M1340 219V172M1380 219V158M1420 219V156M1460 219V166M1500 219V186"/></svg>';

    var MID = '<svg viewBox="0 0 1600 260" preserveAspectRatio="xMidYMax slice" aria-hidden="true">' +
      // Big Ben + Parlamento
      '<path class="f" d="M140 260V120h-6V70h48v50h-6v140ZM134 70L158 18L182 70ZM156 18h4V0h-4Z"/>' +
      '<circle class="tm-clock" cx="158" cy="95" r="13"/>' +
      '<line class="tm-hand m" x1="158" y1="95" x2="158" y2="85" style="transform-origin:158px 95px"/>' +
      '<line class="tm-hand h" x1="158" y1="95" x2="165" y2="95" style="transform-origin:158px 95px"/>' +
      '<path class="f" d="M176 260V188h128v72ZM180 188l6-16 6 16M200 188l6-16 6 16M220 188l6-16 6 16M240 188l6-16 6 16M260 188l6-16 6 16M280 188l6-16 6 16"/>' +
      '<rect class="tm-window" x="196" y="205" width="8" height="12" style="animation-delay:-2s"/><rect class="tm-window" x="252" y="212" width="8" height="12" style="animation-delay:-5s"/>' +
      // Tower Bridge
      '<path class="f" d="M442 260V122h30v138ZM438 122l19-38 19 38ZM552 260V122h30v138ZM548 122l19-38 19 38ZM472 132h80v10h-80ZM384 204h256v9H384Z"/>' +
      '<path class="s" stroke-width="3" d="M384 204Q414 150 442 132M582 132Q610 150 640 204"/>' +
      // Empire State y Chrysler
      '<path class="f" d="M790 260V110h60v150ZM800 110V80h40v30ZM810 80V55h20v25ZM816 55V35h8v20ZM819 35V4h2v31Z"/>' +
      '<rect class="tm-window" x="804" y="140" width="6" height="9"/><rect class="tm-window" x="830" y="180" width="6" height="9" style="animation-delay:-3s"/>' +
      '<path class="f" d="M886 260V120h50v140ZM890 120Q911 64 932 120ZM898 104Q911 76 924 104ZM910 78h2V40h-2Z"/>' +
      // rascacielos
      '<path class="f" d="M700 260V120h58v140ZM950 260V96h44v164ZM1004 260V140h40v120ZM1170 260V150h40v110Z"/>' +
      '<rect class="tm-window" x="712" y="150" width="6" height="9" style="animation-delay:-1s"/><rect class="tm-window" x="962" y="130" width="6" height="9" style="animation-delay:-4s"/>' +
      // CN Tower (Toronto)
      '<path class="f" d="M1093 260L1097 92h6l4 168ZM1086 105a14 8 0 1 0 28 0a14 8 0 1 0-28 0ZM1094 70a6 4 0 1 0 12 0a6 4 0 1 0-12 0ZM1099 70V8h2v62Z"/>' +
      // Ópera de Sídney
      '<path class="f" d="M1318 238h178v12H1318ZM1330 240Q1356 150 1402 240ZM1372 240Q1404 124 1452 240ZM1424 240Q1452 168 1486 240Z"/></svg>';

    var NEAR = '<svg viewBox="0 0 1600 160" preserveAspectRatio="xMidYMax slice" aria-hidden="true">' +
      // colinas y árboles
      '<path class="f" d="M0 160V120Q120 96 240 118T480 112T720 124T960 110T1200 122T1440 108T1600 118V160Z"/>' +
      '<g class="f"><circle cx="60" cy="104" r="16"/><rect x="58" y="104" width="4" height="18"/><circle cx="96" cy="110" r="12"/><circle cx="410" cy="100" r="15"/><circle cx="436" cy="106" r="11"/>' +
      '<circle cx="1010" cy="98" r="14"/><circle cx="1036" cy="104" r="10"/><circle cx="1500" cy="96" r="15"/><circle cx="1528" cy="104" r="11"/></g>' +
      // cabina roja de Londres
      '<path class="f" d="M180 124V80h22v44ZM178 80q13-10 26 0Z"/>' +
      // Estatua de la Libertad
      '<path class="f" d="M630 124V96h40v28ZM622 124h56v6h-56ZM638 96L644 52h12l6 44ZM650 50m-6 0a6 6 0 1 0 12 0a6 6 0 1 0-12 0ZM654 56l8-32h4l-4 32ZM640 58l-6 12h6ZM642 44l-3-6 5 4M650 40v-7M658 44l3-6-5 4"/>' +
      '<ellipse class="tm-flame" cx="664" cy="17" rx="4" ry="7"/></svg>';

    function scene(hero) {
      var sc = el("div", "tm-scene no-print");
      sc.setAttribute("aria-hidden", "true");
      var sky = el("div", "tm-sky");
      var nStars = window.innerWidth < 700 ? 30 : 70;
      for (var i = 0; i < nStars; i++) {
        var s = el("i", "tm-star");
        s.style.left = rnd(0, 100) + "%"; s.style.top = rnd(0, 55) + "%";
        s.style.animationDelay = -rnd(0, 4) + "s";
        sky.appendChild(s);
      }
      [[12, 180, 70], [26, 130, 95], [40, 220, 120]].forEach(function (c) {
        var cl = el("i", "tm-cloud");
        cl.style.top = c[0] + "%"; cl.style.width = c[1] + "px";
        cl.style.animationDuration = c[2] + "s"; cl.style.animationDelay = -rnd(0, c[2]) + "s";
        sky.appendChild(cl);
      });
      sc.appendChild(sky);
      var far = el("div", "tm-layer tm-far", FAR); far.setAttribute("data-tm-speed", "0.06"); far.setAttribute("data-tm-depth", "8");
      var mid = el("div", "tm-layer tm-mid", MID); mid.setAttribute("data-tm-speed", "0.12"); mid.setAttribute("data-tm-depth", "16");
      var near = el("div", "tm-layer tm-near", NEAR); near.setAttribute("data-tm-speed", "0.2"); near.setAttribute("data-tm-depth", "26");
      sc.appendChild(far); sc.appendChild(mid); sc.appendChild(near);
      sc.appendChild(el("div", "tm-water"));
      if (!reduce) {
        sc.appendChild(el("div", "tm-mover tm-bus",
          '<svg viewBox="0 0 86 52"><rect x="2" y="4" width="80" height="40" rx="7" fill="#f43f5e"/><rect x="2" y="22" width="80" height="3" fill="#be123c"/>' +
          '<g fill="#e0e7ff" opacity=".85"><rect x="8" y="9" width="11" height="9" rx="2"/><rect x="23" y="9" width="11" height="9" rx="2"/><rect x="38" y="9" width="11" height="9" rx="2"/><rect x="53" y="9" width="11" height="9" rx="2"/><rect x="68" y="9" width="10" height="9" rx="2"/>' +
          '<rect x="8" y="28" width="11" height="9" rx="2"/><rect x="23" y="28" width="11" height="9" rx="2"/><rect x="38" y="28" width="11" height="9" rx="2"/><rect x="68" y="28" width="10" height="12" rx="2"/></g>' +
          '<circle cx="18" cy="45" r="6" fill="#1e1b4b"/><circle cx="66" cy="45" r="6" fill="#1e1b4b"/><circle cx="18" cy="45" r="2.4" fill="#a5b4fc"/><circle cx="66" cy="45" r="2.4" fill="#a5b4fc"/></svg>'));
        sc.appendChild(el("div", "tm-mover tm-taxi",
          '<svg viewBox="0 0 58 30"><path d="M4 18q0-6 6-6h6l6-8h16l7 8h5q4 0 4 5v7H4Z" fill="#f59e0b"/><rect x="22" y="1" width="12" height="4" rx="1" fill="#fcd34d"/>' +
          '<path d="M24 6h12l5 6H20Z" fill="#e0e7ff" opacity=".8"/><path d="M4 20h50" stroke="#1e1b4b" stroke-dasharray="3 3" stroke-width="1.5"/>' +
          '<circle cx="15" cy="25" r="4.5" fill="#1e1b4b"/><circle cx="45" cy="25" r="4.5" fill="#1e1b4b"/></svg>'));
        sc.appendChild(el("div", "tm-mover tm-roo",
          '<svg viewBox="0 0 46 44"><path d="M30 8q4-6 8-2l-2 5q4 2 3 6l-5 1q-2 8-8 12l6 10h-6l-6-7q-8 3-14 1l-4 3q-4 0-1-3l6-5q-4-6 2-12q6-6 16-4Z" fill="#c084fc"/>' +
          '<circle cx="35" cy="12" r="1.3" fill="#1e1b4b"/><path d="M31 6l2-6 3 5" fill="#c084fc"/></svg>'));
        var plane = el("div", "tm-plane",
          '<svg viewBox="0 0 58 26"><path d="M4 13q0-4 6-4h30l10-8h4l-5 8q7 1 7 4t-7 4l5 8h-4l-10-8H10q-6 0-6-4Z" fill="#e0e7ff"/><path d="M22 9l-6-8h5l10 8ZM22 17l-6 8h5l10-8Z" fill="#a5b4fc"/><circle cx="14" cy="13" r="1.4" fill="#6366f1"/><circle cx="20" cy="13" r="1.4" fill="#6366f1"/></svg>' +
          '<span class="tm-rope"></span><span class="tm-banner">Hello! · G\'day! · Howdy! · Hiya! · Welcome!</span>');
        sc.appendChild(plane);
      }
      hero.insertBefore(sc, hero.firstChild);
      return sc;
    }

    // ------------------------------------------------------------------ saludos flotantes
    var HELLOS = [
      ["Hello!", "UK"], ["Hiya!", "UK"], ["Cheers!", "UK"], ["Lovely!", "UK"], ["G'day, mate!", "Australia"], ["No worries!", "Australia"],
      ["Howdy!", "USA"], ["What's up?", "USA"], ["Awesome!", "USA"], ["How's it going?", "Canada"], ["Top of the morning!", "Ireland"],
      ["Kia ora!", "New Zealand"], ["Nice to meet you!", "Everywhere"], ["Well done!", "Everywhere"], ["Keep going!", "Everywhere"]
    ];
    function hellos(sc) {
      if (reduce) return;
      function one() {
        if (document.hidden || !sc.isConnected) return;
        var r = sc.getBoundingClientRect();
        if (r.bottom < 0 || r.top > window.innerHeight) return;
        var h = HELLOS[Math.floor(Math.random() * HELLOS.length)];
        var b = el("span", "tm-hello");
        b.textContent = h[0];
        var small = el("small"); small.textContent = h[1]; b.appendChild(small);
        // En el cielo del horizonte, por debajo del texto: nunca tapa nada.
        var content = sc.parentNode.querySelector(".hero-grid");
        var minTop = content ? (content.offsetTop + content.offsetHeight + 12) : r.height * 0.7;
        var maxTop = r.height - 150;
        if (maxTop < minTop) maxTop = minTop;
        b.style.left = rnd(3, window.innerWidth < 700 ? 60 : 84) + "%";
        b.style.top = rnd(minTop, maxTop) + "px";
        sc.appendChild(b);
        setTimeout(function () { b.remove(); }, 7200);
      }
      setTimeout(one, 1200);
      setInterval(one, 3200);
    }

    // ------------------------------------------------------------------ fondo de la página
    var ICONS = [
      // Big Ben
      '<path d="M40 88V34h20v54M36 34h28M40 34l10-22 10 22M50 12V4"/><circle cx="50" cy="44" r="6"/><path d="M50 44v-3M50 44h3"/>',
      // cabina telefónica
      '<rect x="32" y="24" width="36" height="64" rx="3"/><path d="M28 24q22-18 44 0M38 34h24v26H38zM50 34v26M38 47h24"/>',
      // Estatua de la Libertad
      '<path d="M40 90h20M44 90l4-50h8l4 50M52 40a6 6 0 1 0 0-12a6 6 0 1 0 0 12M58 30l8-22M64 6q2-4 4 0q-2 4-4 0"/>',
      // Ópera de Sídney
      '<path d="M14 80h72M18 80q10-40 34 0M38 80q14-52 38 0M62 80q10-28 22 0"/>',
      // hoja de arce
      '<path d="M50 88V60M50 60l-8 6 2-10-12-2 8-8-8-10 12 2 4-12 4 8 4-8 4 12 12-2-8 10 8 8-12 2 2 10Z"/>',
      // taza de té
      '<path d="M24 46h44v14q0 20-22 20T24 60ZM68 50q12 0 10 10t-12 6M20 86h56M40 38q-4-6 0-12M50 38q-4-6 0-12"/>',
      // canguro (señal)
      '<path d="M50 6l40 44-40 44-40-44Z"/><path d="M58 34q4-4 6 0l-2 4q-2 8-8 10l4 10h-4l-4-6q-6 2-10 0l-6 6q-3 0 0-3l4-5q-2-6 4-10q6-4 16-6Z"/>',
      // guitarra (country / folk)
      '<path d="M66 10l10 10M71 15L48 38M44 36q-18-4-22 10q-4 14 10 22t22-6q6-12-6-18"/><circle cx="36" cy="54" r="5"/>'
    ];
    var bgIcons = [];
    function background() {
      var bg = el("div", "tm-bg no-print");
      bg.setAttribute("aria-hidden", "true");
      var n = window.innerWidth < 700 ? 5 : 8;
      for (var i = 0; i < n; i++) {
        var ic = el("div", "tm-icon", '<svg viewBox="0 0 100 100">' + ICONS[i % ICONS.length] + "</svg>");
        var left = (i % 2 ? rnd(78, 94) : rnd(1, 12));
        ic.style.left = left + "%";
        var sz = rnd(70, 120); ic.style.width = ic.style.height = sz + "px";
        ic.style.transform = "rotate(" + rnd(-14, 14) + "deg)";
        bgIcons.push({ el: ic, y: i * 42 + rnd(0, 20), speed: rnd(0.15, 0.35), rot: rnd(-14, 14) });
        bg.appendChild(ic);
      }
      if (!reduce) {
        var LEAF = '<svg viewBox="0 0 24 24"><path fill="COLOR" d="M12 22v-5l-4 1 1-3-5-3 2-1-2-4 4 1 1-3 3 3v-6l2 3 2-3v6l3-3 1 3 4-1-2 4 2 1-5 3 1 3-4-1v5Z"/></svg>';
        var STAR = '<svg viewBox="0 0 24 24"><path fill="COLOR" d="M12 2l3 7h7l-5.5 4.5 2 7.5L12 16.5 5.5 21l2-7.5L2 9h7Z"/></svg>';
        var COLORS = ["#f472b6", "#fbbf24", "#818cf8", "#c084fc", "#fb7185"];
        var nl = window.innerWidth < 700 ? 6 : 12;
        for (var k = 0; k < nl; k++) {
          var lf = el("i", "tm-leaf", (k % 3 === 2 ? STAR : LEAF).replace("COLOR", COLORS[k % COLORS.length]));
          lf.style.left = rnd(0, 100) + "%";
          lf.style.animationDuration = rnd(18, 34) + "s";
          lf.style.animationDelay = -rnd(0, 34) + "s";
          lf.style.setProperty("--dx", rnd(-60, 140) + "px");
          lf.style.setProperty("--rot", rnd(200, 620) + "deg");
          var z = rnd(12, 22); lf.style.width = lf.style.height = z + "px";
          bg.appendChild(lf);
        }
      }
      doc.body.insertBefore(bg, doc.body.firstChild);
    }

    // ------------------------------------------------------------------ paralaje
    var layers = [], mx = 0, tx = 0, bar;
    function frame() {
      var y = window.scrollY, vh = window.innerHeight;
      tx += (mx - tx) * 0.05;
      if (y < vh * 1.4) layers.forEach(function (l) {
        var sp = +l.getAttribute("data-tm-speed"), d = +l.getAttribute("data-tm-depth");
        l.style.transform = "translate3d(" + (-tx * d).toFixed(1) + "px," + (y * sp).toFixed(1) + "px,0)";
      });
      var span = vh + 260;
      bgIcons.forEach(function (ic) {
        var top = (((ic.y / 100) * span - y * ic.speed) % span + span) % span - 130;
        ic.el.style.transform = "translate3d(0," + top.toFixed(1) + "px,0) rotate(" + ic.rot.toFixed(1) + "deg)";
      });
      var h = root.scrollHeight - vh;
      if (bar) bar.style.width = (h > 0 ? Math.min(100, y / h * 100) : 0) + "%";
      requestAnimationFrame(frame);
    }

    // ------------------------------------------------------------------ música y efectos
    var KEY = "nc-portal-musica";
    var prefs = { music: true };
    try { prefs = Object.assign(prefs, JSON.parse(localStorage.getItem(KEY) || "{}")); } catch (e) { /* nada */ }
    function musicButton() {
      var actions = doc.querySelector(".header-actions");
      if (!actions) return;
      var b = el("button", "icon-btn tm-music");
      b.type = "button";
      b.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 18V5l11-2v13" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><circle cx="6.5" cy="18" r="2.5" fill="currentColor"/><circle cx="17.5" cy="16" r="2.5" fill="currentColor"/><path class="tm-slash" d="M3 3l18 18" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>';
      function paint() {
        b.classList.toggle("tm-off", !prefs.music);
        b.title = prefs.music ? "Quitar la música de fondo" : "Poner música de fondo";
        b.setAttribute("aria-label", b.title);
        b.setAttribute("aria-pressed", prefs.music ? "true" : "false");
      }
      b.addEventListener("click", function () {
        prefs.music = !prefs.music;
        try { localStorage.setItem(KEY, JSON.stringify(prefs)); } catch (e) { /* nada */ }
        SND.setPrefs({ music: prefs.music, sfx: true, musicVol: 0.5 });
        paint();
      });
      paint();
      actions.insertBefore(b, actions.firstChild);
    }
    SND.setMode("menu");
    SND.setPrefs({ music: prefs.music, sfx: true, musicVol: 0.5 });

    // Sonidos: al abrir una app, al cambiar de tema y (suave) al pasar por las tarjetas.
    doc.addEventListener("click", function (e) {
      var t = e.target;
      if (!t || !t.closest) return;
      if (t.closest("#themeBtn")) { SND.sfx("tema"); return; }
      var a = t.closest("a[href]");
      if (a && a.target === "_blank" && a.closest(".card, .modal")) SND.sfx("abrir");
    }, true);
    var lastHover = 0;
    doc.addEventListener("mouseover", function (e) {
      if (!fine || !e.target || !e.target.closest) return;
      var c = e.target.closest(".card");
      if (!c || (e.relatedTarget && c.contains(e.relatedTarget))) return;
      var now = Date.now();
      if (now - lastHover > 700) { lastHover = now; SND.sfx("hover"); }
    });

    // ------------------------------------------------------------------ arranque
    function start() {
      var hero = doc.querySelector("section.hero");
      if (hero) {
        var sc = scene(hero);
        layers = Array.prototype.slice.call(sc.querySelectorAll("[data-tm-speed]"));
        hellos(sc);
      }
      background();
      bar = el("div", "tm-progress no-print"); bar.setAttribute("aria-hidden", "true");
      doc.body.appendChild(bar);
      musicButton();
      if (!reduce) {
        if (fine) window.addEventListener("mousemove", function (e) { mx = e.clientX / window.innerWidth - 0.5; }, { passive: true });
        requestAnimationFrame(frame);
      } else {
        window.addEventListener("scroll", function () {
          var h = root.scrollHeight - window.innerHeight;
          bar.style.width = (h > 0 ? window.scrollY / h * 100 : 0) + "%";
        }, { passive: true });
        bgIcons.forEach(function (ic) { ic.el.style.top = ic.y + "%"; });
      }
    }
    if (doc.readyState === "loading") doc.addEventListener("DOMContentLoaded", start); else start();
  } catch (err) {
    // La decoración nunca debe romper el portal.
    if (window.console) console.warn("tema decorativo desactivado:", err);
  }
})();
