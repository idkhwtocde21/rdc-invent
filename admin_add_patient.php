<?php
session_start();
include("db.php");

header('Content-Type: application/json');

// Check if user is admin
if (!isset($_SESSION['user_id']) || $_SESSION['role'] != 2) {
    echo json_encode(["status" => "error", "message" => "Unauthorized access."]);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $patient_name = trim($_POST['patient_name'] ?? '');
    $contact = trim($_POST['contact'] ?? '');
    $email = trim($_POST['email'] ?? '');
    $address = trim($_POST['address'] ?? '');
    $last_visit = trim($_POST['last_visit'] ?? '');
    
    // If no last_visit provided, use current date/time
    if (empty($last_visit)) {
        $last_visit = date('Y-m-d H:i:s');
    }
    
    // Medical information fields
    $medical_history = trim($_POST['medical_history'] ?? '');
    $clinical_findings = trim($_POST['clinical_findings'] ?? '');
    $diagnostic_tests = trim($_POST['diagnostic_tests'] ?? '');
    $diagnosis = trim($_POST['diagnosis'] ?? '');
    $conclusion = trim($_POST['conclusion'] ?? '');

    if ($patient_name === "" || $contact === "") {
        echo json_encode(["status" => "error", "message" => "Name and contact are required."]);
        exit;
    }
    
    // Patient name validation
    if (strlen($patient_name) < 2) {
        echo json_encode(["status" => "error", "message" => "Patient name must be at least 2 characters."]);
        exit;
    }
    if (!preg_match('/^[a-zA-Z\s.]+$/', $patient_name)) {
        echo json_encode(["status" => "error", "message" => "Patient name can only contain letters, spaces, and periods."]);
        exit;
    }
    
    // Contact validation
    if (strlen($contact) < 7) {
        echo json_encode(["status" => "error", "message" => "Contact number must be at least 7 characters."]);
        exit;
    }
    if (!preg_match('/^[0-9\s\-\(\)\+]+$/', $contact)) {
        echo json_encode(["status" => "error", "message" => "Contact number contains invalid characters."]);
        exit;
    }
    
    // Email validation if provided
    if ($email !== "" && !filter_var($email, FILTER_VALIDATE_EMAIL)) {
        echo json_encode(["status" => "error", "message" => "Invalid email format."]);
        exit;
    }

    // Handle image upload
    $imagePath = null;
    if (isset($_FILES['patient_image']) && $_FILES['patient_image']['error'] === UPLOAD_ERR_OK) {
        $allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
        $maxSize = 5 * 1024 * 1024; // 5MB
        
        $fileType = $_FILES['patient_image']['type'];
        $fileSize = $_FILES['patient_image']['size'];
        
        if (!in_array($fileType, $allowedTypes)) {
            echo json_encode(["status" => "error", "message" => "Invalid image format. Only JPG, PNG, and GIF are allowed."]);
            exit;
        }
        
        if ($fileSize > $maxSize) {
            echo json_encode(["status" => "error", "message" => "Image size must be less than 5MB."]);
            exit;
        }
        
        $uploadDir = 'uploads/patients/';
        if (!is_dir($uploadDir)) {
            mkdir($uploadDir, 0777, true);
        }
        
        $fileExt = pathinfo($_FILES['patient_image']['name'], PATHINFO_EXTENSION);
        $fileName = 'patient_' . time() . '_' . uniqid() . '.' . $fileExt;
        $targetPath = $uploadDir . $fileName;
        
        if (move_uploaded_file($_FILES['patient_image']['tmp_name'], $targetPath)) {
            $imagePath = $targetPath;
        }
    }

    $stmt = $conn->prepare("INSERT INTO patients (patient_name, contact, email, address, last_visit, medical_history, clinical_findings, diagnostic_tests, diagnosis, conclusion, patient_image) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
    $stmt->bind_param("sssssssssss", $patient_name, $contact, $email, $address, $last_visit, $medical_history, $clinical_findings, $diagnostic_tests, $diagnosis, $conclusion, $imagePath);

    if ($stmt->execute()) {
        usleep(500000);
        echo json_encode(["status" => "success", "message" => "Patient added successfully!"]);
    } else {
        echo json_encode(["status" => "error", "message" => "Error adding patient."]);
    }
    $stmt->close();
}
?>
