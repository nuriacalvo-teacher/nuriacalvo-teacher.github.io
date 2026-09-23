/* ==========================================================================
   sonido.js · música de fondo y efectos del portal de inglés
   --------------------------------------------------------------------------
   Todo se sintetiza en el navegador (Web Audio), sin ficheros:
   - efectos: cuerdas punteadas tipo guzheng (Karplus-Strong), gong,
     bloque de madera y campanillas (iguales que en HSK1)
   - música del portal: «folk alrededor del mundo anglosajón», relajante:
     arpa celta y tin whistle (Irlanda y Reino Unido), guitarra con
     fingerpicking (Norteamérica), un didgeridoo muy suave (Australia) y, de
     vez en cuando, las campanadas del Big Ben (Westminster Quarters).
   */
(function (global) {
  "use strict";

  var AC = global.AudioContext || global.webkitAudioContext;
  var ctx = null, master = null, musicBus = null, sfxBus = null, reverb = null;
  var prefs = { music: true, sfx: true, musicVol: 0.5 };
  var mode = "menu";            // "menu" (con música) o "exercise" (sin música)
  var unlocked = false;
  var bufCache = {};

  // Pentatónica en re: D E F# A B  (宫 商 角 徵 羽)
  var BASE = 146.83;            // re3
  var STEPS = [0, 2, 4, 7, 9];
  function pent(i) {            // i-ésima nota de la escala (puede ser negativa)
    var oct = Math.floor(i / 5), deg = ((i % 5) + 5) % 5;
    return BASE * Math.pow(2, oct + STEPS[deg] / 12);
  }

  function init() {
    if (ctx || !AC) return !!ctx;
    ctx = new AC();
    master = ctx.createGain(); master.gain.value = 0.9; master.connect(ctx.destination);
    // reverberación suave (sala de madera)
    reverb = ctx.createConvolver();
    var len = ctx.sampleRate * 2.6, ir = ctx.createBuffer(2, len, ctx.sampleRate);
    for (var ch = 0; ch < 2; ch++) {
      var d = ir.getChannelData(ch);
      for (var i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3.2);
    }
    reverb.buffer = ir;
    var wet = ctx.createGain(); wet.gain.value = 0.35; reverb.connect(wet); wet.connect(master);
    musicBus = ctx.createGain(); musicBus.gain.value = 0; musicBus.connect(master); musicBus.connect(reverb);
    sfxBus = ctx.createGain(); sfxBus.gain.value = 0.7; sfxBus.connect(master); sfxBus.connect(reverb);
    return true;
  }

  // ------------------------------------------------------------ instrumentos
  /** Cuerda punteada (Karplus-Strong), cacheada por frecuencia. */
  function pluckBuffer(freq, bright) {
    var key = Math.round(freq * 10) + (bright ? "b" : "");
    if (bufCache[key]) return bufCache[key];
    var sr = ctx.sampleRate, dur = 3.2, n = Math.floor(sr * dur);
    var buf = ctx.createBuffer(1, n, sr), out = buf.getChannelData(0);
    var period = Math.max(2, Math.round(sr / freq));
    var line = new Float32Array(period);
    for (var i = 0; i < period; i++) line[i] = Math.random() * 2 - 1;
    var damp = bright ? 0.4985 : 0.4975, idx = 0, prev = 0;
    for (var s = 0; s < n; s++) {
      var cur = line[idx];
      var nx = damp * (cur + prev);
      prev = cur;
      line[idx] = nx;
      out[s] = cur;
      idx = (idx + 1) % period;
    }
    // ataque suave
    for (var a = 0; a < 120; a++) out[a] *= a / 120;
    bufCache[key] = buf;
    return buf;
  }
  function pluck(freq, when, vol, bus, bright) {
    var src = ctx.createBufferSource();
    src.buffer = pluckBuffer(freq, bright);
    var g = ctx.createGain(); g.gain.value = vol;
    var f = ctx.createBiquadFilter(); f.type = "lowpass"; f.frequency.value = bright ? 5200 : 3200;
    src.connect(f); f.connect(g); g.connect(bus);
    src.start(when);
    // ligera vibración de la cuerda, como en el guzheng
    src.playbackRate.setValueAtTime(1, when);
    src.playbackRate.linearRampToValueAtTime(1.004, when + 0.35);
    src.playbackRate.linearRampToValueAtTime(0.998, when + 0.8);
  }
  function tone(freq, when, dur, vol, type, bus, attack) {
    var o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type || "sine"; o.frequency.value = freq;
    g.gain.setValueAtTime(0, when);
    g.gain.linearRampToValueAtTime(vol, when + (attack || 0.01));
    g.gain.exponentialRampToValueAtTime(0.0001, when + dur);
    o.connect(g); g.connect(bus);
    o.start(when); o.stop(when + dur + 0.05);
  }
  /** Gong: parciales inarmónicos con caída lenta. */
  function gong(when, vol, low) {
    var f0 = low ? 72 : 110;
    [[1, 1], [1.48, 0.6], [2.03, 0.45], [2.76, 0.3], [3.9, 0.18], [5.3, 0.1]].forEach(function (p) {
      var o = ctx.createOscillator(), g = ctx.createGain();
      o.type = "sine"; o.frequency.setValueAtTime(f0 * p[0] * 1.02, when);
      o.frequency.exponentialRampToValueAtTime(f0 * p[0], when + 1.2);
      g.gain.setValueAtTime(0, when);
      g.gain.linearRampToValueAtTime(vol * p[1], when + 0.03);
      g.gain.exponentialRampToValueAtTime(0.0001, when + (low ? 3.2 : 2.6));
      o.connect(g); g.connect(sfxBus);
      o.start(when); o.stop(when + 3.4);
    });
  }
  /** Bloque de madera (木鱼). */
  function woodblock(when, vol, freq) {
    var o = ctx.createOscillator(), g = ctx.createGain(), f = ctx.createBiquadFilter();
    o.type = "triangle"; o.frequency.setValueAtTime(freq || 820, when);
    o.frequency.exponentialRampToValueAtTime((freq || 820) * 0.7, when + 0.08);
    f.type = "bandpass"; f.frequency.value = freq || 820; f.Q.value = 4;
    g.gain.setValueAtTime(vol, when); g.gain.exponentialRampToValueAtTime(0.0001, when + 0.16);
    o.connect(f); f.connect(g); g.connect(sfxBus);
    o.start(when); o.stop(when + 0.2);
  }
  function chime(freq, when, vol, bus) {
    tone(freq, when, 2.2, vol, "sine", bus, 0.005);
    tone(freq * 2.76, when, 0.9, vol * 0.25, "sine", bus, 0.005);
  }

  function dmS(i) { var oct = Math.floor(i / 7), deg = ((i % 7) + 7) % 7; return 146.83 * Math.pow(2, oct + [0, 2, 4, 5, 7, 9, 11][deg] / 12); }
  // ------------------------------------------------------------ efectos
  var SFX = {
    ok: function (t) { pluck(pent(10), t, 0.5, sfxBus, true); pluck(pent(12), t + 0.09, 0.5, sfxBus, true); pluck(pent(14), t + 0.18, 0.55, sfxBus, true); chime(pent(17), t + 0.26, 0.08, sfxBus); },
    mid: function (t) { pluck(pent(10), t, 0.45, sfxBus, true); pluck(pent(11), t + 0.14, 0.4, sfxBus, false); },
    ko: function (t) { woodblock(t, 0.55, 520); woodblock(t + 0.14, 0.45, 430); pluck(pent(3), t + 0.05, 0.35, sfxBus, false); },
    tick: function (t) { woodblock(t, 0.18, 1400); },
    hover: function (t) { chime(dmS(14 + Math.floor(Math.random() * 3)), t, 0.03, sfxBus); },
    abrir: function (t) { [7, 9, 11, 14].forEach(function (d, i) { pluck(dmS(d), t + i * 0.07, 0.35, sfxBus, true); }); chime(dmS(18), t + 0.3, 0.06, sfxBus); },
    tema: function (t) { chime(dmS(16), t, 0.05, sfxBus); chime(dmS(18), t + 0.1, 0.04, sfxBus); },
    // resultado final
    excelente: function (t) {
      gong(t, 0.28, false);
      [5, 7, 8, 10, 12, 13, 15, 17].forEach(function (d, i) { pluck(pent(d), t + 0.1 + i * 0.075, 0.45, sfxBus, true); });
      chime(pent(20), t + 0.8, 0.1, sfxBus); chime(pent(22), t + 0.95, 0.08, sfxBus);
    },
    aprobado: function (t) {
      [7, 9, 10, 12].forEach(function (d, i) { pluck(pent(d), t + i * 0.1, 0.45, sfxBus, true); });
      pluck(pent(14), t + 0.45, 0.5, sfxBus, true); chime(pent(17), t + 0.55, 0.07, sfxBus);
    },
    suspenso: function (t) {
      gong(t, 0.22, true);
      [9, 8, 7, 5].forEach(function (d, i) { pluck(pent(d), t + 0.15 + i * 0.2, 0.35, sfxBus, false); });
    }
  };
  function sfx(name) {
    if (!prefs.sfx || !init()) return;
    if (ctx.state === "suspended") ctx.resume();
    var f = SFX[name]; if (f) f(ctx.currentTime + 0.02);
  }

  // ------------------------------------------------------------ música de fondo
  // Re mayor (jónico) con algún do natural (mixolidio), muy de folk celta.
  var MBASE = 146.83;           // re3
  var MAJ = [0, 2, 4, 5, 7, 9, 11];
  function dm(i, mixo) {
    var oct = Math.floor(i / 7), deg = ((i % 7) + 7) % 7;
    var st = MAJ[deg] - (mixo && deg === 6 ? 1 : 0);
    return MBASE * Math.pow(2, oct + st / 12);
  }
  var noiseBuf = null;
  function noise() {
    if (noiseBuf) return noiseBuf;
    noiseBuf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
    var d = noiseBuf.getChannelData(0);
    for (var i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    return noiseBuf;
  }
  /** Tin whistle: tono puro y brillante, con un poco de soplo y vibrato tardío. */
  function whistle(freq, when, dur, vol, cut) {
    var out = ctx.createGain(); out.gain.value = 0; out.connect(musicBus);
    var o = ctx.createOscillator(); o.type = "sine";
    var o2 = ctx.createOscillator(); o2.type = "triangle";
    var g2 = ctx.createGain(); g2.gain.value = 0.08;
    o.connect(out); o2.connect(g2); g2.connect(out);
    // «cut»: nota de adorno rápida por encima, típica del folk irlandés
    if (cut) {
      o.frequency.setValueAtTime(freq * 1.122, when); o2.frequency.setValueAtTime(freq * 2.244, when);
      o.frequency.setValueAtTime(freq, when + 0.06); o2.frequency.setValueAtTime(freq * 2, when + 0.06);
    } else { o.frequency.value = freq; o2.frequency.value = freq * 2; }
    var lfo = ctx.createOscillator(), lg = ctx.createGain();
    lfo.frequency.value = 5.5; lg.gain.setValueAtTime(0, when);
    lg.gain.linearRampToValueAtTime(freq * 0.006, when + Math.min(0.7, dur * 0.6));
    lfo.connect(lg); lg.connect(o.frequency);
    out.gain.setValueAtTime(0, when);
    out.gain.linearRampToValueAtTime(vol, when + 0.05);
    out.gain.setValueAtTime(vol * 0.9, when + dur * 0.75);
    out.gain.linearRampToValueAtTime(0, when + dur);
    var n = ctx.createBufferSource(); n.buffer = noise(); n.loop = true;
    var bp = ctx.createBiquadFilter(); bp.type = "bandpass"; bp.frequency.value = freq * 3; bp.Q.value = 2;
    var ng = ctx.createGain(); ng.gain.setValueAtTime(vol * 0.12, when); ng.gain.linearRampToValueAtTime(0, when + 0.2);
    n.connect(bp); bp.connect(ng); ng.connect(musicBus);
    [o, o2, lfo].forEach(function (x) { x.start(when); x.stop(when + dur + 0.1); });
    n.start(when, Math.random()); n.stop(when + 0.25);
  }
  /** Didgeridoo muy suave: nota grave con formante que se mueve. */
  var didj = null;
  function startDidge() {
    var o = ctx.createOscillator(); o.type = "sawtooth"; o.frequency.value = MBASE / 2;
    var bp = ctx.createBiquadFilter(); bp.type = "bandpass"; bp.frequency.value = 320; bp.Q.value = 5;
    var lp = ctx.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 900;
    var g = ctx.createGain(); g.gain.value = 0;
    o.connect(bp); bp.connect(lp); lp.connect(g); g.connect(musicBus);
    var lfo = ctx.createOscillator(), lg = ctx.createGain();
    lfo.frequency.value = 0.35; lg.gain.value = 140; lfo.connect(lg); lg.connect(bp.frequency);
    var br = ctx.createOscillator(), bg = ctx.createGain();
    br.frequency.value = 0.08; bg.gain.value = 0.012; br.connect(bg); bg.connect(g.gain);
    [o, lfo, br].forEach(function (x) { x.start(); });
    g.gain.setTargetAtTime(0.03, ctx.currentTime, 3);
    didj = { g: g, oscs: [o, lfo, br] };
  }
  /** Campanadas del Big Ben (Westminster Quarters), lejanas. */
  // Las cinco «changes» auténticas, en re mayor: fa# mi re la, re fa# mi la, re mi fa# re, fa# re mi la, la mi fa# re.
  var WQ = [[2, 1, 0, -3], [0, 2, 1, -3], [0, 1, 2, 0], [2, 0, 1, -3], [-3, 1, 2, 0]];
  function westminster(when) {
    var frase = WQ[Math.floor(Math.random() * WQ.length)];
    frase.forEach(function (d, k) {
      var f = dm(d + 7);
      [[1, 1], [2.0, 0.35], [2.76, 0.2], [5.4, 0.08]].forEach(function (p) {
        tone(f * p[0], when + k * 0.75, 3.2, 0.028 * p[1], "sine", musicBus, 0.004);
      });
    });
  }

  var timer = null, playing = false, pos = 9, beat = 0, nextT = 0, bar = 0;
  var CHORDS = [[0, 2, 4], [3, 5, 7], [4, 6, 8], [0, 2, 4], [5, 7, 9], [3, 5, 7], [4, 6, 8], [0, 2, 4]];
  function startDrone() { startDidge(); }
  function stopDrone() {
    if (!didj) return;
    var d = didj; didj = null;
    d.g.gain.setTargetAtTime(0, ctx.currentTime, 0.6);
    setTimeout(function () { d.oscs.forEach(function (o) { try { o.stop(); } catch (e) { /* nada */ } }); }, 3000);
  }
  function schedule() {
    // Un compás de 6/8 tranquilo: guitarra/arpa arpegiando el acorde y, encima,
    // una melodía de tin whistle que respira. Cada 16 compases, el Big Ben.
    var beatLen = 0.42;
    while (nextT < ctx.currentTime + 2.5) {
      var t = nextT;
      var ch = CHORDS[bar % CHORDS.length];
      // fingerpicking: bajo alternado + arpegio
      var patt = [ch[0] - 7, ch[1], ch[2], ch[0], ch[1], ch[2]];
      patt.forEach(function (d, k) {
        pluck(dm(d + 7, bar % 4 === 2), t + k * beatLen, k === 0 ? 0.3 : 0.17, musicBus, k !== 0);
      });
      // melodía: 2-4 notas por compás, a veces descansa
      if (bar % 8 < 6 && Math.random() < 0.85) {
        var n = 2 + Math.floor(Math.random() * 3), tt = t;
        for (var k = 0; k < n; k++) {
          pos += [-2, -1, -1, 1, 1, 2, 0][Math.floor(Math.random() * 7)];
          if (Math.random() < 0.35) pos = ch[Math.floor(Math.random() * 3)] + 14;
          if (pos < 12) pos = 13; if (pos > 20) pos = 18;
          var dur = (6 / n) * beatLen * (0.9 + Math.random() * 0.2);
          whistle(dm(pos), tt, dur, 0.055, Math.random() < 0.3);
          tt += dur;
        }
      }
      if (bar % 16 === 15) westminster(t + 0.5);
      bar++;
      nextT += 6 * beatLen;
    }
  }
  function musicOn() {
    if (playing || !prefs.music || mode !== "menu" || !unlocked || !init()) return;
    if (ctx.state === "suspended") ctx.resume();
    playing = true;
    musicBus.gain.cancelScheduledValues(ctx.currentTime);
    musicBus.gain.setTargetAtTime(0.55 * prefs.musicVol, ctx.currentTime, 1.2);
    nextT = ctx.currentTime + 0.3; beat = 0; bar = 0;
    startDrone();
    timer = setInterval(schedule, 500);
    schedule();
  }
  function musicOff() {
    if (!playing) return;
    playing = false;
    clearInterval(timer); timer = null;
    musicBus.gain.cancelScheduledValues(ctx.currentTime);
    musicBus.gain.setTargetAtTime(0, ctx.currentTime, 0.35);
    stopDrone();
  }
  function refresh() { if (prefs.music && mode === "menu") musicOn(); else musicOff(); }

  // El navegador solo deja sonar audio tras un gesto del usuario.
  function unlock() {
    if (unlocked) return;
    unlocked = true;
    if (init() && ctx.state === "suspended") ctx.resume();
    refresh();
    ["pointerdown", "keydown", "touchstart"].forEach(function (ev) { document.removeEventListener(ev, unlock, true); });
  }
  ["pointerdown", "keydown", "touchstart"].forEach(function (ev) { document.addEventListener(ev, unlock, true); });

  global.Sonido = {
    sfx: sfx,
    setMode: function (m) { mode = m; refresh(); },
    setPrefs: function (p) {
      Object.keys(p).forEach(function (k) { prefs[k] = p[k]; });
      if (ctx && playing) musicBus.gain.setTargetAtTime(0.55 * prefs.musicVol, ctx.currentTime, 0.2);
      refresh();
    },
    isPlaying: function () { return playing; },
    available: !!AC
  };
})(window);
