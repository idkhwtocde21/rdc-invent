<?php
session_start();
include("db.php");

header('Content-Type: application/json');

// Check if user is admin
if (!isset($_SESSION['user_id']) || $_SESSION['role'] != 2) {
    echo json_encode(["status" => "error", "message" => "Unauthorized access."]);
    exit;
}

$id = intval($_POST['id'] ?? 0);
if ($id) {
    $stmt = $conn->prepare("DELETE FROM inventory WHERE id=?");
    $stmt->bind_param("i", $id);
    
    if ($stmt->execute()) {
        usleep(500000);
        echo json_encode(["status" => "success", "message" => "Inventory item deleted successfully!"]);
    } else {
        echo json_encode(["status" => "error", "message" => "Delete failed."]);
    }
    $stmt->close();
} else {
    echo json_encode(["status" => "error", "message" => "Invalid ID."]);
}
?>
