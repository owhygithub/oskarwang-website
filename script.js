// Polyfill for requestIdleCallback for better browser support
window.requestIdleCallback = window.requestIdleCallback || function(callback) {
    const start = Date.now();
    return setTimeout(function() {
        callback({
            didTimeout: false,
            timeRemaining: function() {
                return Math.max(0, 50 - (Date.now() - start));
            }
        });
    }, 1);
};

document.addEventListener('DOMContentLoaded', () => {
    // Custom cursor functionality removed for better compatibility
    
    // Add touch event support for mobile devices
    document.addEventListener('touchstart', function(e) {
        // Handle touch interactions for mobile
        const target = e.target;
        if (target.classList.contains('nav-btn') || target.tagName === 'BUTTON' || target.tagName === 'A') {
            // Add active state for touch feedback
            target.classList.add('touch-active');
        }
    }, { passive: true });
    
    document.addEventListener('touchend', function(e) {
        // Remove active states
        const activeElements = document.querySelectorAll('.touch-active');
        activeElements.forEach(el => el.classList.remove('touch-active'));
    }, { passive: true });
    
    // Call the function to handle initial page load
    handleInitialPageLoad();
});
    
    // Optimized ripple effect using event delegation
    document.addEventListener('mousedown', function(e) {
        const target = e.target;
        if (target.classList.contains('nav-btn') || target.tagName === 'BUTTON' || target.tagName === 'A') {
            // Skip ripple effect for performance if device might be low-powered
            if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
                return;
            }
            
            const ripple = document.createElement('span');
            const rect = target.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;
            
            // Use a simpler ripple effect with fewer properties
            ripple.style.cssText = `
                position: absolute;
                top: ${y}px;
                left: ${x}px;
                width: ${size}px;
                height: ${size}px;
                background: rgba(255, 255, 255, 0.1);
                border-radius: 50%;
                transform: scale(0);
                animation: ripple 0.6s linear;
                pointer-events: none;
                z-index: 0;
            `;
            
            // Only set these styles if not already set
            if (!target.style.position) target.style.position = 'relative';
            if (!target.style.overflow) target.style.overflow = 'hidden';
            
            target.appendChild(ripple);
            
            // Use requestAnimationFrame for cleanup to avoid layout thrashing
            requestAnimationFrame(() => {
                setTimeout(() => {
                    ripple.remove();
                }, 600);
            });
        }
    }, { passive: true });
    
    // Optimized lazy loading with better performance characteristics
    const lazyImages = document.querySelectorAll('.lazy-load');
    
    // Use more efficient IntersectionObserver options
    const imageObserver = new IntersectionObserver((entries, observer) => {
        // Process all entries in a single RAF call to avoid layout thrashing
        if (entries.length) {
            requestAnimationFrame(() => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        
                        // Create a new image to preload without affecting page layout
                        const tempImage = new Image();
                        tempImage.onload = () => {
                            // Only update the DOM after image is loaded
                            img.src = img.dataset.src;
                            img.classList.add('loaded');
                        };
                        tempImage.onerror = () => {
                            // Handle corrupt or missing images
                            console.warn(`Failed to load image: ${img.dataset.src}`);
                            img.src = 'logos/DSC07816.JPG'; // Fallback image
                            img.classList.add('loaded');
                            img.classList.add('error-image');
                        };
                        tempImage.src = img.dataset.src;
                        
                        observer.unobserve(img);
                    }
                });
            });
        }
    }, {
        rootMargin: '200px 0px', // Load images before they appear in viewport
        threshold: 0.01 // Trigger with minimal visibility
    });

    // Observe images in batches to avoid performance spikes
    if (lazyImages.length > 0) {
        requestIdleCallback(() => {
            lazyImages.forEach(image => {
                imageObserver.observe(image);
            });
        }, { timeout: 1000 });
    }

    // Handle initial page load - improved to better handle URL hash navigation
    function handleInitialPageLoad() {
        // Get the hash from the URL, removing the # symbol
        let hash = window.location.hash.replace('#', '');
        
        // If there's no hash or the hash doesn't correspond to a valid page, default to main
        if (!hash || !document.querySelector(`.${hash}-page`)) {
            hash = 'main';
        }
        
        // Show the appropriate page based on the hash
        showPage(hash);
    }


