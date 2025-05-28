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
    
    // Event Listeners
    if (mobileMenuButton) {
        mobileMenuButton.addEventListener('click', toggleMobileMenu);
    }
    
    if (backToTopBtn) {
        backToTopBtn.addEventListener('click', scrollToTop);
    }
    
    // Scroll event listener
    window.addEventListener('scroll', handleScroll);
    
    // Initialize
    updateFavoritesBadge();
    handleScroll(); // Check initial scroll position
    
    // Add page transition effect
    document.body.classList.add('page-transition');
});
