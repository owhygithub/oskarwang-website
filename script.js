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
    // Initialize custom cursor with highly optimized animation
    const cursor = document.querySelector('.cursor');
    
    // Optimized cursor variables
    let mouseX = 0, mouseY = 0;
    let cursorX = 0, cursorY = 0;
    let speed = 0.12; // Reduced for smoother movement
    
    // Use a boolean flag for hover state instead of changing properties repeatedly
    let isHovering = false;
    
    // Pre-calculate transform strings for better performance
    const baseTransform = 'translate(-50%, -50%) rotate(-45deg)';
    
    // Optimized animation function using RAF and minimal calculations
    function animateCursor() {
        // Only calculate position when cursor is visible
        if (cursor.style.opacity !== '0') {
            // Simple linear interpolation with minimal operations
            cursorX += (mouseX - cursorX) * speed;
            cursorY += (mouseY - cursorY) * speed;
            
            // Use translate3d for hardware acceleration with minimal string concatenation
            cursor.style.transform = `translate3d(${cursorX}px, ${cursorY}px, 0) ${baseTransform}`;
        }
        
        requestAnimationFrame(animateCursor);
    }
    
    // Start animation loop
    requestAnimationFrame(animateCursor);
    
    // Use pointer events for better performance across devices
    document.addEventListener('pointermove', (e) => {
        // Direct assignment without throttling for smoother movement
        // Modern browsers optimize RAF internally
        mouseX = e.clientX;
        mouseY = e.clientY;
        
        // Only update opacity if needed
        if (cursor.style.opacity !== '1') {
            cursor.style.opacity = '1';
        }
    }, { passive: true }); // Use passive listener for better performance
    
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
    });
    
    // Use event delegation for hover effects instead of attaching to each element
    document.addEventListener('mouseover', (e) => {
        const target = e.target;
        // Check if the target is an interactive element
        if (target.matches('a, button, .nav-btn, .portfolio-item img, .back-btn, .portfolio-category, .portfolio-album')) {
            cursor.style.borderBottomColor = '#ffffff';
            isHovering = true;
            speed = 0.25; // Slightly faster on hover for better responsiveness
        }
    }, { passive: true });
    
    document.addEventListener('mouseout', (e) => {
        const target = e.target;
        if (target.matches('a, button, .nav-btn, .portfolio-item img, .back-btn, .portfolio-category, .portfolio-album')) {
            cursor.style.borderBottomColor = '#ffea00';
            isHovering = false;
            speed = 0.12; // Return to normal speed
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
                            img.classList.add('loaded');
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
    
    // Update the title
    categoryTitle.textContent = category.charAt(0).toUpperCase() + category.slice(1);
    
    // Clear existing albums
    albumsGrid.innerHTML = '';
    
    // Get albums for this category
    const categoryAlbums = portfolioData[category];
    
    // Create album elements
    Object.keys(categoryAlbums).forEach(albumName => {
        const album = categoryAlbums[albumName];
        const coverImage = album.photos[0]; // Use first photo as cover
        
        const albumElement = document.createElement('div');
        albumElement.className = 'portfolio-album';
        albumElement.setAttribute('data-album', albumName);
        
        albumElement.innerHTML = `
            <div class="album-overlay">
                <h3>${albumName}</h3>
            </div>
            <img src="images/${coverImage}" alt="${albumName}" class="album-image">
        `;
        
        albumElement.addEventListener('click', () => {
            showPhotosForAlbum(category, albumName);
        });
        
        albumsGrid.appendChild(albumElement);
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
    
    // Update the title
    albumTitle.textContent = album;
    
    // Clear existing photos
    photosContainer.innerHTML = '';
    
    // Get photos for this album
    const albumPhotos = portfolioData[category][album].photos;
    
    // Create photo elements
    albumPhotos.forEach(photo => {
        const photoElement = document.createElement('div');
        photoElement.className = 'photo-item';
        
        photoElement.innerHTML = `
            <img src="images/${photo}" alt="${album} photo" class="photo-image">
        `;
        
        photosContainer.appendChild(photoElement);
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


// Portfolio data structure
const portfolioData = {
    photojournalism: {
        'Street Stories': {
            photos: ['DSC02950.jpg', 'DSC02967.jpg', 'DSC02982.jpg', 'DSC03056.jpg', 'warsaw-1418.jpg', 'warsaw-1449.jpg']
        },
        'Eastern Europe': {
            photos: ['DSC03078.jpg', 'DSC03094.jpg', 'DSC03161.jpg', 'DSC03558.jpg', 'DSC03632.jpg']
        },
        'The People': {
            photos: ['DSC02950.jpg', 'DSC02967.jpg', 'DSC02982.jpg', 'DSC03056.jpg', 'warsaw-1418.jpg', 'warsaw-1449.jpg']
        }
    },
    portraits: {
        'Commissions': {
            photos: ['DSC01486.jpg', 'DSC01497.jpg', 'DSC01512.jpg', 'DSC01576.jpg', '_MG_4667.jpg', '_MG_4669.jpg']
        },
        'Friends & Family': {
            photos: ['DSC00533.jpg', 'DSC00559.jpg', 'DSC00582.jpg', 'DSC00622.jpg', 'IMG_3600-v2.jpg', 'IMG_3624.jpg']
        }
    },
    events: {
        'Public Events': {
            photos: ['BMW1.jpg', '55-DSC06358.jpg', '57-DSC06368.jpg', '78-DSC06461.jpg', 'DSC06304.jpg', 'DSC06358.jpg', 'DSC06364.jpg', 'DSC06666.jpg']
        },
        'Private Events': {
            photos: ['bday-60th-6.jpg', 'bday-60th-40.jpg', 'DSC07516.jpg', 'DSC07991.JPG', 'DSC07968.JPG']
        },
        'Brands': {
            photos: ['BMW1.jpg', '55-DSC06358.jpg', '57-DSC06368.jpg', '78-DSC06461.jpg', 'DSC06304.jpg', 'DSC06358.jpg', 'DSC06364.jpg', 'DSC06666.jpg']
        }
    },
    personal: {
        'Travel': {
            photos: ['DSC07926.JPG', 'DSC07897.JPG', 'DSC08003.JPG', 'DSC07673.JPG', 'DSC07693.JPG', 'DSC07709.JPG']
        },
        'Cars': {
            photos: ['DSC07926.JPG', 'DSC07897.JPG', 'DSC08003.JPG', 'DSC07673.JPG', 'DSC07693.JPG', 'DSC07709.JPG']
        },
        'Experimental': {
            photos: ['DSC07926.JPG', 'DSC07897.JPG', 'DSC08003.JPG', 'DSC07673.JPG', 'DSC07693.JPG', 'DSC07709.JPG']
        },
        'Nature': {
            photos: ['IMG_8920.jpg', 'IMG_8975.jpg', 'IMG_9008.jpg', 'IMG_9044.jpg', 'DSC04801.jpg', 'DSC04880.jpg', 'DSC05173.jpg']
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