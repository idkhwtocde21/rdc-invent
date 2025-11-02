<?php

include("db.php");
$inv = $conn->query("SELECT * FROM inventory ORDER BY id DESC");
if ($inv->num_rows === 0): ?>
  <tr>
    <td colspan="5" style="text-align:center; color:#64748b; font-style:italic;">
      No inventory items found.
    </td>
  </tr>
<?php
else:
  while ($row = $inv->fetch_assoc()):
?>
  <tr data-id="<?php echo $row['id']; ?>">
    <td>
      <div style="display: flex; align-items: center; gap: 8px;">
        <span>📦</span>
        <strong><?php echo htmlspecialchars($row['item_name']); ?></strong>
      </div>
    </td>
    <td><?php echo htmlspecialchars($row['category']); ?></td>
    <td><?php echo $row['quantity']; ?></td>
    <td>
      <?php
        $status = $row['status'];
        $color = $status === 'Available' ? '#10b981' : ($status === 'Low Stock' ? '#f59e0b' : '#ef4444');
        $icon = $status === 'Available' ? '✓' : ($status === 'Low Stock' ? '⚠' : '✕');
      ?>
      <span style="color: <?php echo $color; ?>; font-weight: 600;"><?php echo $icon . ' ' . htmlspecialchars($status); ?></span>
    </td>
    <td>
      <button class="btn btn-secondary btn-small edit-inventory">✏️ Edit</button>
      <button class="btn btn-danger btn-small delete-inventory">🗑️ Delete</button>
    </td>
  </tr>
<?php endwhile; endif; ?>