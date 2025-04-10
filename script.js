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
    window.addEventListener('load', () => {
        const preloader = document.querySelector('.preloader');
        preloader.style.opacity = '0';
        setTimeout(() => {
            preloader.style.display = 'none';
        }, 500);
    });
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
        isInAlbumView = false;
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

document.addEventListener('DOMContentLoaded', () => {
    // Initialize custom cursor with highly optimized animation
    const cursor = document.querySelector('.cursor');
    
    // Super snappy cursor variables
    let mouseX = 0, mouseY = 0;
    let cursorX = 0, cursorY = 0;
    let speed = 0.9; // Much higher speed for snappy movement
    let albumViewSpeed = 1.0; // Even faster for album view
    
    // Add variables for throttling cursor updates
    let lastCursorUpdate = 0;
    const cursorUpdateInterval = 16; // ~60fps, adjust as needed for performance
    let lastCursorX = 0, lastCursorY = 0;
    
    // Use a boolean flag for hover state instead of changing properties repeatedly
    let isHovering = false;
    let isInAlbumView = false;
    
    // Pre-calculate transform strings for better performance
    const baseTransform = 'translate(-50%, -50%) rotate(-45deg)';
    
    // Highly optimized animation function for snappy cursor movement
    function animateCursor(timestamp) {
        // Skip calculation if not enough time has passed (throttling)
        if (timestamp - lastCursorUpdate < cursorUpdateInterval) {
            requestAnimationFrame(animateCursor);
            return;
        }
        
        lastCursorUpdate = timestamp;
        
        // Only calculate position when cursor is visible and not in reduced motion mode
        if (cursor.style.opacity !== '0' && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            // Use much faster speed for snappy movement
            const currentSpeed = isInAlbumView ? albumViewSpeed : speed;
            
            // Almost direct positioning with minimal lag
            cursorX = mouseX - (mouseX - cursorX) * (1 - currentSpeed);
            cursorY = mouseY - (mouseY - cursorY) * (1 - currentSpeed);
            
            // Use translate3d for hardware acceleration with minimal string concatenation
            // Only update transform if position has changed significantly
            if (Math.abs(cursorX - lastCursorX) > 0.5 || Math.abs(cursorY - lastCursorY) > 0.5) {
                cursor.style.transform = `translate3d(${cursorX}px, ${cursorY}px, 0) ${baseTransform}`;
                lastCursorX = cursorX;
                lastCursorY = cursorY;
            }
        }
        
        requestAnimationFrame(animateCursor);
    }
    
    // Start animation loop
    requestAnimationFrame(animateCursor);
    
    // Use pointer events for better performance across devices
    document.addEventListener('pointermove', (e) => {
        // Direct assignment for immediate response
        mouseX = e.clientX;
        mouseY = e.clientY;
        
        // For super snappy movement, directly update cursor position
        // This makes the cursor follow the mouse almost instantly
        cursorX = mouseX;
        cursorY = mouseY;
        
        // Set cursor position directly on first move for immediate response
        if (cursor.style.opacity !== '1') {
            cursor.style.opacity = '1';
        }
        
        // Apply transform directly for maximum responsiveness
        cursor.style.transform = `translate3d(${cursorX}px, ${cursorY}px, 0) ${baseTransform}`;
    }, { passive: true });
    
    // Hide cursor when mouse leaves the window
    document.addEventListener('pointerleave', () => {
        cursor.style.opacity = '0';
    });
    
    // Show cursor when mouse enters the window
    document.addEventListener('pointerenter', () => {
        cursor.style.opacity = '1';
        // Reset cursor position to current mouse position for immediate response
        cursorX = mouseX;
        cursorY = mouseY;
        // Apply transform immediately
        cursor.style.transform = `translate3d(${cursorX}px, ${cursorY}px, 0) ${baseTransform}`;
    });
    
    // Use event delegation for hover effects instead of attaching to each element
    document.addEventListener('mouseover', (e) => {
        const target = e.target;
        // Check if the target is an interactive element
        if (target.matches('a, button, .nav-btn, .portfolio-item img, .back-btn, .portfolio-category, .portfolio-album')) {
            cursor.style.borderBottomColor = '#ffffff';
            isHovering = true;
            speed = 1.0; // Instant response on hover
        }
        // Special handling for photo items in album view for better responsiveness
        if (target.matches('.photo-item, .photo-image')) {
            cursor.style.borderBottomColor = '#ffffff';
            isHovering = true;
            speed = 1.0; // Instant response for photo items
        }
    }, { passive: true });


    
    document.addEventListener('mouseout', (e) => {
        const target = e.target;
        if (target.matches('a, button, .nav-btn, .portfolio-item img, .back-btn, .portfolio-category, .portfolio-album')) {
            cursor.style.borderBottomColor = '#ffea00';
            isHovering = false;
            speed = 0.9; // Return to our snappy base speed
        }
        // Special handling for photo items in album view
        if (target.matches('.photo-item, .photo-image')) {
            cursor.style.borderBottomColor = '#ffea00';
            isHovering = false;
            speed = isInAlbumView ? 1.0 : 0.9; // Return to appropriate snappy speed based on view
        }
    }, { passive: true });

    
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
                            
                            // Add srcset if available
                            if (img.dataset.srcset) {
                                img.srcset = img.dataset.srcset;
                            }
                            
                            img.classList.add('loaded');
                            
                            // Decode image asynchronously for smoother rendering
                            if ('decode' in img) {
                                img.decode().catch(() => {
                                    // Silent catch - continue even if decode fails
                                });
                            }
                        };
                        tempImage.src = img.dataset.src;
                        
                        observer.unobserve(img);
                    }
                });
            });
        }
    }, {
        rootMargin: '300px 0px', // Increased margin to load images earlier
        threshold: 0.01 // Trigger with minimal visibility
    });

    // Observe images in batches to avoid performance spikes
    if (lazyImages.length > 0) {
        // Use a more efficient batching approach
        const batchSize = 5; // Process 5 images at a time
        const processBatch = (startIndex) => {
            const endIndex = Math.min(startIndex + batchSize, lazyImages.length);
            
            for (let i = startIndex; i < endIndex; i++) {
                imageObserver.observe(lazyImages[i]);
            }
            
            if (endIndex < lazyImages.length) {
                requestIdleCallback(() => {
                    processBatch(endIndex);
                }, { timeout: 500 });
            }
        };
        
        // Start processing the first batch
        requestIdleCallback(() => {
            processBatch(0);
        }, { timeout: 800 });
    }

    // Handle initial page load
    const hash = window.location.hash.replace('#', '');
    if (hash && document.querySelector(`.${hash}-page`)) {
        showPage(hash);
    }