// Track navigation state
let currentCategory = '';
let currentAlbum = '';
let navigationStack = [];

function showPage(page) {
    const backBtn = document.querySelector('.back-btn');
    const allPages = document.querySelectorAll('.page');
    
    // Ensure the target page exists
    const targetPage = document.querySelector(`.${page}-page`);
    if (!targetPage) {
        console.error(`Page ${page} not found, defaulting to main page`);
        page = 'main';
        // Try to get the main page instead
        const mainPage = document.querySelector('.main-page');
        if (!mainPage) return; // Safety check
    }
    
    // Reset album view flag when not in photos page
    if (page !== 'portfolio-photos') {
        window.isInAlbumView = false;
    }
    
    // Reset scroll position to top
    window.scrollTo(0, 0);
    
    // Hide all pages first
    allPages.forEach(element => {
        element.classList.remove('active-page');
    });

    // Get the target page again in case it was changed to main
    const pageToShow = document.querySelector(`.${page}-page`);
    
    // For overlay pages (like contact), don't hide the main page
    if (page === 'contact') {
        document.querySelector('.main-page').classList.add('active-page');
    }

    if (page === 'portfolio') {
        document.querySelector('.main-page').classList.add('active-page');
        // Reset portfolio navigation when showing main portfolio page
        currentCategory = '';
        currentAlbum = '';
        navigationStack = ['main', 'portfolio'];
    }
    
    pageToShow.classList.add('active-page');

    // Toggle back button visibility and functionality
    if (page === 'main') {
        backBtn.classList.remove('visible');
        // Use replaceState to avoid adding to browser history
        history.replaceState({ page }, document.title, window.location.pathname);
        navigationStack = [];
    } else {
        backBtn.classList.add('visible');
        // Only push state if we're not already on this page (prevents duplicate history entries)
        const currentState = history.state;
        if (!currentState || currentState.page !== page) {
            // Update URL hash and browser history
            history.pushState({ page }, document.title, `#${page}`);
        } else {
            // Ensure the URL hash matches the current page even if we didn't push state
            if (window.location.hash !== `#${page}`) {
                history.replaceState({ page }, document.title, `#${page}`);
            }
        }
        
        // Add to navigation stack if not already there
        if (!navigationStack.includes(page)) {
            navigationStack.push(page);
        } else if (navigationStack[navigationStack.length - 1] !== page) {
            // If page is in stack but not at the end, rebuild stack up to this page
            const pageIndex = navigationStack.indexOf(page);
            navigationStack = navigationStack.slice(0, pageIndex + 1);
        }
    }

}

// Add this with other functions
function redirectToShop() {
    // Replace with your actual shop URL
    window.open('https://www.saatchiart.com/account/profile/2746365', '_blank');
}

// Improved goBack function to work with browser history
function goBack() {
    // If we have a navigation stack with more than one item
    if (navigationStack.length > 1) {
        // Remove the current page from the stack
        navigationStack.pop();
        // Get the previous page
        const previousPage = navigationStack[navigationStack.length - 1];
        // Go back in browser history instead of directly calling showPage
        // This ensures the browser's back button works correctly
        history.back();
    } else {
        // If we're at the root of our navigation, go to main page
        showPage('main');
    }
}

// Add click handler for back button
document.querySelector('.back-btn').addEventListener('click', () => {
    // Use our goBack function to navigate through the hierarchy
    goBack();
});

// Handle hash changes for direct navigation via URL
window.addEventListener('hashchange', function() {
    handleInitialPageLoad();
});

// Handle browser back/forward navigation
window.addEventListener('popstate', function(event) {
    if (event.state && event.state.page) {
        showPage(event.state.page);
    } else {
        handleInitialPageLoad();
    }
});

