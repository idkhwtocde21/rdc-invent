<?php
session_start();
include("db.php");

// Redirect if not logged in or not admin
if (!isset($_SESSION['user_id']) || $_SESSION['role'] != 2) {
    header("Location: index.php");
    exit;
}

// Fetch admin details
$user_id = $_SESSION['user_id'];
$stmt = $conn->prepare("SELECT username, email FROM users WHERE id=? LIMIT 1");
$stmt->bind_param("i", $user_id);
$stmt->execute();
$stmt->bind_result($username, $email);
$stmt->fetch();
$stmt->close();

// Get statistics
$total_patients = $conn->query("SELECT COUNT(*) as count FROM patients")->fetch_assoc()['count'];
$total_inventory = $conn->query("SELECT COUNT(*) as count FROM inventory")->fetch_assoc()['count'];
$total_staff = $conn->query("SELECT COUNT(*) as count FROM users WHERE role = 1")->fetch_assoc()['count'];
$total_admins = $conn->query("SELECT COUNT(*) as count FROM users WHERE role = 2")->fetch_assoc()['count'];
$low_stock = $conn->query("SELECT COUNT(*) as count FROM inventory WHERE status = 'Low Stock' OR status = 'Out of Stock'")->fetch_assoc()['count'];
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Admin Dashboard - Romero's Dental Clinic</title>
  <link rel="stylesheet" href="admin_dashboard.css">
  <link rel="icon" type="image" href="logos/rom_logo.png">
