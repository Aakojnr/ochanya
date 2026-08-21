/**
 * OCHANYA — CINEMATIC LOVE LETTER
 * Open button → music starts → slideshow → scroll experience
 */

// ==========================================================================
// CONFIGURATION — Update your photos and captions here
// ==========================================================================
const PHOTOS = [
  { src: "IMG-20231116-WA0115.jpeg", caption: "" },
  { src: "IMG_9940.jpeg", caption: "" },
  { src: "IMG_3102.jpeg", caption: "" },
  { src: "IMG_9949.jpeg", caption: "" },
  { src: "IMG_4891.jpeg", caption: "" },
  { src: "IMG_3927.jpeg", caption: "" },
];

const YOUTUBE_VIDEO_ID = "NYgdDCRYnN8";
const SLIDESHOW_INTERVAL = 4000; // 4 seconds per photo

// ==========================================================================
// INIT
// ==========================================================================
document.addEventListener("DOMContentLoaded", () => {
  initOpening();
  buildSlideshow();
  initScrollAnimations();
  initLightbox();
  initMusicToggle();
});

// ==========================================================================
// OPENING — Button triggers music + experience
// ==========================================================================
function initOpening() {
  const openBtn = document.getElementById("open-btn");
  const landing = document.getElementById("opening");
  const experience = document.getElementById("experience");
  const musicIndicator = document.getElementById("music-indicator");

  if (!openBtn) return;

  openBtn.addEventListener("click", () => {
    // 1. Fade out landing
    landing.classList.add("fade-out");

    // 2. Start music on this user interaction (browser allows it)
    startMusic();

    setTimeout(() => {
      // 3. Hide landing, reveal experience
      landing.style.display = "none";
      experience.classList.remove("hidden");
      void experience.offsetWidth; // Force repaint
      experience.classList.add("visible");

      // 4. Show music indicator
      if (musicIndicator) {
        musicIndicator.classList.remove("hidden");
        musicIndicator.classList.add("visible");
      }

      // 5. Reset scroll position
      window.scrollTo({ top: 0, behavior: "instant" });

      // 6. Re-trigger scroll animations
      setTimeout(refreshScrollObserver, 200);

      // 7. Start slideshow auto-play
      startSlideshow();
    }, 900);
  });
}

// ==========================================================================
// SLIDESHOW — Auto-playing crossfade gallery
// ==========================================================================
let currentSlide = 0;
let slideshowTimer = null;

function buildSlideshow() {
  const track = document.getElementById("slideshow-track");
  const dotsContainer = document.getElementById("slideshow-dots");
  if (!track || !dotsContainer) return;

  track.innerHTML = "";
  dotsContainer.innerHTML = "";

  PHOTOS.forEach((photo, i) => {
    // Create slide
    const slide = document.createElement("div");
    slide.className = "slide" + (i === 0 ? " active" : "");
    slide.dataset.index = i;

    const img = document.createElement("img");
    img.src = photo.src;
    img.alt = photo.caption || `Memory ${i + 1}`;
    img.loading = i === 0 ? "eager" : "lazy";

    img.onerror = () => {
      slide.style.background = "linear-gradient(145deg, #1c0f12, #14090b)";
      slide.innerHTML = `<div style="display:flex;align-items:center;justify-content:center;width:100%;height:100%;color:#6b5553;font-size:0.85rem;letter-spacing:0.1em;">Memory ${i + 1}</div>`;
    };

    // Tap to open lightbox
    slide.addEventListener("click", () => {
      if (img.complete && img.naturalHeight !== 0) {
        openLightbox(photo.src, photo.caption);
      }
    });

    slide.appendChild(img);
    track.appendChild(slide);

    // Create dot
    const dot = document.createElement("button");
    dot.className = "slideshow-dot" + (i === 0 ? " active" : "");
    dot.setAttribute("aria-label", `Photo ${i + 1}`);
    dot.addEventListener("click", (e) => {
      e.stopPropagation();
      goToSlide(i);
      resetSlideshowTimer();
    });
    dotsContainer.appendChild(dot);
  });

  // Arrow navigation
  const prevBtn = document.getElementById("slide-prev");
  const nextBtn = document.getElementById("slide-next");

  if (prevBtn) {
    prevBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      goToSlide(currentSlide - 1);
      resetSlideshowTimer();
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      goToSlide(currentSlide + 1);
      resetSlideshowTimer();
    });
  }

  // Touch swipe on slideshow
  let touchStartX = 0;
  const container = document.getElementById("slideshow");
  if (container) {
    container.addEventListener("touchstart", (e) => {
      touchStartX = e.touches[0].clientX;
    }, { passive: true });

    container.addEventListener("touchend", (e) => {
      const touchEndX = e.changedTouches[0].clientX;
      const diff = touchStartX - touchEndX;
      if (Math.abs(diff) > 50) {
        if (diff > 0) {
          goToSlide(currentSlide + 1);
        } else {
          goToSlide(currentSlide - 1);
        }
        resetSlideshowTimer();
      }
    }, { passive: true });
  }

  updateCaption();
}

