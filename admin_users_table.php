<?php
session_start();
include("db.php");

// Prevent caching
header('Cache-Control: no-cache, no-store, must-revalidate');
header('Pragma: no-cache');
header('Expires: 0');

// Check if user is logged in and is admin
if (!isset($_SESSION['user_id']) || $_SESSION['role'] != 2) {
    echo '<tr><td colspan="5" style="text-align: center; padding: 40px; color: #ef4444;">Unauthorized access.</td></tr>';
    exit;
}

$user_id = $_SESSION['user_id'];
$filter = $_GET['filter'] ?? 'all'; // all, staff, admin

// Build query based on filter
if ($filter === 'staff') {
    $query = "SELECT id, username, email, role, created_at FROM users WHERE role = 1 ORDER BY created_at DESC";
} elseif ($filter === 'admin') {
    $query = "SELECT id, username, email, role, created_at FROM users WHERE role = 2 ORDER BY created_at DESC";
} else {
    $query = "SELECT id, username, email, role, created_at FROM users ORDER BY created_at DESC";
}

$users = $conn->query($query);

if ($users->num_rows === 0) {
    echo '<tr><td colspan="5" style="text-align: center; padding: 40px; color: #94a3b8;">No users found</td></tr>';
} else {
    while ($row = $users->fetch_assoc()):
?>
<tr data-id="<?php echo $row['id']; ?>"
    data-username="<?php echo htmlspecialchars($row['username']); ?>"
    data-email="<?php echo htmlspecialchars($row['email']); ?>"
    data-role="<?php echo $row['role']; ?>"
    data-joined="<?php echo date('M d, Y', strtotime($row['created_at'])); ?>">
  <td><strong><?php echo htmlspecialchars($row['username']); ?></strong></td>
  <td><?php echo htmlspecialchars($row['email']); ?></td>
  <td>
    <span class="badge <?php echo $row['role'] == 2 ? 'badge-admin' : 'badge-staff'; ?>">
      <?php echo $row['role'] == 2 ? 'Admin' : 'Staff'; ?>
    </span>
  </td>
  <td><?php echo date('M d, Y', strtotime($row['created_at'])); ?></td>
  <td>
    <?php if ($row['id'] == $user_id): ?>
      <!-- Current logged-in admin -->
      <button class="btn-icon view-admin-info" title="View"><i class="fas fa-eye"></i></button>
    <?php elseif ($row['role'] == 2): ?>
      <!-- Other admin -->
      <button class="btn-icon view-other-admin" title="View"><i class="fas fa-eye"></i></button>
    <?php else: ?>
      <!-- Staff members -->
      <button class="btn-icon edit-user" title="Edit"><i class="fas fa-edit"></i></button>
      <button class="btn-icon delete-user" title="Delete"><i class="fas fa-trash"></i></button>
    <?php endif; ?>
  </td>
</tr>
<?php 
    endwhile;
}
?>