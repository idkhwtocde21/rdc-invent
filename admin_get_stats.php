<?php
session_start();
include("db.php");

header('Content-Type: application/json');
header('Cache-Control: no-cache, no-store, must-revalidate');
header('Pragma: no-cache');
header('Expires: 0');

// Check if user is logged in and is admin
if (!isset($_SESSION['user_id']) || $_SESSION['role'] != 2) {
    echo json_encode(["status" => "error", "message" => "Unauthorized access."]);
    exit;
}

// Get all statistics
$total_staff = $conn->query("SELECT COUNT(*) as count FROM users WHERE role = 1")->fetch_assoc()['count'];
$total_admins = $conn->query("SELECT COUNT(*) as count FROM users WHERE role = 2")->fetch_assoc()['count'];
$total_users = $total_staff + $total_admins;
$total_patients = $conn->query("SELECT COUNT(*) as count FROM patients")->fetch_assoc()['count'];
$total_inventory = $conn->query("SELECT COUNT(*) as count FROM inventory")->fetch_assoc()['count'];
$low_stock = $conn->query("SELECT COUNT(*) as count FROM inventory WHERE status = 'Low Stock' OR status = 'Out of Stock'")->fetch_assoc()['count'];

echo json_encode([
    "status" => "success",
    "data" => [
        "total_staff" => $total_staff,
        "total_admins" => $total_admins,
        "total_users" => $total_users,
        "total_patients" => $total_patients,
        "total_inventory" => $total_inventory,
        "low_stock" => $low_stock
    ]
]);
?>
