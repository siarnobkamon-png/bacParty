/* ============================================================
   BAC PARTY 2026 - MAIN SCRIPT
   Loading screen, particles, countdown, music playlist,
   confetti + graduation caps, fireworks, interactions
============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  /* ---------- FESTIVAL PALETTE (used across effects) ---------- */
  const PALETTE = ['#3b82f6', '#ec4899', '#e879f9', '#22d3ee', '#ffd700', '#ffed4e'];

  /* ============================================================
     1. LOADING SCREEN
  ============================================================ */
  const loadingScreen = document.getElementById('loading-screen');
  const loaderPercent = document.getElementById('loaderPercent');
  const loaderPercentBar = document.getElementById('loaderPercentBar');

  let progress = 0;
  const loaderInterval = setInterval(() => {
    progress += Math.random() * 18 + 4;
    if (progress >= 100) {
      progress = 100;
      clearInterval(loaderInterval);
      setTimeout(() => {
        loadingScreen.style.transition = 'opacity 0.8s ease, visibility 0.8s ease';
        loadingScreen.style.opacity = '0';
        loadingScreen.style.visibility = 'hidden';
        document.body.style.overflow = '';
      }, 400);
    }
    if (loaderPercent) loaderPercent.textContent = Math.floor(progress) + '%';
    if (loaderPercentBar) loaderPercentBar.style.width = progress + '%';
  }, 180);

  /* ============================================================
     2. AOS INIT
  ============================================================ */
  if (window.AOS) {
    AOS.init({ duration: 900, once: true, offset: 60, easing: 'ease-out-cubic' });
  }

  /* ============================================================
     3. PARTICLES.JS BACKGROUNDS (festival blue/pink/gold)
  ============================================================ */
  const particleTargets = ['particles-loader', 'particles-hero', 'particles-details', 'particles-countdown', 'particles-location'];
  if (window.particlesJS) {
    particleTargets.forEach((id) => {
      if (!document.getElementById(id)) return;
      particlesJS(id, {
        particles: {
          number: { value: 45, density: { enable: true, value_area: 900 } },
          color: { value: PALETTE },
          shape: { type: 'circle' },
          opacity: { value: 0.5, random: true },
          size: { value: 3, random: true },
          line_linked: { enable: false },
          move: { enable: true, speed: 1, direction: 'top', random: true, out_mode: 'out' }
        },
        interactivity: { events: { onhover: { enable: false }, onclick: { enable: false } } },
        retina_detect: true
      });
    });
  }

  /* ============================================================
     4. COUNTDOWN TIMER -> July 17, 2026, 8:30 PM
  ============================================================ */
  const countdownTarget = new Date('2026-07-17T20:30:00');
  const cdDays = document.getElementById('cdDays');
  const cdHours = document.getElementById('cdHours');
  const cdMinutes = document.getElementById('cdMinutes');
  const cdSeconds = document.getElementById('cdSeconds');

  function updateCountdown() {
    const now = new Date();
    let diff = countdownTarget - now;
    if (diff < 0) diff = 0;

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    const seconds = Math.floor((diff / 1000) % 60);

    if (cdDays) cdDays.textContent = String(days).padStart(2, '0');
    if (cdHours) cdHours.textContent = String(hours).padStart(2, '0');
    if (cdMinutes) cdMinutes.textContent = String(minutes).padStart(2, '0');
    if (cdSeconds) cdSeconds.textContent = String(seconds).padStart(2, '0');
  }
  updateCountdown();
  setInterval(updateCountdown, 1000);

  /* ============================================================
     5. MUSIC CONTROLLER — PEPAS / FESTIVAL VIBES PLAYLIST
     Drop matching audio files into assets/music/ (or edit
     the paths below) — the player is fully wired to switch,
     loop the playlist, and animate the visualizer live.
  ============================================================ */
  const playlist = [
    { name: 'PEPAS', src: 'assets/music/pepas.mp3.mp3'},
    { name: 'FESTIVAL VIBES', src: 'assets/music/festival-vibes.mp3' }
  ];
  let trackIndex = 0;
  let autoSkipTried = false; // guards against infinite skip loop if all files are missing

  const bgMusic = document.getElementById('bgMusic');
  const musicToggle = document.getElementById('musicToggle');
  const musicIcon = document.getElementById('musicIcon');
  const musicPrev = document.getElementById('musicPrev');
  const musicNext = document.getElementById('musicNext');
  const trackName = document.getElementById('trackName');
  const volumeSlider = document.getElementById('volumeSlider');
  const visualizer = document.querySelector('.music-visualizer');
  const musicController = document.getElementById('music-controller');

  function setPlayingUI(isPlaying) {
    if (musicToggle) musicToggle.classList.toggle('playing', isPlaying);
    if (visualizer) visualizer.classList.toggle('active', isPlaying);
    if (musicIcon) {
      musicIcon.classList.toggle('fa-music', !isPlaying);
      musicIcon.classList.toggle('fa-pause', isPlaying);
    }
  }

  function showTrackName(text) {
    if (trackName) trackName.textContent = text;
  }

  function loadTrack(index, autoplay) {
    trackIndex = (index + playlist.length) % playlist.length;
    const track = playlist[trackIndex];
    if (!bgMusic) return;
    autoSkipTried = false;
    if (musicController) musicController.classList.remove('music-error');
    bgMusic.src = track.src;
    bgMusic.load(); // explicit load — more reliable on mobile Safari when swapping tracks
    showTrackName(track.name);
    if (autoplay) attemptPlay();
  }

  function attemptPlay() {
    if (!bgMusic) return;
    const playPromise = bgMusic.play();
    if (playPromise && typeof playPromise.then === 'function') {
      playPromise.then(() => setPlayingUI(true)).catch(() => {
        // Autoplay blocked or file missing — reset UI, user can tap again
        setPlayingUI(false);
      });
    }
  }

  if (bgMusic) {
    bgMusic.volume = volumeSlider ? volumeSlider.value / 100 : 0.5;
    bgMusic.preload = 'auto';
    // Helps inline playback on iOS if a future version ever swaps in <video>-like elements
    bgMusic.setAttribute('playsinline', '');

    loadTrack(0, false);

    // Try to autoplay as soon as the page loads. Most browsers block audio
    // with sound until the user has interacted with the page at least once,
    // so we also arm a one-time fallback that starts playback on the very
    // first click/tap/keypress if the initial attempt was blocked.
    attemptPlay();

    const startOnFirstInteraction = () => {
      if (bgMusic.paused) attemptPlay();
      ['click', 'touchstart', 'keydown'].forEach(evt =>
        window.removeEventListener(evt, startOnFirstInteraction)
      );
    };
    ['click', 'touchstart', 'keydown'].forEach(evt =>
      window.addEventListener(evt, startOnFirstInteraction, { once: true })
    );

    bgMusic.addEventListener('ended', () => loadTrack(trackIndex + 1, true));

    // If a track file is missing/broken, skip to the next one automatically (once)
    bgMusic.addEventListener('error', () => {
      setPlayingUI(false);
      if (musicController) musicController.classList.add('music-error');
      showTrackName('TAP TO RETRY');
      if (!autoSkipTried && playlist.length > 1) {
        autoSkipTried = true;
        loadTrack(trackIndex + 1, false);
      }
    });

    if (musicToggle) {
      musicToggle.addEventListener('click', () => {
        if (bgMusic.paused) {
          attemptPlay();
        } else {
          bgMusic.pause();
          setPlayingUI(false);
        }
      });
    }
    bgMusic.addEventListener('play', () => setPlayingUI(true));
    bgMusic.addEventListener('pause', () => setPlayingUI(false));

    if (musicNext) {
      musicNext.addEventListener('click', (e) => {
        e.stopPropagation();
        loadTrack(trackIndex + 1, !bgMusic.paused);
      });
    }
    if (musicPrev) {
      musicPrev.addEventListener('click', (e) => {
        e.stopPropagation();
        loadTrack(trackIndex - 1, !bgMusic.paused);
      });
    }

    if (volumeSlider) {
      const applyVolume = (e) => { bgMusic.volume = e.target.value / 100; };
      volumeSlider.addEventListener('input', applyVolume);
      volumeSlider.addEventListener('change', applyVolume);
    }
  }

  /* ============================================================
     6. CONFETTI + GRADUATION CAPS (continuous festive layer)
  ============================================================ */
  const confettiCanvas = document.getElementById('confetti-canvas');
  if (confettiCanvas) {
    const ctx = confettiCanvas.getContext('2d');
    let cw, ch;
    function resizeConfetti() {
      cw = confettiCanvas.width = window.innerWidth;
      ch = confettiCanvas.height = window.innerHeight;
    }
    resizeConfetti();
    window.addEventListener('resize', resizeConfetti);

    const PIECE_COUNT = window.innerWidth < 768 ? 26 : 45;
    const CAP_RATIO = 0.22; // ~22% of pieces are graduation caps

    function makePiece() {
      const isCap = Math.random() < CAP_RATIO;
      return {
        x: Math.random() * cw,
        y: Math.random() * -ch,
        size: isCap ? 16 + Math.random() * 10 : 6 + Math.random() * 6,
        speedY: 1 + Math.random() * 2,
        speedX: (Math.random() - 0.5) * 1.5,
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 6,
        color: PALETTE[Math.floor(Math.random() * PALETTE.length)],
        isCap,
        sway: Math.random() * Math.PI * 2
      };
    }

    const pieces = Array.from({ length: PIECE_COUNT }, makePiece);

    function drawCap(p) {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate((p.rotation * Math.PI) / 180);
      const s = p.size;
      // cap board (square)
      ctx.fillStyle = '#0d1445';
      ctx.strokeStyle = p.color;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(-s, 0);
      ctx.lineTo(0, -s * 0.55);
      ctx.lineTo(s, 0);
      ctx.lineTo(0, s * 0.55);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      // base/head circle
      ctx.beginPath();
      ctx.fillStyle = '#0d1445';
      ctx.arc(0, s * 0.15, s * 0.35, 0, Math.PI * 2);
      ctx.fill();
      // tassel
      ctx.beginPath();
      ctx.strokeStyle = p.color;
      ctx.lineWidth = 1.2;
      ctx.moveTo(0, -s * 0.1);
      ctx.lineTo(s * 0.4, s * 0.5);
      ctx.stroke();
      ctx.beginPath();
      ctx.fillStyle = p.color;
      ctx.arc(s * 0.4, s * 0.55, 1.6, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    function drawConfetti(p) {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate((p.rotation * Math.PI) / 180);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
      ctx.restore();
    }

    function animateConfetti() {
      ctx.clearRect(0, 0, cw, ch);
      pieces.forEach((p) => {
        p.y += p.speedY;
        p.sway += 0.02;
        p.x += p.speedX + Math.sin(p.sway) * 0.6;
        p.rotation += p.rotationSpeed;

        if (p.y > ch + 30) {
          Object.assign(p, makePiece(), { y: -30 });
        }
        if (p.x > cw + 30) p.x = -30;
        if (p.x < -30) p.x = cw + 30;

        if (p.isCap) drawCap(p); else drawConfetti(p);
      });
      requestAnimationFrame(animateConfetti);
    }
    animateConfetti();
  }

  /* ============================================================
     7. FIREWORKS — bursts inside the final section (more of them!)
  ============================================================ */
  const fireworksCanvas = document.getElementById('fireworks-canvas');
  let fireworksInterval = null;

  if (fireworksCanvas) {
    const fctx = fireworksCanvas.getContext('2d');
    let fw, fh;
    function resizeFireworks() {
      const rect = fireworksCanvas.parentElement.getBoundingClientRect();
      fw = fireworksCanvas.width = fireworksCanvas.offsetWidth || window.innerWidth;
      fh = fireworksCanvas.height = fireworksCanvas.offsetHeight || window.innerHeight;
    }
    resizeFireworks();
    window.addEventListener('resize', resizeFireworks);

    let fireworkParticles = [];

    function launchFirework(x, y) {
      const color = PALETTE[Math.floor(Math.random() * PALETTE.length)];
      const count = 45;
      for (let i = 0; i < count; i++) {
        const angle = (Math.PI * 2 * i) / count;
        const speed = 2 + Math.random() * 3;
        fireworkParticles.push({
          x, y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          alpha: 1,
          color,
          size: 2 + Math.random() * 2
        });
      }
    }

    function animateFireworks() {
      fctx.clearRect(0, 0, fw, fh);
      fireworkParticles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.04; // gravity
        p.alpha -= 0.015;
        fctx.globalAlpha = Math.max(p.alpha, 0);
        fctx.fillStyle = p.color;
        fctx.beginPath();
        fctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        fctx.fill();
      });
      fctx.globalAlpha = 1;
      fireworkParticles = fireworkParticles.filter((p) => p.alpha > 0);
      requestAnimationFrame(animateFireworks);
    }
    animateFireworks();

    function randomBurst() {
      resizeFireworks();
      const x = fw * (0.15 + Math.random() * 0.7);
      const y = fh * (0.15 + Math.random() * 0.5);
      launchFirework(x, y);
    }

    // Trigger frequent fireworks whenever the final section is on screen
    const finalSection = document.getElementById('reserve');
    if (finalSection && 'IntersectionObserver' in window) {
      const obs = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            if (!fireworksInterval) {
              randomBurst();
              fireworksInterval = setInterval(randomBurst, 550);
            }
          } else if (fireworksInterval) {
            clearInterval(fireworksInterval);
            fireworksInterval = null;
          }
        });
      }, { threshold: 0.25 });
      obs.observe(finalSection);
    }
  }

  /* ============================================================
     8. MID-PAGE WOW TRANSITION (triggers once, before countdown)
  ============================================================ */
  const wowTransition = document.getElementById('wow-transition');
  const countdownSection = document.getElementById('countdown');
  if (wowTransition && countdownSection && 'IntersectionObserver' in window) {
    let wowFired = false;
    const wowObs = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !wowFired) {
          wowFired = true;
          wowTransition.classList.add('active');
          if (window.gsap) {
            const tl = gsap.timeline({
              onComplete: () => wowTransition.classList.remove('active')
            });
            tl.to('#wow-transition .wow-flash', { opacity: 0.9, duration: 0.15 })
              .to('#wow-transition .wow-flash', { opacity: 0, duration: 0.5 })
              .to('#wow-transition .smoke-burst', { opacity: 1, duration: 0.4 }, '<')
              .to('#wow-transition .wb-beam', { opacity: 0.8, duration: 0.3, stagger: 0.03 }, '<')
              .to('#wow-transition .smoke-burst', { opacity: 0, duration: 0.8 })
              .to('#wow-transition .wb-beam', { opacity: 0, duration: 0.6 }, '<');
          } else {
            setTimeout(() => wowTransition.classList.remove('active'), 1200);
          }
          wowObs.disconnect();
        }
      });
    }, { threshold: 0.4 });
    wowObs.observe(countdownSection);
  }

  /* ============================================================
     9. FINAL BADGE — auto burst (particles + flash) once in view
  ============================================================ */
  const finalBadge = document.getElementById('finalBadge');
  const flashOverlay = document.getElementById('flashOverlay');
  const cameraShake = document.getElementById('cameraShake');
  const ctaParticles = document.getElementById('ctaParticles');

  function fireBadgeBurst() {
    if (flashOverlay) {
      flashOverlay.style.transition = 'opacity 0.1s ease';
      flashOverlay.style.opacity = '0.8';
      setTimeout(() => {
        flashOverlay.style.transition = 'opacity 0.6s ease';
        flashOverlay.style.opacity = '0';
      }, 100);
    }
    if (cameraShake) {
      cameraShake.classList.add('shake');
      setTimeout(() => cameraShake.classList.remove('shake'), 500);
    }
    if (ctaParticles) {
      for (let i = 0; i < 18; i++) {
        const dot = document.createElement('span');
        const color = PALETTE[Math.floor(Math.random() * PALETTE.length)];
        const angle = Math.random() * Math.PI * 2;
        const dist = 40 + Math.random() * 80;
        dot.style.cssText = `
          position:absolute; left:50%; top:50%; width:6px; height:6px;
          border-radius:50%; background:${color}; pointer-events:none;
          transform: translate(-50%, -50%);
          transition: transform 0.7s cubic-bezier(.2,.8,.3,1), opacity 0.7s ease;
          opacity: 1; z-index: 5;`;
        ctaParticles.appendChild(dot);
        requestAnimationFrame(() => {
          dot.style.transform = `translate(${Math.cos(angle) * dist - 3}px, ${Math.sin(angle) * dist - 3}px)`;
          dot.style.opacity = '0';
        });
        setTimeout(() => dot.remove(), 750);
      }
    }
  }

  if (finalBadge && 'IntersectionObserver' in window) {
    let badgeFired = false;
    const badgeObs = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !badgeFired) {
          badgeFired = true;
          setTimeout(fireBadgeBurst, 500);
        }
      });
    }, { threshold: 0.5 });
    badgeObs.observe(finalBadge);
  }

  /* ============================================================
     10. THREE.JS AMBIENT PARTICLE FIELD (subtle depth backdrop)
  ============================================================ */
  const threeCanvas = document.getElementById('three-canvas');
  if (threeCanvas && window.THREE) {
    try {
      const renderer = new THREE.WebGLRenderer({ canvas: threeCanvas, alpha: true, antialias: true });
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
      camera.position.z = 50;

      const starColors = [0x3b82f6, 0xec4899, 0xffd700, 0x22d3ee];
      const starCount = window.innerWidth < 768 ? 250 : 500;
      const geometry = new THREE.BufferGeometry();
      const positions = new Float32Array(starCount * 3);
      for (let i = 0; i < starCount; i++) {
        positions[i * 3] = (Math.random() - 0.5) * 200;
        positions[i * 3 + 1] = (Math.random() - 0.5) * 200;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 200;
      }
      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

      const material = new THREE.PointsMaterial({
        size: 0.6,
        color: starColors[Math.floor(Math.random() * starColors.length)],
        transparent: true,
        opacity: 0.7
      });
      const points = new THREE.Points(geometry, material);
      scene.add(points);

      function animateThree() {
        points.rotation.y += 0.0006;
        points.rotation.x += 0.0002;
        renderer.render(scene, camera);
        requestAnimationFrame(animateThree);
      }
      animateThree();

      window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
      });
    } catch (e) {
      console.warn('Three.js background skipped:', e);
    }
  }

  /* ============================================================
     11. SMOOTH ANCHOR SCROLL
  ============================================================ */
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (e) => {
      const targetId = link.getAttribute('href');
      if (targetId.length > 1) {
        const target = document.querySelector(targetId);
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    });
  });

});