// Track navigation state
let currentCategory = '';
let currentAlbum = '';
let navigationStack = [];

function showPage(page) {
    const backBtn = document.querySelector('.back-btn');
    const allPages = document.querySelectorAll('.page');
    
    // Reset album view flag when not in photos page
    if (page !== 'portfolio-photos') {
        isInAlbumView = false;
    }
    
    // Reset scroll position to top
    window.scrollTo(0, 0);
    
    // Hide all pages first
    allPages.forEach(element => {
        element.classList.remove('active-page');
    });

    const targetPage = document.querySelector(`.${page}-page`);
    
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
    
    targetPage.classList.add('active-page');

    // Toggle back button visibility and functionality
    if (page === 'main') {
        backBtn.classList.remove('visible');
        history.replaceState({ page }, document.title, window.location.pathname);
        navigationStack = [];
    } else {
        backBtn.classList.add('visible');
        history.pushState({ page }, document.title, `#${page}`);
        
        // Add to navigation stack if not already there
        if (!navigationStack.includes(page)) {
            navigationStack.push(page);
        }
    }
}

// Add this with other functions
function redirectToShop() {
    // Replace with your actual shop URL
    window.open('https://www.saatchiart.com/account/profile/2746365', '_blank');
}

// Add click handler for back button
document.querySelector('.back-btn').addEventListener('click', () => {
    // Use our goBack function to navigate through the hierarchy
    goBack();
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
    
    // Show loading indicator
    const loadingElement = document.createElement('div');
    loadingElement.className = 'loading-indicator';
    loadingElement.textContent = 'Loading albums...';
    albumsGrid.appendChild(loadingElement);
    
    // Get albums for this category
    const categoryAlbums = portfolioData[category];
    
    // Create a document fragment to batch DOM operations
    const fragment = document.createDocumentFragment();
    
    // Track loaded albums to handle error message
    let loadedAlbumCount = 0;
    const totalAlbums = Object.keys(categoryAlbums).length;
    
    // Process albums in batches to prevent UI blocking
    const processAlbumBatch = (albumNames, startIndex, batchSize) => {
        const endIndex = Math.min(startIndex + batchSize, albumNames.length);
        
        // Process current batch
        for (let i = startIndex; i < endIndex; i++) {
            const albumName = albumNames[i];
            
            // Get photos for this album - we'll use the Promise version now
            getPhotosFromFolder(category, albumName).then(photos => {
                loadedAlbumCount++;
                
                if (photos.length === 0) {
                    console.warn(`No photos found for ${category}/${albumName}`);
                    
                    // Check if all albums have been processed
                    if (loadedAlbumCount === totalAlbums) {
                        // Remove loading indicator
                        const loadingIndicator = albumsGrid.querySelector('.loading-indicator');
                        if (loadingIndicator) loadingIndicator.remove();
                        
                        // Show error message if no albums were loaded
                        if (albumsGrid.children.length === 0) {
                            albumsGrid.innerHTML = '<div class="error-message">No albums found for this category.</div>';
                        }
                    }
                    return; // Skip this album if no photos
                }
                
                // Use custom thumbnail if specified, otherwise use first photo
                const albumData = categoryAlbums[albumName];
                const coverImage = albumData.thumbnail || photos[0];
                const albumDir = albumName.toLowerCase().replace(/ /g, '_').replace(/&/g, 'and');
                
                const albumElement = document.createElement('div');
                albumElement.className = 'portfolio-album';
                albumElement.setAttribute('data-album', albumName);
                
                // Create elements separately for better performance
                const overlay = document.createElement('div');
                overlay.className = 'album-overlay';
                
                const title = document.createElement('h3');
                title.textContent = albumName;
                overlay.appendChild(title);
                
                const img = document.createElement('img');
                // Use a tiny SVG placeholder initially
                img.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1 1"%3E%3C/svg%3E';
                img.setAttribute('data-src', `images/${category}/${albumDir}/${coverImage}`);
                img.alt = albumName;
                img.className = 'album-image';
                img.decoding = 'async'; // Use async decoding for better performance
                
                // Load the actual image
                const tempImage = new Image();
                tempImage.onload = () => {
                    requestAnimationFrame(() => {
                        img.src = tempImage.src;
                        img.classList.add('loaded');
                    });
                };
                tempImage.src = `images/${category}/${albumDir}/${coverImage}`;
                
                albumElement.appendChild(overlay);
                albumElement.appendChild(img);
                
                albumElement.addEventListener('click', () => {
                    showPhotosForAlbum(category, albumName);
                });
                
                fragment.appendChild(albumElement);
                
                // Check if all albums have been processed
                if (loadedAlbumCount === totalAlbums) {
                    // Remove loading indicator
                    const loadingIndicator = albumsGrid.querySelector('.loading-indicator');
                    if (loadingIndicator) loadingIndicator.remove();
                    
                    // Append the fragment to the grid
                    albumsGrid.appendChild(fragment);
                }
            });
        }
        
        // If there are more albums to process, schedule the next batch
        if (endIndex < albumNames.length) {
            requestIdleCallback(() => {
                processAlbumBatch(albumNames, endIndex, batchSize);
            }, { timeout: 50 });
        }
    };
    
    // Start processing in batches of 3 albums
    processAlbumBatch(Object.keys(categoryAlbums), 0, 3);
    
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
    
    // Set flag to indicate we're in album view for faster cursor movement
    isInAlbumView = true;
    
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
        
        // Create a document fragment to batch DOM operations
        const fragment = document.createDocumentFragment();
        
        // Process photos in batches to prevent UI blocking
        const processBatch = (startIndex, batchSize) => {
            const endIndex = Math.min(startIndex + batchSize, photos.length);
            
            for (let i = startIndex; i < endIndex; i++) {
                const photo = photos[i];
                const photoElement = document.createElement('div');
                photoElement.className = 'photo-item';
                
                // Create the image element with a tiny placeholder initially
                const img = document.createElement('img');
                img.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1 1"%3E%3C/svg%3E';
                img.setAttribute('data-src', `images/${category}/${albumDir}/${photo}`);
                img.alt = `${album} photo`;
                img.className = 'photo-image';
                img.loading = 'lazy'; // Use native lazy loading as additional support
                img.decoding = 'async'; // Use async decoding for better performance
                
                // Add progressive loading
                const observer = new IntersectionObserver((entries) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            const target = entry.target;
                            
                            // Create a new image to preload without affecting page layout
                            const tempImage = new Image();
                            tempImage.onload = () => {
                                // Only update the DOM after image is loaded
                                requestAnimationFrame(() => {
                                    target.src = target.dataset.src;
                                    target.classList.add('loaded');
                                    
                                    // Decode image asynchronously for smoother rendering
                                    if ('decode' in target) {
                                        target.decode().catch(() => {
                                            // Silent catch - continue even if decode fails
                                        });
                                    }
                                });
                            };
                            tempImage.src = target.dataset.src;
                            
                            observer.unobserve(target);
                        }
                    });
                }, {
                    rootMargin: '200px 0px',
                    threshold: 0.01
                });
                
                observer.observe(img);
                
                // Check if the image is landscape after it loads with improved ratio detection
                img.onload = function() {
                    if (this.src.includes('data:image')) return; // Skip for placeholder
                    
                    const ratio = this.naturalWidth / this.naturalHeight;
                    
                    // More precise landscape detection with a slight threshold
                    if (ratio > 1.2) {
                        // This is a landscape photo
                        photoElement.classList.add('landscape');
                    } else if (ratio > 0.8 && ratio < 1.2) {
                        // This is a square-ish photo, handle differently
                        photoElement.classList.add('square');
                    }
                };
                
                photoElement.appendChild(img);
                fragment.appendChild(photoElement);
            }
            
            // If this is the first batch, append it immediately
            if (startIndex === 0) {
                photosContainer.appendChild(fragment.cloneNode(true));
            }
            
            // Schedule next batch if needed
            if (endIndex < photos.length) {
                requestIdleCallback(() => {
                    processBatch(endIndex, batchSize);
                    // Append this batch to the container
                    photosContainer.appendChild(fragment);
                }, { timeout: 50 });
            } else {
                // Append final batch
                photosContainer.appendChild(fragment);
                
                // Force a small layout recalculation to ensure grid alignment
                requestAnimationFrame(() => {
                    window.dispatchEvent(new Event('resize'));
                });
            }
        };
        
        // Start processing with first batch of 6 photos
        processBatch(0, 6);

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


