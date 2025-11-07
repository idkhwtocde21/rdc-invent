<?php
session_start();
include("db.php");

header('Content-Type: application/json');

if (!isset($_SESSION['user_id'])) {
    echo json_encode(["status" => "error", "message" => "Unauthorized access."]);
    exit;
}

$id = intval($_POST['id'] ?? 0);
$patient_name = trim($_POST['patient_name'] ?? '');
$contact = trim($_POST['contact'] ?? '');
$email = trim($_POST['email'] ?? '');
$address = trim($_POST['address'] ?? '');
$last_visit = trim($_POST['last_visit'] ?? '');
$patient_image = '';

// Medical information fields
$medical_history = trim($_POST['medical_history'] ?? '');
$clinical_findings = trim($_POST['clinical_findings'] ?? '');
$diagnostic_tests = trim($_POST['diagnostic_tests'] ?? '');
$diagnosis = trim($_POST['diagnosis'] ?? '');
$conclusion = trim($_POST['conclusion'] ?? '');

// Handle image upload
if (isset($_FILES['patient_image']) && $_FILES['patient_image']['error'] === UPLOAD_ERR_OK) {
    $upload_dir = 'uploads/patients/';
    if (!file_exists($upload_dir)) {
        mkdir($upload_dir, 0777, true);
    }
    
    $file_extension = strtolower(pathinfo($_FILES['patient_image']['name'], PATHINFO_EXTENSION));
    $allowed_extensions = ['jpg', 'jpeg', 'png', 'gif'];
    
    if (in_array($file_extension, $allowed_extensions)) {
        // Delete old image if exists
        $old_image_query = $conn->prepare("SELECT patient_image FROM patients WHERE id=?");
        $old_image_query->bind_param("i", $id);
        $old_image_query->execute();
        $old_image_query->bind_result($old_image);
        $old_image_query->fetch();
        $old_image_query->close();
        
        if ($old_image && file_exists($old_image)) {
            unlink($old_image);
        }
        
        $new_filename = uniqid('patient_') . '.' . $file_extension;
        $upload_path = $upload_dir . $new_filename;
        
        if (move_uploaded_file($_FILES['patient_image']['tmp_name'], $upload_path)) {
            $patient_image = $upload_path;
        }
    }
}

if ($id && $patient_name && $contact) {
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
    
    // Build query based on what fields are being updated
    if ($patient_image && $last_visit) {
        $stmt = $conn->prepare("UPDATE patients SET patient_name=?, contact=?, email=?, address=?, last_visit=?, patient_image=?, medical_history=?, clinical_findings=?, diagnostic_tests=?, diagnosis=?, conclusion=? WHERE id=?");
        $stmt->bind_param("sssssssssssi", $patient_name, $contact, $email, $address, $last_visit, $patient_image, $medical_history, $clinical_findings, $diagnostic_tests, $diagnosis, $conclusion, $id);
    } elseif ($patient_image) {
        $stmt = $conn->prepare("UPDATE patients SET patient_name=?, contact=?, email=?, address=?, patient_image=?, medical_history=?, clinical_findings=?, diagnostic_tests=?, diagnosis=?, conclusion=? WHERE id=?");
        $stmt->bind_param("ssssssssssi", $patient_name, $contact, $email, $address, $patient_image, $medical_history, $clinical_findings, $diagnostic_tests, $diagnosis, $conclusion, $id);
    } elseif ($last_visit) {
        $stmt = $conn->prepare("UPDATE patients SET patient_name=?, contact=?, email=?, address=?, last_visit=?, medical_history=?, clinical_findings=?, diagnostic_tests=?, diagnosis=?, conclusion=? WHERE id=?");
        $stmt->bind_param("ssssssssssi", $patient_name, $contact, $email, $address, $last_visit, $medical_history, $clinical_findings, $diagnostic_tests, $diagnosis, $conclusion, $id);
    } else {
        $stmt = $conn->prepare("UPDATE patients SET patient_name=?, contact=?, email=?, address=?, medical_history=?, clinical_findings=?, diagnostic_tests=?, diagnosis=?, conclusion=? WHERE id=?");
        $stmt->bind_param("sssssssssi", $patient_name, $contact, $email, $address, $medical_history, $clinical_findings, $diagnostic_tests, $diagnosis, $conclusion, $id);
    }
    
    if ($stmt->execute()) {
        // Add small delay for better UX with loading screen
        usleep(500000); // 0.5 seconds
        
        echo json_encode(["status" => "success", "message" => "Patient updated successfully!"]);
    } else {
        echo json_encode(["status" => "error", "message" => "Update failed."]);
    }
    $stmt->close();
} else {
    echo json_encode(["status" => "error", "message" => "Invalid data."]);
}
?>