// Portfolio navigation functions
function showAlbumsForCategory(category) {
    currentCategory = category;
    const albumsGrid = document.querySelector('.albums-grid');
    const categoryTitle = document.querySelector('.album-category-title');
    
    // Reset scroll position to top when showing albums
    window.scrollTo(0, 0);
    document.querySelector('.portfolio-albums-page').scrollTop = 0;
    
    // Update the title
    categoryTitle.textContent = category.charAt(0).toUpperCase() + category.slice(1);
    
    // Clear existing albums
    albumsGrid.innerHTML = '';
    
    // Get albums for this category
    const categoryAlbums = portfolioData[category];
    
    // Create album elements
    Object.keys(categoryAlbums).forEach(albumName => {
        // Get photos for this album - we'll use the Promise version now
        getPhotosFromFolder(category, albumName).then(photos => {
            if (photos.length === 0) {
                console.warn(`No photos found for ${category}/${albumName}`);
                return; // Skip this album if no photos
            }
            
            // Use custom thumbnail if specified, otherwise use first photo
            const albumData = categoryAlbums[albumName];
            const coverImage = albumData.thumbnail || photos[0];
            const albumDir = albumName.toLowerCase().replace(/ /g, '_').replace(/&/g, 'and');
            
            const albumElement = document.createElement('div');
            albumElement.className = 'portfolio-album';
            albumElement.setAttribute('data-album', albumName);
            
            // Create elements separately for better error handling
            const overlay = document.createElement('div');
            overlay.className = 'album-overlay';
            overlay.innerHTML = `<h3>${albumName}</h3>`;
            
            const img = document.createElement('img');
            img.alt = `${albumName}`;
            img.className = 'album-image';
            
            // Add error handling for corrupt cover images
            img.onerror = function() {
                console.warn(`Failed to load album cover: images/${category}/${albumDir}/${coverImage}`);
                this.src = 'logos/DSC07816.JPG'; // Fallback image
                this.classList.add('error-image');
            };
            
            // Set source after adding error handler
            img.src = `images/${category}/${albumDir}/${coverImage}`;
            
            albumElement.appendChild(overlay);
            albumElement.appendChild(img);
            
            albumElement.addEventListener('click', () => {
                showPhotosForAlbum(category, albumName);
            });
            
            albumsGrid.appendChild(albumElement);
            
            // Check if we need to show an error message after all albums have been processed
            if (albumsGrid.children.length === 0 && Object.keys(categoryAlbums).length === Object.keys(categoryAlbums).indexOf(albumName) + 1) {
                albumsGrid.innerHTML = '<div class="error-message">No albums found for this category.</div>';
            }
        });
    });
    
    // Show the albums page
    const allPages = document.querySelectorAll('.page');
    allPages.forEach(element => {
        element.classList.remove('active-page');
    });
    document.querySelector('.portfolio-albums-page').classList.add('active-page');
    
    // Update navigation
    if (navigationStack[navigationStack.length - 1] !== 'portfolio-albums') {
        navigationStack.push('portfolio-albums');
    }
}

