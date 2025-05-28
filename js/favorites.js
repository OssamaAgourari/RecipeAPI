window.addEventListener("load", () => {
    const loader = document.getElementById("page-loader");
    loader.classList.add("opacity-0");
    setTimeout(() => loader.style.display = "none", 500);
  });
document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const favoritesContainer = document.getElementById('favorites-container');
    const noFavorites = document.getElementById('no-favorites');
    const loadingSpinner = document.getElementById('loading-spinner');
    const recipeModal = document.getElementById('recipe-modal');
    const modalContent = document.getElementById('modal-content');
    const closeModal = document.getElementById('close-modal');
    const favoriteBtn = document.getElementById('favorite-btn');
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');
    const backToTopBtn = document.getElementById('back-to-top');
    const toastNotification = document.getElementById('toast-notification');
    const toastMessage = document.getElementById('toast-message');
    const toastIcon = document.getElementById('toast-icon');
    const navbar = document.getElementById('navbar');
    const filterInput = document.getElementById('filter-input');
    const sortButton = document.getElementById('sort-button');
    const sortDropdown = document.getElementById('sort-dropdown');
    const sortOptions = document.querySelectorAll('.sort-option');
    const favoritesCount = document.getElementById('favorites-count');
    const suggestedRecipesContainer = document.getElementById('suggested-recipes');
    
    // Current sort state
    let currentSort = 'date-desc'; // Default sort: newest first
    
    // Favorites Manager
    class FavoritesManager {
        constructor() {
            this.favorites = JSON.parse(localStorage.getItem('recipeFavorites')) || [];
            this.filteredFavorites = [...this.favorites];
            this.updateBadge();
        }
        
        removeFavorite(recipeId) {
            const initialLength = this.favorites.length;
            this.favorites = this.favorites.filter(fav => fav.idMeal !== recipeId);
            if (this.favorites.length !== initialLength) {
                this.save();
                return true;
            }
            return false;
        }
        
        isFavorite(recipeId) {
            return this.favorites.some(fav => fav.idMeal === recipeId);
        }
        
        save() {
            localStorage.setItem('recipeFavorites', JSON.stringify(this.favorites));
            this.updateBadge();
            this.renderFavorites();
        }
        
        updateBadge() {
            const count = this.favorites.length;
            const badges = [
                document.getElementById('favorites-badge'),
                document.getElementById('favorites-badge-mobile')
            ];
            
            badges.forEach(badge => {
                if (badge) {
                    if (count > 0) {
                        badge.textContent = count;
                        badge.classList.remove('hidden');
                    } else {
                        badge.classList.add('hidden');
                    }
                }
            });
            
            // Update favorites count if element exists
            if (favoritesCount) {
                favoritesCount.textContent = count;
            }
        }
        
        filterFavorites(query) {
            if (!query) {
                this.filteredFavorites = [...this.favorites];
            } else {
                const lowerQuery = query.toLowerCase();
                this.filteredFavorites = this.favorites.filter(recipe => 
                    recipe.strMeal.toLowerCase().includes(lowerQuery) || 
                    (recipe.strArea && recipe.strArea.toLowerCase().includes(lowerQuery)) ||
                    (recipe.strCategory && recipe.strCategory.toLowerCase().includes(lowerQuery))
                );
            }
            this.sortFavorites(currentSort);
            this.renderFavorites();
        }
        
        sortFavorites(sortType) {
            currentSort = sortType;
            
            switch(sortType) {
                case 'name-asc':
                    this.filteredFavorites.sort((a, b) => a.strMeal.localeCompare(b.strMeal));
                    break;
                case 'name-desc':
                    this.filteredFavorites.sort((a, b) => b.strMeal.localeCompare(a.strMeal));
                    break;
                case 'date-desc':
                    this.filteredFavorites.sort((a, b) => {
                        const dateA = a.favoriteDate ? new Date(a.favoriteDate) : new Date(0);
                        const dateB = b.favoriteDate ? new Date(b.favoriteDate) : new Date(0);
                        return dateB - dateA;
                    });
                    break;
                case 'date-asc':
                    this.filteredFavorites.sort((a, b) => {
                        const dateA = a.favoriteDate ? new Date(a.favoriteDate) : new Date(0);
                        const dateB = b.favoriteDate ? new Date(b.favoriteDate) : new Date(0);
                        return dateA - dateB;
                    });
                    break;
            }
            
            this.renderFavorites();
        }
        
        renderFavorites() {
            if (!favoritesContainer) return;
            
            if (this.filteredFavorites.length === 0) {
                if (noFavorites) noFavorites.classList.remove('hidden');
                favoritesContainer.innerHTML = '';
                return;
            }
            
            if (noFavorites) noFavorites.classList.add('hidden');
            favoritesContainer.innerHTML = '';
            
            this.filteredFavorites.forEach((recipe, index) => {
                const card = createRecipeCard(recipe, true);
                favoritesContainer.appendChild(card);
                
                // Staggered animation
                setTimeout(() => {
                    card.classList.add('show');
                }, 100 * index);
            });
            
            // Add event listeners
            addRecipeCardEventListeners(this.filteredFavorites);
        }
    }
    
    const favoritesManager = new FavoritesManager();
    
    // Recipe Card Template
    function createRecipeCard(recipe, isFavorite = false) {
        const card = document.createElement('div');
        card.className = 'bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer relative recipe-card stagger-animate';
        
        // Generate random difficulty and prep time for demo purposes
        const difficulties = ['Facile', 'Moyen', 'Difficile'];
        const prepTimes = ['20 min', '30 min', '45 min', '1h', '1h 30min'];
        const randomDifficulty = difficulties[Math.floor(Math.random() * difficulties.length)];
        const randomPrepTime = prepTimes[Math.floor(Math.random() * prepTimes.length)];
        
        // Format date if available
        let dateAdded = '';
        if (recipe.favoriteDate) {
            const date = new Date(recipe.favoriteDate);
            dateAdded = `<div class="text-xs text-gray-500 mt-1">
                            <i class="far fa-calendar-alt mr-1"></i>
                            Ajouté le ${date.toLocaleDateString()}
                        </div>`;
        }
        
        card.innerHTML = `
            <div class="absolute top-3 right-3 z-10">
                <button class="favorite-toggle p-2 bg-white bg-opacity-90 rounded-full shadow-md hover:scale-110 transition-transform duration-300" 
                        data-id="${recipe.idMeal}" 
                        aria-label="${isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}">
                    <i class="${isFavorite ? 'fas' : 'far'} fa-heart ${isFavorite ? 'text-red-500' : 'text-gray-400'}"></i>
                </button>
            </div>
            <div class="relative overflow-hidden group">
                <img src="${recipe.strMealThumb}" alt="${recipe.strMeal}" class="w-full h-48 object-cover transition-transform duration-700 group-hover:scale-110">
                <div class="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-0 group-hover:opacity-60 transition-opacity duration-300"></div>
            </div>
            <div class="p-5">
                <h3 class="text-xl font-semibold mb-2 line-clamp-2">${recipe.strMeal}</h3>
                <div class="flex justify-between text-sm text-gray-600 mb-4">
                    <span class="flex items-center">
                        <i class="fas fa-clock mr-1 text-primary-500"></i>
                        ${randomPrepTime}
                    </span>
                    <span class="flex items-center">
                        <i class="fas fa-signal mr-1 text-primary-500"></i>
                        ${randomDifficulty}
                    </span>
                </div>
                <div class="flex items-center text-gray-600 mb-2">
                    <i class="fas fa-globe mr-2 text-primary-500"></i>
                    <span>${recipe.strArea || 'International'}</span>
                    ${recipe.strCategory ? `<span class="mx-2">•</span><span>${recipe.strCategory}</span>` : ''}
                </div>
                ${dateAdded}
                <button class="view-recipe-btn bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600 text-white px-4 py-2 rounded-lg transition w-full flex items-center justify-center font-medium shadow-md hover:shadow-lg transform hover:-translate-y-0.5 mt-4"
                        data-id="${recipe.idMeal}">
                    <i class="fas fa-utensils mr-2"></i>
                    Voir la recette
                </button>
            </div>
        `;
        
        return card;
    }
    
    // Add Event Listeners to Recipe Cards
    function addRecipeCardEventListeners(recipes) {
        // View recipe buttons
        document.querySelectorAll('.view-recipe-btn').forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.stopPropagation();
                const mealId = this.getAttribute('data-id');
                showRecipeDetails(mealId);
            });
        });
        
        // Favorite toggle buttons
        document.querySelectorAll('.favorite-toggle').forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.stopPropagation();
                const mealId = this.getAttribute('data-id');
                const icon = this.querySelector('i');
                
                if (icon.classList.contains('fas')) {
                    // Remove from favorites
                    icon.classList.replace('fas', 'far');
                    icon.classList.replace('text-red-500', 'text-gray-400');
                    this.setAttribute('aria-label', 'Ajouter aux favoris');
                    favoritesManager.removeFavorite(mealId);
                    showToast('info', 'Recette retirée des favoris');
                }
            });
        });
        
        // Make entire card clickable
        document.querySelectorAll('.recipe-card').forEach(card => {
            card.addEventListener('click', function(e) {
                // Ignore clicks on buttons
                if (!e.target.closest('button')) {
                    const viewBtn = this.querySelector('.view-recipe-btn');
                    if (viewBtn) {
                        const mealId = viewBtn.getAttribute('data-id');
                        showRecipeDetails(mealId);
                    }
                }
            });
        });
    }
    
    // Show Recipe Details in Modal
    async function showRecipeDetails(mealId) {
        try {
            // Show loading in modal
            recipeModal.classList.remove('hidden');
            modalContent.classList.add('opacity-0', 'scale-90');
            setTimeout(() => {
                recipeModal.classList.add('opacity-100');
                modalContent.classList.remove('opacity-0', 'scale-90');
            }, 10);
            document.body.style.overflow = 'hidden';
            
            // First check if the recipe is in favorites
            const favoriteRecipe = favoritesManager.favorites.find(recipe => recipe.idMeal === mealId);
            
            if (favoriteRecipe) {
                populateModal(favoriteRecipe);
            } else {
                // If not in favorites, fetch from API
                const response = await fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${mealId}`);
                const data = await response.json();
                
                if (data.meals) {
                    const meal = data.meals[0];
                    populateModal(meal);
                }
            }
        } catch (error) {
            console.error('Error fetching recipe details:', error);
            showToast('error', 'Erreur lors du chargement de la recette');
            closeRecipeModal();
        }
    }
    
    // Populate Modal with Recipe Details
    function populateModal(meal) {
        document.getElementById('modal-recipe-name').textContent = meal.strMeal;
        document.getElementById('modal-recipe-image').src = meal.strMealThumb;
        document.getElementById('modal-recipe-image').alt = meal.strMeal;
        
        // Set random prep time, calories, and difficulty for demo purposes
        document.getElementById('modal-prep-time').textContent = ['20 min', '30 min', '45 min', '1h', '1h 30min'][Math.floor(Math.random() * 5)];
        document.getElementById('modal-calories').textContent = `${Math.floor(Math.random() * 500 + 200)} kcal`;
        document.getElementById('modal-difficulty').textContent = ['Facile', 'Moyen', 'Difficile'][Math.floor(Math.random() * 3)];
        
        // Set favorite button state
        const isFavorite = favoritesManager.isFavorite(meal.idMeal);
        favoriteBtn.innerHTML = `<i class="${isFavorite ? 'fas' : 'far'} fa-heart text-xl text-red-500"></i>`;
        favoriteBtn.setAttribute('data-id', meal.idMeal);
        favoriteBtn.setAttribute('aria-label', isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris');
        
        // Populate ingredients
        const ingredientsList = document.getElementById('modal-recipe-ingredients');
        ingredientsList.innerHTML = '';
        
        for (let i = 1; i <= 20; i++) {
            const ingredient = meal[`strIngredient${i}`];
            const measure = meal[`strMeasure${i}`];
            
            if (ingredient && ingredient.trim() !== '') {
                const li = document.createElement('li');
                li.className = 'flex items-start ingredient-item p-2 rounded-lg';
                li.innerHTML = `<i class="fas fa-check-circle text-primary-500 mt-1 mr-2 flex-shrink-0"></i><span>${measure ? measure + ' ' : ''}${ingredient}</span>`;
                ingredientsList.appendChild(li);
            }
        }
        
        // Populate instructions
        const instructions = document.getElementById('modal-recipe-instructions');
        instructions.textContent = meal.strInstructions;
        
        // Populate tags
        const tagsContainer = document.getElementById('modal-recipe-tags');
        tagsContainer.innerHTML = '';
        
        if (meal.strTags) {
            const tags = meal.strTags.split(',');
            tags.forEach(tag => {
                if (tag.trim()) {
                    const tagElement = document.createElement('span');
                    tagElement.className = 'bg-gray-200 text-gray-800 text-sm px-3 py-1 rounded-full';
                    tagElement.textContent = tag.trim();
                    tagsContainer.appendChild(tagElement);
                }
            });
        }
        
        // Set category and area as tags if they exist
        if (meal.strCategory) {
            const categoryTag = document.createElement('span');
            categoryTag.className = 'bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full';
            categoryTag.textContent = meal.strCategory;
            tagsContainer.appendChild(categoryTag);
        }
        
        if (meal.strArea) {
            const areaTag = document.createElement('span');
            areaTag.className = 'bg-green-100 text-green-800 text-sm px-3 py-1 rounded-full';
            areaTag.textContent = meal.strArea;
            tagsContainer.appendChild(areaTag);
        }
        
        // Add event listener to favorite button
        favoriteBtn.onclick = () => toggleFavorite(meal);
    }
    
    // Toggle Favorite
    function toggleFavorite(meal) {
        const isFavorite = favoritesManager.isFavorite(meal.idMeal);
        const icon = favoriteBtn.querySelector('i');
        
        if (isFavorite) {
            favoritesManager.removeFavorite(meal.idMeal);
            icon.classList.replace('fas', 'far');
            showToast('info', 'Recette retirée des favoris');
        }
        
        // Update any matching recipe cards on the page
        document.querySelectorAll(`.favorite-toggle[data-id="${meal.idMeal}"]`).forEach(btn => {
            const btnIcon = btn.querySelector('i');
            if (isFavorite) {
                btnIcon.classList.replace('fas', 'far');
                btnIcon.classList.replace('text-red-500', 'text-gray-400');
                btn.setAttribute('aria-label', 'Ajouter aux favoris');
            }
        });
    }
    
    // Close Recipe Modal
    function closeRecipeModal() {
        recipeModal.classList.add('opacity-0');
        modalContent.classList.add('opacity-0', 'scale-90');
        setTimeout(() => {
            recipeModal.classList.add('hidden');
            document.body.style.overflow = 'auto';
        }, 300);
    }
    
    // Show Toast Notification
    function showToast(type, message) {
        // Set icon and color based on type
        switch(type) {
            case 'success':
                toastIcon.innerHTML = '<i class="fas fa-check-circle"></i>';
                toastIcon.className = 'text-xl text-green-500';
                break;
            case 'error':
                toastIcon.innerHTML = '<i class="fas fa-exclamation-circle"></i>';
                toastIcon.className = 'text-xl text-red-500';
                break;
            case 'info':
                toastIcon.innerHTML = '<i class="fas fa-info-circle"></i>';
                toastIcon.className = 'text-xl text-primary-500';
                break;
            case 'warning':
                toastIcon.innerHTML = '<i class="fas fa-exclamation-triangle"></i>';
                toastIcon.className = 'text-xl text-yellow-500';
                break;
        }
        
        toastMessage.textContent = message;
        
        // Show toast
        toastNotification.classList.remove('invisible', 'opacity-0');
        toastNotification.classList.add('toast-show');
        
        // Hide toast after 3 seconds
        setTimeout(() => {
            toastNotification.classList.remove('toast-show');
            toastNotification.classList.add('invisible', 'opacity-0');
        }, 3000);
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
    
    // Toggle Sort Dropdown
    function toggleSortDropdown() {
        sortDropdown.classList.toggle('hidden');
    }
    
    // Close Sort Dropdown when clicking outside
    document.addEventListener('click', function(e) {
        if (!e.target.closest('#sort-dropdown-container') && !sortDropdown.classList.contains('hidden')) {
            sortDropdown.classList.add('hidden');
        }
    });
    
    // Load Suggested Recipes
    async function loadSuggestedRecipes() {
        if (!suggestedRecipesContainer) return;
        
        try {
            // Show shimmer loading effect
            suggestedRecipesContainer.innerHTML = '';
            for (let i = 0; i < 3; i++) {
                const shimmer = document.createElement('div');
                shimmer.className = 'bg-white rounded-xl shadow-md overflow-hidden shimmer h-80';
                suggestedRecipesContainer.appendChild(shimmer);
            }
            
            // Fetch random recipes
            const response = await fetch('https://www.themealdb.com/api/json/v1/1/random.php');
            const data1 = await response.json();
            
            const response2 = await fetch('https://www.themealdb.com/api/json/v1/1/random.php');
            const data2 = await response2.json();
            
            const response3 = await fetch('https://www.themealdb.com/api/json/v1/1/random.php');
            const data3 = await response3.json();
            
            const suggestedMeals = [
                data1.meals[0],
                data2.meals[0],
                data3.meals[0]
            ];
            
            // Clear shimmer and display recipes
            suggestedRecipesContainer.innerHTML = '';
            suggestedMeals.forEach((meal, index) => {
                const isFavorite = favoritesManager.isFavorite(meal.idMeal);
                const recipeCard = createRecipeCard(meal, isFavorite);
                suggestedRecipesContainer.appendChild(recipeCard);
                
                // Staggered animation
                setTimeout(() => {
                    recipeCard.classList.add('show');
                }, 100 * index);
            });
            
            // Add event listeners
            addRecipeCardEventListeners(suggestedMeals);
            
        } catch (error) {
            console.error('Error loading suggested recipes:', error);
            if (suggestedRecipesContainer) {
                suggestedRecipesContainer.innerHTML = '<p class="text-center text-gray-500">Impossible de charger les recettes recommandées.</p>';
            }
        }
    }
    
    // Event Listeners
    if (closeModal) {
        closeModal.addEventListener('click', closeRecipeModal);
    }
    
    // Close modal when clicking outside
    if (recipeModal) {
        recipeModal.addEventListener('click', (e) => {
            if (e.target === recipeModal) {
                closeRecipeModal();
            }
        });
    }
    
    // Mobile menu toggle
    if (mobileMenuButton) {
        mobileMenuButton.addEventListener('click', toggleMobileMenu);
    }
    
    // Back to top button
    if (backToTopBtn) {
        backToTopBtn.addEventListener('click', scrollToTop);
    }
    
    // Filter input
    if (filterInput) {
        filterInput.addEventListener('input', function() {
            favoritesManager.filterFavorites(this.value);
        });
    }
    
    // Sort button
    if (sortButton) {
        sortButton.addEventListener('click', toggleSortDropdown);
    }
    
    // Sort options
    if (sortOptions) {
        sortOptions.forEach(option => {
            option.addEventListener('click', function() {
                const sortType = this.getAttribute('data-sort');
                favoritesManager.sortFavorites(sortType);
                sortDropdown.classList.add('hidden');
            });
        });
    }
    
    // Scroll event listener
    window.addEventListener('scroll', handleScroll);
    
    // Initialize
    if (loadingSpinner) loadingSpinner.classList.add('hidden');
    favoritesManager.renderFavorites();
    loadSuggestedRecipes();
    handleScroll(); // Check initial scroll position
});
