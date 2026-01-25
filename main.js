// ============================================
// Sara Laman Portfolio - JavaScript Animations & Interactions
// ============================================

// Wait for DOM to fully load
document.addEventListener('DOMContentLoaded', function() {
    // Initialize all animations
    initScrollAnimations();
    initNavHighlight();
    initContactForm();
});

// ============================================
// Scroll-triggered Fade-in Animations
// ============================================
function initScrollAnimations() {
    // Select all elements that should animate on scroll
    const animatedElements = document.querySelectorAll('.animate-on-scroll');
    
    // Create Intersection Observer for scroll animations
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animated');
                // Optional: stop observing after animation
                // observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    // Observe all animated elements
    animatedElements.forEach(element => {
        observer.observe(element);
    });

    // Add staggered delay to project cards and skill cards
    const staggeredElements = document.querySelectorAll('.project-card, .skill-card, .preview-card');
    staggeredElements.forEach((element, index) => {
        element.style.transitionDelay = `${index * 0.1}s`;
    });
}

// ============================================
// Navigation Active State on Scroll
// ============================================
function initNavHighlight() {
    const navLinks = document.querySelectorAll('nav a');
    
    // Add subtle hover animation to nav items
    navLinks.forEach(link => {
        link.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-2px)';
        });
        
        link.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });
}

// ============================================
// Contact Form Validation & Submission
// ============================================
function initContactForm() {
    const form = document.getElementById('contact-form');
    if (!form) return;

    const nameInput = document.getElementById('name');
    const emailInput = document.getElementById('email');
    const messageInput = document.getElementById('message');
    const submitBtn = form.querySelector('button[type="submit"]');

    // Real-time validation on input
    if (nameInput) {
        nameInput.addEventListener('input', () => validateField(nameInput, validateName));
        nameInput.addEventListener('blur', () => validateField(nameInput, validateName));
    }
    
    if (emailInput) {
        emailInput.addEventListener('input', () => validateField(emailInput, validateEmail));
        emailInput.addEventListener('blur', () => validateField(emailInput, validateEmail));
    }
    
    if (messageInput) {
        messageInput.addEventListener('input', () => validateField(messageInput, validateMessage));
        messageInput.addEventListener('blur', () => validateField(messageInput, validateMessage));
    }

    // Form submission
    form.addEventListener('submit', async function(e) {
        e.preventDefault();

        // Validate all fields
        const isNameValid = validateField(nameInput, validateName);
        const isEmailValid = validateField(emailInput, validateEmail);
        const isMessageValid = validateField(messageInput, validateMessage);

        if (isNameValid && isEmailValid && isMessageValid) {
            // Show loading state
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
            submitBtn.disabled = true;

            // Prepare form data for Google Sheets
            const formData = {
                name: nameInput.value.trim(),
                email: emailInput.value.trim(),
                message: messageInput.value.trim(),
                timestamp: new Date().toISOString()
            };

            // Get the Google Apps Script URL from data attribute
            const scriptURL = form.dataset.action;

            try {
                const response = await fetch(scriptURL, {
                    method: 'POST',
                    mode: 'no-cors', // Required for Google Apps Script
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(formData)
                });

                // Note: 'no-cors' mode doesn't return response status, so we assume success
                // If there's a network error, it will be caught in the catch block
                showFormMessage('success', 'Thank you for your message! I\'ll get back to you soon! ✨');
                form.reset();
                // Remove validation states
                [nameInput, emailInput, messageInput].forEach(input => {
                    input.classList.remove('valid', 'invalid');
                    const feedback = input.parentElement.querySelector('.field-feedback');
                    if (feedback) feedback.remove();
                });
            } catch (error) {
                showFormMessage('error', 'Oops! Something went wrong. Please try emailing me directly.');
            } finally {
                submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Send Message';
                submitBtn.disabled = false;
            }
        } else {
            // Shake the form to indicate error
            form.classList.add('shake');
            setTimeout(() => form.classList.remove('shake'), 500);
        }
    });
}

// ============================================
// Validation Helper Functions
// ============================================
function validateField(input, validationFn) {
    const result = validationFn(input.value);
    const feedback = input.parentElement.querySelector('.field-feedback') || createFeedbackElement(input);

    if (result.isValid) {
        input.classList.remove('invalid');
        input.classList.add('valid');
        feedback.textContent = '';
        feedback.classList.remove('show');
        return true;
    } else {
        input.classList.remove('valid');
        input.classList.add('invalid');
        feedback.textContent = result.message;
        feedback.classList.add('show');
        return false;
    }
}

function createFeedbackElement(input) {
    const feedback = document.createElement('span');
    feedback.className = 'field-feedback';
    input.parentElement.appendChild(feedback);
    return feedback;
}

function validateName(name) {
    const trimmed = name.trim();
    if (trimmed.length === 0) {
        return { isValid: false, message: 'Please enter your name' };
    }
    if (trimmed.length < 2) {
        return { isValid: false, message: 'Name must be at least 2 characters' };
    }
    return { isValid: true };
}

function validateEmail(email) {
    const trimmed = email.trim();
    if (trimmed.length === 0) {
        return { isValid: false, message: 'Please enter your email' };
    }
    // Standard email regex pattern
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(trimmed)) {
        return { isValid: false, message: 'Please enter a valid email address' };
    }
    return { isValid: true };
}

function validateMessage(message) {
    const trimmed = message.trim();
    if (trimmed.length === 0) {
        return { isValid: false, message: 'Please enter a message' };
    }
    if (trimmed.length < 10) {
        return { isValid: false, message: 'Message must be at least 10 characters' };
    }
    return { isValid: true };
}

function showFormMessage(type, message) {
    // Remove existing message if any
    const existing = document.querySelector('.form-message');
    if (existing) existing.remove();

    const messageDiv = document.createElement('div');
    messageDiv.className = `form-message ${type} animate-on-scroll animated`;
    messageDiv.innerHTML = `<p>${message}</p>`;
    
    const form = document.getElementById('contact-form');
    form.parentElement.insertBefore(messageDiv, form.nextSibling);

    // Auto-remove success message after 5 seconds
    if (type === 'success') {
        setTimeout(() => {
            messageDiv.style.opacity = '0';
            setTimeout(() => messageDiv.remove(), 300);
        }, 5000);
    }
}

// ============================================
// Typing Animation for Hero (Optional Enhancement)
// ============================================
function initTypingAnimation() {
    const heroText = document.querySelector('.hero-typing');
    if (!heroText) return;

    const text = heroText.textContent;
    heroText.textContent = '';
    heroText.style.opacity = '1';
    
    let i = 0;
    function typeWriter() {
        if (i < text.length) {
            heroText.textContent += text.charAt(i);
            i++;
            setTimeout(typeWriter, 50);
        }
    }
    typeWriter();
}
