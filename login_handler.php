<?php
session_start();
include("db.php");

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $username = trim($_POST['username'] ?? '');
    $password = $_POST['password'] ?? '';

    if ($username == "" || $password == "") {
        echo json_encode(["status" => "error", "message" => "❌ All fields are required."]);
        exit;
    }

    $query = $conn->prepare("SELECT id, username, password FROM users WHERE username=? OR email=? LIMIT 1");
    $query->bind_param("ss", $username, $username);
    $query->execute();
    $result = $query->get_result();

    if ($result->num_rows === 1) {
        $user = $result->fetch_assoc();
        if (password_verify($password, $user['password'])) {
            $_SESSION['user_id'] = $user['id'];
            echo json_encode(["status" => "success", "message" => "✅ Login successful! Redirecting..."]);
        } else {
            echo json_encode(["status" => "error", "message" => "❌ Incorrect password."]);
        }
    } else {
        echo json_encode(["status" => "error", "message" => "❌ User not found."]);
    }
}
?>
