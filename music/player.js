/* W.P.S. catalog player — vanilla JS, no dependencies.
   Track data verified from legacy.reverbnation.com/wps1 */
(function () {
  "use strict";

  var TRACKS = [
    { title: "Red Ranunculus",                    src: "audio/01-35027355.mp3", art: "art/35027355.jpg" },
    { title: "Strelitzia Reginae",                src: "audio/02-35027357.mp3", art: "art/35027357.jpg" },
    { title: "Anemone — Daughter of the Winds",   src: "audio/03-35027363.mp3", art: "art/35027363.jpg" },
    { title: "Castilleja Coccinea and Lupinus Texensis", src: "audio/04-35027367.mp3", art: "art/35027367.jpg" },
    { title: "Papaveraceae",                      src: "audio/05-35027370.mp3", art: "art/35027370.jpg" },
    { title: "Hibiscus Rosa-Sinensis",            src: "audio/06-35027372.mp3", art: "art/35027372.jpg" },
    { title: "Pilea Cavernicola",                 src: "audio/07-35027376.mp3", art: "art/35027376.jpg" },
    { title: "Random Assorted Flowers",           src: "audio/08-35027382.mp3", art: "art/35027382.jpg" }
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
  var coverImg   = document.getElementById("coverImg");
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
          '<span class="tmeta">William Paul Sindle</span>' +
        "</span>" +
        '<span class="tdur">—</span>';
      li.addEventListener("click", function () {
        if (i === index) { toggle(); } else { load(i, true); }
      });
      playlist.appendChild(li);
      rows.push(li);
    });

    totalTime.textContent = TRACKS.length + " tracks";
  }

  /* -------------------------------------------------------------- state */
  function markActive() {
    rows.forEach(function (row, i) {
      row.classList.toggle("active", i === index);
      row.classList.toggle("playing", i === index && !audio.paused);
    });
    var t = TRACKS[index];
    npTitle.textContent = t.title;
    if (coverImg) coverImg.src = t.art;
    if (coverCount) coverCount.textContent = pad(index + 1) + " / " + pad(TRACKS.length);
    document.title = t.title + " · William Paul Sindle (W.P.S.)";
  }

  function fillTimes() {
    if (!isFinite(audio.duration)) return;
    durTime.textContent = fmt(audio.duration);
    var total = 0, known = true;
    var row = rows[index];
    if (row) row.querySelector(".tdur").textContent = fmt(audio.duration);
    rows.forEach(function (r) {
      var txt = r.querySelector(".tdur").textContent;
      if (txt === "—") known = false;
      else {
        var p = txt.split(":");
        total += (parseInt(p[0], 10) || 0) * 60 + (parseInt(p[1], 10) || 0);
      }
    });
    if (known) {
      totalTime.textContent = TRACKS.length + " tracks · " + fmt(total);
      if (metaRuntime) metaRuntime.textContent = fmt(total);
    } else if (metaRuntime) {
      metaRuntime.textContent = fmt(total) + " (loading…)";
    }
  }

  function load(i, play) {
    index = (i + TRACKS.length) % TRACKS.length;
    audio.src = TRACKS[index].src;
    markActive();
    if (play) audio.play().catch(function () {});
  }

  function toggle() {
    if (!audio.src) { load(0, true); return; }
    if (audio.paused) audio.play().catch(function () {});
    else audio.pause();
  }

  function next(auto) {
    if (shuffle) {
      var n;
      do { n = Math.floor(Math.random() * TRACKS.length); } while (n === index && TRACKS.length > 1);
      load(n, true);
      return;
    }
    if (auto && repeatMode === "one") { audio.currentTime = 0; audio.play(); return; }
    load(index + 1, true);
  }

  function prev() {
    if (audio.currentTime > 3) { audio.currentTime = 0; return; }
    load(index - 1, true);
  }

  /* ------------------------------------------------------------- events */
  playBtn.addEventListener("click", toggle);
  nextBtn.addEventListener("click", function () { next(false); });
  prevBtn.addEventListener("click", prev);

  shuffleBtn.addEventListener("click", function () {
    shuffle = !shuffle;
    shuffleBtn.classList.toggle("on", shuffle);
  });

  repeatBtn.addEventListener("click", function () {
    repeatMode = repeatMode === "all" ? "one" : repeatMode === "one" ? "off" : "all";
    repeatBtn.classList.toggle("on", repeatMode !== "off");
    repeatBtn.title = "Repeat: " + repeatMode;
  });

  audio.addEventListener("play", function () { playBtn.innerHTML = ICON_PAUSE; playBtn.classList.add("playing"); markActive(); });
  audio.addEventListener("pause", function () { playBtn.innerHTML = ICON_PLAY; playBtn.classList.remove("playing"); markActive(); });
  audio.addEventListener("ended", function () { next(true); });
  audio.addEventListener("loadedmetadata", fillTimes);
  audio.addEventListener("timeupdate", function () {
    if (seeking || !isFinite(audio.duration)) return;
    seek.value = Math.round((audio.currentTime / audio.duration) * 1000);
    curTime.textContent = fmt(audio.currentTime);
  });

  seek.addEventListener("input", function () {
    seeking = true;
    if (isFinite(audio.duration)) curTime.textContent = fmt((this.value / 1000) * audio.duration);
  });
  seek.addEventListener("change", function () {
    if (isFinite(audio.duration)) audio.currentTime = (this.value / 1000) * audio.duration;
    seeking = false;
  });

  vol.addEventListener("input", function () { audio.volume = parseFloat(this.value); });
  audio.volume = parseFloat(vol.value);

  document.addEventListener("keydown", function (e) {
    if (e.target.tagName === "INPUT") return;
    if (e.code === "Space") { e.preventDefault(); toggle(); }
    else if (e.code === "ArrowRight" && e.shiftKey) next(false);
    else if (e.code === "ArrowLeft" && e.shiftKey) prev();
  });

  buildList();
  playBtn.innerHTML = ICON_PLAY;
  load(0, false);
})();
