<?php
session_start(); // ADD THIS - Required to access session variables
include("db.php");

header('Content-Type: application/json');

// ADD THIS - Check if user is logged in
if (!isset($_SESSION['user_id'])) {
    echo json_encode(["status" => "error", "message" => "Unauthorized access."]);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $user_id = $_SESSION['user_id'];
    $username = trim($_POST['username'] ?? '');
    $email = trim($_POST['email'] ?? '');
    $password = $_POST['password'] ?? '';

    // Validation
    if ($username === "" || $email === "") {
        echo json_encode(["status" => "error", "message" => "Username and email are required."]);
        exit;
    }

    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        echo json_encode(["status" => "error", "message" => "Invalid email format."]);
        exit;
    }

    // Check if username or email already exists for another user
    $check = $conn->prepare("SELECT id FROM users WHERE (username=? OR email=?) AND id!=? LIMIT 1");
    $check->bind_param("ssi", $username, $email, $user_id);
    $check->execute();
    $check->store_result();
    
    if ($check->num_rows > 0) {
        echo json_encode(["status" => "error", "message" => "Username or email already taken by another user."]);
        $check->close();
        exit;
    }
    $check->close();

    // Update user data
    if ($password !== "") {
        // Update with new password
        $hashed = password_hash($password, PASSWORD_DEFAULT);
        $stmt = $conn->prepare("UPDATE users SET username=?, email=?, password=? WHERE id=?");
        $stmt->bind_param("sssi", $username, $email, $hashed, $user_id);
    } else {
        // Update without changing password
        $stmt = $conn->prepare("UPDATE users SET username=?, email=? WHERE id=?");
        $stmt->bind_param("ssi", $username, $email, $user_id);
    }

    if ($stmt->execute()) {
        // Update session with new username
        $_SESSION['username'] = $username;
        echo json_encode(["status" => "success", "message" => "✅ Settings updated successfully!"]);
    } else {
        echo json_encode(["status" => "error", "message" => "Failed to update settings. Please try again."]);
    }
    $stmt->close();
}
?>