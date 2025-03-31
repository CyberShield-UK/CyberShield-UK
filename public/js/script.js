// Initialize the application
function initializeApp() {
    // Handle navigation links
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const path = link.getAttribute('href');
            router.navigate(path);
        });
    });

    // Handle mobile menu
    const mobileMenu = document.querySelector('.mobile-menu');
    const navLinks = document.querySelector('.nav-links');
    
    if (mobileMenu) {
        mobileMenu.addEventListener('click', () => {
            navLinks.classList.toggle('active');
        });
    }

    // Close mobile menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!navLinks.contains(e.target) && !mobileMenu.contains(e.target)) {
            navLinks.classList.remove('active');
        }
    });

    // Initialize other components
    initializeHeroSection();
    initializeFeatures();
    initializeTestimonials();
    initializeContactForm();
}

// Initialize hero section
function initializeHeroSection() {
    const heroSection = document.querySelector('.hero');
    if (heroSection) {
        // Add any hero section specific initialization
    }
}

// Initialize features section
function initializeFeatures() {
    const features = document.querySelectorAll('.feature-card');
    if (features) {
        features.forEach(feature => {
            feature.addEventListener('mouseenter', () => {
                feature.classList.add('hover');
            });
            feature.addEventListener('mouseleave', () => {
                feature.classList.remove('hover');
            });
        });
    }
}

// Initialize testimonials
function initializeTestimonials() {
    const testimonials = document.querySelector('.testimonials');
    if (testimonials) {
        // Add any testimonials specific initialization
    }
}

// Initialize contact form
function initializeContactForm() {
    const contactForm = document.querySelector('.contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const formData = new FormData(contactForm);
            const data = Object.fromEntries(formData.entries());
            
            try {
                const response = await fetch('/api/contact', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(data)
                });
                
                if (response.ok) {
                    showNotification('Message sent successfully!', 'success');
                    contactForm.reset();
                } else {
                    throw new Error('Failed to send message');
                }
            } catch (error) {
                showNotification('Failed to send message. Please try again.', 'error');
            }
        });
    }
}

// Show notification
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', initializeApp); 