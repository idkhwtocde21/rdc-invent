<?php
session_start();
include("db.php");

// Redirect if not logged in
if (!isset($_SESSION['user_id'])) {
    header("Location: login.php");
    exit;
}

// Fetch user details
$user_id = $_SESSION['user_id'];
$stmt = $conn->prepare("SELECT username, email FROM users WHERE id=? LIMIT 1");
$stmt->bind_param("i", $user_id);
$stmt->execute();
$stmt->bind_result($username, $email);
$stmt->fetch();
$stmt->close();
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Dashboard - Romero's Dental Clinic</title>
  <link rel="stylesheet" href="dashboard.css">
</head>
<body>
  <div class="dashboard">
    <!-- Sidebar -->
    <aside class="sidebar">
      <div class="sidebar-header">
        <div class="sidebar-logo">🦷</div>
        <div class="sidebar-title">Romero's Clinic</div>
        <div class="sidebar-subtitle">Dental Management</div>
      </div>

      <ul class="sidebar-nav">
        <li class="nav-item">
          <div class="nav-link active" data-section="settings">
            <span class="nav-icon">⚙️</span>
            <span>Settings</span>
          </div>
        </li>
        <li class="nav-item">
          <div class="nav-link" data-section="patients">
            <span class="nav-icon">👥</span>
            <span>Patients</span>
          </div>
        </li>
        <li class="nav-item">
          <div class="nav-link" data-section="inventory">
            <span class="nav-icon">📦</span>
            <span>Inventory</span>
          </div>
        </li>
        <li class="nav-item" style="margin-top: auto;">
          <div class="nav-link" id="logout-btn">
            <span class="nav-icon">🚪</span>
            <span>Logout</span>
          </div>
        </li>
      </ul>
    </aside>

    <!-- Main Content -->
    <main class="main-content">
      <!-- Top Bar -->
      <div class="topbar">
        <h1 class="topbar-title">Dashboard</h1>
        <div class="topbar-user">
          <div class="user-avatar"><?php echo strtoupper(substr($username, 0, 2)); ?></div>
          <span><?php echo htmlspecialchars($username); ?></span>
        </div>
      </div>

      <!-- Content -->
      <div class="content">
        <!-- Settings Section -->
        <section class="section active" id="settings-section">
          <div class="section-header">
            <h2 class="section-title">User Settings</h2>
            <p class="section-description">Manage your account preferences and security</p>
          </div>

          <div class="card">
            <form id="settings-form">
              <div class="form-group">
                <label class="form-label">Username</label>
                <input type="text" class="form-input" value="<?php echo htmlspecialchars($username); ?>" name="username" required>
              </div>

              <div class="form-group">
                <label class="form-label">Email Address</label>
                <input type="email" class="form-input" value="<?php echo htmlspecialchars($email); ?>" name="email" required>
              </div>

              <div class="form-group">
                <label class="form-label">
                  New Password 
                  <span class="form-small">(leave blank to keep current)</span>
                </label>
                <input type="password" class="form-input" placeholder="Enter new password" name="password">
              </div>

              <button type="submit" class="btn btn-primary">
                💾 Save Changes
              </button>
            </form>
          </div>
        </section>

        <!-- Patients Section -->
        <section class="section" id="patients-section">
          <div class="section-header">
            <h2 class="section-title">Patient Records</h2>
            <p class="section-description">View and manage patient information</p>
          </div>

          <div class="controls">
            <input type="text" class="search-input" placeholder="🔍 Search patients by name or ID...">
            <button class="btn btn-primary">
              ➕ Add Patient
            </button>
          </div>

          <div class="card">
            <div class="table-container">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Patient Name</th>
                    <th>Contact</th>
                    <th>Last Visit</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>#001</td>
                    <td>
                      <div style="display: flex; align-items: center; gap: 8px;">
                        <span>👤</span>
                        <strong>Juan Dela Cruz</strong>
                      </div>
                    </td>
                    <td>09123456789</td>
                    <td>Oct 10, 2025</td>
                    <td>
                      <button class="btn btn-secondary btn-small">📋 View</button>
                      <button class="btn btn-secondary btn-small">✏️ Edit</button>
                      <button class="btn btn-danger btn-small">🗑️ Delete</button>
                    </td>
                  </tr>
                  <tr>
                    <td>#002</td>
                    <td>
                      <div style="display: flex; align-items: center; gap: 8px;">
                        <span>👤</span>
                        <strong>Maria Santos</strong>
                      </div>
                    </td>
                    <td>09187654321</td>
                    <td>Oct 08, 2025</td>
                    <td>
                      <button class="btn btn-secondary btn-small">📋 View</button>
                      <button class="btn btn-secondary btn-small">✏️ Edit</button>
                      <button class="btn btn-danger btn-small">🗑️ Delete</button>
                    </td>
                  </tr>
                  <tr>
                    <td>#003</td>
                    <td>
                      <div style="display: flex; align-items: center; gap: 8px;">
                        <span>👤</span>
                        <strong>Pedro Reyes</strong>
                      </div>
                    </td>
                    <td>09198765432</td>
                    <td>Oct 05, 2025</td>
                    <td>
                      <button class="btn btn-secondary btn-small">📋 View</button>
                      <button class="btn btn-secondary btn-small">✏️ Edit</button>
                      <button class="btn btn-danger btn-small">🗑️ Delete</button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <!-- Inventory Section -->
        <section class="section" id="inventory-section">
          <div class="section-header">
            <h2 class="section-title">Inventory Management</h2>
            <p class="section-description">Track and manage dental supplies and equipment</p>
          </div>

          <div class="controls">
            <input type="text" class="search-input" placeholder="🔍 Search inventory items...">
            <button class="btn btn-primary">
              ➕ Add Item
            </button>
          </div>

          <div class="card">
            <div class="table-container">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Item Name</th>
                    <th>Category</th>
                    <th>Quantity</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody id="inventory-table-body">
