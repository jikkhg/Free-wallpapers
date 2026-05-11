// DOM Elements
const search = document.getElementById("search");
const cards = document.querySelectorAll(".card");
const categoryBtns = document.querySelectorAll(".category-btn");
const modal = document.getElementById("previewModal");
const modalImage = document.getElementById("modalImage");
const modalTitle = document.getElementById("modalTitle");
const closeBtn = document.querySelector(".close");
const previewBtns = document.querySelectorAll(".preview-btn");
const downloadBtns = document.querySelectorAll(".download-btn");

let currentCategory = "all";

// ===== SEARCH FUNCTIONALITY =====
search.addEventListener("input", (e) => {
  const searchValue = e.target.value.toLowerCase().trim();
  
  cards.forEach(card => {
    const title = card.querySelector(".content h2").innerText.toLowerCase();
    const category = card.getAttribute("data-category").toLowerCase();
    
    const matchesSearch = title.includes(searchValue) || searchValue === "";
    const matchesCategory = currentCategory === "all" || category === currentCategory.toLowerCase();
    
    if (matchesSearch && matchesCategory) {
      card.style.display = "block";
      // Add fade-in animation
      card.style.animation = "fadeIn 0.3s ease";
    } else {
      card.style.display = "none";
    }
  });

  // Show "no results" message if needed
  updateNoResultsMessage();
});

// ===== CATEGORY FILTER =====
categoryBtns.forEach(btn => {
  btn.addEventListener("click", () => {
    // Update active state
    categoryBtns.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    
    currentCategory = btn.getAttribute("data-filter");
    
    // Filter cards
    cards.forEach(card => {
      const category = card.getAttribute("data-category");
      const searchValue = search.value.toLowerCase().trim();
      const title = card.querySelector(".content h2").innerText.toLowerCase();
      
      const matchesSearch = title.includes(searchValue) || searchValue === "";
      const matchesCategory = currentCategory === "all" || category === currentCategory;
      
      if (matchesSearch && matchesCategory) {
        card.style.display = "block";
        card.style.animation = "fadeIn 0.3s ease";
      } else {
        card.style.display = "none";
      }
    });

    updateNoResultsMessage();
  });
});

// ===== MODAL PREVIEW =====
previewBtns.forEach((btn, index) => {
  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    openModal(index);
  });
});

// Also allow clicking the card image to preview
cards.forEach((card, index) => {
  card.querySelector(".card-image").addEventListener("click", () => {
    openModal(index);
  });
});

function openModal(cardIndex) {
  const card = cards[cardIndex];
  const img = card.querySelector("img");
  const title = card.querySelector(".content h2").innerText;
  
  modalImage.src = img.src;
  modalTitle.innerText = title;
  modal.classList.add("show");
  
  // Prevent body scroll
  document.body.style.overflow = "hidden";
}

function closeModal() {
  modal.classList.remove("show");
  document.body.style.overflow = "auto";
}

// Close modal when clicking the close button
closeBtn.addEventListener("click", closeModal);

// Close modal when clicking outside the modal content
window.addEventListener("click", (event) => {
  if (event.target === modal) {
    closeModal();
  }
});

// Close modal with Escape key
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    closeModal();
  }
});

// ===== DOWNLOAD FUNCTIONALITY =====
downloadBtns.forEach((btn, index) => {
  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    const card = btn.closest(".card");
    const img = card.querySelector("img");
    const title = card.querySelector(".content h2").innerText;
    downloadImage(img.src, title);
  });
});

function downloadImage(url, filename) {
  const link = document.createElement("a");
  link.href = url;
  link.download = filename || "wallpaper.jpg";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// ===== NO RESULTS MESSAGE =====
function updateNoResultsMessage() {
  const visibleCards = Array.from(cards).filter(card => card.style.display !== "none");
  
  if (visibleCards.length === 0) {
    let noResultsMsg = document.getElementById("no-results");
    if (!noResultsMsg) {
      noResultsMsg = document.createElement("div");
      noResultsMsg.id = "no-results";
      noResultsMsg.style.cssText = `
        grid-column: 1 / -1;
        text-align: center;
        padding: 60px 20px;
        color: var(--text-secondary);
        font-size: 18px;
      `;
      document.getElementById("wallpapers").appendChild(noResultsMsg);
    }
    noResultsMsg.innerText = "ไม่พบวอลเปเปอร์ที่ตรงกัน 😢";
    noResultsMsg.style.display = "block";
  } else {
    const noResultsMsg = document.getElementById("no-results");
    if (noResultsMsg) {
      noResultsMsg.style.display = "none";
    }
  }
}

// ===== IMAGE LAZY LOADING =====
function setupLazyLoading() {
  const images = document.querySelectorAll("img");
  
  if ("IntersectionObserver" in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src || img.src;
          img.classList.add("loaded");
          observer.unobserve(img);
        }
      });
    });

    images.forEach(img => imageObserver.observe(img));
  }
}

setupLazyLoading();

// ===== KEYBOARD NAVIGATION =====
let currentModalIndex = 0;

document.addEventListener("keydown", (e) => {
  if (!modal.classList.contains("show")) return;
  
  if (e.key === "ArrowLeft") {
    // Previous image
    currentModalIndex = (currentModalIndex - 1 + cards.length) % cards.length;
    openModal(currentModalIndex);
  } else if (e.key === "ArrowRight") {
    // Next image
    currentModalIndex = (currentModalIndex + 1) % cards.length;
    openModal(currentModalIndex);
  }
});

// ===== ANIMATION =====
const style = document.createElement("style");
style.textContent = `
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;
document.head.appendChild(style);

// ===== INITIAL STATE =====
console.log("✨ Free-Wallpapers loaded successfully!");
