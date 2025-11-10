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
    $exclude_id = intval($_POST['exclude_id'] ?? 0); // For edit mode, exclude current patient

    if ($patient_name === "" || $contact === "") {
        echo json_encode(["status" => "error", "message" => "Name and contact are required."]);
        exit;
    }

    // Check for duplicate by name and contact
    if ($exclude_id > 0) {
        $stmt = $conn->prepare("SELECT id, patient_name, contact, email FROM patients WHERE (patient_name = ? OR contact = ? OR (email != '' AND email = ?)) AND id != ? LIMIT 1");
        $stmt->bind_param("sssi", $patient_name, $contact, $email, $exclude_id);
    } else {
        $stmt = $conn->prepare("SELECT id, patient_name, contact, email FROM patients WHERE patient_name = ? OR contact = ? OR (email != '' AND email = ?) LIMIT 1");
        $stmt->bind_param("sss", $patient_name, $contact, $email);
    }
    
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows > 0) {
        $existing = $result->fetch_assoc();
        $duplicateFields = [];
        
        if (strtolower($existing['patient_name']) === strtolower($patient_name)) {
            $duplicateFields[] = "Name: " . $existing['patient_name'];
        }
        if ($existing['contact'] === $contact) {
            $duplicateFields[] = "Contact: " . $existing['contact'];
        }
        if ($email !== '' && $existing['email'] !== '' && strtolower($existing['email']) === strtolower($email)) {
            $duplicateFields[] = "Email: " . $existing['email'];
        }
        
        echo json_encode([
            "status" => "duplicate",
            "message" => "A patient with similar information already exists.",
            "duplicate_fields" => $duplicateFields,
            "existing_patient" => $existing
        ]);
    } else {
        echo json_encode(["status" => "available", "message" => "No duplicate found."]);
    }
    
    $stmt->close();
}
?>
