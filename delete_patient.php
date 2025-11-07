<?php
session_start();
include("db.php");

header('Content-Type: application/json');

if (!isset($_SESSION['user_id'])) {
    echo json_encode(["status" => "error", "message" => "Unauthorized access."]);
    exit;
}

$id = intval($_POST['id'] ?? 0);
if ($id) {
    $stmt = $conn->prepare("DELETE FROM patients WHERE id=?");
    $stmt->bind_param("i", $id);
    
    if ($stmt->execute()) {
        usleep(500000); // 0.5 second delay
        echo json_encode(["status" => "success", "message" => "Patient deleted successfully!"]);
    } else {
        echo json_encode(["status" => "error", "message" => "Delete failed."]);
    }
    $stmt->close();
} else {
    echo json_encode(["status" => "error", "message" => "Invalid ID."]);
}
?>