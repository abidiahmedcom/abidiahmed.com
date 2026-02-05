// ===== Mobile Drawer Menu =====

// Get elements
const navToggle = document.getElementById("navToggle");
const navMenu = document.getElementById("navMenu");
const drawerOverlay = document.getElementById("drawerOverlay");
const navLinks = document.querySelectorAll(".nav-link");

// Toggle drawer function
if (navToggle && navMenu && drawerOverlay) {
  function toggleDrawer() {
    navToggle.classList.toggle("active");
    navMenu.classList.toggle("active");
    drawerOverlay.classList.toggle("active");

    // Prevent body scroll when drawer is open
    if (navMenu.classList.contains("active")) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
  }

  // Close drawer function
  function closeDrawer() {
    navToggle.classList.remove("active");
    navMenu.classList.remove("active");
    drawerOverlay.classList.remove("active");
    document.body.style.overflow = "";
  }

  // Event listeners
  navToggle.addEventListener("click", toggleDrawer);
  drawerOverlay.addEventListener("click", closeDrawer);

  // Close drawer when clicking on navigation links
  navLinks.forEach((link) => {
    link.addEventListener("click", () => {
      // Only close on mobile (when drawer is active)
      if (navMenu.classList.contains("active")) {
        closeDrawer();
      }
    });
  });

  // Close drawer on escape key
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && navMenu.classList.contains("active")) {
      closeDrawer();
    }
  });

  // Handle window resize - close drawer if switching to desktop
  let resizeTimer;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      if (window.innerWidth > 768 && navMenu.classList.contains("active")) {
        closeDrawer();
      }
    }, 250);
  });
}

// ===== Contact Form with reCAPTCHA Enterprise =====

// ===== Contact Form with reCAPTCHA Enterprise =====

const RECAPTCHA_SITE_KEY = "6LcGQ1UsAAAAAOpxC9KvEF44k6grvzSrACoU_Wd3";

// Widget IDs
let mainRecaptchaWidgetId;
let thankyouRecaptchaWidgetId;
let isRecaptchaLoaded = false;

function loadRecaptcha() {
  if (isRecaptchaLoaded) return;
  isRecaptchaLoaded = true;

  const script = document.createElement("script");
  script.src =
    "https://www.google.com/recaptcha/enterprise.js?render=explicit&onload=initRecaptcha";
  script.async = true;
  script.defer = true;
  document.head.appendChild(script);
}

// Add interaction listeners to trigger load
function attachRecaptchaTriggers() {
  const triggers = [
    document.getElementById("emailInput"),
    document.getElementById("thankyouEmailInput"),
    document.getElementById("sendBtn"),
    document.getElementById("thankyouSendBtn"),
  ];

  triggers.forEach((el) => {
    if (el) {
      el.addEventListener("focus", loadRecaptcha, { once: true });
      el.addEventListener("click", loadRecaptcha, { once: true });
      // For buttons, also trigger on hover
      if (el.tagName === "BUTTON") {
        el.addEventListener("mouseover", loadRecaptcha, { once: true });
      }
    }
  });

  // Also trigger on scrolling near the bottom (contact section)
  const scrollHandler = () => {
    if (
      !isRecaptchaLoaded &&
      window.scrollY + window.innerHeight >
        document.documentElement.scrollHeight - 1000
    ) {
      loadRecaptcha();
      window.removeEventListener("scroll", scrollHandler);
    }
  };
  window.addEventListener("scroll", scrollHandler, { passive: true });
}

// Initialize triggers
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", attachRecaptchaTriggers);
} else {
  attachRecaptchaTriggers();
}

// Explicit render callback
window.initRecaptcha = function () {
  // Render Main Form Recaptcha
  const mainContainer = document.getElementById("recaptcha-main");
  if (mainContainer) {
    mainRecaptchaWidgetId = grecaptcha.enterprise.render("recaptcha-main", {
      sitekey: RECAPTCHA_SITE_KEY,
      action: "CONTACT_FORM_SUBMIT",
    });
  }

  // Render Thank You Form Recaptcha
  const thankyouContainer = document.getElementById("recaptcha-thankyou");
  if (thankyouContainer) {
    thankyouRecaptchaWidgetId = grecaptcha.enterprise.render(
      "recaptcha-thankyou",
      {
        sitekey: RECAPTCHA_SITE_KEY,
        action: "CONTACT_FORM_SUBMIT",
      },
    );
  }
};

