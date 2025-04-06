document.addEventListener('DOMContentLoaded', () => {
    // Initialize custom cursor with physics
    const cursor = document.querySelector('.cursor');
    
    // Physics variables for cursor - optimized for responsiveness
    let mouseX = 0, mouseY = 0;
    let cursorX = 0, cursorY = 0;
    let speed = 0.4; // Increased cursor follow speed for better responsiveness
    let lastMouseX = 0, lastMouseY = 0;
    let velocityX = 0, velocityY = 0;
    
    // Animation function for cursor with simplified physics
    function animateCursor() {
        // Apply direct easing for more immediate response
        const easeX = (mouseX - cursorX) * speed;
        const easeY = (mouseY - cursorY) * speed;
        
        // Calculate velocity based on mouse movement with increased sensitivity
        velocityX = (mouseX - lastMouseX) * 0.08; // Increased sensitivity
        velocityY = (mouseY - lastMouseY) * 0.08; // Increased sensitivity
        
        // Apply velocity with improved physics for better responsiveness
        cursorX += easeX + velocityX * 0.2; // Increased velocity influence
        cursorY += easeY + velocityY * 0.2; // Increased velocity influence
        
        // Apply less damping to velocity for better responsiveness
        velocityX *= 0.9; // Reduced damping
        velocityY *= 0.9; // Reduced damping
        
        // Update cursor position
        cursor.style.left = `${cursorX}px`;
        cursor.style.top = `${cursorY}px`;
        
        // Store last mouse position
        lastMouseX = mouseX;
        lastMouseY = mouseY;
        
        requestAnimationFrame(animateCursor);
    }
    
    // Start animation loop
    requestAnimationFrame(animateCursor);
    
    // Update mouse position
    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        cursor.style.opacity = '1';
    });
    
    // Hide cursor when mouse leaves the window
    document.addEventListener('mouseleave', () => {
        cursor.style.opacity = '0';
    });
    
    // Show cursor when mouse enters the window
    document.addEventListener('mouseenter', () => {
        cursor.style.opacity = '1';
        // Reset physics when mouse re-enters
        cursorX = mouseX;
        cursorY = mouseY;
        velocityX = 0;
        velocityY = 0;
    });
    
    // Add hover effects for interactive elements
    document.querySelectorAll('a, button, .nav-btn, .portfolio-item img, .back-btn').forEach(item => {
        item.addEventListener('mouseenter', () => {
            cursor.style.transform = 'translate(-50%, -50%) scale(1.5) rotate(-45deg)';
            cursor.style.borderBottomColor = '#ffffff';
            // Add magnetic effect with faster response
            speed = 0.5; // Increased from 0.4 for even faster response on hover
        });
        
        item.addEventListener('mouseleave', () => {
            cursor.style.transform = 'translate(-50%, -50%) rotate(-45deg)';
            cursor.style.borderBottomColor = '#ffea00';
            // Reset speed to optimized value
            speed = 0.4; // Updated to match our new base speed
        });

        
        // Add ripple effect on click
        item.addEventListener('mousedown', function(e) {
            if (this.classList.contains('nav-btn') || this.tagName === 'BUTTON' || this.tagName === 'A') {
                const ripple = document.createElement('span');
                const rect = this.getBoundingClientRect();
                const size = Math.max(rect.width, rect.height);
                const x = e.clientX - rect.left - size / 2;
                const y = e.clientY - rect.top - size / 2;
                
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
                
                this.style.position = this.style.position || 'relative';
                this.style.overflow = 'hidden';
                this.appendChild(ripple);
                
                setTimeout(() => {
                    ripple.remove();
                }, 600);
            }
        });
    });
    
    // Initialize lazy loading
    const lazyImages = document.querySelectorAll('.lazy-load');
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.add('loaded');
                observer.unobserve(img);
            }
        });
    });

    lazyImages.forEach(image => {
        imageObserver.observe(image);
    });

    // Handle initial page load
    const hash = window.location.hash.replace('#', '');
    if (hash && document.querySelector(`.${hash}-page`)) {
        showPage(hash);
    }
});

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
    }
    
    targetPage.classList.add('active-page');

    // Toggle back button visibility and functionality
    if (page === 'main') {
        backBtn.classList.remove('visible');
        history.replaceState({ page }, document.title, window.location.pathname);
    } else {
        backBtn.classList.add('visible');
        history.pushState({ page }, document.title, `#${page}`);
    }
}

// Add this with other functions
function redirectToShop() {
    // Replace with your actual shop URL
    window.open('https://www.saatchiart.com/account/profile/2746365', '_blank');
}

