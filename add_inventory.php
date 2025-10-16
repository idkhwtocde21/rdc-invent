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
    $quantity = intval($_POST['quantity'] ?? 0);
    $status = trim($_POST['status'] ?? '');

    if ($item_name === "" || $category === "" || $quantity < 0 || $status === "") {
        echo json_encode(["status" => "error", "message" => "All fields are required and quantity must be non-negative."]);
        exit;
    }

    // Validation: If status is "Out of Stock", quantity must be 0
    if ($status === 'Out of Stock' && $quantity !== 0) {
        echo json_encode(["status" => "error", "message" => "Quantity must be 0 when status is 'Out of Stock'."]);
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