// Helper function to get image files from a folder - updated to include all new photos
function getPhotosFromFolder(category, album) {
    // Return a Promise to make this function compatible with the async usage in showPhotosForAlbum
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
        
        // Updated photo collections with all available images
        const photoCollections = {
            photojournalism: {
                'Street Stories': [
                    '081.jpg', 'DSC00533.jpg', 'DSC00559.jpg', 'DSC00582.jpg', 'DSC00755.jpg', 'DSC01128.jpg',
                    'DSC01486.jpg', 'DSC01497.jpg', 'DSC01512.jpg', 'DSC01576.jpg', 'DSC02048.jpg',
                    'DSC02923.jpg', 'DSC06358.jpg', 'DSC06666.jpg', 'DSC07065.JPG', 'DSC07816.JPG', 'DSC07825.JPG',
                    'DSC07839.JPG', 'DSC08003.JPG', 'IMG_0220.jpg', 'IMG_8109.jpg', 'IMG_8158.jpg',
                    'IMG_8497.jpg', 'IMG_8711.jpg', 'IMG_9456.jpg', 'IMG_9502.jpg', 'IMG_9505.jpg',
                    'italy-105.jpg', 'italy-11.jpg', 'italy-40.jpg', 'italy-53.jpg', 'italy-95.jpg'
                ],
                'Eastern Europe': [
                    'DSC04645.jpg', 'DSC04652.jpg', 'DSC04656.jpg', 'DSC04673.jpg', 'DSC04674.jpg',
                    'DSC04706.jpg', 'IMG_8506.jpg', 'IMG_8595.jpg', 'IMG_8714.jpg', 'IMG_8820.jpg',
                    'IMG_8823.jpg', 'IMG_8829.jpg', 'IMG_8836.jpg', 'warsaw-1418.jpg', 'warsaw-1449.jpg'
                ],
                'The People': [
                    'IMG_0211.jpg', 'IMG_0219.jpg', 'IMG_7387.jpg', 'IMG_7390.jpg', 'IMG_7395.jpg', 
                    'IMG_7397.jpg', 'IMG_7419.jpg', 'IMG_7429.jpg', 'IMG_7432.jpg', 'IMG_7447.jpg', 
                    'IMG_7460.jpg', 'IMG_7463.jpg', 'IMG_7465.jpg'
                ]
            },
            portraits: {
                'Commissions': [
                    '2020NEWb_1.jpg', '2020NEWe.jpg', 'DSC06736.jpg', 'DSC06772.jpg', 'DSC06778.jpg',
                    'DSC06789.jpg', 'IMG_6142.jpg', 'IMG_6151.jpg', 'IMG_6170.jpg', 'IMG_6178.jpg', 
                    'IMG_7832.JPG', 'IMG_9162.jpg', 'IMG_9163.jpg', 'hana_2021_amsterdam-14.jpg', 
                    'hana_2021_amsterdam-8.jpg'
                ],
                'Friends & Family': [
                    '55-DSC06358.jpg', '57-DSC06368.jpg', 'DSC00622.jpg', 'DSC02459.jpg', 'DSC02461.jpg',
                    'DSC02967.jpg', 'DSC02982.jpg', 'DSC03078.jpg', 'DSC03094.jpg', 'DSC03558.jpg', 
                    'DSC05104.jpg', 'DSC05137.jpg', 'DSC05146.jpg', 'DSC05229.jpg', 'DSC05385.jpg', 
                    'DSC05645.jpg', 'DSC06304.jpg', 'DSC07874.JPG', 'IMG_0759.jpg', 'IMG_0806.jpg', 
                    'IMG_0841.jpg', 'IMG_0909.jpg', 'IMG_8975.jpg', 'IMG_9162.jpg', 'IMG_9163.jpg', 
                    'IMG_9389.jpg', 'IMG_9397.jpg', 'IMG_9413.jpg', 'IMG_9459.jpg', 'IMG_9488.jpg', 
                    'IMG_9818.jpg'
                ]
            },
            events: {
                'Public Events': [
                    'DSC02411.jpg', 'DSC02490.jpg', 'DSC02501.jpg', 'DSC02506.jpg', 'DSC02519.jpg',
                    'DSC02543.jpg', 'DSC02547.jpg', 'DSC02566.jpg', 'DSC02582.jpg', 'DSC02600.jpg',
                    'DSC02602.jpg', 'DSC02625.jpg', 'DSC02712.jpg', 'IMG_7307.jpg', 'IMG_7312.jpg',
                    'IMG_9652.jpg'
                ],
                'Private Events': [
                    'DSC04801.jpg', 'DSC05173.jpg', 'DSC08511.jpg', 'DSC08647.jpg', 'DSC08701.jpg',
                    'DSC08732.jpg', 'DSC08878.jpg', 'HalloweenParty44.jpg', 'HalloweenParty49.jpg',
                    'IMG_1848.jpg', 'IMG_5270closeup.jpg', '_DSC0006.JPG', '_DSC0062.JPG', '_DSC0201.JPG',
                    '_DSC0206.JPG', '_MG_5254.jpg', 'bday-60th-166.jpg', 'bday-60th-167.jpg',
                    'bday-60th-4.jpg', 'bday-60th-40.jpg', 'bday-60th-6.jpg'
                ],
                'Brands': [
                    'DSC05724.jpg', 'DSC05731.jpg', 'DSC05759.jpg'
                ]
            },
            personal: {
                'Travel': [
                    '49FF53E2-8B17-405D-A21B-849B0275D93B.jpg', 'DSC00888.JPG', 'DSC02479.jpg',
                    'DSC02950.jpg', 'DSC03161.jpg', 'DSC03632.jpg', 'DSC06364.jpg', 'DSC07516.jpg',
                    'DSC07693.JPG', 'DSC07709.JPG', 'DSC07816.JPG', 'DSC07897.JPG', 'DSC07926.JPG',
                    'IMG_7359.jpg', 'IMG_8500.jpg', 'IMG_8573.jpg', 'IMG_8696.jpg', 'IMG_8709.jpg',
                    'IMG_9168.jpg', 'IMG_9464.jpg', '_MG_4669.jpg', 'italy-1.jpg', 'italy-19.jpg',
                    'italy-6.jpg'
                ],
                'Cars': [
                    'BMW1.jpg', 'DSC00433.jpg', 'DSC07027.jpg', 'DSC07038.jpg', 'DSC07067.jpg',
                    'DSC07188.jpg', 'DSC07332.jpg', 'DSC07352.jpg', 'DSC07673.JPG', 'IMG_3600-v2.jpg',
                    'IMG_3624.jpg', 'IMG_5266.jpg', 'IMG_5346.jpg', 'IMG_9044.jpg'
                ],
                'Experimental': ['6.jpg', 'edit4.jpg'],
                'Nature': [
                    '78-DSC06461.jpg', 'DSC03859.jpg', 'DSC03864.jpg', 'DSC03873.jpg', 'DSC04339.jpg',
                    'IMG_7355.jpg', 'IMG_7383.jpg', 'IMG_8464.jpg', 'IMG_8793.jpg', 'IMG_8804.jpg',
                    'IMG_8807.jpg', 'IMG_8832.jpg', 'IMG_8835.jpg', 'IMG_8841.jpg', 'IMG_8845.jpg',
                    'IMG_8846.jpg', 'IMG_8920.jpg', 'IMG_9008.jpg', 'italy-23.jpg', 'italy-25.jpg',
                    'italy-32.jpg', 'italy-34.jpg', 'italy-36.jpg'
                ]
            }
        };
        
        // Return the photos for the specified category and album
        if (photoCollections[category] && photoCollections[category][album]) {
            resolve(photoCollections[category][album]);
        } else {
            // Return an empty array if the category or album doesn't exist
            resolve([]);
        }
    });
}

