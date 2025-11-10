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
    $id = intval($_POST['id'] ?? 0);
    
    if ($id) {
        // Get the patient image path before deleting
        $stmt = $conn->prepare("SELECT patient_image FROM archived_patients WHERE id=?");
        $stmt->bind_param("i", $id);
        $stmt->execute();
        $result = $stmt->get_result();
        $archived = $result->fetch_assoc();
        $stmt->close();
        
        if ($archived) {
            // Delete the image file if exists
            if ($archived['patient_image'] && file_exists($archived['patient_image'])) {
                unlink($archived['patient_image']);
            }
            
            // Delete from archive permanently
            $stmt = $conn->prepare("DELETE FROM archived_patients WHERE id=?");
            $stmt->bind_param("i", $id);
            
            if ($stmt->execute()) {
                usleep(500000);
                echo json_encode(["status" => "success", "message" => "Archived record deleted permanently!"]);
            } else {
                echo json_encode(["status" => "error", "message" => "Failed to delete record."]);
            }
            $stmt->close();
        } else {
            echo json_encode(["status" => "error", "message" => "Record not found."]);
        }
    } else {
        echo json_encode(["status" => "error", "message" => "Invalid ID."]);
    }
}
?>