// Reusable submit handler
async function handleFormSubmit(emailInputId, btnId, widgetId) {
  const emailInput = document.getElementById(emailInputId);
  const sendBtn = document.getElementById(btnId);

  if (!emailInput || !sendBtn) return;

  const email = emailInput.value.trim();
  const originalBtnText = sendBtn.textContent;

  // Validate email
  if (!email || !isValidEmail(email)) {
    emailInput.focus();
    emailInput.style.borderColor = "#f44336";
    setTimeout(() => {
      emailInput.style.borderColor = "";
    }, 2000);
    return;
  }

  // Validate reCAPTCHA
  // Check if widgetId is defined (recaptcha loaded)
  if (typeof widgetId === "undefined") {
    alert("Please wait for the captcha to load.");
    return;
  }

  const token = grecaptcha.enterprise.getResponse(widgetId);
  if (!token) {
    alert("Please complete the captcha verification.");
    return;
  }

  // Disable button and show loading state
  sendBtn.disabled = true;
  sendBtn.textContent = "Sending...";

  try {
    // Prepare form data with reCAPTCHA token
    const formData = {
      email: email,
      recaptchaToken: token,
    };

    // Send data to backend server
    const response = await fetch("api/contact.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(result.message || "Failed to send message");
    }

    console.log("Message sent successfully:", result);

    // Show success state
    sendBtn.textContent = "Sent!";
    sendBtn.style.background =
      "linear-gradient(135deg, #4CAF50 0%, #45a049 100%)";
    emailInput.value = "";
    grecaptcha.enterprise.reset(widgetId); // Reset specific captcha

    // Reset button after 3 seconds
    setTimeout(() => {
      sendBtn.textContent = originalBtnText;
      sendBtn.style.background = "";
      sendBtn.disabled = false;
    }, 3000);
  } catch (error) {
    console.error("Error:", error);
    sendBtn.textContent = "Error";
    sendBtn.style.background =
      "linear-gradient(135deg, #f44336 0%, #d32f2f 100%)";

    setTimeout(() => {
      sendBtn.textContent = originalBtnText;
      sendBtn.style.background = "";
      sendBtn.disabled = false;
    }, 3000);
  }
}

// Event Listeners for Main Contact Form
const sendBtn = document.getElementById("sendBtn");
if (sendBtn) {
  sendBtn.addEventListener("click", function (e) {
    e.preventDefault();
    e.stopPropagation(); // Stop propagation if inside a form
    handleFormSubmit("emailInput", "sendBtn", mainRecaptchaWidgetId);
  });

  const emailInput = document.getElementById("emailInput");
  if (emailInput) {
    emailInput.addEventListener("keypress", function (e) {
      if (e.key === "Enter") {
        e.preventDefault();
        handleFormSubmit("emailInput", "sendBtn", mainRecaptchaWidgetId);
      }
    });
  }
}

// Event Listeners for Thank You Form
const thankyouSendBtn = document.getElementById("thankyouSendBtn");
if (thankyouSendBtn) {
  thankyouSendBtn.addEventListener("click", function (e) {
    e.preventDefault();
    e.stopPropagation();
    handleFormSubmit(
      "thankyouEmailInput",
      "thankyouSendBtn",
      thankyouRecaptchaWidgetId,
    );
  });

  const thankyouEmailInput = document.getElementById("thankyouEmailInput");
  if (thankyouEmailInput) {
    thankyouEmailInput.addEventListener("keypress", function (e) {
      if (e.key === "Enter") {
        e.preventDefault();
        handleFormSubmit(
          "thankyouEmailInput",
          "thankyouSendBtn",
          thankyouRecaptchaWidgetId,
        );
      }
    });
  }
}

