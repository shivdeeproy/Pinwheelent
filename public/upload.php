<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

// Handle preflight OPTIONS requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'error' => 'Invalid request method.']);
    exit;
}

// 1. Ensure file was uploaded
if (empty($_FILES)) {
    echo json_encode(['success' => false, 'error' => 'No files uploaded.']);
    exit;
}

// Get the first uploaded file (compatible with all PHP versions)
$file = reset($_FILES);

if ($file['error'] !== UPLOAD_ERR_OK) {
    echo json_encode(['success' => false, 'error' => 'Upload error code: ' . $file['error']]);
    exit;
}

// 2. Validate File is an Image (MIME type check)
$allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
$fileMime = mime_content_type($file['tmp_name']);

if (!in_array($fileMime, $allowedMimeTypes)) {
    echo json_encode(['success' => false, 'error' => 'Invalid file type. Only JPG, PNG, WEBP, and GIF are allowed.']);
    exit;
}

// Verify it has image dimensions (double check against script renaming)
$imageInfo = getimagesize($file['tmp_name']);
if ($imageInfo === false) {
    echo json_encode(['success' => false, 'error' => 'File is not a valid image.']);
    exit;
}

// 3. Validate file extension
$extension = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
$allowedExtensions = ['jpg', 'jpeg', 'png', 'webp', 'gif'];
if (!in_array($extension, $allowedExtensions)) {
    echo json_encode(['success' => false, 'error' => 'Invalid file extension.']);
    exit;
}

// 4. Create target directory
// The script lives in `dist/upload.php`
// We want to save uploads outside `dist/` and `pinwheel/` in `public_html/uploads/`
$targetDir = __DIR__ . '/../../uploads/';
if (!file_exists($targetDir)) {
    mkdir($targetDir, 0755, true);
}

// 5. Generate secure, unique filename
$safeName = preg_replace('/[^a-zA-Z0-9_\.-]/', '', pathinfo($file['name'], PATHINFO_FILENAME));
$newFilename = time() . '_' . $safeName . '.' . $extension;
$targetPath = $targetDir . $newFilename;

// 6. Image Optimization using PHP GD
$optimized = false;
if (extension_loaded('gd')) {
    try {
        switch ($fileMime) {
            case 'image/jpeg':
            case 'image/jpg':
                $img = @imagecreatefromjpeg($file['tmp_name']);
                if ($img) {
                    // Compress JPEG to 80% quality
                    $optimized = imagejpeg($img, $targetPath, 80);
                    imagedestroy($img);
                }
                break;
            case 'image/png':
                $img = @imagecreatefrompng($file['tmp_name']);
                if ($img) {
                    // Compress PNG (80% quality conversion: set compression level 6-8)
                    imagealphablending($img, false);
                    imagesavealpha($img, true);
                    $optimized = imagepng($img, $targetPath, 6);
                    imagedestroy($img);
                }
                break;
            case 'image/webp':
                $img = @imagecreatefromwebp($file['tmp_name']);
                if ($img) {
                    $optimized = imagewebp($img, $targetPath, 80);
                    imagedestroy($img);
                }
                break;
            case 'image/gif':
                // Don't compress animated GIFs to avoid breaking animations
                break;
        }
    } catch (Exception $e) {
        $optimized = false;
    }
}

// Fallback to standard move if GD optimization is skipped or fails
if (!$optimized) {
    if (!move_uploaded_file($file['tmp_name'], $targetPath)) {
        echo json_encode(['success' => false, 'error' => 'Failed to save uploaded file. Check directory permissions.']);
        exit;
    }
}

// Set file permissions to be readable by webserver but not writeable
chmod($targetPath, 0644);

// 7. Return dynamic URL
$protocol = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https://' : 'http://';
$host = $_SERVER['HTTP_HOST'];
$publicUrl = $protocol . $host . '/uploads/' . $newFilename;

echo json_encode([
    'success' => true,
    'url' => $publicUrl
]);
