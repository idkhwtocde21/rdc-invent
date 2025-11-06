<?php
session_start();
include("db.php");

header('Content-Type: application/json');

if (!isset($_SESSION['user_id'])) {
    echo json_encode(["status" => "error", "message" => "Unauthorized access."]);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $patient_name = trim($_POST['patient_name'] ?? '');
    $contact = trim($_POST['contact'] ?? '');
    $email = trim($_POST['email'] ?? '');
    $address = trim($_POST['address'] ?? '');
    $last_visit = date('Y-m-d H:i:s');
    $patient_image = '';

    // Handle image upload
    if (isset($_FILES['patient_image']) && $_FILES['patient_image']['error'] === UPLOAD_ERR_OK) {
        $upload_dir = 'uploads/patients/';
        if (!file_exists($upload_dir)) {
            mkdir($upload_dir, 0777, true);
        }
        
        $file_extension = strtolower(pathinfo($_FILES['patient_image']['name'], PATHINFO_EXTENSION));
        $allowed_extensions = ['jpg', 'jpeg', 'png', 'gif'];
        
        if (in_array($file_extension, $allowed_extensions)) {
            $new_filename = uniqid('patient_') . '.' . $file_extension;
            $upload_path = $upload_dir . $new_filename;
            
            if (move_uploaded_file($_FILES['patient_image']['tmp_name'], $upload_path)) {
                $patient_image = $upload_path;
            }
        }
    }

    if ($patient_name === "" || $contact === "") {
        echo json_encode(["status" => "error", "message" => "Name and contact are required."]);
        exit;
    }
    
    // Patient name validation: minimum 2 characters, letters and spaces only
    if (strlen($patient_name) < 2) {
        echo json_encode(["status" => "error", "message" => "Patient name must be at least 2 characters."]);
        exit;
    }
    if (!preg_match('/^[a-zA-Z\s.]+$/', $patient_name)) {
        echo json_encode(["status" => "error", "message" => "Patient name can only contain letters, spaces, and periods."]);
        exit;
    }
    
    // Contact validation: numbers, spaces, hyphens, parentheses, plus sign
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

    $stmt = $conn->prepare("INSERT INTO patients (patient_name, contact, email, address, last_visit, patient_image) VALUES (?, ?, ?, ?, ?, ?)");
    $stmt->bind_param("ssssss", $patient_name, $contact, $email, $address, $last_visit, $patient_image);

    if ($stmt->execute()) {
        $new_id = $conn->insert_id;
        
        echo json_encode([
            "status" => "success", 
            "message" => "Patient added successfully!",
            "patient" => [
                "id" => $new_id,
                "patient_name" => $patient_name,
                "contact" => $contact,
                "email" => $email,
                "address" => $address,
                "last_visit" => $last_visit,
                "patient_image" => $patient_image,
                "created_at" => date('Y-m-d H:i:s')
            ]
        ]);
    } else {
        echo json_encode(["status" => "error", "message" => "Error adding patient."]);
    }
    $stmt->close();
}
?>