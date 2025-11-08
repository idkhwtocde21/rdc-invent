<?php
session_start();
include("db.php");

header('Content-Type: application/json');

if (!isset($_SESSION['user_id'])) {
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
    
    // Item name validation: minimum 2 characters, alphanumeric and common symbols
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
    
    // Category validation: must be from allowed list
    $allowed_categories = ['Medicine', 'Tool', 'Equipment', 'Supplies', 'Consumables', 'Other'];
    if (!in_array($category, $allowed_categories)) {
        echo json_encode(["status" => "error", "message" => "Invalid category selected."]);
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
    
    // Quantity validation: cannot exceed 100
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
        // Add small delay for better UX with loading screen
        usleep(500000); // 0.5 seconds
        
        echo json_encode(["status" => "success", "message" => "Inventory item added successfully!"]);
    } else {
        echo json_encode(["status" => "error", "message" => "Error adding inventory item."]);
    }
    $stmt->close();
}
?>