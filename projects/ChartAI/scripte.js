document.addEventListener('DOMContentLoaded', function() {
    // Initialize animations - disabled
    // initAnimations();
    
    // Mobile menu toggle
    initMobileMenu();
    
    // FAQ accordion
    initFaqAccordion();
    
    // Simple navigation without animations
    initSimpleNavigation();
    
    // Phone mockup tilt effect on mouse move
    initTiltEffect();
    
    // Initialize image popup functionality
    initImagePopup();
});

// Empty function that doesn't apply any animations
function initAnimations() {
    // All animations disabled as requested
}

function initMobileMenu() {
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    const body = document.body;
    
    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            body.classList.toggle('menu-open');
            
            // Toggle menu icon between bars and X
            const icon = menuToggle.querySelector('i');
            if (icon.classList.contains('fa-bars')) {
                icon.classList.remove('fa-bars');
                icon.classList.add('fa-times');
            } else {
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }
        });
        
        // Close menu when clicking a link
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('active');
                body.classList.remove('menu-open');
                const icon = menuToggle.querySelector('i');
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            });
        });
        
        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (navLinks.classList.contains('active') && 
                !e.target.closest('.nav-links') && 
                !e.target.closest('.menu-toggle')) {
                navLinks.classList.remove('active');
                body.classList.remove('menu-open');
                const icon = menuToggle.querySelector('i');
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }
        });
    }
}

function initFaqAccordion() {
    const faqItems = document.querySelectorAll('.faq-item');
    
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        
        question.addEventListener('click', () => {
            // Close other open FAQ items
            faqItems.forEach(otherItem => {
                if (otherItem !== item && otherItem.classList.contains('active')) {
                    otherItem.classList.remove('active');
                }
            });
            
            // Toggle current FAQ item
            item.classList.toggle('active');
        });
    });
    
    // Open the first FAQ item by default
    if (faqItems.length > 0) {
        faqItems[0].classList.add('active');
    }
}

// Simple navigation without smooth scrolling animations
function initSimpleNavigation() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                // Calculate header height to account for fixed positioning
                const headerHeight = document.querySelector('header').offsetHeight;
                
                // Instant scroll without animation
                window.scrollTo(0, targetElement.offsetTop - headerHeight);
            }
        });
    });
}

function initTiltEffect() {
    const mockups = document.querySelectorAll('.phone-mockup');
    
    mockups.forEach(mockup => {
        const parent = mockup.parentElement;
        
        parent.addEventListener('mousemove', (e) => {
            const rect = parent.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            // Calculate rotation values based on mouse position
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            const rotateY = ((x - centerX) / centerX) * 10;
            const rotateX = ((centerY - y) / centerY) * 10;
            
            // Apply the rotation transform
            mockup.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
        });
        
        // Reset rotation when mouse leaves
        parent.addEventListener('mouseleave', () => {
            mockup.style.transform = 'perspective(1000px) rotateY(-15deg)';
            mockup.style.transition = 'transform 0.5s ease';
        });
        
        // Remove transition on mouse enter for smoother effect
        parent.addEventListener('mouseenter', () => {
            mockup.style.transition = 'none';
        });
    });
}

// Add sticky header effect on scroll
window.addEventListener('scroll', function() {
    const header = document.querySelector('header');
    
    if (window.scrollY > 50) {
        header.classList.add('sticky');
    } else {
        header.classList.remove('sticky');
    }
});

// Make all testimonials visible (removing auto-slider functionality)
const testimonials = document.querySelectorAll('.testimonial');
testimonials.forEach(testimonial => {
    testimonial.classList.add('active-testimonial');
    testimonial.style.opacity = '1';
    testimonial.style.transform = 'scale(1)';
});

// Simple scroll progress indicator without animations
function initScrollProgress() {
    const progressBar = document.createElement('div');
    progressBar.className = 'scroll-progress';
    document.body.appendChild(progressBar);
    
    window.addEventListener('scroll', () => {
        const totalHeight = document.body.scrollHeight - window.innerHeight;
        const progress = (window.scrollY / totalHeight) * 100;
        progressBar.style.width = `${progress}%`;
    });
}

initScrollProgress();

// Back to top button without animations
function initBackToTop() {
    const backToTopBtn = document.createElement('button');
    backToTopBtn.className = 'back-to-top';
    backToTopBtn.innerHTML = '<i class="fas fa-arrow-up"></i>';
    document.body.appendChild(backToTopBtn);
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 500) {
            backToTopBtn.classList.add('visible');
        } else {
            backToTopBtn.classList.remove('visible');
        }
    });
    
    backToTopBtn.addEventListener('click', () => {
        // Instant scroll without animation
        window.scrollTo(0, 0);
    });
}

initBackToTop();

// Image popup/lightbox functionality
function initImagePopup() {
    const miniMockups = document.querySelectorAll('.mini-mockup');
    const imagePopup = document.querySelector('.image-popup');
    const popupImage = document.querySelector('.popup-image');
    const closePopup = document.querySelector('.close-popup');
    
    if (!miniMockups.length || !imagePopup || !popupImage || !closePopup) return;
    
    // Open popup when clicking on mini mockup images
    miniMockups.forEach(mockup => {
        mockup.addEventListener('click', () => {
            popupImage.src = mockup.src;
            popupImage.alt = mockup.alt;
            imagePopup.classList.add('active');
            document.body.style.overflow = 'hidden'; // Prevent scrolling when popup is open
        });
    });
    
    // Close popup when clicking the close button
    closePopup.addEventListener('click', () => {
        imagePopup.classList.remove('active');
        document.body.style.overflow = ''; // Restore scrolling
    });
    
    // Close popup when clicking outside the image
    imagePopup.addEventListener('click', (e) => {
        if (e.target === imagePopup) {
            imagePopup.classList.remove('active');
            document.body.style.overflow = ''; // Restore scrolling
        }
    });
    
    // Close popup when pressing escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && imagePopup.classList.contains('active')) {
            imagePopup.classList.remove('active');
            document.body.style.overflow = ''; // Restore scrolling
        }
    });
}