// Email validation helper
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// ===== Project Platform Popup =====
const projectPopupOverlay = document.getElementById("projectPopupOverlay");
const popupClose = document.getElementById("popupClose");
const btnWeb = document.getElementById("btnWeb");
const btnAndroid = document.getElementById("btnAndroid");
const btnIOS = document.getElementById("btnIOS");
const projectCards = document.querySelectorAll(".project-card");

let redirectTimer;

function openPopup(webUrl, androidUrl, iosUrl) {
  // Clear any existing timer
  if (redirectTimer) {
    clearTimeout(redirectTimer);
    redirectTimer = null;
  }

  // Clear any existing interval
  const popupContent = document.querySelector(".project-popup");
  if (popupContent && popupContent.dataset.intervalId) {
    clearInterval(parseInt(popupContent.dataset.intervalId));
    delete popupContent.dataset.intervalId;
  }

  // Remove existing countdown text
  const existingCountdown = document.getElementById("redirect-countdown");
  if (existingCountdown) existingCountdown.remove();

  let validOptions = 0;
  let targetUrl = "";

  if (btnWeb) {
    if (webUrl && webUrl !== "#") {
      btnWeb.href = webUrl;
      btnWeb.style.display = "flex";
      validOptions++;
      targetUrl = webUrl;
    } else {
      btnWeb.style.display = "none";
    }
  }

  if (btnAndroid) {
    if (androidUrl && androidUrl !== "#" && androidUrl !== "") {
      btnAndroid.href = androidUrl;
      btnAndroid.style.display = "flex";
      validOptions++;
      targetUrl = androidUrl;
    } else {
      btnAndroid.style.display = "none";
    }
  }

  if (btnIOS) {
    if (iosUrl && iosUrl !== "#" && iosUrl !== "") {
      btnIOS.href = iosUrl;
      btnIOS.style.display = "flex";
      validOptions++;
      targetUrl = iosUrl;
    } else {
      btnIOS.style.display = "none";
    }
  }

  if (projectPopupOverlay) {
    projectPopupOverlay.classList.add("active");
    document.body.style.overflow = "hidden";
  }

  // Auto-redirect if only one option
  if (validOptions === 1 && targetUrl) {
    const countdown = document.createElement("p");
    countdown.id = "redirect-countdown";
    countdown.style.marginTop = "15px";
    countdown.style.fontSize = "0.9rem";
    countdown.style.color = "#666";
    countdown.style.fontWeight = "500";
    countdown.innerHTML =
      'Redirecting in <span id="countdown-timer">5</span> seconds...';

    if (popupContent) {
      popupContent.appendChild(countdown);

      let timeLeft = 5;
      const timerSpan = document.getElementById("countdown-timer");

      const countdownInterval = setInterval(() => {
        timeLeft--;
        if (timerSpan) timerSpan.textContent = timeLeft;
        if (timeLeft <= 0) clearInterval(countdownInterval);
      }, 1000);

      popupContent.dataset.intervalId = countdownInterval;

      redirectTimer = setTimeout(() => {
        const newWindow = window.open(targetUrl, "_blank");
        if (newWindow) {
          newWindow.focus();
        }
        closePopup();
      }, 5000);
    }
  }
}

function closePopup() {
  if (redirectTimer) {
    clearTimeout(redirectTimer);
    redirectTimer = null;
  }

  const popupContent = document.querySelector(".project-popup");
  if (popupContent && popupContent.dataset.intervalId) {
    clearInterval(parseInt(popupContent.dataset.intervalId));
    delete popupContent.dataset.intervalId;
  }

  const existingCountdown = document.getElementById("redirect-countdown");
  if (existingCountdown) existingCountdown.remove();

  if (projectPopupOverlay) {
    projectPopupOverlay.classList.remove("active");
    document.body.style.overflow = "";
  }
}

if (popupClose) {
  popupClose.addEventListener("click", closePopup);
}

if (projectPopupOverlay) {
  projectPopupOverlay.addEventListener("click", (e) => {
    if (e.target === projectPopupOverlay) {
      closePopup();
    }
  });
}

document.addEventListener("keydown", (e) => {
  if (
    e.key === "Escape" &&
    projectPopupOverlay &&
    projectPopupOverlay.classList.contains("active")
  ) {
    closePopup();
  }
});