// Portfolio data structure - simplified for dynamic loading with custom thumbnails
const portfolioData = {
    photojournalism: {
        'Street Stories': {
            thumbnail: 'italy-95.jpg' // Custom thumbnail image
        },
        'Eastern Europe': {
            thumbnail: 'DSC04656.jpg' // Custom thumbnail image
        },
        'The People': {
            thumbnail: 'IMG_7395.jpg' // Custom thumbnail image
        }
    },
    portraits: {
        'Commissions': {
            thumbnail: 'IMG_9162.jpg' // Custom thumbnail image
        },
        'Friends & Family': {
            thumbnail: 'DSC05229.jpg' // Custom thumbnail image
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
            thumbnail: 'italy-19.jpg' // Custom thumbnail image
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

// console.log(portfolioData);

// Portfolio data structure
// const portfolioData = {
//     photojournalism: {
//         'Street Stories': {
//             photos: ['DSC02950.jpg', 'DSC02967.jpg', 'DSC02982.jpg', 'DSC03056.jpg', 'warsaw-1418.jpg', 'warsaw-1449.jpg']
//         },
//         'Eastern Europe': {
//             photos: ['DSC03078.jpg', 'DSC03094.jpg', 'DSC03161.jpg', 'DSC03558.jpg', 'DSC03632.jpg']
//         },
//         'The People': {
//             photos: ['DSC02950.jpg', 'DSC02967.jpg', 'DSC02982.jpg', 'DSC03056.jpg', 'warsaw-1418.jpg', 'warsaw-1449.jpg']
//         }
//     },
//     portraits: {
//         'Commissions': {
//             photos: ['DSC01486.jpg', 'DSC01497.jpg', 'DSC01512.jpg', 'DSC01576.jpg', '_MG_4667.jpg', '_MG_4669.jpg']
//         },
//         'Friends & Family': {
//             photos: ['DSC00533.jpg', 'DSC00559.jpg', 'DSC00582.jpg', 'DSC00622.jpg', 'IMG_3600-v2.jpg', 'IMG_3624.jpg']
//         }
//     },
//     events: {
//         'Public Events': {
//             photos: ['BMW1.jpg', '55-DSC06358.jpg', '57-DSC06368.jpg', '78-DSC06461.jpg', 'DSC06304.jpg', 'DSC06358.jpg', 'DSC06364.jpg', 'DSC06666.jpg']
//         },
//         'Private Events': {
//             photos: ['bday-60th-6.jpg', 'bday-60th-40.jpg', 'DSC07516.jpg', 'DSC07991.JPG', 'DSC07968.JPG']
//         },
//         'Brands': {
//             photos: ['BMW1.jpg', '55-DSC06358.jpg', '57-DSC06368.jpg', '78-DSC06461.jpg', 'DSC06304.jpg', 'DSC06358.jpg', 'DSC06364.jpg', 'DSC06666.jpg']
//         }
//     },
//     personal: {
//         'Travel': {
//             photos: ['DSC07926.JPG', 'DSC07897.JPG', 'DSC08003.JPG', 'DSC07673.JPG', 'DSC07693.JPG', 'DSC07709.JPG']
//         },
//         'Cars': {
//             photos: ['DSC07926.JPG', 'DSC07897.JPG', 'DSC08003.JPG', 'DSC07673.JPG', 'DSC07693.JPG', 'DSC07709.JPG']
//         },
//         'Experimental': {
//             photos: ['DSC07926.JPG', 'DSC07897.JPG', 'DSC08003.JPG', 'DSC07673.JPG', 'DSC07693.JPG', 'DSC07709.JPG']
//         },
//         'Nature': {
//             photos: ['IMG_8920.jpg', 'IMG_8975.jpg', 'IMG_9008.jpg', 'IMG_9044.jpg', 'DSC04801.jpg', 'DSC04880.jpg', 'DSC05173.jpg']
//         }
//     }
// };

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
    window.addEventListener('load', () => {
        const preloader = document.querySelector('.preloader');
        preloader.style.opacity = '0';
        setTimeout(() => {
            preloader.style.display = 'none';
        }, 500);
    });
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
        isInAlbumView = false;
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