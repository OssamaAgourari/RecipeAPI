window.addEventListener("load", () => {
    const loader = document.getElementById("page-loader");
    loader.classList.add("opacity-0");
    setTimeout(() => loader.style.display = "none", 500);
  });
document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');
    const backToTopBtn = document.getElementById('back-to-top');
    const navbar = document.getElementById('navbar');
    const newsletterForm = document.getElementById('newsletter-form');
    const contactForm = document.getElementById('contact-form');
    const successModal = document.getElementById('success-modal');
    const modalContent = document.getElementById('modal-content');
    const closeSuccessModal = document.getElementById('close-success-modal');
    const successTitle = document.getElementById('success-title');
    const successMessage = document.getElementById('success-message');
    const newsletterEmail = document.getElementById('newsletter-email');
    const newsletterEmailError = document.getElementById('newsletter-email-error');
    const contactEmail = document.getElementById('contact-email');
    const contactEmailError = document.getElementById('contact-email-error');
    const favoritesBadge = document.getElementById('favorites-badge');
    const favoritesBadgeMobile = document.getElementById('favorites-badge-mobile');
    
    // Update favorites badge
    function updateFavoritesBadge() {
        const favorites = JSON.parse(localStorage.getItem('recipeFavorites')) || [];
        const count = favorites.length;
        
        if (favoritesBadge) {
            if (count > 0) {
                favoritesBadge.textContent = count;
                favoritesBadge.classList.remove('hidden');
            } else {
                favoritesBadge.classList.add('hidden');
            }
        }
        
        if (favoritesBadgeMobile) {
            if (count > 0) {
                favoritesBadgeMobile.textContent = count;
                favoritesBadgeMobile.classList.remove('hidden');
            } else {
                favoritesBadgeMobile.classList.add('hidden');
            }
        }
    }
    
    // Toggle Mobile Menu
    function toggleMobileMenu() {
        if (mobileMenu.classList.contains('mobile-menu-open')) {
            // Close menu
            mobileMenu.classList.remove('mobile-menu-open');
        } else {
            // Open menu
            mobileMenu.classList.add('mobile-menu-open');
        }
    }
    
    // Handle Scroll Events
    function handleScroll() {
        // Back to top button visibility
        if (window.scrollY > 300) {
            backToTopBtn.classList.remove('opacity-0', 'invisible');
        } else {
            backToTopBtn.classList.add('opacity-0', 'invisible');
        }
        
        // Navbar scroll effect
        if (window.scrollY > 50) {
            navbar.classList.add('navbar-scrolled');
        } else {
            navbar.classList.remove('navbar-scrolled');
        }
    }
    
    // Scroll to Top
    function scrollToTop() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }
    
    // Validate Email
    function validateEmail(email) {
        const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(String(email).toLowerCase());
    }
    
    // Show Success Modal
    function showSuccessModal(title, message) {
        successTitle.textContent = title;
        successMessage.textContent = message;
        
        successModal.classList.remove('hidden');
        setTimeout(() => {
            successModal.classList.add('opacity-100');
            modalContent.classList.remove('opacity-0', 'scale-90');
        }, 10);
        document.body.style.overflow = 'hidden';
    }
    
    // Close Success Modal
    function closeSuccessModalHandler() {
        successModal.classList.remove('opacity-100');
        modalContent.classList.add('opacity-0', 'scale-90');
        setTimeout(() => {
            successModal.classList.add('hidden');
            document.body.style.overflow = 'auto';
        }, 300);
    }
    
    // Handle Newsletter Form Submit
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Validate email
            const email = newsletterEmail.value.trim();
            if (!validateEmail(email)) {
                newsletterEmailError.classList.remove('hidden');
                newsletterEmail.classList.add('border-red-500');
                return;
            }
            
            // Hide error if previously shown
            newsletterEmailError.classList.add('hidden');
            newsletterEmail.classList.remove('border-red-500');
            
            // Simulate form submission
            showSuccessModal('Merci pour votre inscription !', 'Vous recevrez bientôt nos meilleures recettes et conseils culinaires dans votre boîte mail.');
            
            // Reset form
            newsletterForm.reset();
        });
        
        // Live email validation
        newsletterEmail.addEventListener('input', function() {
            if (this.value.trim() !== '' && !validateEmail(this.value.trim())) {
                newsletterEmailError.classList.remove('hidden');
                this.classList.add('border-red-500');
            } else {
                newsletterEmailError.classList.add('hidden');
                this.classList.remove('border-red-500');
            }
        });
    }
    
    // Handle Contact Form Submit
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Validate email
            const email = contactEmail.value.trim();
            if (!validateEmail(email)) {
                contactEmailError.classList.remove('hidden');
                contactEmail.classList.add('border-red-500');
                return;
            }
            
            // Hide error if previously shown
            contactEmailError.classList.add('hidden');
            contactEmail.classList.remove('border-red-500');
            
            // Simulate form submission
            showSuccessModal('Message envoyé !', 'Votre message a été envoyé avec succès. Nous vous répondrons dans les plus brefs délais.');
            
            // Reset form
            contactForm.reset();
        });
        
        // Live email validation
        contactEmail.addEventListener('input', function() {
            if (this.value.trim() !== '' && !validateEmail(this.value.trim())) {
                contactEmailError.classList.remove('hidden');
                this.classList.add('border-red-500');
            } else {
                contactEmailError.classList.add('hidden');
                this.classList.remove('border-red-500');
            }
        });
    }
    
    // Event Listeners
    if (mobileMenuButton) {
        mobileMenuButton.addEventListener('click', toggleMobileMenu);
    }
    
    if (backToTopBtn) {
        backToTopBtn.addEventListener('click', scrollToTop);
    }
    
    if (closeSuccessModal) {
        closeSuccessModal.addEventListener('click', closeSuccessModalHandler);
    }
    
    // Close modal when clicking outside
    if (successModal) {
        successModal.addEventListener('click', (e) => {
            if (e.target === successModal) {
                closeSuccessModalHandler();
            }
        });
    }
    
    // Scroll event listener
    window.addEventListener('scroll', handleScroll);
    
    // Initialize
    updateFavoritesBadge();
    handleScroll(); // Check initial scroll position
    
    // Add page transition effect
    document.body.classList.add('page-transition');
});