// Add click handler for back button
document.querySelector('.back-btn').addEventListener('click', () => {
    showPage('main');
});


// Scroll Gallery functionality
let currentImageIndex = 0;
let images = [
    // Load all images from the images folder
    '081.jpg', '167.jpg', '49FF53E2-8B17-405D-A21B-849B0275D93B.jpg', '55-DSC06358.jpg',
    '57-DSC06368.jpg', '6.jpg', '78-DSC06461.jpg', 'BMW1.jpg', 'DSC00533.jpg',
    'DSC00559.jpg', 'DSC00582.jpg', 'DSC00622.jpg', 'DSC00888.JPG', 'DSC01128.jpg',
    'DSC01486.jpg', 'DSC01497.jpg', 'DSC01512.jpg', 'DSC01576.jpg',
    'DSC02893.jpg', 'DSC02923.jpg', 'DSC02950.jpg', 'DSC02967.jpg', 'DSC02982.jpg',
    'DSC03056.jpg', 'DSC03078.jpg', 'DSC03094.jpg', 'DSC03161.jpg', 'DSC03558.jpg',
    'DSC03632.jpg', 'DSC04801.jpg', 'DSC04880.jpg', 'DSC05173.jpg', 'DSC06304.jpg',
    'DSC06358.jpg', 'DSC06364.jpg', 'DSC06666.jpg', 'DSC07516.jpg', 'IMG_3600-v2.jpg',
    'IMG_3624.jpg', 'IMG_8920.jpg', 'IMG_8975.jpg', 'IMG_9008.jpg', 'IMG_9044.jpg',
    '_MG_0205.jpg', '_MG_4667.jpg', '_MG_4669.jpg', 'bday-60th-4.jpg', 'bday-60th-40.jpg',
    'bday-60th-6.jpg', 'edit4.jpg', 'warsaw-1418.jpg', 'warsaw-1449.jpg'
];
let isScrolling = false;
let scrollTimeout;

// Initialize the scroll gallery when the portfolio page is shown
function initScrollGallery() {
    // Reset current image index
    currentImageIndex = 0;
    
    // Shuffle the images array for random order
    shuffleArray(images);
    
    // Display the first image
    updateGalleryImage();
    
    // Set up automatic slideshow
    startSlideshow();
    
    // Add scroll event listener to the gallery container
    const galleryContainer = document.querySelector('.gallery-container');
    if (galleryContainer) {
        // Use wheel event for more precise scroll detection
        galleryContainer.addEventListener('wheel', handleGalleryScroll);
        
        // Add touch events for mobile
        galleryContainer.addEventListener('touchstart', handleTouchStart, false);
        galleryContainer.addEventListener('touchmove', handleTouchMove, false);
    }
}

// Function to shuffle array (Fisher-Yates algorithm)
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// Handle scroll events in the gallery
function handleGalleryScroll(event) {
    // Prevent default scroll behavior
    event.preventDefault();
    
    // If already scrolling, return
    if (isScrolling) return;
    
    // Stop automatic slideshow when user interacts
    stopSlideshow();
    
    // Set scrolling flag
    isScrolling = true;
    
    // Determine scroll direction
    const direction = event.deltaY > 0 ? 1 : -1;
    
    // Update current image index based on direction
    currentImageIndex = (currentImageIndex + direction + images.length) % images.length;
    
    // Update the gallery image
    updateGalleryImage();
    
    // Reset scrolling flag after animation completes
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => {
        isScrolling = false;
        // Restart slideshow after user interaction
        startSlideshow();
    }, 1000); // Match this to the CSS transition duration
}

// Variables for touch events
let touchStartY = 0;

// Handle touch start event
function handleTouchStart(event) {
    touchStartY = event.touches[0].clientY;
}

// Handle touch move event
function handleTouchMove(event) {
    if (!touchStartY || isScrolling) return;
    
    const touchEndY = event.touches[0].clientY;
    const diff = touchStartY - touchEndY;
    
    // If significant vertical swipe detected
    if (Math.abs(diff) > 50) {
        // Stop automatic slideshow when user interacts
        stopSlideshow();
        
        // Set scrolling flag
        isScrolling = true;
        
        // Determine direction (positive = down, negative = up)
        const direction = diff > 0 ? 1 : -1;
        
        // Update current image index based on direction
        currentImageIndex = (currentImageIndex + direction + images.length) % images.length;
        
        // Update the gallery image
        updateGalleryImage();
        
        // Reset touch start position
        touchStartY = 0;
        
        // Reset scrolling flag after animation completes
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
            isScrolling = false;
            // Restart slideshow after user interaction
            startSlideshow();
        }, 1000); // Match this to the CSS transition duration
    }
}