function showPhotosForAlbum(category, album) {
    currentAlbum = album;
    const photosContainer = document.querySelector('.photos-container');
    const albumTitle = document.querySelector('.album-title');
    
    // Reset scroll position to top when showing photos
    window.scrollTo(0, 0);
    document.querySelector('.portfolio-photos-page').scrollTop = 0;
    
    // Set flag to indicate we're in album view (maintained for other functionality)
    // Note: This no longer affects cursor speed since we're using direct positioning
    window.isInAlbumView = true;
    
    // Update the title
    albumTitle.textContent = album;
    
    // Clear existing photos
    photosContainer.innerHTML = '';
    
    // Show loading indicator
    const loadingElement = document.createElement('div');
    loadingElement.className = 'loading-indicator';
    loadingElement.textContent = 'Loading photos...';
    photosContainer.appendChild(loadingElement);
    
    // Get photos for this album asynchronously
    getPhotosFromFolder(category, album).then(photos => {
        // Remove loading indicator
        photosContainer.innerHTML = '';
        
        // Create photo elements
        if (photos.length === 0) {
            photosContainer.innerHTML = '<div class="error-message">No photos found in this album.</div>';
            return;
        }
        
        // Map album name to directory name
        const albumDir = album.toLowerCase().replace(/ /g, '_').replace(/&/g, 'and');
        
        photos.forEach(photo => {
            const photoElement = document.createElement('div');
            photoElement.className = 'photo-item';
            
            // Create the image element
            const img = document.createElement('img');
            img.alt = `${album} photo`;
            img.className = 'photo-image';
            
            // Add error handling for corrupt images
            img.onerror = function() {
                console.warn(`Failed to load image: images/${category}/${albumDir}/${photo}`);
                this.src = 'logos/DSC07816.JPG'; // Fallback image
                this.classList.add('error-image');
            };
            
            // Set source after adding error handler
            img.src = `images/${category}/${albumDir}/${photo}`;
            
            // Check if the image is landscape after it loads with improved ratio detection
            img.onload = function() {
                const ratio = this.naturalWidth / this.naturalHeight;
                
                // More precise landscape detection with a slight threshold
                if (ratio > 1.2) {
                    // This is a landscape photo
                    photoElement.classList.add('landscape');
                } else if (ratio > 0.8 && ratio < 1.2) {
                    // This is a square-ish photo, handle differently
                    photoElement.classList.add('square');
                }
                
                // Force a small layout recalculation to ensure grid alignment
                setTimeout(() => {
                    window.dispatchEvent(new Event('resize'));
                }, 50);
            };
            
            photoElement.appendChild(img);
            photosContainer.appendChild(photoElement);
        });

    }).catch(error => {
        console.error('Error loading photos:', error);
        photosContainer.innerHTML = '<div class="error-message">Error loading photos. Please try again later.</div>';
    });
    
    // Show the photos page
    const allPages = document.querySelectorAll('.page');
    allPages.forEach(element => {
        element.classList.remove('active-page');
    });
    document.querySelector('.portfolio-photos-page').classList.add('active-page');
    
    // Update navigation
    if (navigationStack[navigationStack.length - 1] !== 'portfolio-photos') {
        navigationStack.push('portfolio-photos');
    }
}


