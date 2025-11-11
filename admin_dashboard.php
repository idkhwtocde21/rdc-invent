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
$full_name = '';
$username = '';
$email = '';
$stmt = $conn->prepare("SELECT full_name, username, email FROM users WHERE id=? LIMIT 1");
$stmt->bind_param("i", $user_id);
$stmt->execute();
$stmt->bind_result($full_name, $username, $email);
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
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
  <link rel="stylesheet" href="admin_dashboard.css">
  <link rel="icon" type="image" href="logos/rom_logo.png">
  
  <!-- SweetAlert2 -->
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/sweetalert2@11/dist/sweetalert2.min.css">
  <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
</head>
<body>
  <!-- Loading Screen -->
  <div class="loading-screen" id="loading-screen">
    <div class="loading-content">
      <div class="loading-spinner"></div>
      <p class="loading-text">Logging out...</p>
    </div>
  </div>

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
              <span class="nav-icon"><i class="fas fa-chart-line"></i></span>
              <span>Overview</span>
            </a>
          </li>
          <li class="nav-item">
            <a href="#" class="nav-link" data-section="users">
              <span class="nav-icon"><i class="fas fa-users"></i></span>
              <span>Users Management</span>
            </a>
          </li>
          <li class="nav-item">
            <a href="#" class="nav-link" data-section="patients">
              <span class="nav-icon"><i class="fas fa-user-injured"></i></span>
              <span>All Patients</span>
            </a>
          </li>
          <li class="nav-item">
            <a href="#" class="nav-link" data-section="inventory">
              <span class="nav-icon"><i class="fas fa-box"></i></span>
              <span>Inventory</span>
            </a>
          </li>
          <li class="nav-item">
            <a href="#" class="nav-link" data-section="archive">
              <span class="nav-icon"><i class="fas fa-archive"></i></span>
              <span>Archive</span>
            </a>
          </li>
          <li class="nav-item">
            <a href="#" class="nav-link" data-section="settings">
              <span class="nav-icon"><i class="fas fa-cog"></i></span>
              <span>Settings</span>
            </a>
          </li>
        </ul>
      </nav>

      <div class="sidebar-footer">
      </div>
    </aside>

    <!-- Main Content -->
    <main class="main-content">
      <!-- Top Bar -->
      <header class="topbar">
        <h1 class="topbar-title">Admin Dashboard</h1>
        <div class="topbar-user" id="user-menu-toggle">
          <div class="user-avatar"><?php echo strtoupper(substr($username, 0, 2)); ?></div>
          <span><?php echo htmlspecialchars($username); ?></span>
          
          <!-- Dropdown Menu -->
          <div class="user-dropdown">
            <div class="user-dropdown-header">
              <div class="user-dropdown-name"><?php echo htmlspecialchars($username); ?></div>
              <div class="user-dropdown-email"><?php echo htmlspecialchars($email); ?></div>
            </div>
            <div class="user-dropdown-menu">
              <button class="user-dropdown-item logout" id="logout-btn">
                <i class="fas fa-sign-out-alt dropdown-icon"></i>
                <span>Logout</span>
              </button>
            </div>
          </div>
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
              <div class="stat-icon"><i class="fas fa-user-tie"></i></div>
              <div class="stat-info">
                <h3 class="stat-number"><?php echo $total_staff; ?></h3>
                <p class="stat-label">Staff Members</p>
              </div>
            </div>

            <div class="stat-card">
              <div class="stat-icon"><i class="fas fa-user-shield"></i></div>
              <div class="stat-info">
                <h3 class="stat-number"><?php echo $total_admins; ?></h3>
                <p class="stat-label">Administrators</p>
              </div>
            </div>

            <div class="stat-card">
              <div class="stat-icon"><i class="fas fa-procedures"></i></div>
              <div class="stat-info">
                <h3 class="stat-number"><?php echo $total_patients; ?></h3>
                <p class="stat-label">Total Patients</p>
              </div>
            </div>

            <div class="stat-card alert">
              <div class="stat-icon"><i class="fas fa-exclamation-triangle"></i></div>
              <div class="stat-info">
                <h3 class="stat-number"><?php echo $low_stock; ?></h3>
                <p class="stat-label">Low Stock Items</p>
              </div>
            </div>
          </div>

          <!-- Recent Patients -->
          <div class="card">
            <h3 class="card-title">Recent Visits</h3>
            <div class="activity-list" id="recent-visits-list">
              <?php
              $recent_patients = $conn->query("SELECT patient_name, last_visit FROM patients WHERE last_visit IS NOT NULL ORDER BY last_visit DESC LIMIT 5");
              while ($row = $recent_patients->fetch_assoc()): 
              ?>
              <div class="activity-item">
                <span class="activity-icon"><i class="fas fa-user-clock"></i></span>
                <span class="activity-text"><strong><?php echo htmlspecialchars($row['patient_name']); ?></strong></span>
                <span class="activity-time"><?php echo date('M d, Y g:i A', strtotime($row['last_visit'])); ?></span>
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
              <span><i class="fas fa-user-tie"></i> Staff</span>
              <span class="tab-count"><?php echo $total_staff; ?></span>
            </button>
            <button class="filter-tab" data-filter="admin">
              <span><i class="fas fa-user-shield"></i> Admins</span>
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
                    <th>Status</th>
                    <th>Joined</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody id="users-table-body">
                  <?php
                  $users = $conn->query("SELECT id, full_name, username, email, role, is_active, created_at FROM users ORDER BY created_at DESC");
                  while ($row = $users->fetch_assoc()):
                  ?>
                  <tr data-id="<?php echo $row['id']; ?>" 
                      data-fullname="<?php echo htmlspecialchars($row['full_name']); ?>"
                      data-username="<?php echo htmlspecialchars($row['username']); ?>"
                      data-email="<?php echo htmlspecialchars($row['email']); ?>"
                      data-role="<?php echo $row['role']; ?>"
                      data-active="<?php echo $row['is_active']; ?>"
                      data-joined="<?php echo date('M d, Y', strtotime($row['created_at'])); ?>">
                    <td><strong><?php echo htmlspecialchars($row['username']); ?></strong></td>
                    <td><?php echo htmlspecialchars($row['email']); ?></td>
                    <td>
                      <span class="badge <?php echo $row['role'] == 2 ? 'badge-admin' : 'badge-staff'; ?>">
                        <?php echo $row['role'] == 2 ? 'Admin' : 'Staff'; ?>
                      </span>
                    </td>
                    <td>
                      <span class="badge <?php echo $row['is_active'] == 1 ? 'badge-success' : 'badge-danger'; ?>">
                        <?php echo $row['is_active'] == 1 ? 'Active' : 'Disabled'; ?>
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
                        <button class="btn-icon view-staff-info" title="View"><i class="fas fa-eye"></i></button>
                        <?php if ($row['is_active'] == 1): ?>
                          <button class="btn-icon disable-user" title="Disable Account"><i class="fas fa-ban"></i></button>
                        <?php else: ?>
                          <button class="btn-icon enable-user" title="Enable Account"><i class="fas fa-check-circle"></i></button>
                        <?php endif; ?>
                        <button class="btn-icon delete-user" title="Delete"><i class="fas fa-trash"></i></button>
                      <?php endif; ?>
                    </td>
                  </tr>
                  <?php endwhile; ?>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <!-- Patients Section (Full CRUD) -->
        <section id="patients-section" class="section">
          <div class="section-header">
            <h2 class="section-title">All Patients</h2>
            <div style="display: flex; gap: 10px; align-items: center;">
              <input type="text" class="search-input" placeholder="Search patients...">
              <button class="btn btn-primary" id="open-add-patient-modal">
                <i class="fas fa-user-plus"></i> Add Patient
              </button>
            </div>
          </div>

          <div class="card">
            <div class="table-container">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>Patient Name</th>
                    <th>Contact</th>
                    <th>Email</th>
                    <th>Last Visit</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody id="admin-patients-table-body">
                  <?php
                  $patients = $conn->query("SELECT id, patient_name, contact, email, last_visit FROM patients ORDER BY id DESC");
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
                  <?php endwhile; ?>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <!-- Inventory Section (Full CRUD) -->
        <section id="inventory-section" class="section">
          <div class="section-header">
            <h2 class="section-title">Inventory Management</h2>
            <div style="display: flex; gap: 10px; align-items: center;">
              <input type="text" class="search-input" placeholder="Search items...">
              <button class="btn btn-primary" id="open-add-inventory-modal-admin">
                <i class="fas fa-box-open"></i> Add Item
              </button>
            </div>
          </div>

          <div class="card">
            <div class="table-container">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>Item Name</th>
                    <th>Category</th>
                    <th>Pieces</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody id="admin-inventory-table-body">
                  <?php
                  $inventory = $conn->query("SELECT id, item_name, category, quantity, status FROM inventory ORDER BY id DESC");
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
                  <?php endwhile; ?>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <!-- Settings Section -->
        <!-- Archive Section -->
        <section id="archive-section" class="section">
          <div class="section-header">
            <h2 class="section-title">Archived Patient Records</h2>
            <p class="section-description">View archived patient records</p>
          </div>

          <div class="card">
            <div class="table-container">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>Patient Name</th>
                    <th>Contact</th>
                    <th>Archived Date</th>
                    <th>Archived By</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody id="archive-table-body">
                  <?php
                  $archives = $conn->query("SELECT * FROM archived_patients ORDER BY archived_at DESC");
                  while ($row = $archives->fetch_assoc()):
                  ?>
                  <tr data-id="<?php echo $row['id']; ?>">
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
                    <i class="fas fa-eye eye-icon"></i>
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
      <form id="add-user-form" novalidate>
        <div class="form-group">
          <label class="form-label">Full Name</label>
          <input type="text" class="form-input" name="full_name" required>
        </div>

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
      <div class="modal-header">
        <div class="modal-icon"><i class="fas fa-sign-out-alt"></i></div>
        <h3 class="modal-title">Confirm Logout</h3>
        <p class="modal-text">Are you sure you want to logout?</p>
      </div>
      <div class="modal-actions">
        <button class="btn btn-secondary" id="cancel-logout">Cancel</button>
        <button class="btn btn-danger" id="confirm-logout">Logout</button>
      </div>
    </div>
  </div>

  <!-- Delete User Modal -->
  <!-- Delete User Modal -->
  <div class="modal" id="delete-user-modal">
    <div class="modal-content">
      <div class="modal-header">
        <div class="modal-icon"><i class="fas fa-trash-alt"></i></div>
        <h3 class="modal-title">Delete User</h3>
        <p class="modal-text">Are you sure you want to delete this user? This action cannot be undone.</p>
      </div>
      <div class="modal-actions">
        <button class="btn btn-secondary" id="cancel-delete-user">Cancel</button>
        <button class="btn btn-danger" id="confirm-delete-user">Delete</button>
      </div>
    </div>
  </div>

  <!-- View Admin Info Modal -->
  <div class="modal" id="view-admin-modal">
    <div class="modal-content">
      <h2 class="modal-title" id="view-admin-modal-title">Admin Account Information</h2>
      <div style="margin: 20px 0;">
        <div class="info-group">
          <label class="info-label">Full Name</label>
          <p class="info-value" id="view-admin-fullname"></p>
        </div>
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
        <button class="btn-secondary" id="close-view-admin" style="width: 100%;">Close</button>
      </div>
    </div>
  </div>

  <!-- Restricted Admin View Modal -->
  <div class="modal" id="restricted-admin-modal">
    <div class="modal-content">
      <h2 class="modal-title"><i class="fas fa-exclamation-triangle" style="color: #f59e0b;"></i> Access Restricted</h2>
      <div style="margin: 30px 0; text-align: center;">
        <div style="font-size: 60px; margin-bottom: 20px;"><i class="fas fa-lock" style="color: #94a3b8;"></i></div>
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

  <!-- View Staff Info Modal -->
  <div class="modal" id="view-staff-modal">
    <div class="modal-content">
      <h2 class="modal-title" id="view-staff-modal-title">Staff's Account Information</h2>
      <div style="margin: 20px 0;">
        <div class="info-group">
          <label class="info-label">Full Name</label>
          <p class="info-value" id="view-staff-fullname"></p>
        </div>
        <div class="info-group">
          <label class="info-label">Username</label>
          <p class="info-value" id="view-staff-username"></p>
        </div>
        <div class="info-group">
          <label class="info-label">Email</label>
          <p class="info-value" id="view-staff-email"></p>
        </div>
        <div class="info-group">
          <label class="info-label">Role</label>
          <p class="info-value"><span class="badge badge-staff">Staff</span></p>
        </div>
        <div class="info-group">
          <label class="info-label">Joined</label>
          <p class="info-value" id="view-staff-joined"></p>
        </div>
      </div>
      <div class="modal-actions">
        <button class="btn-secondary" id="close-view-staff" style="width: 100%;">Close</button>
      </div>
    </div>
  </div>

  <!-- Add/Edit Patient Modal (Admin) -->
  <div class="modal" id="admin-patient-modal">
    <div class="modal-content" style="max-width: 800px;">
      <div class="modal-header">
        <div class="patient-image-container" id="admin-edit-patient-image-container">
          <i class="fas fa-user" style="font-size: 48px; color: #94a3b8;"></i>
        </div>
        <h3 class="modal-title" id="admin-patient-modal-title">Add Patient</h3>
        <p class="modal-text" id="admin-patient-modal-text">Fill out the patient details below.</p>
      </div>
      <form id="admin-patient-form" enctype="multipart/form-data" novalidate>
        <div class="form-group">
          <label class="form-label">Patient Image</label>
          <div class="image-upload-wrapper">
            <input type="file" class="form-input" id="admin-patient-image-input" name="patient_image" accept="image/*">
            <small class="form-hint">Accepted formats: JPG, PNG, GIF (Max: 5MB)</small>
          </div>
        </div>
        <div class="form-row" style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
          <div class="form-group">
            <label class="form-label">Patient Name *</label>
            <input type="text" class="form-input" name="patient_name" required>
          </div>
          <div class="form-group">
            <label class="form-label">Contact *</label>
            <input type="text" class="form-input" name="contact" required>
          </div>
        </div>
        <div class="form-row" style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
          <div class="form-group">
            <label class="form-label">Email</label>
            <input type="email" class="form-input" name="email">
          </div>
          <div class="form-group">
            <label class="form-label">Address</label>
            <input type="text" class="form-input" name="address">
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">Last Visit Date & Time</label>
          <input type="datetime-local" class="form-input" name="last_visit">
        </div>
        <div class="form-group">
          <label class="form-label">Medical History</label>
          <textarea class="form-input" name="medical_history" rows="3"></textarea>
        </div>
        <div class="form-group">
          <label class="form-label">Clinical Findings</label>
          <textarea class="form-input" name="clinical_findings" rows="3"></textarea>
        </div>
        <div class="form-group">
          <label class="form-label">Diagnostic Tests</label>
          <textarea class="form-input" name="diagnostic_tests" rows="3"></textarea>
        </div>
        <div class="form-group">
          <label class="form-label">Diagnosis</label>
          <textarea class="form-input" name="diagnosis" rows="3"></textarea>
        </div>
        <div class="form-group">
          <label class="form-label">Conclusion</label>
          <textarea class="form-input" name="conclusion" rows="3"></textarea>
        </div>
        <div class="modal-actions">
          <button type="button" class="btn btn-secondary" id="cancel-admin-patient">Cancel</button>
          <button type="submit" class="btn btn-primary" id="admin-patient-submit-btn">Add Patient</button>
        </div>
      </form>
    </div>
  </div>

  <!-- View Patient Modal (Admin) -->
  <div class="modal" id="admin-view-patient-modal">
    <div class="modal-content" style="max-width: 800px;">
      <div class="modal-header">
        <div class="patient-image-container" id="admin-patient-image-container">
          <i class="fas fa-user" style="font-size: 48px; color: #94a3b8;"></i>
        </div>
        <h3 class="modal-title">Patient Information</h3>
      </div>
      <div class="patient-details" id="admin-patient-details">
        <!-- Patient details will be loaded here -->
      </div>
      <div class="modal-actions">
        <button class="btn btn-secondary" id="close-admin-view-patient" style="width: 100%;">Close</button>
      </div>
    </div>
  </div>

  <!-- Delete Patient Modal (Admin) -->
  <div class="modal" id="admin-delete-patient-modal">
    <div class="modal-content">
      <div class="modal-header">
        <div class="modal-icon"><i class="fas fa-trash-alt"></i></div>
        <h3 class="modal-title">Delete Patient</h3>
        <p class="modal-text">Are you sure you want to delete this patient? This action cannot be undone.</p>
      </div>
      <div class="modal-actions">
        <button class="btn btn-secondary" id="cancel-delete-patient-admin">Cancel</button>
        <button class="btn btn-danger" id="confirm-delete-patient-admin">Delete</button>
      </div>
    </div>
  </div>

  <!-- Add/Edit Inventory Modal (Admin) -->
  <div class="modal" id="admin-inventory-modal">
    <div class="modal-content">
      <div class="modal-header">
        <div class="modal-icon">📦</div>
        <h3 class="modal-title" id="admin-inventory-modal-title">Add Inventory Item</h3>
        <p class="modal-text" id="admin-inventory-modal-text">Fill out the details below to add a new item.</p>
      </div>
      <form id="admin-inventory-form" novalidate>
        <div class="form-group">
          <label class="form-label">Item Name</label>
          <input type="text" class="form-input" name="item_name" required>
        </div>
        <div class="form-group">
          <label class="form-label">Category</label>
          <select class="form-input" name="category" required>
            <option value="">Select category</option>
            <option value="Medicine">Medicine</option>
            <option value="Tool">Tool</option>
            <option value="Equipment">Equipment</option>
            <option value="Supplies">Supplies</option>
            <option value="Consumables">Consumables</option>
            <option value="Other">Other</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Pieces</label>
          <input type="number" class="form-input" name="quantity" required>
        </div>
        <div class="form-group" id="admin-status-field-group" style="display: none;">
          <label class="form-label">Status</label>
          <select class="form-input" name="status">
            <option value="">Select status</option>
            <option value="Available">Available</option>
            <option value="Low Stock">Low Stock</option>
            <option value="Out of Stock">Out of Stock</option>
          </select>
        </div>
        <div class="modal-actions">
          <button type="button" class="btn btn-secondary" id="cancel-admin-inventory">Cancel</button>
          <button type="submit" class="btn btn-primary" id="admin-inventory-submit-btn">Add Item</button>
        </div>
      </form>
    </div>
  </div>

  <!-- Delete Inventory Modal (Admin) -->
  <div class="modal" id="admin-delete-inventory-modal">
    <div class="modal-content">
      <div class="modal-header">
        <div class="modal-icon"><i class="fas fa-trash-alt"></i></div>
        <h3 class="modal-title">Delete Item</h3>
        <p class="modal-text">Are you sure you want to delete this inventory item? This action cannot be undone.</p>
      </div>
      <div class="modal-actions">
        <button class="btn btn-secondary" id="cancel-delete-inventory-admin">Cancel</button>
        <button class="btn btn-danger" id="confirm-delete-inventory-admin">Delete</button>
      </div>
    </div>
  </div>

  <!-- View Archive Modal -->
  <div class="modal" id="view-archive-modal">
    <div class="modal-content" style="max-width: 800px;">
      <div class="modal-header">
        <div class="patient-image-container" id="archive-patient-image-container">
          <i class="fas fa-user" style="font-size: 48px; color: #94a3b8;"></i>
        </div>
        <h3 class="modal-title">Archived Patient Information</h3>
      </div>
      <div id="archive-patient-details" class="patient-details"></div>
      <div class="modal-actions">
        <button class="btn btn-secondary" id="close-archive-view">Close</button>
      </div>
    </div>
  </div>

  <!-- Restore Archive Confirmation Modal -->
  <div class="modal" id="restore-archive-modal">
    <div class="modal-content">
      <div class="modal-header">
        <div class="modal-icon"><i class="fas fa-undo" style="color: #10b981;"></i></div>
        <h3 class="modal-title">Restore Patient Record</h3>
        <p class="modal-text">Are you sure you want to restore this patient record? It will be moved back to the active patients list.</p>
      </div>
      <div class="modal-actions">
        <button class="btn btn-secondary" id="cancel-restore-archive">Cancel</button>
        <button class="btn btn-primary" id="confirm-restore-archive">Restore</button>
      </div>
    </div>
  </div>

  <!-- Delete Archive Permanently Modal -->
  <div class="modal" id="delete-archive-modal">
    <div class="modal-content">
      <div class="modal-header">
        <div class="modal-icon"><i class="fas fa-trash-alt"></i></div>
        <h3 class="modal-title">Delete Permanently</h3>
        <p class="modal-text">Are you sure you want to permanently delete this archived record? This action CANNOT be undone!</p>
      </div>
      <div class="modal-actions">
        <button class="btn btn-secondary" id="cancel-delete-archive">Cancel</button>
        <button class="btn btn-danger" id="confirm-delete-archive">Delete Permanently</button>
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