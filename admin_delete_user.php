<?php
session_start();
include("db.php");

header('Content-Type: application/json');

// Check if user is logged in and is admin
if (!isset($_SESSION['user_id']) || $_SESSION['role'] != 2) {
    echo json_encode(["status" => "error", "message" => "Unauthorized access."]);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $id = intval($_POST['id'] ?? 0);

    if ($id <= 0) {
        echo json_encode(["status" => "error", "message" => "Invalid user ID."]);
        exit;
    }

    // Prevent admin from deleting themselves
    if ($id == $_SESSION['user_id']) {
        echo json_encode(["status" => "error", "message" => "You cannot delete your own account."]);
        exit;
    }

    $stmt = $conn->prepare("DELETE FROM users WHERE id=?");
    $stmt->bind_param("i", $id);

    if ($stmt->execute()) {
        echo json_encode(["status" => "success", "message" => " User deleted successfully!"]);
    } else {
        echo json_encode(["status" => "error", "message" => "Failed to delete user."]);
    }
    $stmt->close();
}
?>