// Update the gallery image based on current index
function updateGalleryImage() {
    const galleryContainer = document.querySelector('.gallery-container');
    if (!galleryContainer) return;
    
    // Remove active class from all items
    const items = document.querySelectorAll('.gallery-item');
    items.forEach(item => item.classList.remove('active'));
    
    // Create new gallery item
    const newItem = document.createElement('div');
    newItem.className = 'gallery-item';
    
    // Create image element
    const img = document.createElement('img');
    img.src = `images/${images[currentImageIndex]}`;
    img.alt = `Gallery Photo ${currentImageIndex + 1}`;
    img.className = 'gallery-image';
    
    // Add image to item
    newItem.appendChild(img);
    
    // Add item to container
    galleryContainer.appendChild(newItem);
    
    // Force reflow before adding active class for transition
    void newItem.offsetWidth;
    
    // Add active class to trigger transition
    newItem.classList.add('active');
    
    // Remove old items after transition
    setTimeout(() => {
        items.forEach(item => {
            if (item !== newItem) {
                galleryContainer.removeChild(item);
            }
        });
    }, 1000); // Match this to the CSS transition duration
}

// Modify showPage function to initialize scroll gallery when portfolio page is shown
function showPage(page) {
    const backBtn = document.querySelector('.back-btn');
    const allPages = document.querySelectorAll('.page');
    
    // Stop slideshow if it's running
    if (slideshowTimer) {
        stopSlideshow();
    }
    
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
        // Initialize scroll gallery when portfolio page is shown
        initScrollGallery();
    }
    
    targetPage.classList.add('active-page');

    // Toggle back button visibility and functionality
    if (page === 'main') {
        backBtn.classList.remove('visible');
        history.replaceState({ page }, document.title, window.location.pathname);
    } else {
        backBtn.classList.add('visible');
        history.pushState({ page }, document.title, `#${page}`);
    }
}

// Lightbox functionality
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('gallery-image')) {
        const lightbox = document.createElement('div');
        lightbox.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background: rgba(0,0,0,0.9);
            display: flex;
            justify-content: center;
            align-items: center;
            cursor: pointer;
            z-index: 1000;
        `;
        
        const fullImg = document.createElement('img');
        fullImg.src = e.target.src;
        fullImg.style.maxWidth = '90%';
        fullImg.style.maxHeight = '90%';
        
        lightbox.appendChild(fullImg);
        document.body.appendChild(lightbox);
        
        lightbox.addEventListener('click', () => {
            document.body.removeChild(lightbox);
        });
    }
});

// Preloader
window.addEventListener('load', () => {
    document.querySelector('.preloader').style.opacity = '0';
    setTimeout(() => {
        document.querySelector('.preloader').remove();
    }, 500);
});

// Add parallax effect to main page background
document.addEventListener('mousemove', (e) => {
    if (document.querySelector('.main-page.active-page')) {
        const mainPage = document.querySelector('.main-page');
        const moveX = (e.clientX - window.innerWidth / 2) * 0.01;
        const moveY = (e.clientY - window.innerHeight / 2) * 0.01;
        
        mainPage.style.backgroundPosition = `calc(50% + ${moveX}px) calc(50% + ${moveY}px)`;
        mainPage.style.transition = 'background-position 0.3s ease-out';
    }
});

// Slideshow timer variable
let slideshowTimer;

// Function to start automatic slideshow
function startSlideshow() {
    // Clear any existing timer
    if (slideshowTimer) {
        clearInterval(slideshowTimer);
    }
    
    // Set interval to change image every 5 seconds
    slideshowTimer = setInterval(() => {
        // Only proceed if not currently scrolling
        if (!isScrolling) {
            // Set scrolling flag to prevent user scrolling during transition
            isScrolling = true;
            
            // Move to next image
            currentImageIndex = (currentImageIndex + 1) % images.length;
            
            // Update the gallery image
            updateGalleryImage();
            
            // Reset scrolling flag after animation completes
            setTimeout(() => {
                isScrolling = false;
            }, 1000); // Match this to the CSS transition duration
        }
    }, 5000); // Change image every 5 seconds
}

// Function to stop slideshow (called when user interacts with gallery)
function stopSlideshow() {
    if (slideshowTimer) {
        clearInterval(slideshowTimer);
        slideshowTimer = null;
    }
}