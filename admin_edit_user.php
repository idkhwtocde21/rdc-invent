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
    $username = trim($_POST['username'] ?? '');
    $email = trim($_POST['email'] ?? '');
    $password = trim($_POST['password'] ?? '');
    $role = intval($_POST['role'] ?? 1);

    // Validation
    if ($id <= 0 || $username === "" || $email === "") {
        echo json_encode(["status" => "error", "message" => "All fields are required."]);
        exit;
    }

    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        echo json_encode(["status" => "error", "message" => "Invalid email format."]);
        exit;
    }

    if (!in_array($role, [1, 2])) {
        echo json_encode(["status" => "error", "message" => "Invalid role."]);
        exit;
    }

    // Prevent admin from demoting themselves
    if ($id == $_SESSION['user_id'] && $role != 2) {
        echo json_encode(["status" => "error", "message" => "You cannot change your own role from Admin to Staff."]);
        exit;
    }

    // Check if username already exists (excluding current user)
    $stmt = $conn->prepare("SELECT id FROM users WHERE username=? AND id!=? LIMIT 1");
    $stmt->bind_param("si", $username, $id);
    $stmt->execute();
    $stmt->store_result();
    if ($stmt->num_rows > 0) {
        echo json_encode(["status" => "error", "message" => "Username already taken."]);
        $stmt->close();
        exit;
    }
    $stmt->close();

    // Check if email already exists (excluding current user)
    $stmt = $conn->prepare("SELECT id FROM users WHERE email=? AND id!=? LIMIT 1");
    $stmt->bind_param("si", $email, $id);
    $stmt->execute();
    $stmt->store_result();
    if ($stmt->num_rows > 0) {
        echo json_encode(["status" => "error", "message" => "Email already in use."]);
        $stmt->close();
        exit;
    }
    $stmt->close();

    // Update user
    if ($password !== "") {
        if (strlen($password) < 6) {
            echo json_encode(["status" => "error", "message" => "Password must be at least 6 characters."]);
            exit;
        }
        $hashed_password = password_hash($password, PASSWORD_DEFAULT);
        $stmt = $conn->prepare("UPDATE users SET username=?, email=?, password=?, role=? WHERE id=?");
        $stmt->bind_param("sssii", $username, $email, $hashed_password, $role, $id);
    } else {
        $stmt = $conn->prepare("UPDATE users SET username=?, email=?, role=? WHERE id=?");
        $stmt->bind_param("ssii", $username, $email, $role, $id);
    }

    if ($stmt->execute()) {
        echo json_encode(["status" => "success", "message" => "✓ User updated successfully!"]);
    } else {
        echo json_encode(["status" => "error", "message" => "Failed to update user."]);
    }
    $stmt->close();
}
?>