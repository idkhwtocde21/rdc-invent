<?php

include("db.php");

$id = intval($_POST['id'] ?? 0);
$item_name = trim($_POST['item_name'] ?? '');
$category = trim($_POST['category'] ?? '');
$quantity = intval($_POST['quantity'] ?? 0);
$status = trim($_POST['status'] ?? '');

if ($id && $item_name && $category && $quantity >= 0 && $status) {
    // Validation: If status is "Out of Stock", quantity must be 0
    if ($status === 'Out of Stock' && $quantity !== 0) {
        echo json_encode(["status" => "error", "message" => "Quantity must be 0 when status is 'Out of Stock'."]);
        exit;
    }

    $stmt = $conn->prepare("UPDATE inventory SET item_name=?, category=?, quantity=?, status=? WHERE id=?");
    $stmt->bind_param("ssisi", $item_name, $category, $quantity, $status, $id);
    if ($stmt->execute()) {
        echo json_encode(["status" => "success", "message" => "Inventory updated."]);
    } else {
        echo json_encode(["status" => "error", "message" => "Update failed."]);
    }
    $stmt->close();
} else {
    echo json_encode(["status" => "error", "message" => "Invalid data."]);
}
?>