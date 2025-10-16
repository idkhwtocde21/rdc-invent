<?php 
include("db.php");
$id = intval($_POST['id'] ?? 0);
if ($id) {
    $stmt = $conn->prepare("DELETE FROM inventory WHERE id=?");
    $stmt->bind_param("i", $id);
    if ($stmt->execute()) {
        echo json_encode(["status" => "success", "message" => "Item deleted."]);
    } else {
        echo json_encode(["status" => "error", "message" => "Delete failed."]);
    }
    $stmt->close();
} else {
    echo json_encode(["status" => "error", "message" => "Invalid ID."]);
}
?>