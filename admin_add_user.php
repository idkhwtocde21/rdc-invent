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
    $username = trim($_POST['username'] ?? '');
    $email = trim($_POST['email'] ?? '');
    $password = trim($_POST['password'] ?? '');
    $role = intval($_POST['role'] ?? 1);

    // Validation
    if ($username === "" || $email === "" || $password === "") {
        echo json_encode(["status" => "error", "message" => "All fields are required."]);
        exit;
    }
    
    // Username validation: no spaces, 3-20 characters, alphanumeric and underscore only
    if (preg_match('/\s/', $username)) {
        echo json_encode(["status" => "error", "message" => "Username cannot contain spaces."]);
        exit;
    }
    if (strlen($username) < 3 || strlen($username) > 20) {
        echo json_encode(["status" => "error", "message" => "Username must be between 3-20 characters."]);
        exit;
    }
    if (!preg_match('/^[a-zA-Z0-9_]+$/', $username)) {
        echo json_encode(["status" => "error", "message" => "Username can only contain letters, numbers, and underscores."]);
        exit;
    }

    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        echo json_encode(["status" => "error", "message" => "Invalid email format."]);
        exit;
    }

    if (strlen($password) < 6) {
        echo json_encode(["status" => "error", "message" => "Password must be at least 6 characters."]);
        exit;
    }

    if (!in_array($role, [1, 2])) {
        echo json_encode(["status" => "error", "message" => "Invalid role."]);
        exit;
    }

    // Check if username already exists
    $stmt = $conn->prepare("SELECT id FROM users WHERE username=? LIMIT 1");
    $stmt->bind_param("s", $username);
    $stmt->execute();
    $stmt->store_result();
    if ($stmt->num_rows > 0) {
        echo json_encode(["status" => "error", "message" => "Username already exists."]);
        $stmt->close();
        exit;
    }
    $stmt->close();

    // Check if email already exists
    $stmt = $conn->prepare("SELECT id FROM users WHERE email=? LIMIT 1");
    $stmt->bind_param("s", $email);
    $stmt->execute();
    $stmt->store_result();
    if ($stmt->num_rows > 0) {
        echo json_encode(["status" => "error", "message" => "Email already in use."]);
        $stmt->close();
        exit;
    }
    $stmt->close();

    // Hash password
    $hashed_password = password_hash($password, PASSWORD_DEFAULT);

    // Insert new user
    $stmt = $conn->prepare("INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)");
    $stmt->bind_param("sssi", $username, $email, $hashed_password, $role);

    if ($stmt->execute()) {
        $roleText = $role == 2 ? 'Admin' : 'Staff';
        echo json_encode(["status" => "success", "message" => " $roleText added successfully!"]);
    } else {
        echo json_encode(["status" => "error", "message" => "Failed to add user."]);
    }
    $stmt->close();
}
?>