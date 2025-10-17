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

if ($id && $patient_name && $contact) {
    $stmt = $conn->prepare("UPDATE patients SET patient_name=?, contact=?, email=?, address=? WHERE id=?");
    $stmt->bind_param("ssssi", $patient_name, $contact, $email, $address, $id);
    
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