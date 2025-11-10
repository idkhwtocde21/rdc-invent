<?php
session_start();
include("db.php");

// Check if user is admin
if (!isset($_SESSION['user_id']) || $_SESSION['role'] != 2) {
    exit;
}

$archives = $conn->query("SELECT * FROM archived_patients ORDER BY archived_at DESC");

if ($archives->num_rows > 0):
    while ($row = $archives->fetch_assoc()):
?>
<tr data-id="<?php echo $row['id']; ?>" 
    data-original-id="<?php echo $row['original_patient_id']; ?>"
    data-name="<?php echo htmlspecialchars($row['patient_name']); ?>"
    data-contact="<?php echo htmlspecialchars($row['contact']); ?>"
    data-email="<?php echo htmlspecialchars($row['email']); ?>"
    data-address="<?php echo htmlspecialchars($row['address']); ?>"
    data-last-visit="<?php echo $row['last_visit']; ?>"
    data-image="<?php echo htmlspecialchars($row['patient_image']); ?>"
    data-medical="<?php echo htmlspecialchars($row['medical_history']); ?>"
    data-clinical="<?php echo htmlspecialchars($row['clinical_findings']); ?>"
    data-diagnostic="<?php echo htmlspecialchars($row['diagnostic_tests']); ?>"
    data-diagnosis="<?php echo htmlspecialchars($row['diagnosis']); ?>"
    data-conclusion="<?php echo htmlspecialchars($row['conclusion']); ?>"
    data-archived-at="<?php echo $row['archived_at']; ?>"
    data-archived-by="<?php echo htmlspecialchars($row['archived_by_username']); ?>"
    data-archived-role="<?php echo $row['archived_by_role']; ?>">
  <td><?php echo htmlspecialchars($row['patient_name']); ?></td>
  <td><?php echo htmlspecialchars($row['contact']); ?></td>
  <td><?php echo date('M d, Y g:i A', strtotime($row['archived_at'])); ?></td>
  <td>
    <?php echo htmlspecialchars($row['archived_by_username']); ?>
    <span style="color: #64748b; font-size: 13px;">
      (<?php echo $row['archived_by_role'] == 2 ? 'Admin' : 'Staff'; ?>)
    </span>
  </td>
  <td>
    <div class="action-buttons">
      <button class="btn-icon view-archive" title="View">
        <i class="fas fa-eye"></i>
      </button>
      <button class="btn-icon restore-archive" title="Restore">
        <i class="fas fa-undo"></i>
      </button>
      <button class="btn-icon delete-archive-permanent" title="Delete Permanently">
        <i class="fas fa-trash-alt"></i>
      </button>
    </div>
  </td>
</tr>
<?php 
    endwhile;
else:
?>
<tr>
  <td colspan="5" style="text-align: center; color: #94a3b8; padding: 24px;">No archived records found.</td>
</tr>
<?php endif; ?>
