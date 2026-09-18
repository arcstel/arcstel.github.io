/* W.P. catalog player — vanilla JS, no dependencies. */
(function () {
  "use strict";

  var TRACKS = [
    { title: "music",                 src: "audio/01-music.mp3",                duration: "3:49" },
    { title: "lyrical homicide",      src: "audio/02-lyrical-homicide.mp3",     duration: "3:39" },
    { title: "music remix",           src: "audio/03-music-remix.mp3",          duration: "4:00" },
    { title: "partying wit my crew",  src: "audio/04-partying-wit-my-crew.mp3", duration: "3:11" },
    { title: "livin",                 src: "audio/05-livin.mp3",                duration: "3:40" },
    { title: "this is what we bring", src: "audio/06-this-is-what-we-bring.mp3",duration: "3:33" }
  ];

  var audio    = document.getElementById("audio");
  var playlist = document.getElementById("playlist");
  var playBtn  = document.getElementById("playBtn");
  var prevBtn  = document.getElementById("prevBtn");
  var nextBtn  = document.getElementById("nextBtn");
  var shuffleBtn = document.getElementById("shuffleBtn");
  var repeatBtn  = document.getElementById("repeatBtn");
  var seek     = document.getElementById("seek");
  var vol      = document.getElementById("vol");
  var npTitle  = document.getElementById("npTitle");
  var curTime  = document.getElementById("curTime");
  var durTime  = document.getElementById("durTime");
  var coverCount = document.getElementById("coverCount");
  var totalTime  = document.getElementById("totalTime");
  var metaRuntime = document.getElementById("metaRuntime");

  var ICON_PLAY  = '<svg viewBox="0 0 24 24"><polygon points="6 4 20 12 6 20 6 4"/></svg>';
  var ICON_PAUSE = '<svg viewBox="0 0 24 24"><line x1="9" y1="5" x2="9" y2="19"/><line x1="15" y1="5" x2="15" y2="19"/></svg>';

  var index = 0;
  var shuffle = false;
  var repeatMode = "all"; // off | all | one
  var seeking = false;
  var rows = [];

  function fmt(sec) {
    if (!isFinite(sec) || sec < 0) sec = 0;
    var m = Math.floor(sec / 60);
    var s = Math.floor(sec % 60);
    return m + ":" + (s < 10 ? "0" : "") + s;
  }

  function parseDur(str) {
    var p = String(str).split(":");
    return (parseInt(p[0], 10) || 0) * 60 + (parseInt(p[1], 10) || 0);
  }

  function pad(n) { return (n < 10 ? "0" : "") + n; }

  /* ------------------------------------------------------------- build */
  function buildList() {
    TRACKS.forEach(function (t, i) {
      var li = document.createElement("li");
      li.className = "track";
      li.dataset.i = i;
      li.innerHTML =
        '<span class="tnum">' + pad(i + 1) + "</span>" +
        '<span class="eq"><i></i><i></i><i></i></span>' +
        '<span class="tname">' + t.title +
          '<span class="tmeta">W.P. · FL Studio</span>' +
        "</span>" +
        '<span class="tdur">' + t.duration + "</span>";
      li.addEventListener("click", function () {
        if (i === index) { toggle(); } else { load(i, true); }
      });
      playlist.appendChild(li);
      rows.push(li);
    });

    var total = TRACKS.reduce(function (a, t) { return a + parseDur(t.duration); }, 0);
    totalTime.textContent = TRACKS.length + " tracks · " + fmt(total);
    if (metaRuntime) metaRuntime.textContent = fmt(total);
  }

  /* -------------------------------------------------------------- state */
  function markActive() {
    rows.forEach(function (row, i) {
      row.classList.toggle("active", i === index);
      if (i !== index) row.classList.remove("paused");
    });
  }

  function setPlaying(on) {
    playBtn.innerHTML = on ? ICON_PAUSE : ICON_PLAY;
    playBtn.title = on ? "Pause" : "Play";
    playBtn.setAttribute("aria-label", on ? "Pause" : "Play");
    if (rows[index]) rows[index].classList.toggle("paused", !on);
  }

  function updateMediaSession() {
    if (!("mediaSession" in navigator)) return;
    var t = TRACKS[index];
    try {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: t.title,
        artist: "W.P. — Will Sindle",
        album: "W.P.",
        artwork: [{ src: "art/cover.jpg", sizes: "800x600", type: "image/jpeg" }]
      });
    } catch (e) { /* MediaMetadata unsupported */ }
  }

  /* --------------------------------------------------------------- load */
  function load(i, autoplay) {
    index = (i + TRACKS.length) % TRACKS.length;
    var t = TRACKS[index];
    audio.src = t.src;
    audio.load();
    npTitle.textContent = t.title;
    coverCount.textContent = pad(index + 1) + " / " + pad(TRACKS.length);
    markActive();
    updateMediaSession();
    curTime.textContent = "0:00";
    durTime.textContent = t.duration;
    seek.value = 0;
    if (autoplay) play();
  }

  function play() {
    var p = audio.play();
    if (p && p.catch) p.catch(function () { setPlaying(false); });
  }

  function toggle() {
    if (audio.paused) play(); else audio.pause();
  }

  function advance(auto) {
    if (auto && repeatMode === "one") {
      audio.currentTime = 0;
      play();
      return;
    }
    var last = index === TRACKS.length - 1;
    if (auto && !shuffle && repeatMode === "off" && last) {
      audio.pause();
      audio.currentTime = 0;
      return;
    }
    var n = index;
    if (shuffle && TRACKS.length > 1) {
      do { n = Math.floor(Math.random() * TRACKS.length); } while (n === index);
    } else {
      n = (index + 1) % TRACKS.length;
    }
    load(n, true);
  }

  function back() {
    if (audio.currentTime > 3) { audio.currentTime = 0; return; }
    var n;
    if (shuffle && TRACKS.length > 1) {
      do { n = Math.floor(Math.random() * TRACKS.length); } while (n === index);
    } else {
      n = (index - 1 + TRACKS.length) % TRACKS.length;
    }
    load(n, true);
  }

  /* -------------------------------------------------------------- events */
  playBtn.addEventListener("click", toggle);
  nextBtn.addEventListener("click", function () { advance(false); });
  prevBtn.addEventListener("click", back);

  shuffleBtn.addEventListener("click", function () {
    shuffle = !shuffle;
    shuffleBtn.classList.toggle("on", shuffle);
    shuffleBtn.title = shuffle ? "Shuffle on" : "Shuffle";
  });

  repeatBtn.addEventListener("click", function () {
    repeatMode = repeatMode === "all" ? "off" : repeatMode === "off" ? "one" : "all";
    repeatBtn.classList.toggle("on", repeatMode !== "off");
    repeatBtn.title = repeatMode === "all" ? "Repeat all" : repeatMode === "one" ? "Repeat one" : "Repeat";
    repeatBtn.setAttribute("aria-label", repeatBtn.title);
  });

  audio.addEventListener("play", function () { setPlaying(true); });
  audio.addEventListener("pause", function () { setPlaying(false); });
  audio.addEventListener("ended", function () { advance(true); });

  audio.addEventListener("loadedmetadata", function () {
    durTime.textContent = fmt(audio.duration);
    if (rows[index]) {
      rows[index].querySelector(".tdur").textContent = fmt(audio.duration);
      TRACKS[index].duration = fmt(audio.duration);
    }
    var total = TRACKS.reduce(function (a, t) { return a + parseDur(t.duration); }, 0);
    totalTime.textContent = TRACKS.length + " tracks · " + fmt(total);
    if (metaRuntime) metaRuntime.textContent = fmt(total);
  });

  audio.addEventListener("timeupdate", function () {
    if (!seeking && isFinite(audio.duration) && audio.duration > 0) {
      seek.value = Math.round((audio.currentTime / audio.duration) * 1000);
    }
    curTime.textContent = fmt(audio.currentTime);
  });

  audio.addEventListener("error", function () {
    if (rows[index]) rows[index].querySelector(".tname").dataset.error = "1";
  });

  seek.addEventListener("input", function () {
    seeking = true;
    if (isFinite(audio.duration) && audio.duration > 0) {
      curTime.textContent = fmt((seek.value / 1000) * audio.duration);
    }
  });
  seek.addEventListener("change", function () {
    if (isFinite(audio.duration) && audio.duration > 0) {
      audio.currentTime = (seek.value / 1000) * audio.duration;
    }
    seeking = false;
  });

  var savedVol = parseFloat(localStorage.getItem("wp_volume"));
  audio.volume = isFinite(savedVol) ? savedVol : 0.9;
  vol.value = audio.volume;
  vol.addEventListener("input", function () {
    audio.volume = parseFloat(vol.value);
    try { localStorage.setItem("wp_volume", audio.volume); } catch (e) {}
  });

  document.addEventListener("keydown", function (e) {
    var tag = (e.target && e.target.tagName) || "";
    if (tag === "INPUT" || tag === "TEXTAREA" || tag === "BUTTON") return;
    if (e.code === "Space") { e.preventDefault(); toggle(); }
    else if (e.code === "ArrowRight") { audio.currentTime = Math.min(audio.currentTime + 5, audio.duration || 0); }
    else if (e.code === "ArrowLeft") { audio.currentTime = Math.max(audio.currentTime - 5, 0); }
  });

  if ("mediaSession" in navigator) {
    try {
      navigator.mediaSession.setActionHandler("play", play);
      navigator.mediaSession.setActionHandler("pause", function () { audio.pause(); });
      navigator.mediaSession.setActionHandler("previoustrack", back);
      navigator.mediaSession.setActionHandler("nexttrack", function () { advance(false); });
    } catch (e) { /* handlers unsupported */ }
  }

  var year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();

  var navToggle = document.getElementById("navToggle");
  if (navToggle) navToggle.addEventListener("click", function () {
    document.getElementById("navLinks").classList.toggle("open");
  });

  /* --------------------------------------------------------------- init */
  buildList();
  load(0, false);
  setPlaying(false);
})();
