<?php
session_start();
include("db.php");

header('Content-Type: application/json');

// Check if user is admin
if (!isset($_SESSION['user_id']) || $_SESSION['role'] != 2) {
    echo json_encode(["status" => "error", "message" => "Unauthorized access."]);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $item_name = trim($_POST['item_name'] ?? '');
    $category = trim($_POST['category'] ?? '');
    $quantity = isset($_POST['quantity']) ? intval($_POST['quantity']) : null;

    if ($item_name === "" || $category === "" || $quantity === null || $quantity < 0) {
        echo json_encode(["status" => "error", "message" => "All fields are required and quantity must be non-negative."]);
        exit;
    }
    
    // Item name validation
    if (strlen($item_name) < 2) {
        echo json_encode(["status" => "error", "message" => "Item name must be at least 2 characters."]);
        exit;
    }
    if (strlen($item_name) > 100) {
        echo json_encode(["status" => "error", "message" => "Item name must not exceed 100 characters."]);
        exit;
    }
    
    // Check for duplicate item names
    $check_stmt = $conn->prepare("SELECT id FROM inventory WHERE item_name = ?");
    $check_stmt->bind_param("s", $item_name);
    $check_stmt->execute();
    $check_stmt->store_result();
    
    if ($check_stmt->num_rows > 0) {
        echo json_encode(["status" => "error", "message" => "An item with this name already exists."]);
        $check_stmt->close();
        exit;
    }
    $check_stmt->close();
    
    // Category validation
    $allowed_categories = ['Medicine', 'Tool', 'Equipment', 'Supplies', 'Consumables', 'Other'];
    if (!in_array($category, $allowed_categories)) {
        echo json_encode(["status" => "error", "message" => "Invalid category selected."]);
        exit;
    }
    
    // Quantity validation
    if ($quantity > 100) {
        echo json_encode(["status" => "error", "message" => "Quantity cannot exceed 100 items."]);
        exit;
    }
    
    // Auto-determine status based on quantity
    if ($quantity == 0) {
        $status = 'Out of Stock';
    } elseif ($quantity < 5) {
        $status = 'Low Stock';
    } else {
        $status = 'Available';
    }

    $stmt = $conn->prepare("INSERT INTO inventory (item_name, category, quantity, status) VALUES (?, ?, ?, ?)");
    $stmt->bind_param("ssis", $item_name, $category, $quantity, $status);

    if ($stmt->execute()) {
        usleep(500000);
        echo json_encode(["status" => "success", "message" => "Inventory item added successfully!"]);
    } else {
        echo json_encode(["status" => "error", "message" => "Error adding inventory item."]);
    }
    $stmt->close();
}
?>