projectCards.forEach((card) => {
  card.addEventListener("click", () => {
    const webUrl = card.dataset.web;
    const androidUrl = card.dataset.android;
    const iosUrl = card.dataset.ios;
    openPopup(webUrl, androidUrl, iosUrl);
  });
});

// ===== Dynamic Navigation Bar =====
const navbar = document.querySelector(".navbar");
if (navbar) {
  let lastScrollY = window.scrollY;
  let hideTimeout;

  function startHideTimer() {
    clearTimeout(hideTimeout);
    if (window.scrollY < 50) return; // Don't hide if at top

    hideTimeout = setTimeout(() => {
      if (window.scrollY < 50) return;
      navbar.classList.add("nav-hidden");
    }, 5000);
  }

  // Start timer initially
  startHideTimer();

  let ticking = false;

  window.addEventListener("scroll", () => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        const currentScrollY = window.scrollY;

        // Hide when not at top (stricter rule)
        if (currentScrollY > 50) {
          navbar.classList.add("nav-hidden");
          clearTimeout(hideTimeout);
        } else {
          // Show when at top
          navbar.classList.remove("nav-hidden");
        }

        lastScrollY = currentScrollY;
        ticking = false;
      });

      ticking = true;
    }
  });

  // Show navbar when hovering near the top
  let mouseMoveTicking = false;
  window.addEventListener("mousemove", (e) => {
    if (!mouseMoveTicking && e.clientY <= 100) {
      window.requestAnimationFrame(() => {
        navbar.classList.remove("nav-hidden");
        startHideTimer();
        mouseMoveTicking = false;
      });
      mouseMoveTicking = true;
    }
  });

  // Keep navbar visible when hovering over it
  navbar.addEventListener("mouseenter", () => {
    clearTimeout(hideTimeout);
    navbar.classList.remove("nav-hidden");
  });

  navbar.addEventListener("mouseleave", () => {
    startHideTimer();
  });
}

// ===== Project Filtering =====
const filterButtons = document.querySelectorAll(".filter-btn");
const filterableCards = document.querySelectorAll(".project-card");

if (filterButtons.length > 0 && filterableCards.length > 0) {
  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      // Remove active class from all buttons
      filterButtons.forEach((btn) => btn.classList.remove("active"));
      // Add active class to clicked button
      button.classList.add("active");

      const filterValue = button.getAttribute("data-filter");

      filterableCards.forEach((card) => {
        const cardCategories = card.getAttribute("data-category");

        // Reset animation classes
        card.classList.remove("show", "hide");

        // Small delay to allow removal to take effect
        setTimeout(() => {
          if (
            filterValue === "all" ||
            (cardCategories && cardCategories.includes(filterValue))
          ) {
            card.style.display = "block"; // Ensure it takes space before animation

            // Use requestAnimationFrame instead of forced reflow to trigger transition
            requestAnimationFrame(() => {
              requestAnimationFrame(() => {
                card.classList.add("show");
              });
            });
          } else {
            card.classList.add("hide");
            // After animation, set display to none (handled by CSS .hide usually, but explicit safety)
            setTimeout(() => {
              if (card.classList.contains("hide")) {
                card.style.display = "none";
              }
            }, 400); // Match transition duration
          }
        }, 10);
      });
    });
  });
}

// ===== VPN Warning Popup =====
const vpnPopupOverlay = document.getElementById("vpnPopupOverlay");
const vpnPopupClose = document.getElementById("vpnPopupClose");
const vpnContinueBtn = document.getElementById("vpnContinueBtn");
const vpnCountdown = document.getElementById("vpnCountdown");
const clientCards = document.querySelectorAll(".client-card");

let vpnTimer;

