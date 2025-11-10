<?php
session_start();
include("db.php");

header('Content-Type: application/json');

// Check if user is admin
if (!isset($_SESSION['user_id']) || $_SESSION['role'] != 2) {
    echo json_encode(["status" => "error", "message" => "Unauthorized access."]);
    exit;
}

$id = intval($_POST['id'] ?? 0);
if ($id) {
    // Start transaction
    $conn->begin_transaction();
    
    try {
        // Get patient data first
        $stmt = $conn->prepare("SELECT * FROM patients WHERE id=?");
        $stmt->bind_param("i", $id);
        $stmt->execute();
        $result = $stmt->get_result();
        $patient = $result->fetch_assoc();
        $stmt->close();
        
        if (!$patient) {
            throw new Exception("Patient not found.");
        }
        
        // Archive the patient record
        $stmt = $conn->prepare("INSERT INTO archived_patients (original_patient_id, patient_name, contact, email, address, last_visit, patient_image, medical_history, clinical_findings, diagnostic_tests, diagnosis, conclusion, created_at, archived_by, archived_by_username, archived_by_role) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
        
        $stmt->bind_param("issssssssssssisi", 
            $patient['id'],
            $patient['patient_name'],
            $patient['contact'],
            $patient['email'],
            $patient['address'],
            $patient['last_visit'],
            $patient['patient_image'],
            $patient['medical_history'],
            $patient['clinical_findings'],
            $patient['diagnostic_tests'],
            $patient['diagnosis'],
            $patient['conclusion'],
            $patient['created_at'],
            $_SESSION['user_id'],
            $_SESSION['username'],
            $_SESSION['role']
        );
        
        if (!$stmt->execute()) {
            throw new Exception("Failed to archive patient.");
        }
        $stmt->close();
        
        // Delete from patients table
        $stmt = $conn->prepare("DELETE FROM patients WHERE id=?");
        $stmt->bind_param("i", $id);
        
        if (!$stmt->execute()) {
            throw new Exception("Failed to delete patient.");
        }
        $stmt->close();
        
        // Commit transaction
        $conn->commit();
        
        usleep(500000);
        echo json_encode(["status" => "success", "message" => "Patient archived successfully!"]);
        
    } catch (Exception $e) {
        $conn->rollback();
        echo json_encode(["status" => "error", "message" => $e->getMessage()]);
    }
} else {
    echo json_encode(["status" => "error", "message" => "Invalid ID."]);
}
?>
