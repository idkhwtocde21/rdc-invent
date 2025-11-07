<?php
session_start();
include("db.php");

if (!isset($_SESSION['user_id'])) {
    exit;
}

$patients = $conn->query("SELECT * FROM patients ORDER BY id DESC");
if ($patients->num_rows === 0): ?>
  <tr>
    <td colspan="4" style="text-align:center; color:#64748b; font-style:italic;">
      No patient records found.
    </td>
  </tr>
<?php
else:
  while ($row = $patients->fetch_assoc()):
?>
  <tr 
    data-id="<?php echo $row['id']; ?>" 
    data-email="<?php echo htmlspecialchars($row['email']); ?>" 
    data-address="<?php echo htmlspecialchars($row['address']); ?>"
    data-last-visit="<?php echo $row['last_visit'] ? date('Y-m-d\TH:i', strtotime($row['last_visit'])) : ''; ?>"
    data-image="<?php echo htmlspecialchars($row['patient_image'] ?? ''); ?>"
    data-medical-history="<?php echo htmlspecialchars($row['medical_history'] ?? ''); ?>"
    data-clinical-findings="<?php echo htmlspecialchars($row['clinical_findings'] ?? ''); ?>"
    data-diagnostic-tests="<?php echo htmlspecialchars($row['diagnostic_tests'] ?? ''); ?>"
    data-diagnosis="<?php echo htmlspecialchars($row['diagnosis'] ?? ''); ?>"
    data-conclusion="<?php echo htmlspecialchars($row['conclusion'] ?? ''); ?>"
  >
    <td>
      <div style="display: flex; align-items: center; gap: 8px;">
        <?php if (!empty($row['patient_image'])): ?>
          <img src="<?php echo htmlspecialchars($row['patient_image']); ?>" alt="Patient" style="width: 32px; height: 32px; border-radius: 50%; object-fit: cover;">
        <?php else: ?>
          <i class="fas fa-user-circle" style="font-size: 24px; color: #94a3b8;"></i>
        <?php endif; ?>
        <strong><?php echo htmlspecialchars($row['patient_name']); ?></strong>
      </div>
    </td>
    <td><?php echo htmlspecialchars($row['contact']); ?></td>
    <td>
      <?php 
        if ($row['last_visit']) {
          echo date('M d, Y g:i A', strtotime($row['last_visit']));
        } else {
          echo '<span style="color: #94a3b8;">No visit yet</span>';
        }
      ?>
    </td>
    <td>
      <button class="btn btn-secondary btn-small view-patient"><i class="fas fa-eye"></i> View</button>
      <button class="btn btn-secondary btn-small edit-patient"><i class="fas fa-edit"></i> Edit</button>
      <button class="btn btn-danger btn-small delete-patient"><i class="fas fa-trash"></i> Delete</button>
    </td>
  </tr>
<?php endwhile; endif; ?>