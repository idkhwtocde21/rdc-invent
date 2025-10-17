<?php
session_start();
include("db.php");

if (!isset($_SESSION['user_id'])) {
    exit;
}

$patients = $conn->query("SELECT * FROM patients ORDER BY id DESC");
if ($patients->num_rows === 0): ?>
  <tr>
    <td colspan="5" style="text-align:center; color:#64748b; font-style:italic;">
      No patient records found.
    </td>
  </tr>
<?php
else:
  while ($row = $patients->fetch_assoc()):
?>
  <tr data-id="<?php echo $row['id']; ?>">
    <td>#<?php echo str_pad($row['id'], 3, '0', STR_PAD_LEFT); ?></td>
    <td>
      <div style="display: flex; align-items: center; gap: 8px;">
        <span>👤</span>
        <strong><?php echo htmlspecialchars($row['patient_name']); ?></strong>
      </div>
    </td>
    <td><?php echo htmlspecialchars($row['contact']); ?></td>
    <td><?php echo date('M d, Y', strtotime($row['created_at'])); ?></td>
    <td>
      <button class="btn btn-secondary btn-small">📋 View</button>
      <button class="btn btn-secondary btn-small edit-patient">✏️ Edit</button>
      <button class="btn btn-danger btn-small delete-patient">🗑️ Delete</button>
    </td>
  </tr>
<?php endwhile; endif; ?>