function openVpnPopup(url) {
  if (vpnPopupOverlay && vpnContinueBtn) {
    vpnContinueBtn.href = url;
    vpnPopupOverlay.classList.add("active");
    document.body.style.overflow = "hidden";

    // Countdown Logic
    let secondsLeft = 5;
    if (vpnCountdown)
      vpnCountdown.textContent = `Redirecting in ${secondsLeft}s...`;

    // Clear any existing timer
    if (vpnTimer) clearInterval(vpnTimer);

    vpnTimer = setInterval(() => {
      secondsLeft--;
      if (vpnCountdown)
        vpnCountdown.textContent = `Redirecting in ${secondsLeft}s...`;

      if (secondsLeft <= 0) {
        clearInterval(vpnTimer);
        // Trigger click on the button to handle the redirect (preserves target="_blank")
        vpnContinueBtn.click();
      }
    }, 1000);
  }
}

function closeVpnPopup() {
  if (vpnPopupOverlay) {
    vpnPopupOverlay.classList.remove("active");
    document.body.style.overflow = "";
    // Stop timer when closed
    if (vpnTimer) clearInterval(vpnTimer);
  }
}

if (vpnPopupClose) {
  vpnPopupClose.addEventListener("click", closeVpnPopup);
}

if (vpnPopupOverlay) {
  vpnPopupOverlay.addEventListener("click", (e) => {
    if (e.target === vpnPopupOverlay) {
      closeVpnPopup();
    }
  });
}

// Attach listeners to client cards
if (clientCards.length > 0) {
  clientCards.forEach((card) => {
    card.addEventListener("click", (e) => {
      e.preventDefault();
      const url = card.getAttribute("href");
      if (url) {
        openVpnPopup(url);
      }
    });
  });
}

if (vpnContinueBtn) {
  vpnContinueBtn.addEventListener("click", () => {
    // Wait a bit then close, since new tab opens
    setTimeout(closeVpnPopup, 500);
  });
}

// ===== Client Card Hover Preview =====
(function () {
  // Don't initialize on mobile devices
  const isMobile = () => window.innerWidth <= 768;
  if (isMobile()) return;

  // Create the preview tooltip element
  const previewTooltip = document.createElement("div");
  previewTooltip.className = "client-preview-tooltip";
  previewTooltip.innerHTML = '<img src="" alt="Website Preview">';
  document.body.appendChild(previewTooltip);

  const previewImage = previewTooltip.querySelector("img");
  const previewCards = document.querySelectorAll(".client-card[data-preview]");

  let isVisible = false;
  let currentCard = null;

  // Preload images for smoother experience
  previewCards.forEach((card) => {
    const previewSrc = card.getAttribute("data-preview");
    if (previewSrc) {
      const img = new Image();
      img.src = previewSrc;
    }
  });

  previewCards.forEach((card) => {
    card.addEventListener("mouseenter", function (e) {
      const previewSrc = this.getAttribute("data-preview");
      if (!previewSrc) return;

      currentCard = this;
      previewImage.src = previewSrc;

      // Position the tooltip
      updateTooltipPosition(e);

      // Show the tooltip with a small delay for smoothness
      setTimeout(() => {
        if (currentCard === this) {
          previewTooltip.classList.add("visible");
          isVisible = true;
        }
      }, 100);
    });

    card.addEventListener("mousemove", function (e) {
      if (isVisible) {
        updateTooltipPosition(e);
      }
    });

    card.addEventListener("mouseleave", function () {
      previewTooltip.classList.remove("visible");
      isVisible = false;
      currentCard = null;
    });
  });

  function updateTooltipPosition(e) {
    const offsetX = 20;
    const offsetY = 20;
    const tooltipWidth = 200;
    const tooltipHeight = previewTooltip.offsetHeight || 200;

    let x = e.clientX + offsetX;
    let y = e.clientY + offsetY;

    // Prevent tooltip from going off-screen (right)
    if (x + tooltipWidth > window.innerWidth - 20) {
      x = e.clientX - tooltipWidth - offsetX;
    }

    // Prevent tooltip from going off-screen (bottom)
    if (y + tooltipHeight > window.innerHeight - 20) {
      y = e.clientY - tooltipHeight - offsetY;
    }

    // Prevent tooltip from going off-screen (left)
    if (x < 20) {
      x = 20;
    }

    // Prevent tooltip from going off-screen (top)
    if (y < 20) {
      y = 20;
    }

    previewTooltip.style.left = x + "px";
    previewTooltip.style.top = y + "px";
  }
})();
