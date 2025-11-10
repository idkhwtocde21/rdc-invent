<?php
session_start();
include("db.php");

// Check if user is admin
if (!isset($_SESSION['user_id']) || $_SESSION['role'] != 2) {
    exit;
}

$inventory = $conn->query("SELECT id, item_name, category, quantity, status FROM inventory ORDER BY id DESC");
if ($inventory->num_rows === 0): ?>
  <tr>
    <td colspan="5" style="text-align:center; color:#64748b; font-style:italic;">
      No inventory items found.
    </td>
  </tr>
<?php
else:
  while ($row = $inventory->fetch_assoc()):
?>
  <tr data-id="<?php echo $row['id']; ?>"
      data-item-name="<?php echo htmlspecialchars($row['item_name']); ?>"
      data-category="<?php echo htmlspecialchars($row['category']); ?>"
      data-quantity="<?php echo $row['quantity']; ?>"
      data-status="<?php echo htmlspecialchars($row['status']); ?>">
    <td>
      <div style="display: flex; align-items: center; gap: 8px;">
        <span>📦</span>
        <strong><?php echo htmlspecialchars($row['item_name']); ?></strong>
      </div>
    </td>
    <td><?php echo htmlspecialchars($row['category']); ?></td>
    <td><?php echo $row['quantity']; ?></td>
    <td>
      <span class="status-badge <?php 
        if ($row['status'] == 'Available') echo 'status-available';
        elseif ($row['status'] == 'Low Stock') echo 'status-low';
        else echo 'status-out';
      ?>">
        <?php echo $row['status']; ?>
      </span>
    </td>
    <td>
      <button class="btn-icon edit-inventory-admin" title="Edit"><i class="fas fa-edit"></i></button>
      <button class="btn-icon delete-inventory-admin" title="Delete"><i class="fas fa-trash"></i></button>
    </td>
  </tr>
<?php endwhile; endif; ?>
