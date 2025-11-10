<?php
session_start();
include("db.php");

// Check if user is admin
if (!isset($_SESSION['user_id']) || $_SESSION['role'] != 2) {
    exit;
}

$recent_patients = $conn->query("SELECT patient_name, last_visit FROM patients WHERE last_visit IS NOT NULL ORDER BY last_visit DESC LIMIT 5");

if ($recent_patients->num_rows > 0):
    while ($row = $recent_patients->fetch_assoc()): 
?>
<div class="activity-item">
  <span class="activity-icon"><i class="fas fa-user-clock"></i></span>
  <span class="activity-text"><strong><?php echo htmlspecialchars($row['patient_name']); ?></strong></span>
  <span class="activity-time"><?php echo date('M d, Y g:i A', strtotime($row['last_visit'])); ?></span>
</div>
<?php 
    endwhile;
else:
?>
<div class="activity-item">
  <span class="activity-text" style="color: #94a3b8; font-style: italic;">No recent visits</span>
</div>
<?php endif; ?>
