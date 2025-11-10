<?php
session_start();
include("db.php");

// Check if user is admin
if (!isset($_SESSION['user_id']) || $_SESSION['role'] != 2) {
    exit;
}

$patients = $conn->query("SELECT id, patient_name, contact, email, last_visit FROM patients ORDER BY id DESC");
if ($patients->num_rows === 0): ?>
  <tr>
    <td colspan="5" style="text-align:center; color:#64748b; font-style:italic;">
      No patients found.
    </td>
  </tr>
<?php
else:
  while ($row = $patients->fetch_assoc()):
?>
  <tr data-id="<?php echo $row['id']; ?>">
    <td><strong><?php echo htmlspecialchars($row['patient_name']); ?></strong></td>
    <td><?php echo htmlspecialchars($row['contact']); ?></td>
    <td><?php echo htmlspecialchars($row['email']); ?></td>
    <td><?php echo $row['last_visit'] ? date('M d, Y g:i A', strtotime($row['last_visit'])) : 'No visit yet'; ?></td>
    <td>
      <button class="btn-icon view-patient-admin" title="View"><i class="fas fa-eye"></i></button>
      <button class="btn-icon edit-patient-admin" title="Edit"><i class="fas fa-edit"></i></button>
      <button class="btn-icon delete-patient-admin" title="Delete"><i class="fas fa-trash"></i></button>
    </td>
  </tr>
<?php endwhile; endif; ?>
