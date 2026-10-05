/* ==========================================================================
   tema/tema.js · «Around the English-speaking world»
   Añade la capa decorativa del portal SIN tocar el contenido: horizonte con
   paralaje (Londres · Dublín · Nueva York · Toronto · Sídney), avioneta con
   pancarta, globo, sol o luna, nubes, saludos flotantes, barra de progreso,
   música y efectos.
   Además pinta la ESTACIÓN que elige la profesora en su panel (primavera,
   verano, otoño o invierno): colores del paisaje, hojas, lluvia, viento,
   nieve que va cubriendo el suelo y los edificios, flores, arcoíris…
   La estación llega en el atributo data-season de <html>.
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

    // Florecillas para la primavera: puntitos de colores sobre la hierba
    // (solo se ven en primavera; el resto del año están ocultas).
    function flores(n, x0, x1, y0, y1, r) {
      var C = ["#f472b6", "#fde047", "#ffffff", "#c084fc", "#fb7185", "#facc15"], s = '<g class="tm-flores">';
      for (var i = 0; i < n; i++) {
        s += '<circle cx="' + rnd(x0, x1).toFixed(0) + '" cy="' + rnd(y0, y1).toFixed(1) + '" r="' + (r * rnd(.7, 1.2)).toFixed(1) + '" fill="' + C[i % C.length] + '"/>';
      }
      return s + "</g>";
    }

    // ------------------------------------------------------------------ horizonte
    // Tres capas SVG (lejana, media y cercana) sobre un suelo común (y = 260).
    // Clases: .f edificios · .c colinas · .v/.v2 vegetación · .copa árboles de
    // hoja caduca (en invierno se quedan pelados).
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
      '<path class="c" d="M0 160V120Q120 96 240 118T480 112T720 124T960 110T1200 122T1440 108T1600 118V160Z"/>' +
      '<rect class="f" x="58" y="104" width="4" height="18"/>' +
      '<g class="v copa"><circle cx="60" cy="104" r="16"/><circle cx="410" cy="100" r="15"/><circle cx="1010" cy="98" r="14"/><circle cx="1500" cy="96" r="15"/></g>' +
      '<g class="v2 copa"><circle cx="96" cy="110" r="12"/><circle cx="436" cy="106" r="11"/><circle cx="1036" cy="104" r="10"/><circle cx="1528" cy="104" r="11"/></g>' +
      flores(40, 0, 1600, 124, 150, 2.2) +
      // cabina roja de Londres
      '<path class="f" d="M180 124V80h22v44ZM178 80q13-10 26 0Z"/>' +
      // Irlanda: torre redonda de Glendalough y cruz celta
      '<path class="f" d="M322 124V42h16v82ZM319 42l11-20 11 20ZM328 58h4v7h-4ZM328 84h4v7h-4Z"/>' +
      '<path class="f" d="M357 124V70h7v54ZM349 80h23v6h-23Z"/><circle class="s" cx="360.5" cy="83" r="8" stroke-width="3"/>' +
      // Ha'penny Bridge (Dublín) con sus farolas
      '<path class="s" stroke-width="4" d="M820 124Q890 84 960 124"/><path class="s" stroke-width="1.5" d="M826 121Q890 90 954 121M840 114v-6M860 106v-7M890 102v-8M920 106v-7M940 114v-6"/>' +
      '<g fill="#fbbf24" class="tm-lamp"><circle cx="860" cy="98" r="2.2"/><circle cx="890" cy="93" r="2.2"/><circle cx="920" cy="98" r="2.2"/></g>' +
      // Estatua de la Libertad
      '<path class="f" d="M630 124V96h40v28ZM622 124h56v6h-56ZM638 96L644 52h12l6 44ZM650 50m-6 0a6 6 0 1 0 12 0a6 6 0 1 0-12 0ZM654 56l8-32h4l-4 32ZM640 58l-6 12h6ZM642 44l-3-6 5 4M650 40v-7M658 44l3-6-5 4"/>' +
      '<ellipse class="tm-flame" cx="664" cy="17" rx="4" ry="7"/></svg>';

    var AVION = '<svg viewBox="0 0 58 26"><path d="M4 13q0-4 6-4h30l10-8h4l-5 8q7 1 7 4t-7 4l5 8h-4l-10-8H10q-6 0-6-4Z" fill="#e0e7ff"/><path d="M22 9l-6-8h5l10 8ZM22 17l-6 8h5l10-8Z" fill="#a5b4fc"/><circle cx="14" cy="13" r="1.4" fill="#6366f1"/><circle cx="20" cy="13" r="1.4" fill="#6366f1"/></svg>';

    // Nube: el --d guarda su duración, para que el otoño la acelere con calc()
    function nube(cls, top, w, dur) {
      var cl = el("i", cls);
      cl.style.top = top + "%"; cl.style.width = w + "px";
      cl.style.setProperty("--d", dur + "s"); cl.style.animationDelay = -rnd(0, dur) + "s";
      return cl;
    }

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
      // las tres primeras salen siempre de día; las «tm-mas» solo cuando la
      // estación trae el cielo más cubierto (otoño, invierno, primavera)
      [[12, 180, 70, ""], [26, 130, 95, ""], [40, 220, 120, ""], [6, 160, 84, " tm-mas"], [20, 240, 110, " tm-mas"], [33, 150, 76, " tm-mas"]].forEach(function (c) {
        sky.appendChild(nube("tm-cloud" + c[3], c[0], c[1], c[2]));
      });
      sc.appendChild(sky);
      var far = el("div", "tm-layer tm-far", FAR); far.setAttribute("data-tm-speed", "0.06"); far.setAttribute("data-tm-depth", "8");
      var mid = el("div", "tm-layer tm-mid", MID); mid.setAttribute("data-tm-speed", "0.12"); mid.setAttribute("data-tm-depth", "16");
      var near = el("div", "tm-layer tm-near", NEAR); near.setAttribute("data-tm-speed", "0.2"); near.setAttribute("data-tm-depth", "26");
      sc.appendChild(far); sc.appendChild(mid); sc.appendChild(near);
      sc.appendChild(el("div", "tm-water"));
      if (!reduce) {
        sc.appendChild(el("div", "tm-plane", AVION +
          '<span class="tm-rope"></span><span class="tm-banner">Hello! · Dia duit! · G\'day! · Howdy! · Hiya! · Welcome!</span>'));
      }
      hero.insertBefore(sc, hero.firstChild);
      return sc;
    }

    // ------------------------------------------------------------------ saludos flotantes
    var HELLOS = [
      ["Hello!", "UK"], ["Hiya!", "UK"], ["Cheers!", "UK"], ["Lovely!", "UK"], ["G'day, mate!", "Australia"], ["No worries!", "Australia"],
      ["Howdy!", "USA"], ["What's up?", "USA"], ["Awesome!", "USA"], ["How's it going?", "Canada"], ["Top of the morning!", "Ireland"], ["Dia duit!", "Ireland · Gaeilge"], ["Sláinte!", "Ireland"], ["What's the craic?", "Ireland"],
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
    // ------------------------------------------------------------------ paralaje
    var layers = [], mx = 0, tx = 0, bar;
    function frame() {
      var y = window.scrollY, vh = window.innerHeight;
      tx += (mx - tx) * 0.05;
      if (y < vh * 1.4) layers.forEach(function (l) {
        var sp = +l.getAttribute("data-tm-speed"), d = +l.getAttribute("data-tm-depth");
        l.style.transform = "translate3d(" + (-tx * d).toFixed(1) + "px," + (y * sp).toFixed(1) + "px,0)";
      });
      moverMundo(y, tx);
      var h = root.scrollHeight - vh;
      if (bar) bar.style.width = (h > 0 ? Math.min(100, y / h * 100) : 0) + "%";
      requestAnimationFrame(frame);
    }

    // ------------------------------------------------------------------ el mundo que pasa
    // Franja de paisaje fija al pie de la ventana, en tres capas que viajan a
    // distinta velocidad al bajar por la página.

    // --- capa lejana: montañas, colinas y pinos
    var W_FAR = '<svg viewBox="0 0 1500 300" aria-hidden="true">' +
      '<g opacity=".7"><path class="f" d="M0 300V208l64-72 46 52 38-34 70 86 58-48 86 74 72-62 104 84 78-70 96 82 74-56 86 68 72-44 156 92V300Z"/></g>' +
      '<path class="c" d="M0 300V254q76-34 156-14t166 8 150-28 164 24 152-16 166 22 146 10 160-16 140 12V300Z"/>' +
      '<g class="v" opacity=".8"><path d="M210 254l12-30 12 30zM232 254l10-24 10 24zM700 252l11-28 11 28zM1062 254l12-30 12 30z"/></g>' +
      '</svg>';

    // --- capa media: los monumentos del mundo angloparlante
    var W_MID = '<svg viewBox="0 0 1500 300" aria-hidden="true">' +
      // Stonehenge
      '<path class="f" d="M38 300v-54h17v54zM72 300v-54h17v54zM32 240h63v12H32zM112 300v-44h15v44zM142 300v-40h14v40zM106 250h56v11h-56z"/>' +
      // Big Ben y el Parlamento
      '<path class="f" d="M198 300V190h-6v-13h31v13h-6v110zM195 177l16-29 16 29zM209 148h4v-12h-4z"/>' +
      '<circle class="tm-clock" cx="211" cy="200" r="7"/>' +
      '<path class="f" d="M231 300v-60h74v60zM235 240l5-13 5 13M251 240l5-13 5 13M267 240l5-13 5 13M283 240l5-13 5 13"/>' +
      '<rect class="tm-wwin" x="242" y="256" width="6" height="10"/><rect class="tm-wwin" x="276" y="262" width="6" height="10" style="animation-delay:-3s"/>' +
      // Tower Bridge
      '<path class="f" d="M356 300V182h27v118zM352 182l17.5-29 17.5 29zM477 300V182h27v118zM473 182l17.5-29 17.5 29zM383 196h94v11h-94zM334 266h192v9H334z"/>' +
      '<path class="s" stroke-width="3.4" d="M334 266q22-46 52-60M474 206q30 14 52 60"/>' +
      '<path class="s" stroke-width="1.6" d="M348 258v-12M362 250v-14M396 244v-14M420 242v-12M444 242v-12M468 248v-14M500 256v-12"/>' +
      // Estatua de la Libertad
      '<path class="f" d="M566 300v-28h36v28zM571 272v-15h26v15zM577 257l6-54h10l6 54zM584 203a6.5 6.5 0 1 1 13 0a6.5 6.5 0 1 1-13 0ZM597 201l10-27h4l-8 27zM582 196l-2-8 4 5M590 193v-8M598 196l3-8-5 5"/>' +
      '<ellipse class="tm-flame" cx="609" cy="169" rx="3.6" ry="6.5"/>' +
      // Nueva York: Empire State y Chrysler
      '<path class="f" d="M646 300V182h44v118zM654 182v-22h28v22zM664 160v-17h8v17zM666 143v-27h4v27z"/>' +
      '<path class="f" d="M700 300V204h40v96zM704 204q20-48 40 0ZM714 188q10-26 20 0ZM722 168h4v-28h-4z"/>' +
      '<path class="f" d="M750 300V226h34v74zM790 300V244h28v56z"/>' +
      '<rect class="tm-wwin" x="658" y="206" width="6" height="9" style="animation-delay:-1s"/><rect class="tm-wwin" x="712" y="230" width="6" height="9" style="animation-delay:-4s"/><rect class="tm-wwin" x="760" y="250" width="6" height="9" style="animation-delay:-6s"/>' +
      // Torre CN de Toronto
      '<path class="f" d="M844 300l4-148h6l4 148zM838 162a13 7.5 0 1 0 26 0a13 7.5 0 1 0-26 0ZM846 132a5 3.5 0 1 0 10 0a5 3.5 0 1 0-10 0ZM850 132V92h2v40z"/>' +
      // Ópera de Sídney y el puente del puerto
      '<path class="f" d="M898 290h128v10H898ZM906 292q20-64 54 0ZM938 292q24-78 58 0ZM978 292q16-52 40 0Z"/>' +
      '<path class="s" stroke-width="7" d="M1046 292q52-74 104 0"/><path class="s" stroke-width="2.4" d="M1046 292q52-54 104 0"/>' +
      '<path class="f" d="M1038 282h120v6h-120zM1038 268h14v30h-14zM1144 268h14v30h-14z"/>' +
      '<path class="s" stroke-width="1.6" d="M1070 282v-16M1090 282v-24M1110 282v-24M1130 282v-16"/>' +
      // faro
      '<path class="f" d="M1176 300l6-68h10l6 68zM1178 232h18v-8h-18zM1180 224l4-13h6l4 13z"/>' +
      '<circle class="tm-lamp" cx="1187" cy="228" r="3" fill="#fbbf24"/>' +
      '</svg>';

    // --- capa cercana: el suelo, los árboles y el mobiliario de la calle
    var W_NEAR = '<svg viewBox="0 0 1500 300" aria-hidden="true">' +
      '<path class="g" d="M0 268q100-16 200-8t200 12 200-14 200 10 200-12 200 8 200-10 100 6V300H0Z"/>' +
      flores(70, 0, 1500, 272, 286, 1.8) +
      '<path class="r" d="M0 288h1500v12H0z"/>' +
      '<g class="r"><path d="M20 292h40v4H20zM100 292h40v4h-40zM180 292h40v4h-40zM260 292h40v4h-40zM340 292h40v4h-40zM420 292h40v4h-40zM500 292h40v4h-40zM580 292h40v4h-40zM660 292h40v4h-40zM740 292h40v4h-40zM820 292h40v4h-40zM900 292h40v4h-40zM980 292h40v4h-40zM1060 292h40v4h-40zM1140 292h40v4h-40zM1220 292h40v4h-40zM1300 292h40v4h-40zM1380 292h40v4h-40zM1460 292h40v4h-40z"/></g>' +
      // árboles: primero los troncos, luego las copas
      '<g class="f"><path d="M92 256h7v26h-7zM462 254h7v28h-7zM878 256h7v26h-7zM652 244h6v38h-6zM1252 258h6v24h-6zM1400 259h6v23h-6z"/></g>' +
      '<g class="v copa"><circle cx="86" cy="246" r="20"/><circle cx="466" cy="244" r="18"/><circle cx="874" cy="246" r="19"/><circle cx="1248" cy="248" r="17"/><circle cx="1404" cy="250" r="15"/></g>' +
      '<g class="v2 copa"><circle cx="110" cy="254" r="14"/><circle cx="446" cy="252" r="13"/><circle cx="896" cy="254" r="13"/><circle cx="1268" cy="256" r="12"/><circle cx="1386" cy="257" r="11"/></g>' +
      // un abeto, que no pierde la hoja en invierno
      '<g class="v"><path d="M646 282l-14-38h28zM648 258l-12-30h24z"/></g>' +
      // cabina telefónica roja
      '<path class="d" d="M146 282v-48h24v48zM144 234q13-10 28 0Z"/>' +
      '<path class="r" d="M150 240h7v14h-7zM159 240h7v14h-7zM150 258h7v14h-7zM159 258h7v14h-7z"/>' +
      // buzón de correos
      '<path class="d" d="M304 282v-32a9 9 0 0 1 18 0v32zM306 258h14v4h-14z"/>' +
      // parada de autobús
      '<path class="d" d="M716 282v-44h4v44zM706 232h24v14h-24z"/>' +
      // banco de parque
      '<path class="d" d="M1016 282v-14h3v14zM1044 282v-14h3v14zM1012 266h36v4h-36zM1012 258h36v3.4h-36z"/>' +
      // valla de madera
      '<g class="f"><path d="M540 282v-26h4v26zM556 282v-26h4v26zM572 282v-26h4v26zM588 282v-26h4v26zM604 282v-26h4v26zM536 262h76v4h-76zM536 272h76v4h-76z"/></g>' +
      // farolas con su luz
      '<g class="d"><path d="M396 282v-46h3.5v46zM392 234h12v4h-12zM1122 282v-46h3.5v46zM1118 234h12v4h-12z"/></g>' +
      '<g class="tm-lamp" fill="#fbbf24"><circle cx="398" cy="232" r="3"/><circle cx="1124" cy="232" r="3"/></g>' +
      // matorrales en el tramo de campo abierto
      '<g class="v2"><path d="M1300 282q14-10 28 0zM1332 282q10-7 20 0zM1446 282q12-9 24 0z"/></g>' +
      '</svg>';

    var worldEl = null, worldLayers = [], tileW = 1200;
    function mundo() {
      var w = el("div", "tm-world no-print");
      w.setAttribute("aria-hidden", "true");
      [["tm-w-far", .10, 4, W_FAR], ["tm-w-mid", .24, 9, W_MID], ["tm-w-near", .46, 16, W_NEAR]].forEach(function (c) {
        var l = el("div", "tm-wl " + c[0]);
        l.setAttribute("data-tw-speed", c[1]); l.setAttribute("data-tw-depth", c[2]);
        l.appendChild(el("div", "tm-wtile", c[3]));
        w.appendChild(l);
        worldLayers.push(l);
      });
      // el manto de nieve que va creciendo en invierno
      w.appendChild(el("div", "tm-manto"));
      worldEl = w;
      return w;
    }
    // Tantas copias de la baldosa como hagan falta para cubrir la ventana.
    function ajustarMundo() {
      if (!worldEl) return;
      var h = worldEl.offsetHeight || 300;
      tileW = Math.round(h * 5);
      worldEl.style.setProperty("--tw-tile", tileW + "px");
      var n = Math.ceil(window.innerWidth / tileW) + 1;
      worldLayers.forEach(function (l) {
        while (l.children.length < n) l.appendChild(l.firstElementChild.cloneNode(true));
        while (l.children.length > n) l.removeChild(l.lastElementChild);
      });
    }

    var ultOpac = -1;
    function moverMundo(y, tx) {
      // en lo alto de la página manda la escena de la portada: el paisaje
      // aparece poco a poco en cuanto se empieza a bajar
      var k = y < 120 ? 0 : (y > 460 ? 1 : (y - 120) / 340);
      if (worldEl && Math.abs(k - ultOpac) > .02) {
        ultOpac = k;
        worldEl.style.opacity = k >= 1 ? "" : "calc(var(--tw-op) * " + k.toFixed(2) + ")";
      }
      for (var i = 0; i < worldLayers.length; i++) {
        var l = worldLayers[i];
        var sp = +l.getAttribute("data-tw-speed"), d = +l.getAttribute("data-tw-depth");
        var off = ((y * sp + tx * d) % tileW + tileW) % tileW;
        l.style.transform = "translate3d(" + (-off).toFixed(1) + "px,0,0)";
      }
    }

    // ------------------------------------------------------------------ el cielo
    var GLOBO = '<svg viewBox="0 0 40 58"><path d="M20 2q14 0 14 15 0 11-14 23Q6 28 6 17 6 2 20 2z" fill="#f472b6"/>' +
      '<path d="M20 2q5 0 5 15 0 11-5 23-5-12-5-23 0-15 5-15z" fill="#fbbf24" opacity=".85"/>' +
      '<path d="M14 40h12l-2 6H16z" fill="#92400e"/><path d="M15 40l2-4M25 40l-2-4" stroke="#78350f" stroke-width="1"/></svg>';
    function cielo() {
      var sk = el("div", "tm-weather no-print");
      sk.setAttribute("aria-hidden", "true");
      sk.appendChild(el("i", "tm-astro"));
      sk.appendChild(el("i", "tm-arcoiris"));
      [[8, 190, 110, ""], [17, 140, 86, ""], [28, 230, 140, ""], [38, 120, 96, ""],
       [4, 260, 124, " tm-mas"], [13, 170, 92, " tm-mas"], [23, 210, 132, " tm-mas"], [33, 160, 104, " tm-mas"]].forEach(function (c) {
        sk.appendChild(nube("tm-wcloud" + c[3], c[0], c[1], c[2]));
      });
      if (!reduce) sk.appendChild(el("div", "tm-globo", GLOBO));
      return sk;
    }

    // ------------------------------------------------------------------ estaciones
    // La profesora elige la estación en su panel; el portal la deja en
    // <html data-season="…">. Aquí se encienden los efectos de cada una:
    //   otoño     → hojas secas, ráfagas de viento y chaparrones de vez en cuando
    //   invierno  → nieve que va cuajando en el suelo y encima de los edificios
    //   primavera → pétalos, chubascos cortos y arcoíris al escampar
    //   verano    → motas de luz dorada de día y luciérnagas de noche
    // Los colores del paisaje y del cielo los pone tema.css.
    var ESTACIONES = ["primavera", "verano", "otono", "invierno"];
    var est = null, cv = null, cx = null, W = 0, H = 0, DPR = 1;
    var parts = [], viento = 0, vientoObj = 0, vientoBase = 0, lluvia = 0, lluviaObj = 0, nieve = 0;
    var timers = [], loopOn = false, tPrev = 0, dyEl = null;
    var escala = window.innerWidth < 700 ? .55 : 1;
    var HOJAS = ["#d97706", "#b45309", "#ca8a04", "#c2410c", "#9a3412", "#a16207", "#7e22ce", "#9333ea", "#eab308"];
    var PETALOS = ["#fbcfe8", "#f9a8d4", "#f472b6", "#fff1f2", "#fde68a"];

    function luz() { return root.getAttribute("data-theme") === "light"; }
    function later(fn, ms) { timers.push(setTimeout(fn, ms)); }

    // Filtro SVG que pinta de blanco el borde de arriba de todo lo que toca:
    // así la nieve «cuaja» sobre tejados, torres, puentes y colinas. Su grosor
    // (dy) crece poco a poco mientras dura el invierno.
    function filtroNieve() {
      var d = el("div", "tm-defs", '<svg width="0" height="0" aria-hidden="true" focusable="false">' +
        '<filter id="tm-nieve" x="0" y="0" width="1" height="1" color-interpolation-filters="sRGB">' +
        '<feComponentTransfer in="SourceAlpha" result="a"><feFuncA type="linear" slope="12"/></feComponentTransfer>' +
        '<feOffset in="a" dx="0" dy="0" result="b"/>' +
        '<feComposite in="a" in2="b" operator="out" result="borde"/>' +
        '<feFlood flood-color="#ffffff" flood-opacity=".95"/>' +
        '<feComposite in2="borde" operator="in" result="nieve"/>' +
        '<feMerge><feMergeNode in="SourceGraphic"/><feMergeNode in="nieve"/></feMerge></filter></svg>');
      dyEl = d.querySelector("feOffset");
      return d;
    }
    function ponNieve(n) {
      nieve = n;
      root.style.setProperty("--nieve", n.toFixed(3));
      if (dyEl) dyEl.setAttribute("dy", (n * 5).toFixed(2));
    }
    // en minuto y medio la nieve ya lo cubre todo
    function acumular() {
      if (est !== "invierno") return;
      if (nieve < 1) ponNieve(Math.min(1, nieve + 1 / 90));
      if (nieve < 1) later(acumular, 1000);
    }

    // Llueve a ratos: un chaparrón, escampa y, en primavera, sale el arcoíris.
    // El primero llega enseguida, para que se vea nada más elegir la estación.
    function chaparron(primera) {
      later(function () {
        lluviaObj = est === "otono" ? 1 : .6;
        root.classList.add("tm-llueve");
        later(function () {
          lluviaObj = 0;
          root.classList.remove("tm-llueve");
          if (est === "primavera") {
            root.classList.add("tm-arco");
            later(function () { root.classList.remove("tm-arco"); }, 24000);
          }
          chaparron(false);
        }, rnd(14000, 24000));
      }, primera ? rnd(6000, 10000) : rnd(35000, 70000));
    }
    // Otoño: ráfagas de viento que arrastran las hojas y la lluvia
    function rafagas() {
      later(function () {
        vientoObj = rnd(170, 270);
        root.classList.add("tm-rafaga");
        later(function () { vientoObj = vientoBase; root.classList.remove("tm-rafaga"); rafagas(); }, rnd(2500, 4500));
      }, rnd(6000, 14000));
    }

    // --- partículas
    function nueva(tipo, enPantalla) {
      var p = { t: tipo, ph: rnd(0, 6.3) };
      p.x = rnd(-20, W + 20);
      p.y = enPantalla ? rnd(-20, H) : rnd(-60, -10);
      if (tipo === "hoja") {
        p.s = rnd(5, 10); p.vy = rnd(38, 75); p.k = rnd(.6, 1.2); p.sw = rnd(18, 40); p.fs = rnd(1, 2.4);
        p.rot = rnd(0, 6.3); p.vr = rnd(-2, 2); p.flip = rnd(0, 6.3); p.ff = rnd(2, 5);
        p.c = HOJAS[Math.floor(Math.random() * HOJAS.length)];
      } else if (tipo === "petalo") {
        p.s = rnd(3, 5.5); p.vy = rnd(22, 45); p.k = rnd(.7, 1.3); p.sw = rnd(14, 30); p.fs = rnd(1, 2);
        p.rot = rnd(0, 6.3); p.vr = rnd(-1.5, 1.5); p.flip = rnd(0, 6.3); p.ff = rnd(1.5, 4);
        p.c = PETALOS[Math.floor(Math.random() * PETALOS.length)];
      } else if (tipo === "copo") {
        p.r = rnd(1, 3.3); p.vy = 14 + p.r * 14 + rnd(0, 10); p.sw = rnd(6, 16); p.fs = rnd(.6, 1.6); p.a = rnd(.55, .95);
      } else if (tipo === "gota") {
        p.l = rnd(10, 20); p.vy = rnd(650, 950); p.y = enPantalla ? rnd(-20, H) : rnd(-120, -20);
      } else if (tipo === "mota") {
        p.r = rnd(1, 2.6); p.vy = rnd(6, 18); p.sw = rnd(6, 14); p.fs = rnd(.4, 1); p.y = enPantalla ? rnd(0, H) : H + 10;
      } else if (tipo === "luciernaga") {
        p.y = rnd(H * .35, H * .95); p.ang = rnd(0, 6.3); p.v = rnd(10, 24); p.r = rnd(1.4, 2.4);
      } else if (tipo === "estela") {
        p.x = -260; p.y = rnd(H * .1, H * .8); p.len = rnd(120, 240); p.v = rnd(700, 1000); p.amp = rnd(6, 16);
      }
      return p;
    }
    function principal() {
      return est === "otono" ? ["hoja", 30] : est === "primavera" ? ["petalo", 22] :
        est === "invierno" ? ["copo", 130] : est === "verano" ? [luz() ? "mota" : "luciernaga", 22] : null;
    }
    function cuenta(tipo) { var n = 0; for (var i = 0; i < parts.length; i++) if (parts[i].t === tipo) n++; return n; }
    function poblar() {
      var pr = principal(); if (!pr) return;
      var n = Math.round(pr[1] * escala);
      for (var i = 0; i < n; i++) parts.push(nueva(pr[0], true));
    }

    function mover(p, dt) {
      switch (p.t) {
        case "hoja": case "petalo":
          p.ph += p.fs * dt; p.flip += p.ff * dt;
          p.rot += p.vr * dt * (1 + viento / 90);
          p.x += (viento * p.k + Math.sin(p.ph) * p.sw) * dt;
          p.y += p.vy * dt * (1 + viento / 500);
          return p.y < H + 20 && p.x < W + 60 && p.x > -60;
        case "copo":
          p.ph += p.fs * dt;
          p.x += (viento * .6 + Math.sin(p.ph) * p.sw) * dt; p.y += p.vy * dt;
          return p.y < H + 10 && p.x < W + 30 && p.x > -30;
        case "gota":
          p.x += (viento * 1.3 + 40) * dt; p.y += p.vy * dt;
          return p.y < H + 20 && p.x < W + 60;
        case "mota":
          p.ph += p.fs * dt;
          p.x += (Math.sin(p.ph) * p.sw + viento * .3) * dt; p.y -= p.vy * dt;
          return p.y > -10;
        case "luciernaga":
          p.ph += dt; p.ang += rnd(-1.6, 1.6) * dt;
          p.x += Math.cos(p.ang) * p.v * dt; p.y += Math.sin(p.ang) * p.v * dt * .6;
          if (p.y < H * .3 || p.y > H) p.ang = -p.ang;
          return p.x > -20 && p.x < W + 20;
        case "estela":
          p.x += p.v * dt;
          return p.x < W + 40;
      }
      return false;
    }
    function pintar(p) {
      var c = cx;
      switch (p.t) {
        case "hoja": case "petalo":
          c.save(); c.translate(p.x, p.y); c.rotate(p.rot); c.scale(Math.cos(p.flip), 1);
          c.globalAlpha = p.t === "hoja" ? .85 : .8;
          c.fillStyle = p.c; c.beginPath();
          c.moveTo(0, -p.s);
          c.quadraticCurveTo(p.s * .85, -p.s * .15, 0, p.s);
          c.quadraticCurveTo(-p.s * .85, -p.s * .15, 0, -p.s);
          c.fill();
          if (p.t === "hoja") {
            c.strokeStyle = "rgba(0,0,0,.22)"; c.lineWidth = .7;
            c.beginPath(); c.moveTo(0, -p.s * .8); c.lineTo(0, p.s * 1.35); c.stroke();
          }
          c.restore();
          break;
        case "copo":
          c.globalAlpha = p.a; c.fillStyle = "#fff";
          c.beginPath(); c.arc(p.x, p.y, p.r, 0, 6.283); c.fill();
          if (luz()) { c.strokeStyle = "rgba(71,85,105,.35)"; c.lineWidth = .8; c.stroke(); }
          break;
        case "gota":
          c.globalAlpha = 1; c.strokeStyle = luz() ? "rgba(51,65,85,.38)" : "rgba(191,203,235,.42)"; c.lineWidth = 1.1;
          var k = (viento * 1.3 + 40) / p.vy;
          c.beginPath(); c.moveTo(p.x, p.y); c.lineTo(p.x - k * p.l, p.y - p.l); c.stroke();
          break;
        case "mota":
          c.globalAlpha = .45 + .35 * Math.sin(p.ph * 3);
          c.fillStyle = "#facc15"; c.beginPath(); c.arc(p.x, p.y, p.r, 0, 6.283); c.fill();
          break;
        case "luciernaga":
          var b = Math.max(0, Math.sin(p.ph * 2.2));
          if (b < .05) break;
          c.globalAlpha = b * .9;
          var g = c.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 5);
          g.addColorStop(0, "rgba(217,249,157,1)"); g.addColorStop(.3, "rgba(190,242,100,.55)"); g.addColorStop(1, "rgba(190,242,100,0)");
          c.fillStyle = g; c.beginPath(); c.arc(p.x, p.y, p.r * 5, 0, 6.283); c.fill();
          break;
        case "estela":
          c.globalAlpha = 1; c.strokeStyle = luz() ? "rgba(100,116,139,.22)" : "rgba(226,232,240,.18)"; c.lineWidth = 1.3;
          c.beginPath(); c.moveTo(p.x, p.y);
          c.bezierCurveTo(p.x + p.len * .33, p.y - p.amp, p.x + p.len * .66, p.y + p.amp, p.x + p.len, p.y);
          c.stroke();
          break;
      }
    }

    function bucle(t) {
      if (!loopOn) return;
      requestAnimationFrame(bucle);
      if (doc.hidden) { tPrev = 0; return; }
      var dt = tPrev ? Math.min(.05, (t - tPrev) / 1000) : .016; tPrev = t;
      viento += (vientoObj - viento) * Math.min(1, dt * 1.2);
      lluvia += (lluviaObj - lluvia) * Math.min(1, dt * .5);
      var pr = principal();
      // el verano cambia de motas a luciérnagas si se pasa a modo noche
      if (est === "verano") {
        var otro = pr[0] === "mota" ? "luciernaga" : "mota";
        if (cuenta(otro)) { parts = parts.filter(function (p) { return p.t !== otro; }); poblar(); }
      }
      var objetivo = { gota: Math.round(170 * lluvia * escala) };
      if (pr) objetivo[pr[0]] = Math.round(pr[1] * escala);
      if (root.classList.contains("tm-rafaga") && cuenta("estela") < 4 && Math.random() < dt * 3) parts.push(nueva("estela"));
      for (var j = cuenta("gota"); j < objetivo.gota; j += 6) parts.push(nueva("gota"));
      cx.clearRect(0, 0, W, H);
      var vivas = [], tipos = {};
      for (var i = 0; i < parts.length; i++) {
        var p = parts[i];
        if (mover(p, dt)) { vivas.push(p); pintar(p); tipos[p.t] = (tipos[p.t] || 0) + 1; }
        else if (objetivo[p.t] && (tipos[p.t] || 0) < objetivo[p.t]) {
          // la que sale por abajo vuelve a entrar por arriba (si aún hacen falta)
          var q = nueva(p.t); vivas.push(q); tipos[p.t] = (tipos[p.t] || 0) + 1;
        }
      }
      // las que sobran (cuando escampa) no vuelven a entrar
      parts = vivas;
      cx.globalAlpha = 1;
    }
    function medir() {
      if (!cv) return;
      DPR = Math.min(2, window.devicePixelRatio || 1);
      W = window.innerWidth; H = window.innerHeight;
      cv.width = Math.round(W * DPR); cv.height = Math.round(H * DPR);
      cx.setTransform(DPR, 0, 0, DPR, 0, 0);
    }
    function arrancar() {
      if (loopOn || !cx) return;
      loopOn = true; tPrev = 0;
      requestAnimationFrame(bucle);
    }
    function parar() {
      loopOn = false;
      if (cx) cx.clearRect(0, 0, W, H);
    }

    function aplicarEstacion() {
      var s = root.getAttribute("data-season");
      if (ESTACIONES.indexOf(s) < 0) s = null;
      if (s === est) return;
      est = s;
      timers.forEach(clearTimeout); timers = [];
      root.classList.remove("tm-llueve", "tm-arco", "tm-rafaga");
      lluvia = lluviaObj = 0;
      vientoBase = s === "otono" ? 45 : s === "primavera" ? 14 : s === "invierno" ? 12 : 0;
      viento = vientoObj = vientoBase;
      parts = [];
      ponNieve(s === "invierno" && reduce ? 1 : 0);
      if (!s || reduce || !cx) { parar(); return; }
      if (s === "invierno") acumular();
      if (s === "otono" || s === "primavera") chaparron(true);
      if (s === "otono") rafagas();
      poblar();
      arrancar();
    }
    function estaciones() {
      cv = el("canvas", "tm-season no-print");
      cv.setAttribute("aria-hidden", "true");
      try { cx = cv.getContext("2d"); } catch (e) { cx = null; }
      medir();
      window.addEventListener("resize", medir, { passive: true });
      new MutationObserver(aplicarEstacion).observe(root, { attributes: true, attributeFilter: ["data-season"] });
      return cv;
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
      // al fondo de la página, por este orden: tinte de la estación, cielo y
      // paisaje; la lluvia, la nieve y las hojas van al final para caer por
      // delante de los edificios (pero siempre por detrás del contenido)
      var tinte = el("div", "tm-tinte no-print"); tinte.setAttribute("aria-hidden", "true");
      var fondo = [filtroNieve(), tinte, cielo(), mundo()];
      for (var i = fondo.length - 1; i >= 0; i--) doc.body.insertBefore(fondo[i], doc.body.firstChild);
      doc.body.appendChild(estaciones());
      ajustarMundo();
      aplicarEstacion();
      window.addEventListener("resize", ajustarMundo, { passive: true });
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
      }
    }
    if (doc.readyState === "loading") doc.addEventListener("DOMContentLoaded", start); else start();
  } catch (err) {
    // La decoración nunca debe romper el portal.
    if (window.console) console.warn("tema decorativo desactivado:", err);
  }
})();
