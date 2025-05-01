<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

// Function to scan directory and return image files
function scanImageDirectory($dir) {
    $images = [];
    
    // Check if directory exists
    if (!is_dir($dir)) {
        return $images;
    }
    
    // Get all files in the directory
    $files = scandir($dir);
    
    // Filter for image files
    foreach ($files as $file) {
        // Skip . and .. directories
        if ($file === '.' || $file === '..') {
            continue;
        }
        
        // Check if it's an image file
        $extension = strtolower(pathinfo($file, PATHINFO_EXTENSION));
        if (in_array($extension, ['jpg', 'jpeg', 'png', 'gif', 'JPG', 'JPEG', 'PNG', 'GIF'])) {
            $images[] = $file;
        }
    }
    
    return $images;
}

// Get parameters from request
$category = isset($_GET['category']) ? $_GET['category'] : '';
$album = isset($_GET['album']) ? $_GET['album'] : '';

// Validate parameters
if (empty($category) || empty($album)) {
    echo json_encode(['error' => 'Category and album parameters are required']);
    exit;
}

// Convert album name to directory name
$albumDir = strtolower(str_replace(' ', '_', str_replace('&', 'and', $album)));

// Create the path to the album directory
$albumPath = "images/$category/$albumDir";

// Scan the directory for images
$images = scanImageDirectory($albumPath);

// Return the list of images as JSON
echo json_encode(['images' => $images]);