<?php
$inv = $conn->query("SELECT * FROM inventory ORDER BY id DESC");
if ($inv->num_rows === 0): ?>
  <tr>
    <td colspan="6" style="text-align:center; color:#64748b; font-style:italic;">
      No inventory items found.
    </td>
  </tr>
<?php
else:
  while ($row = $inv->fetch_assoc()):
?>
  <tr data-id="<?php echo $row['id']; ?>">
    <td>#<?php echo $row['id']; ?></td>
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
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </div>
    </main>
  </div>

  <!-- Logout Modal -->
  <div class="modal" id="logout-modal">
    <div class="modal-content">
      <div class="modal-header">
        <div class="modal-icon">🚪</div>
        <h3 class="modal-title">Confirm Logout</h3>
        <p class="modal-text">Are you sure you want to logout?</p>
      </div>
      <div class="modal-actions">
        <button class="btn btn-secondary" id="cancel-logout">Cancel</button>
        <button class="btn btn-danger" id="confirm-logout">Logout</button>
      </div>
    </div>
  </div>

  <!-- Add Inventory Modal -->
  <div class="modal" id="add-inventory-modal">
    <div class="modal-content">
      <div class="modal-header">
        <div class="modal-icon">📦</div>
        <h3 class="modal-title">Add Inventory Item</h3>
        <p class="modal-text">Fill out the details below to add a new item.</p>
      </div>
      <form id="add-inventory-form">
        <div class="form-group">
          <label class="form-label">Item Name</label>
          <input type="text" class="form-input" name="item_name" required>
        </div>
        <div class="form-group">
          <label class="form-label">Category</label>
          <input type="text" class="form-input" name="category" required>
        </div>
        <div class="form-group">
          <label class="form-label">Quantity</label>
          <input type="number" class="form-input" name="quantity" min="1" required>
        </div>
        <div class="form-group">
          <label class="form-label">Status</label>
          <select class="form-input" name="status" required>
            <option value="">Select status</option>
            <option value="Available">Available</option>
            <option value="Low Stock">Low Stock</option>
            <option value="Out of Stock">Out of Stock</option>
          </select>
        </div>
        <div class="modal-actions">
          <button type="button" class="btn btn-secondary" id="cancel-add-inventory">Cancel</button>
          <button type="submit" class="btn btn-primary" id="inventory-submit-btn">Add Item</button>
        </div>
      </form>
    </div>
  </div>

  <!-- Delete Inventory Modal -->
  <div class="modal" id="delete-inventory-modal">
    <div class="modal-content">
      <div class="modal-header">
        <div class="modal-icon">🗑️</div>
        <h3 class="modal-title">Delete Item</h3>
        <p class="modal-text">Are you sure you want to delete this inventory item? This action cannot be undone.</p>
      </div>
      <div class="modal-actions">
        <button class="btn btn-secondary" id="cancel-delete-inventory">Cancel</button>
        <button class="btn btn-danger" id="confirm-delete-inventory">Delete</button>
      </div>
    </div>
  </div>

  <!-- Save Settings Confirmation Modal -->
  <div class="modal" id="save-settings-modal">
    <div class="modal-content">
      <div class="modal-header">
        <div class="modal-icon">💾</div>
        <h3 class="modal-title">Save Changes</h3>
        <p class="modal-text">Are you sure you want to update your account settings?</p>
      </div>
      <div class="modal-actions">
        <button class="btn btn-secondary" id="cancel-save-settings">Cancel</button>
        <button class="btn btn-primary" id="confirm-save-settings">Save Changes</button>
      </div>
    </div>
  </div>

  <!-- Notification -->
  <div class="notification" id="notification">
    <span id="notification-icon">✓</span>
    <span id="notification-text">Success!</span>
  </div>

  <script src="dashboard.js"></script>
</body>
</html>