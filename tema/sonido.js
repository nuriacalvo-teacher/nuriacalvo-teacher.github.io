/* ==========================================================================
   sonido.js · música de fondo y efectos del portal de inglés
   --------------------------------------------------------------------------
   Todo se sintetiza en el navegador (Web Audio), sin ficheros:
   - efectos: cuerdas punteadas tipo guzheng (Karplus-Strong), gong,
     bloque de madera y campanillas (iguales que en HSK1)
   - música del portal: popurrí de melodías tradicionales (dominio público)
     tocadas despacio con flauta/tin whistle, arpa y un colchón de cuerdas:
     Greensleeves (Inglaterra), The Irish Washerwoman (Irlanda), Amazing
     Grace (EE. UU.) y Auld Lang Syne (Escocia). Entre canción y canción,
     didgeridoo con clapsticks (Australia) o las campanadas del Big Ben.
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
  // Popurrí de melodías tradicionales (dominio público) del mundo anglosajón,
  // tocadas despacio con tin whistle y arpa, y entre una y otra un interludio:
  // didgeridoo con clapsticks (Australia) o las campanadas del Big Ben (Londres).
  function mf(m) { return 440 * Math.pow(2, (m - 69) / 12); }
  var CH = {
    Am: [57, 60, 64], G: [55, 59, 62], F: [53, 57, 60], E: [52, 56, 59], C: [48, 52, 55],
    Em: [52, 55, 59], D: [50, 54, 57], Bb: [46, 50, 53], Dm: [50, 53, 57]
  };
  var SONGS = [
    { name: "Greensleeves", from: "Inglaterra", beat: 0.62, bar: 3, pickup: 1, voice: "flute",
      notes: [[69,1],
        [72,2],[74,1],[76,1.5],[77,.5],[76,1],[74,2],[71,1],[67,1.5],[69,.5],[71,1],[72,2],[69,1],[69,1.5],[68,.5],[69,1],[71,2],[68,1],[64,2],[69,1],
        [72,2],[74,1],[76,1.5],[77,.5],[76,1],[74,2],[71,1],[67,1.5],[69,.5],[71,1],[72,1.5],[71,.5],[69,1],[68,1.5],[66,.5],[68,1],[69,3],
        [79,3],[79,1.5],[78,.5],[76,1],[74,2],[71,1],[67,1.5],[69,.5],[71,1],[72,2],[69,1],[69,1.5],[68,.5],[69,1],[71,2],[68,1],[64,3],
        [79,3],[79,1.5],[78,.5],[76,1],[74,2],[71,1],[67,1.5],[69,.5],[71,1],[72,1.5],[71,.5],[69,1],[68,1.5],[66,.5],[68,1],[69,3]],
      chords: ["Am","Am","G","G","F","E","E","Am", "Am","Am","G","G","Am","E","Am",
               "C","G","G","Em","Am","E","E","E", "C","G","G","Em","Am","E","Am"] },
    { name: "The Irish Washerwoman", from: "Irlanda", beat: 0.25, bar: 6, pickup: 2, voice: "whistle",
      notes: [[74,1],[72,1],
        [71,1],[67,1],[67,1],[62,1],[67,1],[67,1], [71,1],[67,1],[71,1],[74,1],[72,1],[71,1],
        [72,1],[69,1],[69,1],[64,1],[69,1],[69,1], [72,1],[69,1],[72,1],[76,1],[74,1],[72,1],
        [71,1],[67,1],[67,1],[62,1],[67,1],[67,1], [71,1],[67,1],[71,1],[74,1],[72,1],[71,1],
        [72,1],[71,1],[72,1],[69,1],[74,1],[72,1], [71,1],[67,1],[67,1],[67,1],[74,1],[72,1],
        [71,1],[67,1],[67,1],[62,1],[67,1],[67,1], [71,1],[67,1],[71,1],[74,1],[72,1],[71,1],
        [72,1],[69,1],[69,1],[64,1],[69,1],[69,1], [72,1],[69,1],[72,1],[76,1],[74,1],[72,1],
        [71,1],[67,1],[67,1],[62,1],[67,1],[67,1], [71,1],[67,1],[71,1],[74,1],[72,1],[71,1],
        [72,1],[71,1],[72,1],[69,1],[74,1],[72,1], [71,1],[67,1],[67,1],[67,3]],
      chords: ["G","G","Am","D","G","G","D","G", "G","G","Am","D","G","G","D","G"] },
    { name: "Amazing Grace", from: "Estados Unidos", beat: 0.72, bar: 3, pickup: 1, voice: "flute",
      notes: [[62,1],
        [67,2],[71,.5],[67,.5],[71,2],[69,1],[67,2],[64,1],[62,2],[62,1],[67,2],[71,.5],[67,.5],[71,2],[69,1],[74,5],[71,1],
        [74,2],[71,.5],[67,.5],[71,2],[69,1],[67,2],[64,1],[62,2],[62,1],[67,2],[71,.5],[67,.5],[71,2],[69,1],[67,5]],
      chords: ["G","G","C","G","G","D","D","G", "G","G","C","G","G","D","G","G"] },
    { name: "Auld Lang Syne", from: "Escocia", beat: 0.66, bar: 4, pickup: 1, voice: "flute",
      notes: [[60,1],
        [65,1.5],[65,.5],[65,1],[69,1],[67,1.5],[65,.5],[67,1],[69,1],[65,1.5],[65,.5],[69,1],[72,1],[74,3],[74,1],
        [72,1.5],[69,.5],[69,1],[65,1],[67,1.5],[65,.5],[67,1],[69,1],[65,1.5],[62,.5],[62,1],[60,1],[65,4]],
      chords: ["F","C","F","Bb","F","C","Bb","F"] }
  ];

  var noiseBuf = null;
  function noise() {
    if (noiseBuf) return noiseBuf;
    noiseBuf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
    var d = noiseBuf.getChannelData(0);
    for (var i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    return noiseBuf;
  }
  /** Tin whistle / flauta: tono redondo, soplo al atacar y vibrato que llega tarde. */
  function whistle(freq, when, dur, vol, bright) {
    var out = ctx.createGain(); out.gain.value = 0; out.connect(musicBus);
    var lp = ctx.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = bright ? 5000 : 2600;
    var o = ctx.createOscillator(); o.type = "sine";
    var o2 = ctx.createOscillator(); o2.type = "triangle";
    var g2 = ctx.createGain(); g2.gain.value = bright ? 0.14 : 0.06;
    o.connect(lp); o2.connect(g2); g2.connect(lp); lp.connect(out);
    o.frequency.value = freq; o2.frequency.value = freq * 2;
    var lfo = ctx.createOscillator(), lg = ctx.createGain();
    lfo.frequency.value = 5.2; lg.gain.setValueAtTime(0, when);
    lg.gain.setValueAtTime(0, when + Math.min(0.35, dur * 0.4));
    lg.gain.linearRampToValueAtTime(freq * (dur > 0.8 ? 0.008 : 0.003), when + Math.max(0.4, dur * 0.8));
    lfo.connect(lg); lg.connect(o.frequency);
    var att = bright ? 0.02 : 0.07, rel = Math.min(0.25, dur * 0.35);
    out.gain.setValueAtTime(0, when);
    out.gain.linearRampToValueAtTime(vol, when + att);
    out.gain.setValueAtTime(vol * 0.85, Math.max(when + att, when + dur - rel));
    out.gain.linearRampToValueAtTime(0, when + dur + 0.05);
    var n = ctx.createBufferSource(); n.buffer = noise(); n.loop = true;
    var bp = ctx.createBiquadFilter(); bp.type = "bandpass"; bp.frequency.value = freq * 2.5; bp.Q.value = 1.5;
    var ng = ctx.createGain(); ng.gain.setValueAtTime(vol * 0.25, when); ng.gain.linearRampToValueAtTime(vol * 0.03, when + 0.12);
    ng.gain.linearRampToValueAtTime(0, when + dur);
    n.connect(bp); bp.connect(ng); ng.connect(musicBus);
    [o, o2, lfo].forEach(function (x) { x.start(when); x.stop(when + dur + 0.15); });
    n.start(when, Math.random()); n.stop(when + dur + 0.1);
  }
  /** Colchón de cuerdas muy suave bajo cada acorde. */
  function pad(notes, when, dur, vol) {
    var g = ctx.createGain(); g.gain.value = 0;
    var lp = ctx.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 900;
    g.connect(musicBus); lp.connect(g);
    notes.forEach(function (m, k) {
      [-5, 5].forEach(function (det) {
        var o = ctx.createOscillator(); o.type = "sawtooth"; o.frequency.value = mf(m + 12); o.detune.value = det;
        o.connect(lp); o.start(when); o.stop(when + dur + 0.6);
      });
    });
    g.gain.setValueAtTime(0, when);
    g.gain.linearRampToValueAtTime(vol, when + Math.min(0.6, dur * 0.4));
    g.gain.setValueAtTime(vol, when + dur - 0.1);
    g.gain.linearRampToValueAtTime(0, when + dur + 0.5);
  }
  /** Didgeridoo con formante que se mueve (Australia). */
  function didge(when, dur, vol) {
    var o = ctx.createOscillator(); o.type = "sawtooth"; o.frequency.value = 73.4;
    var bp = ctx.createBiquadFilter(); bp.type = "bandpass"; bp.frequency.value = 300; bp.Q.value = 5;
    var lp = ctx.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 900;
    var g = ctx.createGain(); g.gain.value = 0;
    o.connect(bp); bp.connect(lp); lp.connect(g); g.connect(musicBus);
    var lfo = ctx.createOscillator(), lg = ctx.createGain();
    lfo.frequency.value = 0.6; lg.gain.value = 170; lfo.connect(lg); lg.connect(bp.frequency);
    g.gain.setValueAtTime(0, when);
    g.gain.linearRampToValueAtTime(vol, when + 1.2);
    g.gain.setValueAtTime(vol, when + dur - 1.5);
    g.gain.linearRampToValueAtTime(0, when + dur);
    [o, lfo].forEach(function (x) { x.start(when); x.stop(when + dur + 0.1); });
  }
  function clap(when, vol) {
    var o = ctx.createOscillator(), g = ctx.createGain(), f = ctx.createBiquadFilter();
    o.type = "triangle"; o.frequency.setValueAtTime(1500, when); o.frequency.exponentialRampToValueAtTime(900, when + 0.05);
    f.type = "bandpass"; f.frequency.value = 1400; f.Q.value = 6;
    g.gain.setValueAtTime(vol, when); g.gain.exponentialRampToValueAtTime(0.0001, when + 0.09);
    o.connect(f); f.connect(g); g.connect(musicBus); o.start(when); o.stop(when + 0.12);
  }
  /** Campanadas del Big Ben: las auténticas «Westminster Quarters» (en mi mayor). */
  var WQ = [[68, 66, 64, 59], [64, 68, 66, 59], [64, 66, 68, 64], [68, 64, 66, 59], [59, 66, 68, 64]];
  function bell(m, when, vol) {
    [[1, 1], [2.0, 0.4], [2.76, 0.22], [5.4, 0.08]].forEach(function (p) {
      tone(mf(m) * p[0], when, 3.4, vol * p[1], "sine", musicBus, 0.004);
    });
  }

  // ------------------------------------------------------------ partitura → eventos
  var timer = null, playing = false, events = [], cursor = 0, songIdx = Math.floor(Math.random() * SONGS.length), inter = 0, nextIsSong = true;
  function at(t, fn) { events.push({ t: t, fn: fn }); }
  function addSong(song, t0) {
    var b = song.beat, t = t0;
    song.notes.forEach(function (n) {
      var m = n[0], d = n[1] * b;
      (function (m, d, tt) { at(tt, function (w) { whistle(mf(m + (song.voice === "whistle" ? 12 : 12)), w, d * 0.95, song.voice === "whistle" ? 0.045 : 0.055, song.voice === "whistle"); }); })(m, d, t);
      t += d;
    });
    var end = t;
    // acompañamiento: arpa arpegiando + bajo + colchón, compás a compás
    var start = t0 + song.pickup * b, barLen = song.bar * b;
    song.chords.forEach(function (name, i) {
      var c = CH[name], tb = start + i * barLen;
      if (tb >= end) return;
      var pat;
      if (song.bar === 6) pat = [c[0] - 12, c[1], c[2], c[0], c[1], c[2]];
      else if (song.bar === 4) pat = [c[0] - 12, c[1], c[2], c[0] + 12, c[2], c[1], c[2], c[0] + 12];
      else pat = [c[0] - 12, c[1], c[2], c[0] + 12, c[2], c[1]];
      var step = barLen / pat.length;
      pat.forEach(function (m, k) {
        (function (m, tt, first) { at(tt, function (w) { pluck(mf(m + (first ? 0 : 12)), w, first ? 0.24 : 0.12, musicBus, !first); }); })(m, tb + k * step, k === 0);
      });
      (function (c, tt) { at(tt, function (w) { pad(c, w, barLen, 0.012); }); })(c, tb);
    });
    return end + 1.2;
  }
  function addInterlude(t0) {
    inter++;
    if (inter % 2) {
      // Australia: didgeridoo y clapsticks
      at(t0, function (w) { didge(w, 9, 0.05); });
      for (var k = 0; k < 14; k++) (function (tt) { at(tt, function (w) { clap(w, 0.09); }); })(t0 + 1.4 + k * 0.5);
      return t0 + 9.5;
    }
    // Londres: un cuarto del Big Ben, lejano
    var fr = WQ[Math.floor(Math.random() * WQ.length)];
    fr.forEach(function (m, k) { (function (m, tt) { at(tt, function (w) { bell(m + 12, w, 0.03); }); })(m, t0 + k * 0.85); });
    return t0 + 6;
  }
  function schedule() {
    var horizon = ctx.currentTime + 2;
    while (cursor < horizon + 6) {
      if (nextIsSong) cursor = addSong(SONGS[songIdx++ % SONGS.length], cursor);
      else cursor = addInterlude(cursor);
      nextIsSong = !nextIsSong;
      events.sort(function (a, b) { return a.t - b.t; });
    }
    while (events.length && events[0].t < horizon) {
      var e = events.shift();
      if (e.t >= ctx.currentTime - 0.05) e.fn(e.t);
    }
  }
  function startDrone() { events = []; cursor = ctx.currentTime + 0.4; nextIsSong = true; }
  function stopDrone() { events = []; }
  function musicOn() {
    if (playing || !prefs.music || mode !== "menu" || !unlocked || !init()) return;
    if (ctx.state === "suspended") ctx.resume();
    playing = true;
    musicBus.gain.cancelScheduledValues(ctx.currentTime);
    musicBus.gain.setTargetAtTime(0.55 * prefs.musicVol, ctx.currentTime, 1.2);
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