function goToSlide(index) {
  const slides = document.querySelectorAll(".slide");
  const dots = document.querySelectorAll(".slideshow-dot");
  if (slides.length === 0) return;

  // Wrap around
  if (index < 0) index = slides.length - 1;
  if (index >= slides.length) index = 0;

  slides.forEach((s) => s.classList.remove("active"));
  dots.forEach((d) => d.classList.remove("active"));

  slides[index].classList.add("active");
  dots[index].classList.add("active");
  currentSlide = index;

  updateCaption();
}

function updateCaption() {
  const captionEl = document.getElementById("slideshow-caption");
  if (captionEl && PHOTOS[currentSlide]) {
    captionEl.textContent = PHOTOS[currentSlide].caption || "";
  }
}

function startSlideshow() {
  if (slideshowTimer) clearInterval(slideshowTimer);
  slideshowTimer = setInterval(() => {
    goToSlide(currentSlide + 1);
  }, SLIDESHOW_INTERVAL);
}

function resetSlideshowTimer() {
  if (slideshowTimer) clearInterval(slideshowTimer);
  slideshowTimer = setInterval(() => {
    goToSlide(currentSlide + 1);
  }, SLIDESHOW_INTERVAL);
}

// ==========================================================================
// SCROLL ANIMATIONS
// ==========================================================================
let scrollObserver;

function initScrollAnimations() {
  scrollObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
      }
    });
  }, {
    root: null,
    rootMargin: "0px 0px -40px 0px",
    threshold: 0.1
  });

  document.querySelectorAll(".scroll-reveal").forEach((el) => {
    scrollObserver.observe(el);
  });
}

function refreshScrollObserver() {
  document.querySelectorAll(".scroll-reveal").forEach((el) => {
    if (scrollObserver) scrollObserver.observe(el);
  });
}

// ==========================================================================
// LIGHTBOX
// ==========================================================================
function initLightbox() {
  const lightbox = document.getElementById("lightbox");
  const closeBtn = document.getElementById("lightbox-close");
  const backdrop = document.querySelector(".lightbox-backdrop");

  if (!lightbox) return;

  const close = () => {
    lightbox.classList.remove("active");
    lightbox.setAttribute("aria-hidden", "true");
  };

  if (closeBtn) closeBtn.addEventListener("click", close);
  if (backdrop) backdrop.addEventListener("click", close);
  lightbox.addEventListener("click", (e) => {
    if (e.target === lightbox || e.target.id === "lightbox-img") close();
  });

  let touchStartY = 0;
  lightbox.addEventListener("touchstart", (e) => {
    touchStartY = e.touches[0].clientY;
  }, { passive: true });

  lightbox.addEventListener("touchend", (e) => {
    if (e.changedTouches[0].clientY - touchStartY > 60) close();
  }, { passive: true });
}

function openLightbox(src, caption) {
  const lightbox = document.getElementById("lightbox");
  const img = document.getElementById("lightbox-img");
  const cap = document.getElementById("lightbox-caption");

  if (!lightbox || !img) return;
  img.src = src;
  cap.textContent = caption || "";
  lightbox.classList.add("active");
  lightbox.setAttribute("aria-hidden", "false");
}

// ==========================================================================
// MUSIC — YouTube IFrame API
// ==========================================================================
let ytPlayer = null;
let musicPlaying = false;

window.onYouTubeIframeAPIReady = function () {
  ytPlayer = new YT.Player("yt-player", {
    height: "1",
    width: "1",
    videoId: YOUTUBE_VIDEO_ID,
    playerVars: {
      autoplay: 0,
      controls: 0,
      loop: 1,
      playlist: YOUTUBE_VIDEO_ID,
      modestbranding: 1,
      playsinline: 1,
    },
    events: {
      onReady: (event) => {
        event.target.setVolume(50);
      },
      onStateChange: (event) => {
        const indicator = document.getElementById("music-indicator");
        if (event.data === YT.PlayerState.PLAYING) {
          musicPlaying = true;
          if (indicator) indicator.classList.add("playing");
        } else if (event.data === YT.PlayerState.PAUSED || event.data === YT.PlayerState.ENDED) {
          musicPlaying = false;
          if (indicator) indicator.classList.remove("playing");
        }
      }
    }
  });
};

function startMusic() {
  if (ytPlayer && ytPlayer.playVideo) {
    ytPlayer.playVideo();
  }
}

function initMusicToggle() {
  const indicator = document.getElementById("music-indicator");
  if (!indicator) return;

  indicator.addEventListener("click", () => {
    if (!ytPlayer) return;
    if (musicPlaying) {
      ytPlayer.pauseVideo();
    } else {
      ytPlayer.playVideo();
    }
  });
}