</head>
<body>
  <div class="admin-dashboard">
    <!-- Sidebar -->
    <aside class="sidebar">
      <div class="sidebar-header">
        <div class="sidebar-logo">
          <img src="logos/rom_logo.png" alt="Logo" class="logo-img">
        </div>
        <h2 class="sidebar-title">Admin Panel</h2>
        <p class="sidebar-subtitle">Romero's Dental Clinic</p>
      </div>

      <nav class="sidebar-nav">
        <ul>
          <li class="nav-item">
            <a href="#" class="nav-link active" data-section="overview">
              <span class="nav-icon">📊</span>
              <span>Overview</span>
            </a>
          </li>
          <li class="nav-item">
            <a href="#" class="nav-link" data-section="users">
              <span class="nav-icon">👥</span>
              <span>Users Management</span>
            </a>
          </li>
          <li class="nav-item">
            <a href="#" class="nav-link" data-section="patients">
              <span class="nav-icon">🏥</span>
              <span>All Patients</span>
            </a>
          </li>
          <li class="nav-item">
            <a href="#" class="nav-link" data-section="inventory">
              <span class="nav-icon">📦</span>
              <span>Inventory</span>
            </a>
          </li>
          <li class="nav-item">
            <a href="#" class="nav-link" data-section="settings">
              <span class="nav-icon">⚙️</span>
              <span>Settings</span>
            </a>
          </li>
        </ul>
      </nav>

      <div class="sidebar-footer">
        <button class="logout-btn" id="logout-btn">
          <span>🚪</span>
          <span>Logout</span>
        </button>
      </div>
    </aside>

    <!-- Main Content -->
    <main class="main-content">
      <!-- Top Bar -->
      <header class="topbar">
        <h1 class="topbar-title">Admin Dashboard</h1>
        <div class="topbar-user">
          <div class="user-avatar"><?php echo strtoupper(substr($username, 0, 2)); ?></div>
          <span><?php echo htmlspecialchars($username); ?></span>
          <span class="admin-badge">Admin</span>
        </div>
      </header>

      <!-- Content Area -->
      <div class="content">
        <!-- Overview Section -->
        <section id="overview-section" class="section active">
          <div class="section-header">
            <h2 class="section-title">Dashboard Overview</h2>
            <p class="section-description">Quick statistics and system overview</p>
          </div>

          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-icon">👨‍💼</div>
              <div class="stat-info">
                <h3 class="stat-number"><?php echo $total_staff; ?></h3>
                <p class="stat-label">Staff Members</p>
              </div>
            </div>

            <div class="stat-card">
              <div class="stat-icon">👑</div>
              <div class="stat-info">
                <h3 class="stat-number"><?php echo $total_admins; ?></h3>
                <p class="stat-label">Administrators</p>
              </div>
            </div>

            <div class="stat-card">
              <div class="stat-icon">🏥</div>
              <div class="stat-info">
                <h3 class="stat-number"><?php echo $total_patients; ?></h3>
                <p class="stat-label">Total Patients</p>
              </div>
            </div>

            <div class="stat-card alert">
              <div class="stat-icon">⚠️</div>
              <div class="stat-info">
                <h3 class="stat-number"><?php echo $low_stock; ?></h3>
                <p class="stat-label">Low Stock Items</p>
              </div>
            </div>
          </div>

          <!-- Recent Activity -->
          <div class="card">
            <h3 class="card-title">Recent Activity</h3>
            <div class="activity-list">
              <?php
              $recent_patients = $conn->query("SELECT patient_name, created_at FROM patients ORDER BY created_at DESC LIMIT 5");
              while ($row = $recent_patients->fetch_assoc()): 
              ?>
              <div class="activity-item">
                <span class="activity-icon">➕</span>
                <span class="activity-text">New patient: <strong><?php echo htmlspecialchars($row['patient_name']); ?></strong></span>
                <span class="activity-time"><?php echo date('M d, Y', strtotime($row['created_at'])); ?></span>
              </div>
              <?php endwhile; ?>
            </div>
          </div>
        </section>

        <!-- Users Management Section -->
        <section id="users-section" class="section">
          <div class="section-header">
            <div>
              <h2 class="section-title">Users Management</h2>
            </div>
            <div style="display: flex; gap: 12px; align-items: center;">
              <input type="text" class="search-input" id="users-search" placeholder="Search users...">
              <button class="btn-primary" id="add-user-btn">+ Add User</button>
            </div>
          </div>

          <!-- Filter Tabs -->
          <div class="filter-tabs">
            <button class="filter-tab active" data-filter="all">
              <span>All Users</span>
              <span class="tab-count"><?php echo $total_staff + $total_admins; ?></span>
            </button>
            <button class="filter-tab" data-filter="staff">
              <span>👨‍💼 Staff</span>
              <span class="tab-count"><?php echo $total_staff; ?></span>
            </button>
            <button class="filter-tab" data-filter="admin">
              <span>👑 Admins</span>
              <span class="tab-count"><?php echo $total_admins; ?></span>
            </button>
          </div>

          <div class="card">
            <div class="table-container">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>Username</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Joined</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody id="users-table-body">
                  <?php
                  $users = $conn->query("SELECT id, username, email, role, created_at FROM users ORDER BY created_at DESC");
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
                        <button class="btn-icon view-admin-info" title="View">👁️</button>
                      <?php elseif ($row['role'] == 2): ?>
                        <!-- Other admin -->
                        <button class="btn-icon view-other-admin" title="View">👁️</button>
                      <?php else: ?>
                        <!-- Staff members -->
                        <button class="btn-icon edit-user" title="Edit">✏️</button>
                        <button class="btn-icon delete-user" title="Delete">🗑️</button>
                      <?php endif; ?>
                    </td>
                  </tr>
                  <?php endwhile; ?>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <!-- Patients Section (View Only) -->
        <section id="patients-section" class="section">
          <div class="section-header">
            <h2 class="section-title">All Patients</h2>
            <input type="text" class="search-input" placeholder="Search patients...">
          </div>

          <div class="card">
            <div class="table-container">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>Patient Name</th>
                    <th>Contact</th>
                    <th>Last Visit</th>
                  </tr>
                </thead>
                <tbody>
                  <?php
                  $patients = $conn->query("SELECT patient_name, contact, last_visit FROM patients ORDER BY id DESC");
                  while ($row = $patients->fetch_assoc()):
                  ?>
                  <tr>
                    <td><strong><?php echo htmlspecialchars($row['patient_name']); ?></strong></td>
                    <td><?php echo htmlspecialchars($row['contact']); ?></td>
                    <td><?php echo $row['last_visit'] ? date('M d, Y g:i A', strtotime($row['last_visit'])) : 'No visit yet'; ?></td>
                  </tr>
                  <?php endwhile; ?>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <!-- Inventory Section (View Only) -->
        <section id="inventory-section" class="section">
          <div class="section-header">
            <h2 class="section-title">Inventory Overview</h2>
            <input type="text" class="search-input" placeholder="Search items...">
          </div>

          <div class="card">
            <div class="table-container">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>Item Name</th>
                    <th>Category</th>
                    <th>Quantity</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  <?php
                  $inventory = $conn->query("SELECT item_name, category, quantity, status FROM inventory ORDER BY id DESC");
                  while ($row = $inventory->fetch_assoc()):
                  ?>
                  <tr>
                    <td><strong><?php echo htmlspecialchars($row['item_name']); ?></strong></td>
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
                  </tr>
                  <?php endwhile; ?>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <!-- Settings Section -->
        <section id="settings-section" class="section">
          <div class="section-header">
            <h2 class="section-title">Admin Settings</h2>
            <p class="section-description">Manage your admin account</p>
          </div>

          <div class="card">
            <form id="admin-settings-form">
              <div class="form-group">
                <label class="form-label">Username</label>
                <input type="text" class="form-input" name="username" value="<?php echo htmlspecialchars($username); ?>" required>
              </div>

              <div class="form-group">
                <label class="form-label">Email</label>
                <input type="email" class="form-input" name="email" value="<?php echo htmlspecialchars($email); ?>" required>
              </div>

              <div class="form-group">
                <label class="form-label">
                  New Password 
                  <span class="form-small">(leave blank to keep current)</span>
                </label>
                <div style="position: relative;">
                  <input type="password" class="form-input" placeholder="Enter new password" name="password" id="admin-password">
                  <button type="button" class="password-toggle" id="toggle-admin-password" aria-label="Toggle password visibility">
                    <span class="eye-icon">👁️</span>
                  </button>
                </div>
              </div>

              <button type="submit" class="btn-primary">Save Changes</button>
            </form>
          </div>
        </section>
      </div>
    </main>
  </div>

  <!-- Add User Modal -->
  <div class="modal" id="add-user-modal">
    <div class="modal-content">
      <h2 class="modal-title">Add New User</h2>
      <form id="add-user-form">
        <div class="form-group">
          <label class="form-label">Username</label>
          <input type="text" class="form-input" name="username" required>
        </div>

        <div class="form-group">
          <label class="form-label">Email</label>
          <input type="email" class="form-input" name="email" required>
        </div>

        <div class="form-group">
          <label class="form-label">Password</label>
          <input type="password" class="form-input" name="password" required>
        </div>

        <div class="form-group">
          <label class="form-label">Role</label>
          <select class="form-input" name="role" required>
            <option value="1">Staff</option>
            <option value="2">Admin</option>
          </select>
        </div>

        <div class="modal-actions">
          <button type="button" class="btn-secondary" id="cancel-add-user">Cancel</button>
          <button type="submit" class="btn-primary">Add User</button>
        </div>
      </form>
    </div>
  </div>

  <!-- Logout Modal -->
  <div class="modal" id="logout-modal">
    <div class="modal-content">
      <h2 class="modal-title">Confirm Logout</h2>
      <p>Are you sure you want to logout?</p>
      <div class="modal-actions">
        <button class="btn-secondary" id="cancel-logout">Cancel</button>
        <button class="btn-primary" id="confirm-logout">Logout</button>
      </div>
    </div>
  </div>

  <!-- Delete User Modal -->
  <div class="modal" id="delete-user-modal">
    <div class="modal-content">
      <h2 class="modal-title">Delete User</h2>
      <p>Are you sure you want to delete this user? This action cannot be undone.</p>
      <div class="modal-actions">
        <button class="btn-secondary" id="cancel-delete-user">Cancel</button>
        <button class="btn-danger" id="confirm-delete-user">Delete</button>
      </div>
    </div>
  </div>

  <!-- View Admin Info Modal -->
  <div class="modal" id="view-admin-modal">
    <div class="modal-content">
      <h2 class="modal-title">Your Account Information</h2>
      <div style="margin: 20px 0;">
        <div class="info-group">
          <label class="info-label">Username</label>
          <p class="info-value" id="view-admin-username"></p>
        </div>
        <div class="info-group">
          <label class="info-label">Email</label>
          <p class="info-value" id="view-admin-email"></p>
        </div>
        <div class="info-group">
          <label class="info-label">Role</label>
          <p class="info-value"><span class="badge badge-admin">Admin</span></p>
        </div>
        <div class="info-group">
          <label class="info-label">Joined</label>
          <p class="info-value" id="view-admin-joined"></p>
        </div>
      </div>
      <div class="modal-actions">
        <button class="btn-secondary" id="close-view-admin">Close</button>
        <button class="btn-primary" id="goto-settings">Edit in Settings</button>
      </div>
    </div>
  </div>

  <!-- Restricted Admin View Modal -->
  <div class="modal" id="restricted-admin-modal">
    <div class="modal-content">
      <h2 class="modal-title">⚠️ Access Restricted</h2>
      <div style="margin: 30px 0; text-align: center;">
        <div style="font-size: 60px; margin-bottom: 20px;">🔒</div>
        <p style="font-size: 16px; color: #64748b; margin-bottom: 10px;">
          You cannot view other administrators' information.
        </p>
        <p style="font-size: 14px; color: #94a3b8;">
          Only the account owner can view their own credentials.
        </p>
      </div>
      <div class="modal-actions">
        <button class="btn-primary" id="close-restricted-admin" style="width: 100%;">Understood</button>
      </div>
    </div>
  </div>

  <!-- Notification -->
  <div class="notification" id="notification">
    <span class="notification-icon" id="notification-icon">✓</span>
    <span class="notification-text" id="notification-text">Success!</span>
  </div>

  <script src="admin_dashboard.js"></script>
</body>
</html>