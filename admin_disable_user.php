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

    // Prevent admin from disabling themselves
    if ($id == $_SESSION['user_id']) {
        echo json_encode(["status" => "error", "message" => "You cannot disable your own account."]);
        exit;
    }

    // Check if user exists and is not an admin
    $check_stmt = $conn->prepare("SELECT role FROM users WHERE id=?");
    $check_stmt->bind_param("i", $id);
    $check_stmt->execute();
    $result = $check_stmt->get_result();
    
    if ($result->num_rows === 0) {
        echo json_encode(["status" => "error", "message" => "User not found."]);
        $check_stmt->close();
        exit;
    }
    
    $user = $result->fetch_assoc();
    $role = $user['role'];
    $check_stmt->close();

    if ($role == 2) {
        echo json_encode(["status" => "error", "message" => "Cannot disable admin accounts."]);
        exit;
    }

    // Disable the user account
    $stmt = $conn->prepare("UPDATE users SET is_active=0 WHERE id=?");
    $stmt->bind_param("i", $id);

    if ($stmt->execute()) {
        usleep(500000); // 0.5 second delay
        echo json_encode(["status" => "success", "message" => "User account disabled successfully!"]);
    } else {
        echo json_encode(["status" => "error", "message" => "Failed to disable user account: " . $conn->error]);
    }
    $stmt->close();
}
?>
