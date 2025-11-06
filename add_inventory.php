<?php
session_start(); // ADD THIS - Required to access session variables
include("db.php");

if (!isset($_SESSION['user_id'])) {
    echo json_encode(["status" => "error", "message" => "Unauthorized access."]);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $item_name = trim($_POST['item_name'] ?? '');
    $category = trim($_POST['category'] ?? '');
    $quantity = isset($_POST['quantity']) ? intval($_POST['quantity']) : null;
    $status = trim($_POST['status'] ?? '');

    if ($item_name === "" || $category === "" || $quantity === null || $quantity < 0 || $status === "") {
        echo json_encode(["status" => "error", "message" => "All fields are required and quantity must be non-negative."]);
        exit;
    }
    
    // Item name validation: minimum 2 characters, alphanumeric and common symbols
    if (strlen($item_name) < 2) {
        echo json_encode(["status" => "error", "message" => "Item name must be at least 2 characters."]);
        exit;
    }
    if (strlen($item_name) > 100) {
        echo json_encode(["status" => "error", "message" => "Item name must not exceed 100 characters."]);
        exit;
    }
    
    // Category validation: minimum 2 characters
    if (strlen($category) < 2) {
        echo json_encode(["status" => "error", "message" => "Category must be at least 2 characters."]);
        exit;
    }
    if (strlen($category) > 50) {
        echo json_encode(["status" => "error", "message" => "Category must not exceed 50 characters."]);
        exit;
    }
    
    // Status validation: must be one of the predefined values
    $valid_statuses = ['Available', 'Low Stock', 'Out of Stock'];
    if (!in_array($status, $valid_statuses)) {
        echo json_encode(["status" => "error", "message" => "Invalid status value."]);
        exit;
    }

    // Validation: If status is "Out of Stock", quantity must be 0
    if ($status === 'Out of Stock' && $quantity !== 0) {
        echo json_encode(["status" => "error", "message" => "Quantity must be 0 when status is 'Out of Stock'."]);
        exit;
    }

    // Validation: If status is NOT "Out of Stock", quantity must be at least 1
    if ($status !== 'Out of Stock' && $quantity < 1) {
        echo json_encode(["status" => "error", "message" => "Quantity must be at least 1 when item is in stock."]);
        exit;
    }

    $stmt = $conn->prepare("INSERT INTO inventory (item_name, category, quantity, status) VALUES (?, ?, ?, ?)");
    $stmt->bind_param("ssis", $item_name, $category, $quantity, $status);

    if ($stmt->execute()) {
        echo json_encode(["status" => "success", "message" => "Inventory item added successfully!"]);
    } else {
        echo json_encode(["status" => "error", "message" => "Error adding inventory item."]);
    }
    $stmt->close();
}
?>