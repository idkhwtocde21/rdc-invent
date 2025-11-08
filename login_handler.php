<?php
session_start();
include("db.php");

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $username = trim($_POST['username'] ?? '');
    $password = $_POST['password'] ?? '';

    if ($username == "" || $password == "") {
        echo json_encode(["status" => "error", "message" => "All fields are required."]);
        exit;
    }

    // Updated query to include email, role, and is_active
    $query = $conn->prepare("SELECT id, username, email, password, role, is_active FROM users WHERE username=? OR email=? LIMIT 1");
    $query->bind_param("ss", $username, $username);
    $query->execute();
    $result = $query->get_result();

    if ($result->num_rows === 1) {
        $user = $result->fetch_assoc();
        
        // Check if account is disabled
        if ($user['is_active'] == 0) {
            echo json_encode(["status" => "error", "message" => "Your account has been disabled. Please contact an administrator."]);
            exit;
        }
        
        if (password_verify($password, $user['password'])) {
            $_SESSION['user_id'] = $user['id'];
            $_SESSION['username'] = $user['username'];
            $_SESSION['email'] = $user['email'];
            $_SESSION['role'] = $user['role']; // Store role in session
            
            // Redirect based on role
            $redirect_url = ($user['role'] == 2) ? 'admin_dashboard.php' : 'dashboard.php';
            
            echo json_encode([
                "status" => "success", 
                "message" => "Login successful! Redirecting...",
                "redirect" => $redirect_url
            ]);
        } else {
            echo json_encode(["status" => "error", "message" => "Incorrect password."]);
        }
    } else {
        echo json_encode(["status" => "error", "message" => "User not found."]);
    }
}
?>