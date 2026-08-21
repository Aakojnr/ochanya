/**
 * OCHANYA ANNIVERSARY — CINEMATIC DIGITAL LOVE LETTER
 * Easily configure your photos below.
 */

// ==========================================================================
// 1. PHOTO CONFIGURATION
// If you upload photos with different filenames, just change them here!
// ==========================================================================
const PHOTOS = [
  { src: "images/photo1.jpg", caption: "" },
  { src: "images/photo2.jpg", caption: "" },
  { src: "images/photo3.jpg", caption: "" },
  { src: "images/photo4.jpg", caption: "" },
  { src: "images/photo5.jpg", caption: "" },
  { src: "images/photo6.jpg", caption: "" },
];

document.addEventListener("DOMContentLoaded", () => {
  initOpening();
  renderGallery();
  initScrollAnimations();
  initLightbox();
});

// ==========================================================================
// 2. Opening Screen Transition
// ==========================================================================
function initOpening() {
  const openBtn = document.getElementById("open-btn");
  const landingScreen = document.getElementById("opening");
  const experience = document.getElementById("experience");

  if (!openBtn) return;

  openBtn.addEventListener("click", () => {
    // 1. Fade out landing screen
    landingScreen.classList.add("fade-out");

    setTimeout(() => {
      // 2. Hide landing, show experience
      landingScreen.style.display = "none";
      experience.classList.remove("hidden");
      
      // Force repaint
      void experience.offsetWidth;
      
      experience.classList.add("visible");
      
      // 3. Smooth scroll down to letter
      window.scrollTo({
        top: 0,
        behavior: "instant"
      });

      // Refresh intersection observer triggers
      triggerScrollCheck();
    }, 900);
  });
}

// ==========================================================================
// 3. Render Gallery with Placeholders & Natural Aspect Ratio
// ==========================================================================
function renderGallery() {
  const container = document.getElementById("gallery-container");
  if (!container) return;

  container.innerHTML = "";

  PHOTOS.forEach((photo, index) => {
    const item = document.createElement("div");
    item.className = "gallery-item scroll-reveal";
    
    // Create image element
    const img = document.createElement("img");
    img.src = photo.src;
    img.alt = photo.caption || `Memory ${index + 1}`;
    img.loading = index === 0 ? "eager" : "lazy";

    // If image fails to load (e.g. before you upload real files), show an elegant card
    img.onerror = () => {
      item.innerHTML = `
        <div class="gallery-placeholder">
          <span class="icon">✦</span>
          <span>Memory ${index + 1}</span>
        </div>
      `;
    };

    img.onload = () => {
      item.appendChild(img);
      if (photo.caption && photo.caption.trim() !== "") {
        const cap = document.createElement("div");
        cap.className = "gallery-caption";
        cap.textContent = photo.caption;
        item.appendChild(cap);
      }
    };

    // Tap to open lightbox
    item.addEventListener("click", () => {
      if (img.complete && img.naturalHeight !== 0) {
        openLightbox(photo.src, photo.caption);
      }
    });

    // Start loading
    item.appendChild(img);
    container.appendChild(item);
  });
}

// ==========================================================================
// 4. Scroll Reveal Animations (Safari Mobile Safe)
// ==========================================================================
let observer;

function initScrollAnimations() {
  const observerOptions = {
    root: null,
    rootMargin: "0px 0px -40px 0px",
    threshold: 0.12
  };

  observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
      }
    });
  }, observerOptions);

  document.querySelectorAll(".scroll-reveal").forEach((el) => {
    observer.observe(el);
  });
}

function triggerScrollCheck() {
  document.querySelectorAll(".scroll-reveal").forEach((el) => {
    if (observer) observer.observe(el);
  });
}

// ==========================================================================
// 5. Mobile-Friendly Lightbox
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
    if (e.target === lightbox || e.target.id === "lightbox-img") {
      close();
    }
  });

  // Close on swipe down on mobile
  let touchStartY = 0;
  lightbox.addEventListener("touchstart", (e) => {
    touchStartY = e.touches[0].clientY;
  }, { passive: true });

  lightbox.addEventListener("touchend", (e) => {
    const touchEndY = e.changedTouches[0].clientY;
    if (touchEndY - touchStartY > 60) {
      close(); // Swiped down
    }
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
