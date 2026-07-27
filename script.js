/* ============================================================
   PREMIUM BIRTHDAY WEBSITE — VANILLA JS
   Sections: loading screen, scroll progress, ambient background
   canvas (hearts/sparkles/stars/petals), cursor particles,
   locket gift interaction, 4-photo gallery, final heart
   celebration, and a Web-Audio-generated ambient lullaby player.
   ============================================================ */

(() => {
  "use strict";

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ----------------------------------------------------------
     LOADING SCREEN
  ---------------------------------------------------------- */
  window.addEventListener("load", () => {
    const screen = document.getElementById("loading-screen");
    setTimeout(() => screen.classList.add("hide"), 900);
  });

  /* ----------------------------------------------------------
     SCROLL PROGRESS BAR
  ---------------------------------------------------------- */
  const progressFill = document.getElementById("scroll-progress-fill");
  function updateProgress() {
    const scrollTop = window.scrollY;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const pct = max > 0 ? (scrollTop / max) * 100 : 0;
    progressFill.style.width = pct + "%";
  }
  document.addEventListener("scroll", updateProgress, { passive: true });
  updateProgress();

  /* ----------------------------------------------------------
     REVEAL ON SCROLL (fade + slide)
  ---------------------------------------------------------- */
  const revealEls = document.querySelectorAll(".reveal-up");
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
          setTimeout(() => entry.target.classList.add("in-view"), i * 70);
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );
  revealEls.forEach((el) => io.observe(el));
  // Section 1 headline should appear immediately without waiting to scroll
  document.querySelectorAll("#section-1 .reveal-up").forEach((el, i) => {
    setTimeout(() => el.classList.add("in-view"), 300 + i * 150);
  });

  /* ----------------------------------------------------------
     MOUSE GLOW + CURSOR PARTICLES
  ---------------------------------------------------------- */
  const mouseGlow = document.getElementById("mouse-glow");
  const cursorCanvas = document.getElementById("cursor-canvas");
  const cctx = cursorCanvas.getContext("2d");
  let cw, ch;
  function resizeCursorCanvas() {
    cw = cursorCanvas.width = window.innerWidth;
    ch = cursorCanvas.height = window.innerHeight;
  }
  resizeCursorCanvas();
  window.addEventListener("resize", resizeCursorCanvas);

  let sparkleTrail = [];
  let mouseX = -100, mouseY = -100, lastTrailTime = 0;

  window.addEventListener("pointermove", (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    mouseGlow.style.opacity = "1";
    mouseGlow.style.left = mouseX + "px";
    mouseGlow.style.top = mouseY + "px";

    const now = performance.now();
    if (!reducedMotion && now - lastTrailTime > 40) {
      lastTrailTime = now;
      sparkleTrail.push({
        x: mouseX + (Math.random() - 0.5) * 10,
        y: mouseY + (Math.random() - 0.5) * 10,
        life: 1,
        size: Math.random() * 2.5 + 1.5,
      });
      if (sparkleTrail.length > 60) sparkleTrail.shift();
    }
  });
  window.addEventListener("pointerleave", () => (mouseGlow.style.opacity = "0"));

  function drawCursorTrail() {
    cctx.clearRect(0, 0, cw, ch);
    sparkleTrail.forEach((p) => {
      cctx.globalAlpha = Math.max(p.life, 0);
      cctx.fillStyle = "#ffffff";
      cctx.beginPath();
      cctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      cctx.fill();
      p.life -= 0.025;
      p.y -= 0.3;
    });
    sparkleTrail = sparkleTrail.filter((p) => p.life > 0);
    cctx.globalAlpha = 1;
    requestAnimationFrame(drawCursorTrail);
  }
  if (!reducedMotion) requestAnimationFrame(drawCursorTrail);

  /* ----------------------------------------------------------
     AMBIENT BACKGROUND CANVAS
     hearts, sparkling particles, glowing stars, floating petals
     slow, relaxed drifting motion — parallax with scroll
  ---------------------------------------------------------- */
  const bgCanvas = document.getElementById("bg-canvas");
  const bctx = bgCanvas.getContext("2d");
  let bw, bh;
  function resizeBgCanvas() {
    bw = bgCanvas.width = window.innerWidth;
    bh = bgCanvas.height = window.innerHeight * 3.4; // spans full scrollable page loosely
  }
  resizeBgCanvas();
  window.addEventListener("resize", resizeBgCanvas);

  const PALETTE = ["#F3B9C9", "#DD7EA6", "#C9A15E", "#FFFFFF"];
  function rand(min, max) { return Math.random() * (max - min) + min; }

  function makeParticle(kind) {
    return {
      kind,
      x: rand(0, bw),
      y: rand(0, bh),
      size: kind === "star" ? rand(1, 2.6) : rand(8, 22),
      speed: rand(0.08, 0.28),
      drift: rand(-0.25, 0.25),
      angle: rand(0, Math.PI * 2),
      spin: rand(-0.004, 0.004),
      opacity: rand(0.25, 0.75),
      color: PALETTE[Math.floor(Math.random() * PALETTE.length)],
      twinkle: rand(0, Math.PI * 2),
    };
  }

  const particles = [];
  const COUNTS = { heart: 16, sparkle: 40, star: 50, petal: 14 };
  Object.entries(COUNTS).forEach(([kind, count]) => {
    for (let i = 0; i < count; i++) particles.push(makeParticle(kind));
  });

  function drawHeart(ctx, x, y, size, color, angle) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.scale(size / 20, size / 20);
    ctx.beginPath();
    ctx.moveTo(0, 6);
    ctx.bezierCurveTo(-10, -6, -20, 4, 0, 18);
    ctx.bezierCurveTo(20, 4, 10, -6, 0, 6);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.restore();
  }

  function drawPetal(ctx, x, y, size, color, angle) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.beginPath();
    ctx.ellipse(0, 0, size / 2, size / 3.2, 0, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.restore();
  }

  let scrollParallax = 0;
  function renderBackground() {
    bctx.clearRect(0, 0, bw, bh);
    particles.forEach((p) => {
      p.y += p.speed;
      p.x += Math.sin(p.twinkle) * p.drift * 0.4;
      p.angle += p.spin;
      p.twinkle += 0.01;
      if (p.y > bh + 30) { p.y = -30; p.x = rand(0, bw); }

      const flicker = p.kind === "star" ? (Math.sin(p.twinkle) + 1) / 2 : 1;
      bctx.globalAlpha = p.opacity * (0.5 + flicker * 0.5);

      if (p.kind === "heart") drawHeart(bctx, p.x, p.y, p.size, p.color, p.angle);
      else if (p.kind === "petal") drawPetal(bctx, p.x, p.y, p.size, p.color, p.angle);
      else if (p.kind === "star") {
        bctx.beginPath();
        bctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        bctx.fillStyle = "#FFFDF6";
        bctx.shadowBlur = 6;
        bctx.shadowColor = "#FFF3DA";
        bctx.fill();
        bctx.shadowBlur = 0;
      } else {
        bctx.beginPath();
        bctx.arc(p.x, p.y, p.size / 6, 0, Math.PI * 2);
        bctx.fillStyle = p.color;
        bctx.fill();
      }
    });
    bctx.globalAlpha = 1;
    if (!reducedMotion) requestAnimationFrame(renderBackground);
  }
  requestAnimationFrame(renderBackground);

  // subtle parallax: shift canvas vertical offset opposite scroll direction
  document.addEventListener(
    "scroll",
    () => {
      scrollParallax = window.scrollY * 0.15;
      bgCanvas.style.transform = `translateY(${-scrollParallax}px)`;
    },
    { passive: true }
  );

  /* ----------------------------------------------------------
     FX CANVAS — confetti / fireworks / heart bursts
  ---------------------------------------------------------- */
  const fxCanvas = document.getElementById("fx-canvas");
  const fctx = fxCanvas.getContext("2d");
  function resizeFx() {
    fxCanvas.width = window.innerWidth;
    fxCanvas.height = window.innerHeight;
  }
  resizeFx();
  window.addEventListener("resize", resizeFx);

  let fxParticles = [];
  const CONFETTI_COLORS = ["#EFA9C4", "#DD7EA6", "#C9A15E", "#FFFFFF", "#F8D0DE"];

  function burst(x, y, opts = {}) {
    const count = opts.count || 60;
    for (let i = 0; i < count; i++) {
      const angle = rand(0, Math.PI * 2);
      const speed = rand(2, opts.speed || 7);
      fxParticles.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - rand(0, 2),
        gravity: 0.12,
        size: rand(4, 9),
        color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
        life: 1,
        decay: rand(0.008, 0.016),
        shape: opts.shape || (Math.random() > 0.5 ? "heart" : "circle"),
        rot: rand(0, Math.PI * 2),
        rotSpeed: rand(-0.1, 0.1),
      });
    }
  }

  function renderFx() {
    fctx.clearRect(0, 0, fxCanvas.width, fxCanvas.height);
    fxParticles.forEach((p) => {
      p.vy += p.gravity * 0.15;
      p.x += p.vx;
      p.y += p.vy;
      p.rot += p.rotSpeed;
      p.life -= p.decay;
      fctx.save();
      fctx.globalAlpha = Math.max(p.life, 0);
      if (p.shape === "heart") {
        drawHeart(fctx, p.x, p.y, p.size, p.color, p.rot);
      } else {
        fctx.beginPath();
        fctx.translate(p.x, p.y);
        fctx.rotate(p.rot);
        fctx.fillStyle = p.color;
        fctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
      }
      fctx.restore();
    });
    fxParticles = fxParticles.filter((p) => p.life > 0);
    requestAnimationFrame(renderFx);
  }
  requestAnimationFrame(renderFx);

  function fireworkShow(cx, cy) {
    let shots = 0;
    const interval = setInterval(() => {
      const x = cx + rand(-window.innerWidth * 0.25, window.innerWidth * 0.25);
      const y = cy + rand(-window.innerHeight * 0.15, window.innerHeight * 0.1);
      burst(x, y, { count: 45, speed: 6 });
      shots++;
      if (shots >= 5) clearInterval(interval);
    }, 220);
  }

  /* ----------------------------------------------------------
     RIPPLE EFFECT FOR PREMIUM BUTTONS
  ---------------------------------------------------------- */
  function attachRipple(btn) {
    btn.addEventListener("click", (e) => {
      const rect = btn.getBoundingClientRect();
      const ripple = document.createElement("span");
      const size = Math.max(rect.width, rect.height);
      ripple.className = "ripple";
      ripple.style.width = ripple.style.height = size + "px";
      ripple.style.left = e.clientX - rect.left - size / 2 + "px";
      ripple.style.top = e.clientY - rect.top - size / 2 + "px";
      btn.appendChild(ripple);
      setTimeout(() => ripple.remove(), 650);
    });
  }
  document.querySelectorAll(".btn-premium").forEach(attachRipple);

  /* ----------------------------------------------------------
     SECTION 1 — LOCKET GIFT INTERACTION
  ---------------------------------------------------------- */
  const locket = document.getElementById("locket");
  const giftHint = document.getElementById("gift-hint");
  const openSurpriseBtn = document.getElementById("open-surprise-btn");

  let lockOpened = false;
  locket.addEventListener("click", () => {
    if (lockOpened) return;
    lockOpened = true;
    locket.classList.add("opened");
    giftHint.classList.add("hidden");

    const rect = locket.getBoundingClientRect();
    burst(rect.left + rect.width / 2, rect.top + rect.height / 2, { count: 70, speed: 8 });

    setTimeout(() => {
      openSurpriseBtn.classList.remove("hidden");
      openSurpriseBtn.style.animation = "fadeInSlow .8s ease forwards";
    }, 500);
  });

  openSurpriseBtn.addEventListener("click", () => {
    document.getElementById("section-2").scrollIntoView({ behavior: "smooth" });
  });

  /* ----------------------------------------------------------
     SECTION 3 — FINAL HEART INTERACTION
  ---------------------------------------------------------- */
  const finalHeart = document.getElementById("final-heart");
  const finalHint = document.getElementById("final-hint");
  const finalMessage = document.getElementById("final-message");
  let finalClicked = false;

  finalHeart.addEventListener("click", () => {
    if (finalClicked) return;
    finalClicked = true;
    finalHeart.classList.add("clicked");
    finalHint.classList.add("hidden");

    const rect = finalHeart.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    burst(cx, cy, { count: 80, speed: 9 });
    fireworkShow(cx, cy);

    document.body.style.transition = "filter 1.2s ease";
    document.body.style.filter = "brightness(1.08)";
    setTimeout(() => (document.body.style.filter = "brightness(1)"), 1600);

    setTimeout(() => finalMessage.classList.remove("hidden"), 500);
  });

  /* ----------------------------------------------------------
     AMBIENT MUSIC — your own song file
     ============================================================
     GANTI DUA BARIS DI BAWAH INI dengan lagu kamu sendiri:
     1. Taruh file musik (mp3/ogg/wav) di folder assets/music/
     2. Ubah SONG_SRC ke nama file itu
     3. Ubah SONG_TITLE ke judul yang mau ditampilkan di pemutar
     Tidak perlu mengubah kode lain — semuanya otomatis mengikuti.
  ============================================================ */
  const SONG_SRC   = "assets/music/Musik1.mp3";
  const SONG_TITLE = "Happy Birthday-Abigael";

  const bgAudio = document.getElementById("bg-audio");
  const musicTitleEl = document.getElementById("music-title");
  bgAudio.src = SONG_SRC;
  musicTitleEl.textContent = SONG_TITLE;

  let isPlaying = false;
  let isMuted = false;
  let songMissing = false;

  const musicToggle = document.getElementById("music-toggle");
  const iconPlay = document.getElementById("icon-play");
  const iconPause = document.getElementById("icon-pause");
  const muteToggle = document.getElementById("mute-toggle");
  const iconVolOn = document.getElementById("icon-vol-on");
  const iconVolOff = document.getElementById("icon-vol-off");
  const volumeSlider = document.getElementById("volume-slider");
  const equalizer = document.getElementById("equalizer");

  bgAudio.volume = volumeSlider.value / 100;

  // If the song file hasn't been added yet, fail quietly instead of breaking the page.
  bgAudio.addEventListener("error", () => {
    songMissing = true;
    musicTitleEl.textContent = "add your song in assets/music";
  });

  function startEqualizer() { equalizer.classList.add("playing"); }
  function stopEqualizer() { equalizer.classList.remove("playing"); }

  function playMusic() {
    if (songMissing) return;
    const playPromise = bgAudio.play();
    if (playPromise && playPromise.catch) {
      playPromise
        .then(() => {
          isPlaying = true;
          iconPlay.style.display = "none";
          iconPause.style.display = "block";
          startEqualizer();
        })
        .catch(() => {
          // browser blocked autoplay until a real user gesture — that's fine,
          // the play button still works normally on click/tap.
        });
    }
  }

  function pauseMusic() {
    bgAudio.pause();
    isPlaying = false;
    iconPlay.style.display = "block";
    iconPause.style.display = "none";
    stopEqualizer();
  }

  musicToggle.addEventListener("click", () => {
    if (isPlaying) pauseMusic();
    else playMusic();
  });

  muteToggle.addEventListener("click", () => {
    isMuted = !isMuted;
    bgAudio.muted = isMuted;
    iconVolOn.style.display = isMuted ? "none" : "block";
    iconVolOff.style.display = isMuted ? "block" : "none";
  });

  volumeSlider.addEventListener("input", () => {
    bgAudio.volume = volumeSlider.value / 100;
    if (bgAudio.volume > 0 && isMuted) muteToggle.click();
  });

  // Autoplay after first user interaction anywhere on the page (browser policy safe)
  let hasAutoplayed = false;
  function tryAutoplay() {
    if (hasAutoplayed) return;
    hasAutoplayed = true;
    playMusic();
    window.removeEventListener("click", tryAutoplay);
    window.removeEventListener("touchstart", tryAutoplay);
    window.removeEventListener("keydown", tryAutoplay);
  }
  window.addEventListener("click", tryAutoplay, { once: true });
  window.addEventListener("touchstart", tryAutoplay, { once: true });
  window.addEventListener("keydown", tryAutoplay, { once: true });

})();
