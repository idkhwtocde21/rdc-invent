<?php
session_start();
include("db.php");

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $username = trim($_POST['username'] ?? '');
    $password = $_POST['password'] ?? '';

    if ($username == "" || $password == "") {
        echo json_encode(["status" => "error", "message" => "✕ Username and password are required."]);
        exit;
    }

    // Check if username or email
    $stmt = $conn->prepare("SELECT id, username, email, password, role FROM users WHERE username=? OR email=? LIMIT 1");
    $stmt->bind_param("ss", $username, $username);
    $stmt->execute();
    $stmt->bind_result($user_id, $db_username, $db_email, $hashed_password, $role);
    
    if ($stmt->fetch() && password_verify($password, $hashed_password)) {
        $_SESSION['user_id'] = $user_id;
        $_SESSION['username'] = $db_username;
        $_SESSION['email'] = $db_email;
        $_SESSION['role'] = $role; // Store role in session
        
        $stmt->close();
        
        // Redirect based on role
        $redirect_url = ($role == 2) ? 'admin_dashboard.php' : 'dashboard.php';
        
        echo json_encode([
            "status" => "success", 
            "message" => "✓ Login successful! Redirecting...",
            "redirect" => $redirect_url
        ]);
    } else {
        $stmt->close();
        echo json_encode(["status" => "error", "message" => "✕ Invalid username or password."]);
    }
}
?>