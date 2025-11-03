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
  <link rel="icon" type="image" href="logos/rom_logo.png">
  <!-- Add jsPDF and html2canvas for PDF export -->
  <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"></script>
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
                <div style="position: relative;">
                  <input type="password" class="form-input" placeholder="Enter new password" name="password" id="settings-password">
                  <button type="button" class="password-toggle" id="toggle-settings-password" aria-label="Toggle password visibility">
                    <span class="eye-icon">👁️</span>
                  </button>
                </div>
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
            <input type="text" class="search-input" placeholder="🔍 Search patients by name...">
            <button class="btn btn-primary" id="open-add-patient-modal">
              ➕ Add Patient
            </button>
          </div>

          <div class="card">
            <div class="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Patient Name</th>
                    <th>Contact</th>
                    <th>Last Visit</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody id="patient-table-body">
<?php
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
  >
    <td>
      <div style="display: flex; align-items: center; gap: 8px;">
        <?php if (!empty($row['patient_image'])): ?>
          <img src="<?php echo htmlspecialchars($row['patient_image']); ?>" alt="Patient" style="width: 32px; height: 32px; border-radius: 50%; object-fit: cover;">
        <?php else: ?>
          <span>👤</span>
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
      <button class="btn btn-secondary btn-small view-patient">📋 View</button>
      <button class="btn btn-secondary btn-small edit-patient">✏️ Edit</button>
      <button class="btn btn-danger btn-small delete-patient">🗑️ Delete</button>
    </td>
  </tr>
<?php endwhile; endif; ?>
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
            <button class="btn btn-primary" id="open-add-inventory-modal">
              ➕ Add Item
            </button>
          </div>

          <div class="card">
            <div class="table-container">
              <table>
                <thead>
                  <tr>
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

  <!-- Add Patient Modal -->
  <div class="modal" id="add-patient-modal">
    <div class="modal-content">
      <div class="modal-header">
        <div class="modal-icon">👤</div>
        <h3 class="modal-title">Add Patient</h3>
        <p class="modal-text">Fill out the patient details below.</p>
      </div>
      <form id="add-patient-form" enctype="multipart/form-data">
        <div class="form-group">
          <label class="form-label">Patient Photo (Optional)</label>
          <div style="display: flex; flex-direction: column; gap: 12px;">
            <input type="file" class="form-input" name="patient_image" id="patient-image-input" accept="image/*">
            <div id="image-preview" style="display: none; text-align: center;">
              <img id="preview-img" src="" alt="Preview" style="max-width: 150px; max-height: 150px; border-radius: 12px; object-fit: cover; border: 2px solid #e2e8f0;">
            </div>
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">Full Name</label>
          <input type="text" class="form-input" name="patient_name" required>
        </div>
        <div class="form-group">
          <label class="form-label">Contact Number</label>
          <input type="text" class="form-input" name="contact" required>
        </div>
        <div class="form-group">
          <label class="form-label">Email (Optional)</label>
          <input type="email" class="form-input" name="email">
        </div>
        <div class="form-group">
          <label class="form-label">Address</label>
          <textarea class="form-input" name="address" rows="2"></textarea>
        </div>
        <div class="form-group" id="last-visit-group" style="display: none;">
          <label class="form-label">Last Visit Date & Time</label>
          <input type="datetime-local" class="form-input" name="last_visit">
        </div>
        <div class="modal-actions">
          <button type="button" class="btn btn-secondary" id="cancel-add-patient">Cancel</button>
          <button type="submit" class="btn btn-primary" id="patient-submit-btn">Add Patient</button>
        </div>
      </form>
    </div>
  </div>

  <!-- Delete Patient Modal -->
  <div class="modal" id="delete-patient-modal">
    <div class="modal-content">
      <div class="modal-header">
        <div class="modal-icon">🗑️</div>
        <h3 class="modal-title">Delete Patient</h3>
        <p class="modal-text">Are you sure you want to delete this patient record? This action cannot be undone.</p>
      </div>
      <div class="modal-actions">
        <button class="btn btn-secondary" id="cancel-delete-patient">Cancel</button>
        <button class="btn btn-danger" id="confirm-delete-patient">Delete</button>
      </div>
    </div>
  </div>

  <!-- View Patient Modal -->
  <div class="modal" id="view-patient-modal">
    <div class="modal-content">
      <div class="modal-header">
        <div class="modal-icon">👁️</div>
        <h3 class="modal-title">Patient Details</h3>
        <p class="modal-text">Full details for the selected patient.</p>
      </div>
      <div class="card" id="patient-details-card" style="margin:0; box-shadow:none;">
        <div style="text-align: center; margin-bottom: 16px;" id="view-patient-image-container">
          <img id="view-patient-image" src="" alt="Patient Photo" style="display: none; width: 120px; height: 120px; border-radius: 50%; object-fit: cover; border: 3px solid #667eea; margin: 0 auto;">
          <div id="view-patient-no-image" style="display: none; width: 120px; height: 120px; border-radius: 50%; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); margin: 0 auto; display: flex; align-items: center; justify-content: center; font-size: 48px; color: white;">👤</div>
        </div>
        <div style="margin-bottom:12px;"><strong>Name:</strong> <span id="view-patient-name"></span></div>
        <div style="margin-bottom:12px;"><strong>Contact:</strong> <span id="view-patient-contact"></span></div>
        <div style="margin-bottom:12px;"><strong>Email:</strong> <span id="view-patient-email"></span></div>
        <div style="margin-bottom:12px;"><strong>Address:</strong> <span id="view-patient-address"></span></div>
        <div style="margin-bottom:12px;"><strong>Last Visit:</strong> <span id="view-patient-last-visit"></span></div>
        <div style="margin-bottom:0; color:#64748b;"><small id="view-patient-created"></small></div>
      </div>
      <div class="modal-actions">
        <button class="btn btn-secondary" id="export-patient-pdf">📄 Export PDF</button>
        <button class="btn btn-secondary" id="close-view-patient">Close</button>
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