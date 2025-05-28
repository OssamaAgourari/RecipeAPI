window.addEventListener("load", () => {
    const loader = document.getElementById("page-loader");
    loader.classList.add("opacity-0");
    setTimeout(() => loader.style.display = "none", 500);
  });
document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const searchInput = document.getElementById('search-input');
    const searchBtn = document.getElementById('search-btn');
    const resultsContainer = document.getElementById('results-container');
    const noResults = document.getElementById('no-results');
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
    const categoryPills = document.querySelectorAll('.category-pill');
    const featuredRecipesContainer = document.getElementById('featured-recipes');
    
    // Favorites Manager
    class FavoritesManager {
        constructor() {
            this.favorites = JSON.parse(localStorage.getItem('recipeFavorites')) || [];
            this.updateBadge();
        }
        
        addFavorite(recipe) {
            if (!this.favorites.some(fav => fav.idMeal === recipe.idMeal)) {
                // Add timestamp for sorting
                recipe.favoriteDate = new Date().toISOString();
                this.favorites.push(recipe);
                this.save();
                return true;
            }
            return false;
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
                <div class="flex items-center text-gray-600 mb-4">
                    <i class="fas fa-globe mr-2 text-primary-500"></i>
                    <span>${recipe.strArea || 'International'}</span>
                    ${recipe.strCategory ? `<span class="mx-2">•</span><span>${recipe.strCategory}</span>` : ''}
                </div>
                <button class="view-recipe-btn bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600 text-white px-4 py-2 rounded-lg transition w-full flex items-center justify-center font-medium shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                        data-id="${recipe.idMeal}">
                    <i class="fas fa-utensils mr-2"></i>
                    Voir la recette
                </button>
            </div>
        `;
        
        return card;
    }
    
    // Search Recipes Function
    async function searchRecipes() {
        const searchTerm = searchInput.value.trim();
        if (!searchTerm) return;
        
        // Show loading spinner
        loadingSpinner.classList.remove('hidden');
        resultsContainer.innerHTML = '';
        noResults.classList.add('hidden');
        
        try {
            let apiUrl;
            if (searchTerm.length === 1) {
                // Search by first letter
                apiUrl = `https://www.themealdb.com/api/json/v1/1/search.php?f=${searchTerm}`;
            } else {
                // Search by name
                apiUrl = `https://www.themealdb.com/api/json/v1/1/search.php?s=${searchTerm}`;
            }
            
            const response = await fetch(apiUrl);
            const data = await response.json();
            
            // Hide loading spinner
            loadingSpinner.classList.add('hidden');
            
            if (data.meals) {
                displayRecipes(data.meals);
                // Scroll to results
                document.getElementById('search-results').scrollIntoView({ behavior: 'smooth', block: 'start' });
                showToast('success', `${data.meals.length} recettes trouvées !`);
            } else {
                noResults.classList.remove('hidden');
                showToast('info', 'Aucune recette trouvée. Essayez un autre terme.');
            }
        } catch (error) {
            console.error('Error fetching recipes:', error);
            loadingSpinner.classList.add('hidden');
            noResults.classList.remove('hidden');
            showToast('error', 'Erreur lors de la recherche. Veuillez réessayer.');
        }
    }
    
    // Display Recipes Function
    function displayRecipes(meals) {
        resultsContainer.innerHTML = '';
        
        meals.forEach((meal, index) => {
            const isFavorite = favoritesManager.isFavorite(meal.idMeal);
            const recipeCard = createRecipeCard(meal, isFavorite);
            resultsContainer.appendChild(recipeCard);
            
            // Staggered animation
            setTimeout(() => {
                recipeCard.classList.add('show');
            }, 100 * index);
        });
        
        // Add event listeners to all view recipe buttons
        document.querySelectorAll('.view-recipe-btn').forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.stopPropagation();
                const mealId = this.getAttribute('data-id');
                showRecipeDetails(mealId);
            });
        });
        
        // Add event listeners to all favorite toggles
        document.querySelectorAll('.favorite-toggle').forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.stopPropagation();
                const mealId = this.getAttribute('data-id');
                const icon = this.querySelector('i');
                
                if (icon.classList.contains('far')) {
                    // Add to favorites
                    icon.classList.replace('far', 'fas');
                    icon.classList.replace('text-gray-400', 'text-red-500');
                    this.setAttribute('aria-label', 'Retirer des favoris');
                    icon.classList.add('pulse-heart');
                    
                    // Find the meal in search results
                    const meal = meals.find(m => m.idMeal === mealId);
                    if (meal) {
                        favoritesManager.addFavorite(meal);
                        showToast('success', 'Recette ajoutée aux favoris !');
                    }
                } else {
                    // Remove from favorites
                    icon.classList.replace('fas', 'far');
                    icon.classList.replace('text-red-500', 'text-gray-400');
                    this.setAttribute('aria-label', 'Ajouter aux favoris');
                    favoritesManager.removeFavorite(mealId);
                    showToast('info', 'Recette retirée des favoris');
                }
                
                // Remove animation class after animation completes
                setTimeout(() => {
                    icon.classList.remove('pulse-heart');
                }, 1000);
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
            
            const response = await fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${mealId}`);
            const data = await response.json();
            
            if (data.meals) {
                const meal = data.meals[0];
                populateModal(meal);
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
        } else {
            favoritesManager.addFavorite(meal);
            icon.classList.replace('far', 'fas');
            icon.classList.add('favorite-added');
            showToast('success', 'Recette ajoutée aux favoris !');
            
            // Remove animation class after animation completes
            setTimeout(() => {
                icon.classList.remove('favorite-added');
            }, 500);
        }
        
        // Update any matching recipe cards on the page
        document.querySelectorAll(`.favorite-toggle[data-id="${meal.idMeal}"]`).forEach(btn => {
            const btnIcon = btn.querySelector('i');
            if (isFavorite) {
                btnIcon.classList.replace('fas', 'far');
                btnIcon.classList.replace('text-red-500', 'text-gray-400');
                btn.setAttribute('aria-label', 'Ajouter aux favoris');
            } else {
                btnIcon.classList.replace('far', 'fas');
                btnIcon.classList.replace('text-gray-400', 'text-red-500');
                btn.setAttribute('aria-label', 'Retirer des favoris');
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
    
    // Load Featured Recipes
    async function loadFeaturedRecipes() {
        if (!featuredRecipesContainer) return;
        
        try {
            // Show shimmer loading effect
            featuredRecipesContainer.innerHTML = '';
            for (let i = 0; i < 3; i++) {
                const shimmer = document.createElement('div');
                shimmer.className = 'bg-white rounded-xl shadow-md overflow-hidden shimmer h-80';
                featuredRecipesContainer.appendChild(shimmer);
            }
            
            // Fetch random recipes
            const response = await fetch('https://www.themealdb.com/api/json/v1/1/random.php');
            const data1 = await response.json();
            
            const response2 = await fetch('https://www.themealdb.com/api/json/v1/1/random.php');
            const data2 = await response2.json();
            
            const response3 = await fetch('https://www.themealdb.com/api/json/v1/1/random.php');
            const data3 = await response3.json();
            
            const featuredMeals = [
                data1.meals[0],
                data2.meals[0],
                data3.meals[0]
            ];
            
            // Clear shimmer and display recipes
            featuredRecipesContainer.innerHTML = '';
            featuredMeals.forEach((meal, index) => {
                const isFavorite = favoritesManager.isFavorite(meal.idMeal);
                const recipeCard = createRecipeCard(meal, isFavorite);
                featuredRecipesContainer.appendChild(recipeCard);
                
                // Staggered animation
                setTimeout(() => {
                    recipeCard.classList.add('show');
                }, 100 * index);
            });
            
            // Add event listeners
            document.querySelectorAll('#featured-recipes .view-recipe-btn').forEach(btn => {
                btn.addEventListener('click', function(e) {
                    e.stopPropagation();
                    const mealId = this.getAttribute('data-id');
                    showRecipeDetails(mealId);
                });
            });
            
            document.querySelectorAll('#featured-recipes .favorite-toggle').forEach(btn => {
                btn.addEventListener('click', function(e) {
                    e.stopPropagation();
                    const mealId = this.getAttribute('data-id');
                    const icon = this.querySelector('i');
                    
                    if (icon.classList.contains('far')) {
                        // Add to favorites
                        icon.classList.replace('far', 'fas');
                        icon.classList.replace('text-gray-400', 'text-red-500');
                        this.setAttribute('aria-label', 'Retirer des favoris');
                        icon.classList.add('pulse-heart');
                        
                        // Find the meal
                        const meal = featuredMeals.find(m => m.idMeal === mealId);
                        if (meal) {
                            favoritesManager.addFavorite(meal);
                            showToast('success', 'Recette ajoutée aux favoris !');
                        }
                    } else {
                        // Remove from favorites
                        icon.classList.replace('fas', 'far');
                        icon.classList.replace('text-red-500', 'text-gray-400');
                        this.setAttribute('aria-label', 'Ajouter aux favoris');
                        favoritesManager.removeFavorite(mealId);
                        showToast('info', 'Recette retirée des favoris');
                    }
                    
                    // Remove animation class after animation completes
                    setTimeout(() => {
                        icon.classList.remove('pulse-heart');
                    }, 1000);
                });
            });
            
            // Make entire card clickable
            document.querySelectorAll('#featured-recipes .recipe-card').forEach(card => {
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
            
        } catch (error) {
            console.error('Error loading featured recipes:', error);
            if (featuredRecipesContainer) {
                featuredRecipesContainer.innerHTML = '<p class="text-center text-gray-500">Impossible de charger les recettes recommandées.</p>';
            }
        }
    }
    
    // Handle Category Pills
    function handleCategoryPill(category) {
        searchInput.value = category;
        searchRecipes();
    }
    
    // Event Listeners
    searchBtn.addEventListener('click', searchRecipes);
    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            searchRecipes();
        }
    });
    
    closeModal.addEventListener('click', closeRecipeModal);
    
    // Close modal when clicking outside
    recipeModal.addEventListener('click', (e) => {
        if (e.target === recipeModal) {
            closeRecipeModal();
        }
    });
    
    // Mobile menu toggle
    mobileMenuButton.addEventListener('click', toggleMobileMenu);
    
    // Back to top button
    backToTopBtn.addEventListener('click', scrollToTop);
    
    // Scroll event listener
    window.addEventListener('scroll', handleScroll);
    
    // Category pills
    categoryPills.forEach(pill => {
        pill.addEventListener('click', function() {
            const category = this.textContent.trim();
            handleCategoryPill(category);
        });
    });
    
    // Initialize
    loadFeaturedRecipes();
    handleScroll(); // Check initial scroll position
});
