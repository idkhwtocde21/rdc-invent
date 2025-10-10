<?php
include("db.php");

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $username = trim($_POST['username'] ?? '');
    $email = trim($_POST['email'] ?? '');
    $password = $_POST['password'] ?? '';
    $confirm = $_POST['confirm_password'] ?? '';

    if ($username == "" || $email == "" || $password == "" || $confirm == "") {
        echo json_encode(["status" => "error", "message" => "❌ All fields are required."]);
        exit;
    }
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        echo json_encode(["status" => "error", "message" => "❌ Invalid email format."]);
        exit;
    }
    if ($password !== $confirm) {
        echo json_encode(["status" => "error", "message" => "❌ Passwords do not match."]);
        exit;
    }

    $check = $conn->query("SELECT id FROM users WHERE username='$username' OR email='$email' LIMIT 1");
    if ($check && $check->num_rows > 0) {
        echo json_encode(["status" => "error", "message" => "❌ Username or email already exists."]);
        exit;
    }

    $hashed = password_hash($password, PASSWORD_DEFAULT);
    $insert = $conn->query("INSERT INTO users (username, email, password) VALUES ('$username', '$email', '$hashed')");

    if ($insert) {
        echo json_encode(["status" => "success", "message" => "✅ Account created successfully! Please login."]);
    } else {
        echo json_encode(["status" => "error", "message" => "❌ Error creating account."]);
    }
}
?>
