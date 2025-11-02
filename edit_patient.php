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
    // Build query based on what fields are being updated
    if ($patient_image && $last_visit) {
        $stmt = $conn->prepare("UPDATE patients SET patient_name=?, contact=?, email=?, address=?, last_visit=?, patient_image=? WHERE id=?");
        $stmt->bind_param("ssssssi", $patient_name, $contact, $email, $address, $last_visit, $patient_image, $id);
    } elseif ($patient_image) {
        $stmt = $conn->prepare("UPDATE patients SET patient_name=?, contact=?, email=?, address=?, patient_image=? WHERE id=?");
        $stmt->bind_param("sssssi", $patient_name, $contact, $email, $address, $patient_image, $id);
    } elseif ($last_visit) {
        $stmt = $conn->prepare("UPDATE patients SET patient_name=?, contact=?, email=?, address=?, last_visit=? WHERE id=?");
        $stmt->bind_param("sssssi", $patient_name, $contact, $email, $address, $last_visit, $id);
    } else {
        $stmt = $conn->prepare("UPDATE patients SET patient_name=?, contact=?, email=?, address=? WHERE id=?");
        $stmt->bind_param("ssssi", $patient_name, $contact, $email, $address, $id);
    }
    
    if ($stmt->execute()) {
        echo json_encode(["status" => "success", "message" => "Patient updated successfully!"]);
    } else {
        echo json_encode(["status" => "error", "message" => "Update failed."]);
    }
    $stmt->close();
} else {
    echo json_encode(["status" => "error", "message" => "Invalid data."]);
}
?>