// Helper function to get image files from a folder - fetches from GitHub repository
function getPhotosFromFolder(category, album) {
    return new Promise((resolve) => {
        // Map album names to directory names for proper path construction
        const albumDirMap = {
            'Street Stories': 'street_stories',
            'Eastern Europe': 'eastern_europe',
            'The People': 'the_people',
            'Commissions': 'commissions',
            'Friends & Family': 'friends_and_family',
            'Public Events': 'public_events',
            'Private Events': 'private_events',
            'Brands': 'brands',
            'Travel': 'travel',
            'Cars': 'cars',
            'Experimental': 'experimental',
            'Nature': 'nature'
        };
        
        // Convert album name to directory name
        const albumDir = albumDirMap[album] || album.toLowerCase().replace(/ /g, '_').replace(/&/g, 'and');
        
        // Construct the GitHub API URL to fetch directory contents
        const githubAPIUrl = `https://api.github.com/repos/owhygithub/oskarwang-website/contents/images/${category}/${albumDir}`;
        
        // Add cache buster to prevent caching issues
        const cacheBuster = `?timestamp=${Date.now()}`;
        
        // Fetch the directory listing from GitHub API
        fetch(githubAPIUrl + cacheBuster)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`GitHub API error: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                // Filter for image files only
                const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.JPG', '.JPEG', '.PNG', '.GIF'];
                const images = data
                    .filter(file => 
                        file.type === 'file' && 
                        imageExtensions.some(ext => file.name.toLowerCase().endsWith(ext.toLowerCase()))
                    )
                    .map(file => file.name);
                
                if (images.length > 0) {
                    console.log(`Found ${images.length} images for ${category}/${album}`);
                    resolve(images);
                } else {
                    throw new Error(`No images found in GitHub repository for ${category}/${album}`);
                }
            })
            .catch(error => {
                console.warn(`Error fetching from GitHub: ${error.message}`);
                console.warn(`Falling back to static image list for ${category}/${album}`);
            });
    });
}


// Portfolio data structure - simplified for dynamic loading with custom thumbnails
const portfolioData = {
    photojournalism: {
        'Street Stories': {
            thumbnail: 'DSC02923.jpg' // Custom thumbnail image
        },
        'Eastern Europe': {
            thumbnail: 'warsaw-1418.jpg' // Custom thumbnail image
        },
        'The People': {
            thumbnail: 'IMG_0219.jpg' // Custom thumbnail image
        }
    },
    portraits: {
        'Commissions': {
            thumbnail: 'IMG_6170.jpg' // Custom thumbnail image
        },
        'Friends & Family': {
            thumbnail: 'DSC03558.jpg' // Custom thumbnail image
        }
    },
    events: {
        'Public Events': {
            thumbnail: 'DSC02600.jpg' // Custom thumbnail image
        },
        'Private Events': {
            thumbnail: 'bday-60th-6.jpg' // Custom thumbnail image
        },
        'Brands': {
            thumbnail: 'DSC05731.jpg' // Custom thumbnail image
        }
    },
    personal: {
        'Travel': {
            thumbnail: '49FF53E2-8B17-405D-A21B-849B0275D93B.jpg' // Custom thumbnail image
        },
        'Cars': {
            thumbnail: 'DSC07038.jpg' // Custom thumbnail image
        },
        'Experimental': {
            thumbnail: 'edit4.jpg' // Custom thumbnail image
        },
        'Nature': {
            thumbnail: 'IMG_8845.jpg' // Custom thumbnail image
        }
    }
};

// Initialize portfolio event listeners
// Polyfill for requestIdleCallback for better browser support
window.requestIdleCallback = window.requestIdleCallback || function(callback) {
    const start = Date.now();
    return setTimeout(function() {
        callback({
            didTimeout: false,
            timeRemaining: function() {
                return Math.max(0, 50 - (Date.now() - start));
            }
        });
    }, 1);
};

document.addEventListener('DOMContentLoaded', () => {
    // Add event listeners to category elements
    document.querySelectorAll('.portfolio-category').forEach(category => {
        category.addEventListener('click', () => {
            const categoryName = category.getAttribute('data-category');
            showAlbumsForCategory(categoryName);
        });
    });
    
    // Handle initial page load based on URL hash
    handleInitialPageLoad();
    
    // Set initial history state for the main page if no hash is present
    if (!window.location.hash) {
        history.replaceState({ page: 'main' }, document.title, window.location.pathname);
    }
});

// Initialize preloader
// Polyfill for requestIdleCallback for better browser support
window.requestIdleCallback = window.requestIdleCallback || function(callback) {
    const start = Date.now();
    return setTimeout(function() {
        callback({
            didTimeout: false,
            timeRemaining: function() {
                return Math.max(0, 50 - (Date.now() - start));
            }
        });
    }, 1);
};

document.addEventListener('DOMContentLoaded', () => {
    // Hide preloader when page is loaded
    const hidePreloader = () => {
        const preloader = document.querySelector('.preloader');
        preloader.style.opacity = '0';
        setTimeout(() => {
            preloader.style.display = 'none';
        }, 500);
    };
    
    // Hide preloader on both DOMContentLoaded and window load events
    // This ensures it works on both initial load and page refresh
    hidePreloader();
    window.addEventListener('load', hidePreloader);
});

// Handle window popstate for browser back button
window.addEventListener('popstate', (event) => {
    if (event.state && event.state.page) {
        showPage(event.state.page);
    } else {
        showPage('main');
    }
});

// Additional portfolio navigation helpers
function goBack() {
    if (navigationStack.length <= 1) {
        showPage('main');
        return;
    }
    
    // Remove current page from stack
    navigationStack.pop();
    
    // Reset album view flag when navigating away from photos page
    if (navigationStack[navigationStack.length - 1] !== 'portfolio-photos') {
        window.isInAlbumView = false;
    }
    
    // Go to previous page
    const previousPage = navigationStack[navigationStack.length - 1];
    
    if (previousPage === 'portfolio') {
        showPage('portfolio');
    } else if (previousPage === 'portfolio-albums') {
        showAlbumsForCategory(currentCategory);
    } else if (previousPage === 'portfolio-photos') {
        showPhotosForAlbum(currentCategory, currentAlbum);
    } else {
        showPage(previousPage);
    }
}

// Optimized lightbox functionality for portfolio photos
(function() {
    // Create lightbox elements once and reuse them
    const lightbox = document.createElement('div');
    lightbox.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background: rgba(0,0,0,0.9);
        display: none; /* Hidden by default */
        justify-content: center;
        align-items: center;
        cursor: pointer;
        z-index: 1000;
        opacity: 0;
        transition: opacity 0.2s ease;
    `;
    
    const fullImg = document.createElement('img');
    fullImg.style.maxWidth = '90%';
    fullImg.style.maxHeight = '90%';
    fullImg.style.transform = 'scale(0.95)';
    fullImg.style.transition = 'transform 0.2s ease';
    
    lightbox.appendChild(fullImg);
    document.body.appendChild(lightbox);
    
    // Show lightbox function with optimized animation
    function showLightbox(imgSrc) {
        fullImg.src = imgSrc;
        lightbox.style.display = 'flex';
        
        // Force reflow before starting animation
        void lightbox.offsetWidth;
        
        lightbox.style.opacity = '1';
        fullImg.style.transform = 'scale(1)';
    }
    
    // Hide lightbox function with optimized animation
    function hideLightbox() {
        lightbox.style.opacity = '0';
        fullImg.style.transform = 'scale(0.95)';
        
        setTimeout(() => {
            lightbox.style.display = 'none';
        }, 200);
    }
    
    // Event delegation for better performance
    document.addEventListener('click', (e) => {
        // Check if clicking on an image
        if (e.target.classList.contains('photo-image') || e.target.classList.contains('album-image') || e.target.classList.contains('category-image')) {
            // Don't show lightbox if clicking on category or album (they navigate instead)
            if ((e.target.classList.contains('category-image') && e.target.closest('.portfolio-category')) ||
                (e.target.classList.contains('album-image') && e.target.closest('.portfolio-album'))) {
                return;
            }
            
            showLightbox(e.target.src);
        }
        
        // Check if clicking on the lightbox to close it
        if (e.target === lightbox || e.target === fullImg) {
            hideLightbox();
        }
    }, { passive: true });
    
    // Close lightbox with escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && lightbox.style.display === 'flex') {
            hideLightbox();
        }
    });
})();

// Optimized parallax effect with throttling and RAF
(function() {
    let ticking = false;
    let lastMouseX = 0;
    let lastMouseY = 0;
    const parallaxFactor = 0.005; // Reduced factor for better performance
    
    document.addEventListener('mousemove', (e) => {
        lastMouseX = e.clientX;
        lastMouseY = e.clientY;
        
        if (!ticking) {
            requestAnimationFrame(() => {
                if (document.querySelector('.main-page.active-page')) {
                    const mainPage = document.querySelector('.main-page');
                    const moveX = (lastMouseX - window.innerWidth / 2) * parallaxFactor;
                    const moveY = (lastMouseY - window.innerHeight / 2) * parallaxFactor;
                    
                    mainPage.style.backgroundPosition = `calc(50% + ${moveX}px) calc(50% + ${moveY}px)`;
                }
                ticking = false;
            });
            ticking = true;
        }
    }, { passive: true });
})();