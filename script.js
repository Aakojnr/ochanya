/**
 * OCHANYA — CINEMATIC LOVE LETTER
 * Native HTML5 Audio + Smooth Auto Slideshow
 */

const PHOTOS = [
  { src: "IMG-20231116-WA0115.jpeg", caption: "" },
  { src: "IMG_9940.jpeg", caption: "" },
  { src: "IMG_3102.jpeg", caption: "" },
  { src: "IMG_9949.jpeg", caption: "" },
  { src: "IMG_4891.jpeg", caption: "" },
  { src: "IMG_3927.jpeg", caption: "" },
];

const SLIDESHOW_INTERVAL = 4000;

document.addEventListener("DOMContentLoaded", () => {
  initOpening();
  buildSlideshow();
  initScrollAnimations();
  initLightbox();
  initAudioControls();
});

// ==========================================================================
// OPENING + INSTANT AUDIO PLAYBACK ON IPHONE TAP
// ==========================================================================
function initOpening() {
  const openBtn = document.getElementById("open-btn");
  const landing = document.getElementById("opening");
  const experience = document.getElementById("experience");
  const musicIndicator = document.getElementById("music-indicator");
  const audio = document.getElementById("bg-audio");

  if (!openBtn) return;

  openBtn.addEventListener("click", () => {
    // 1. Play native audio immediately on user tap (iOS Safari always allows this!)
    if (audio) {
      audio.volume = 0.6;
      audio.play().then(() => {
        if (musicIndicator) musicIndicator.classList.add("playing");
      }).catch(err => {
        console.log("Audio playback:", err);
      });
    }

    // 2. Fade landing
    landing.classList.add("fade-out");

    setTimeout(() => {
      landing.style.display = "none";
      experience.classList.remove("hidden");
      void experience.offsetWidth;
      experience.classList.add("visible");

      if (musicIndicator) {
        musicIndicator.classList.remove("hidden");
        musicIndicator.classList.add("visible");
      }

      window.scrollTo({ top: 0, behavior: "instant" });
      setTimeout(refreshScrollObserver, 150);
      startSlideshow();
    }, 900);
  });
}

// ==========================================================================
// AUDIO TOGGLE (FLOATING BUTTON)
// ==========================================================================
function initAudioControls() {
  const indicator = document.getElementById("music-indicator");
  const audio = document.getElementById("bg-audio");
  if (!indicator || !audio) return;

  indicator.addEventListener("click", () => {
    if (audio.paused) {
      audio.play();
      indicator.classList.add("playing");
    } else {
      audio.pause();
      indicator.classList.remove("playing");
    }
  });
}

// ==========================================================================
// SLIDESHOW
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
    const slide = document.createElement("div");
    slide.className = "slide" + (i === 0 ? " active" : "");

    const img = document.createElement("img");
    img.src = photo.src;
    img.alt = photo.caption || `Memory ${i + 1}`;
    img.loading = i === 0 ? "eager" : "lazy";

    slide.appendChild(img);
    slide.addEventListener("click", () => openLightbox(photo.src, photo.caption));
    track.appendChild(slide);

    const dot = document.createElement("button");
    dot.className = "slideshow-dot" + (i === 0 ? " active" : "");
    dot.addEventListener("click", (e) => {
      e.stopPropagation();
      goToSlide(i);
      resetSlideshowTimer();
    });
    dotsContainer.appendChild(dot);
  });

  const prevBtn = document.getElementById("slide-prev");
  const nextBtn = document.getElementById("slide-next");

  if (prevBtn) prevBtn.addEventListener("click", (e) => { e.stopPropagation(); goToSlide(currentSlide - 1); resetSlideshowTimer(); });
  if (nextBtn) nextBtn.addEventListener("click", (e) => { e.stopPropagation(); goToSlide(currentSlide + 1); resetSlideshowTimer(); });

  let touchStartX = 0;
  const container = document.getElementById("slideshow");
  if (container) {
    container.addEventListener("touchstart", (e) => { touchStartX = e.touches[0].clientX; }, { passive: true });
    container.addEventListener("touchend", (e) => {
      const diff = touchStartX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 50) {
        goToSlide(diff > 0 ? currentSlide + 1 : currentSlide - 1);
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

  if (index < 0) index = slides.length - 1;
  if (index >= slides.length) index = 0;

  slides.forEach(s => s.classList.remove("active"));
  dots.forEach(d => d.classList.remove("active"));

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
  slideshowTimer = setInterval(() => goToSlide(currentSlide + 1), SLIDESHOW_INTERVAL);
}

function resetSlideshowTimer() {
  if (slideshowTimer) clearInterval(slideshowTimer);
  slideshowTimer = setInterval(() => goToSlide(currentSlide + 1), SLIDESHOW_INTERVAL);
}

// ==========================================================================
// SCROLL OBSERVER
// ==========================================================================
let scrollObserver;

function initScrollAnimations() {
  scrollObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) entry.target.classList.add("is-visible");
    });
  }, { root: null, threshold: 0.1 });

  document.querySelectorAll(".scroll-reveal").forEach(el => scrollObserver.observe(el));
}

function refreshScrollObserver() {
  document.querySelectorAll(".scroll-reveal").forEach(el => {
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
  const close = () => { lightbox.classList.remove("active"); lightbox.setAttribute("aria-hidden", "true"); };

  if (closeBtn) closeBtn.addEventListener("click", close);
  if (backdrop) backdrop.addEventListener("click", close);
  lightbox.addEventListener("click", (e) => {
    if (e.target === lightbox || e.target.id === "lightbox-img") close();
  });
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
