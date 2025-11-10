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
        // Start transaction
        $conn->begin_transaction();
        
        try {
            // Get archived patient data
            $stmt = $conn->prepare("SELECT * FROM archived_patients WHERE id=?");
            $stmt->bind_param("i", $id);
            $stmt->execute();
            $result = $stmt->get_result();
            $archived = $result->fetch_assoc();
            $stmt->close();
            
            if (!$archived) {
                throw new Exception("Archived record not found.");
            }
            
            // Restore to patients table
            $stmt = $conn->prepare("INSERT INTO patients (patient_name, contact, email, address, last_visit, patient_image, medical_history, clinical_findings, diagnostic_tests, diagnosis, conclusion, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
            
            $stmt->bind_param("ssssssssssss",
                $archived['patient_name'],
                $archived['contact'],
                $archived['email'],
                $archived['address'],
                $archived['last_visit'],
                $archived['patient_image'],
                $archived['medical_history'],
                $archived['clinical_findings'],
                $archived['diagnostic_tests'],
                $archived['diagnosis'],
                $archived['conclusion'],
                $archived['created_at']
            );
            
            if (!$stmt->execute()) {
                throw new Exception("Failed to restore patient.");
            }
            $stmt->close();
            
            // Delete from archive
            $stmt = $conn->prepare("DELETE FROM archived_patients WHERE id=?");
            $stmt->bind_param("i", $id);
            
            if (!$stmt->execute()) {
                throw new Exception("Failed to remove from archive.");
            }
            $stmt->close();
            
            // Commit transaction
            $conn->commit();
            
            usleep(500000);
            echo json_encode(["status" => "success", "message" => "Patient restored successfully!"]);
            
        } catch (Exception $e) {
            $conn->rollback();
            echo json_encode(["status" => "error", "message" => $e->getMessage()]);
        }
    } else {
        echo json_encode(["status" => "error", "message" => "Invalid ID."]);
    }
}
?>
