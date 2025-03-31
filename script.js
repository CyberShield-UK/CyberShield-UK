// Mobile menu functionality
document.addEventListener('DOMContentLoaded', function() {
    const mobileMenuBtn = document.querySelector('.mobile-menu');
    const navLinks = document.querySelector('.nav-links');
    let isMenuLoading = false;

    // Add loading state to mobile menu
    mobileMenuBtn.addEventListener('click', async function() {
        if (isMenuLoading) return;
        
        try {
            isMenuLoading = true;
            mobileMenuBtn.classList.add('loading');
            
            // Simulate a small delay for better UX
            await new Promise(resolve => setTimeout(resolve, 100));
            
            navLinks.style.display = navLinks.style.display === 'flex' ? 'none' : 'flex';
        } catch (error) {
            console.error('Error toggling mobile menu:', error);
            // Fallback to default state
            navLinks.style.display = 'none';
        } finally {
            isMenuLoading = false;
            mobileMenuBtn.classList.remove('loading');
        }
    });

    // Close mobile menu when clicking outside
    document.addEventListener('click', function(event) {
        if (!event.target.closest('.navbar')) {
            navLinks.style.display = 'none';
        }
    });

    // Smooth scrolling for anchor links with error handling
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const target = document.querySelector(targetId);
            
            if (target) {
                try {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                    // Close mobile menu after clicking a link
                    navLinks.style.display = 'none';
                } catch (error) {
                    console.error('Error during smooth scroll:', error);
                    // Fallback to instant scroll
                    target.scrollIntoView({ block: 'start' });
                }
            }
        });
    });

    // Add scroll event listener for navbar with debouncing
    const navbar = document.querySelector('.navbar');
    let scrollTimeout;
    window.addEventListener('scroll', function() {
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
            try {
                if (window.scrollY > 50) {
                    navbar.style.backgroundColor = 'rgba(255, 255, 255, 0.95)';
                    navbar.style.boxShadow = '0 2px 5px rgba(0,0,0,0.1)';
                } else {
                    navbar.style.backgroundColor = '#fff';
                    navbar.style.boxShadow = 'none';
                }
            } catch (error) {
                console.error('Error updating navbar:', error);
            }
        }, 10);
    });

    // Add animation to service cards on scroll with error handling
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '50px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            try {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                    // Unobserve after animation to improve performance
                    observer.unobserve(entry.target);
                }
            } catch (error) {
                console.error('Error animating element:', error);
                // Fallback to visible state
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'none';
            }
        });
    }, observerOptions);

    // Initialize animations with error handling
    try {
        document.querySelectorAll('.service-card, .feature').forEach(element => {
            element.style.opacity = '0';
            element.style.transform = 'translateY(20px)';
            element.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
            observer.observe(element);
        });
    } catch (error) {
        console.error('Error initializing animations:', error);
    }

    // Form validation
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Basic form validation
            const requiredFields = form.querySelectorAll('[required]');
            let isValid = true;
            
            requiredFields.forEach(field => {
                if (!field.value.trim()) {
                    isValid = false;
                    field.classList.add('error');
                    
                    // Add error message
                    const errorMessage = document.createElement('div');
                    errorMessage.className = 'error-message';
                    errorMessage.textContent = 'This field is required';
                    field.parentNode.appendChild(errorMessage);
                } else {
                    field.classList.remove('error');
                    const errorMessage = field.parentNode.querySelector('.error-message');
                    if (errorMessage) {
                        errorMessage.remove();
                    }
                }
            });

            // Email validation
            const emailFields = form.querySelectorAll('input[type="email"]');
            emailFields.forEach(field => {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (field.value && !emailRegex.test(field.value)) {
                    isValid = false;
                    field.classList.add('error');
                    
                    const errorMessage = document.createElement('div');
                    errorMessage.className = 'error-message';
                    errorMessage.textContent = 'Please enter a valid email address';
                    field.parentNode.appendChild(errorMessage);
                }
            });

            if (isValid) {
                // Show loading state
                const submitButton = form.querySelector('button[type="submit"]');
                if (submitButton) {
                    submitButton.disabled = true;
                    submitButton.classList.add('loading');
                    submitButton.textContent = 'Sending...';
                }

                // Here you would typically send the form data to your server
                // For now, we'll simulate a submission
                setTimeout(() => {
                    if (submitButton) {
                        submitButton.disabled = false;
                        submitButton.classList.remove('loading');
                        submitButton.textContent = 'Submit';
                    }
                }, 1500);
            }
        });
    });
}); 