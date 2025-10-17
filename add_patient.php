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

    if ($patient_name === "" || $contact === "") {
        echo json_encode(["status" => "error", "message" => "Name and contact are required."]);
        exit;
    }

    $stmt = $conn->prepare("INSERT INTO patients (patient_name, contact, email, address) VALUES (?, ?, ?, ?)");
    $stmt->bind_param("ssss", $patient_name, $contact, $email, $address);

    if ($stmt->execute()) {
        // Get the newly inserted patient ID
        $new_id = $conn->insert_id;
        
        // Return the new patient data
        echo json_encode([
            "status" => "success", 
            "message" => "Patient added successfully!",
            "patient" => [
                "id" => $new_id,
                "patient_name" => $patient_name,
                "contact" => $contact,
                "email" => $email,
                "address" => $address,
                "created_at" => date('Y-m-d H:i:s')
            ]
        ]);
    } else {
        echo json_encode(["status" => "error", "message" => "Error adding patient."]);
    }
    $stmt->close();
}
?>