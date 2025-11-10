<?php
// Run this file once to create the archived_patients table
include("db.php");

$sql = "CREATE TABLE IF NOT EXISTS archived_patients (
    id INT PRIMARY KEY AUTO_INCREMENT,
    original_patient_id INT,
    patient_name VARCHAR(255) NOT NULL,
    contact VARCHAR(50) NOT NULL,
    email VARCHAR(255),
    address TEXT,
    last_visit DATETIME,
    patient_image VARCHAR(255),
    medical_history TEXT,
    clinical_findings TEXT,
    diagnostic_tests TEXT,
    diagnosis TEXT,
    conclusion TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    archived_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    archived_by INT,
    archived_by_username VARCHAR(100),
    archived_by_role TINYINT,
    INDEX(original_patient_id),
    INDEX(archived_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4";

if ($conn->query($sql) === TRUE) {
    echo "Table 'archived_patients' created successfully!";
} else {
    echo "Error creating table: " . $conn->error;
}

$conn->close();
?>
