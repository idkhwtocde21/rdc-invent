// Navigation
console.log('Admin Dashboard JS loaded');
const navLinks = document.querySelectorAll('.nav-link[data-section]');
const sections = document.querySelectorAll('.section');
console.log('Nav links found:', navLinks.length);
console.log('Sections found:', sections.length);

if (navLinks.length > 0 && sections.length > 0) {
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const targetSection = link.dataset.section;
      console.log('Clicked section:', targetSection);

      // Update active nav link
      navLinks.forEach(l => l.classList.remove('active'));
      link.classList.add('active');

      // Show target section
      sections.forEach(section => {
        section.classList.remove('active');
        if (section.id === targetSection + '-section') {
          section.classList.add('active');
        }
      });
      
      if (typeof hideNotification === 'function') {
        hideNotification();
      }
    });
  });
} else {
  console.error('Navigation elements not found!');
}

// User Dropdown Menu Toggle
const userMenuToggle = document.getElementById('user-menu-toggle');
const userDropdown = document.querySelector('.user-dropdown');

if (userMenuToggle) {
  userMenuToggle.addEventListener('click', (e) => {
    e.stopPropagation();
    userMenuToggle.classList.toggle('active');
  });
}

// Close dropdown when clicking outside
document.addEventListener('click', (e) => {
  if (userMenuToggle && !userMenuToggle.contains(e.target)) {
    userMenuToggle.classList.remove('active');
  }
});

// Logout Modal
const logoutBtn = document.getElementById('logout-btn');
const logoutModal = document.getElementById('logout-modal');
const confirmLogout = document.getElementById('confirm-logout');
const cancelLogout = document.getElementById('cancel-logout');

if (logoutBtn) {
  logoutBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    if (userMenuToggle) userMenuToggle.classList.remove('active');
    logoutModal.classList.add('show');
  });
}

if (cancelLogout) {
  cancelLogout.addEventListener('click', () => {
    logoutModal.classList.remove('show');
  });
}

if (confirmLogout) {
  confirmLogout.addEventListener('click', () => {
    logoutModal.classList.remove('show');
    
    // Show loading screen
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) {
      loadingScreen.classList.add('active');
    }
    
    // Redirect after delay
    setTimeout(() => {
      window.location.href = 'logout.php';
    }, 1500);
  });
}

// SweetAlert2 Notification System
function showNotification(message, type = 'success') {
  const Toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    didOpen: (toast) => {
      toast.addEventListener('mouseenter', Swal.stopTimer)
      toast.addEventListener('mouseleave', Swal.resumeTimer)
    }
  });

  Toast.fire({
    icon: type === 'success' ? 'success' : 'error',
    title: message
  });
}

function hideNotification() {
  Swal.close();
}

// Show loading with SweetAlert2
function showLoading(message = 'Processing...') {
  Swal.fire({
    title: message,
    allowOutsideClick: false,
    allowEscapeKey: false,
    didOpen: () => {
      Swal.showLoading();
    }
  });
}

// Store original admin settings data for change detection
let originalAdminSettingsData = {};

// Load original admin settings on page load
window.addEventListener('DOMContentLoaded', () => {
  const adminSettingsForm = document.getElementById('admin-settings-form');
  if (adminSettingsForm) {
    originalAdminSettingsData = {
      username: adminSettingsForm.username.value.trim(),
      email: adminSettingsForm.email.value.trim()
    };
  }
});

// Admin Settings Form Handler
const adminSettingsForm = document.getElementById('admin-settings-form');
if (adminSettingsForm) {
  adminSettingsForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const formData = new FormData(adminSettingsForm);
    
    // Client-side validation
    const username = formData.get('username').trim();
    const email = formData.get('email').trim();
    const password = formData.get('password');
    
    if (!username) {
      showNotification('Username is required.', 'error');
      return;
    }
    
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showNotification('Valid email is required.', 'error');
      return;
    }
    
    if (password && password.length < 6) {
      showNotification('Password must be at least 6 characters.', 'error');
      return;
    }
    
    // Check if any fields changed
    const hasChanges = 
      username !== originalAdminSettingsData.username ||
      email !== originalAdminSettingsData.email ||
      (password && password.trim() !== '');
    
    if (!hasChanges) {
      showNotification('No credentials changed. Please modify at least one field to save.', 'error');
      return;
    }
    
    // Show confirmation dialog before saving
    Swal.fire({
      title: 'Save Changes',
      text: 'Are you sure you want to update your account settings?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#4c6ef5',
      cancelButtonColor: '#94a3b8',
      confirmButtonText: 'Save Changes',
      cancelButtonText: 'Cancel',
      reverseButtons: true
    }).then((result) => {
      if (result.isConfirmed) {
        // User confirmed, proceed with update
        showLoading('Updating settings...');
        
        fetch('admin_update_settings.php', {
          method: 'POST',
          body: formData
        })
        .then(res => res.json())
        .then((data) => {
          Swal.close();
          
          if (data.status === 'success') {
            // Show success message with auto-redirect
            Swal.fire({
              title: 'Settings Updated!',
              html: 'Your settings have been updated successfully.<br>You will be redirected to the login page...',
              icon: 'success',
              timer: 3000,
              timerProgressBar: true,
              showConfirmButton: false,
              allowOutsideClick: false,
              allowEscapeKey: false,
              willClose: () => {
                // Show loading screen
                const loadingScreen = document.getElementById('loading-screen');
                if (loadingScreen) {
                  loadingScreen.classList.add('active');
                }
                
                // Redirect to logout (which will redirect to login)
                setTimeout(() => {
                  window.location.href = 'logout.php';
                }, 500);
              }
            });
          } else {
            showNotification(data.message, 'error');
          }
        })
        .catch(() => {
          Swal.close();
          showNotification('Server error. Please try again.', 'error');
        });
      }
    });
  });
}

// Password visibility toggle
const toggleAdminPassword = document.getElementById('toggle-admin-password');
const adminPasswordInput = document.getElementById('admin-password');

if (toggleAdminPassword && adminPasswordInput) {
  toggleAdminPassword.addEventListener('click', function() {
    const type = adminPasswordInput.getAttribute('type');
    const eyeIcon = toggleAdminPassword.querySelector('.eye-icon');
    
    if (type === 'password') {
      adminPasswordInput.setAttribute('type', 'text');
      toggleAdminPassword.classList.add('active');
      eyeIcon.classList.remove('fa-eye');
      eyeIcon.classList.add('fa-eye-slash');
    } else {
      adminPasswordInput.setAttribute('type', 'password');
      toggleAdminPassword.classList.remove('active');
      eyeIcon.classList.remove('fa-eye-slash');
      eyeIcon.classList.add('fa-eye');
    }
  });
}

// Filter Tabs
const filterTabs = document.querySelectorAll('.filter-tab');
let currentFilter = 'all';

filterTabs.forEach(tab => {
  tab.addEventListener('click', function() {
    const filter = this.dataset.filter;
    currentFilter = filter;
    
    // Update active tab
    filterTabs.forEach(t => t.classList.remove('active'));
    this.classList.add('active');
    
    // Clear users search input
    const usersSearch = document.getElementById('users-search');
    if (usersSearch) {
      usersSearch.value = '';
    }
    
    // Refresh table with filter
    refreshUsersTable(filter);
    hideNotification();
  });
});

// Add User Modal
const addUserBtn = document.getElementById('add-user-btn');
const addUserModal = document.getElementById('add-user-modal');
const cancelAddUser = document.getElementById('cancel-add-user');
const addUserForm = document.getElementById('add-user-form');

addUserBtn.addEventListener('click', () => {
  addUserForm.reset();
  delete addUserForm.dataset.editId;
  // Reset modal title and button text
  document.querySelector('#add-user-modal .modal-title').textContent = 'Add New User';
  document.querySelector('#add-user-form .btn-primary').textContent = 'Add User';
  // Make password required for new user
  addUserForm.querySelector('[name="password"]').setAttribute('required', 'required');
  addUserModal.classList.add('show');
  hideNotification();
});

cancelAddUser.addEventListener('click', () => {
  addUserModal.classList.remove('show');
  hideNotification();
});

// Add User Form Handler (Edit removed - now using Enable/Disable)
addUserForm.addEventListener('submit', function(e) {
  e.preventDefault();

  const formData = new FormData(addUserForm);
  const username = formData.get('username').trim();
  const email = formData.get('email').trim();
  const password = formData.get('password');
  const role = formData.get('role');

  if (!username) {
    showNotification('Username is required.', 'error');
    return;
  }
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    showNotification('Valid email is required.', 'error');
    return;
  }
  if (!password) {
    showNotification('Password is required for new user.', 'error');
    return;
  }
  if (password.length < 6) {
    showNotification('Password must be at least 6 characters.', 'error');
    return;
  }

  addUserModal.classList.remove('show');
  showLoading('Adding user...');

  fetch('admin_add_user.php', {
    method: 'POST',
    body: formData
  })
  .then(res => res.json())
  .then(data => {
    console.log('Add user response:', data);
    Swal.close();
    showNotification(data.message, data.status === 'success' ? 'success' : 'error');
    if (data.status === 'success') {
      console.log('Add successful, will refresh table...');
      addUserForm.reset();
      // Force refresh the table and stats
      setTimeout(() => {
        refreshUsersTable(currentFilter);
        refreshStatistics();
      }, 100);
    }
  })
  .catch((error) => {
    console.error('Error:', error);
    Swal.close();
    showNotification('Server error. Please try again.', 'error');
  });
});

// Delete User Modal
const deleteUserModal = document.getElementById('delete-user-modal');
const cancelDeleteUser = document.getElementById('cancel-delete-user');
const confirmDeleteUser = document.getElementById('confirm-delete-user');
let deleteUserId = null;

cancelDeleteUser.addEventListener('click', () => {
  deleteUserModal.classList.remove('show');
  deleteUserId = null;
  hideNotification();
});

confirmDeleteUser.addEventListener('click', () => {
  if (deleteUserId) {
    console.log('=== DELETE USER INITIATED ===');
    console.log('Deleting user ID:', deleteUserId);
    
    deleteUserModal.classList.remove('show');
    showLoading('Deleting user...');
    
    fetch('admin_delete_user.php', {
      method: 'POST',
      body: new URLSearchParams({id: deleteUserId})
    })
    .then(res => res.json())
    .then(data => {
      console.log('Delete response:', data);
      Swal.close();
      showNotification(data.message, data.status === 'success' ? 'success' : 'error');
      if (data.status === 'success') {
        console.log('Delete successful, will refresh table...');
        deleteUserId = null;
        // Force refresh the table
        setTimeout(() => {
          refreshUsersTable(currentFilter);
        }, 100);
      } else {
        console.log('Delete failed');
        deleteUserId = null;
      }
    })
    .catch(error => {
      console.error('Error deleting user:', error);
      Swal.close();
      showNotification('Server error. Please try again.', 'error');
      deleteUserId = null;
    });
  }
});

// View Admin Info Modal
const viewAdminModal = document.getElementById('view-admin-modal');
const closeViewAdmin = document.getElementById('close-view-admin');

closeViewAdmin.addEventListener('click', () => {
  viewAdminModal.classList.remove('show');
  hideNotification();
});

// Restricted Admin View Modal
const restrictedAdminModal = document.getElementById('restricted-admin-modal');
const closeRestrictedAdmin = document.getElementById('close-restricted-admin');

closeRestrictedAdmin.addEventListener('click', () => {
  restrictedAdminModal.classList.remove('show');
});

// Attach User Row Events
function attachUserRowEvents() {
  // View Own Admin Info Handler
  document.querySelectorAll('.view-admin-info').forEach(btn => {
    btn.onclick = function() {
      const row = btn.closest('tr');
      const fullname = row.dataset.fullname;
      const username = row.dataset.username;
      const email = row.dataset.email;
      const joined = row.dataset.joined;
      
      // Set title for viewing own account
      document.getElementById('view-admin-modal-title').textContent = 'Your Account Information';
      
      document.getElementById('view-admin-fullname').textContent = fullname || 'N/A';
      document.getElementById('view-admin-username').textContent = username;
      document.getElementById('view-admin-email').textContent = email;
      document.getElementById('view-admin-joined').textContent = joined;
      
      viewAdminModal.classList.add('show');
      hideNotification();
    };
  });

  // View Other Admin Handler (With Confirmation)
  document.querySelectorAll('.view-other-admin').forEach(btn => {
    btn.onclick = function() {
      const row = btn.closest('tr');
      const fullname = row.dataset.fullname;
      const username = row.dataset.username;
      const email = row.dataset.email;
      const joined = row.dataset.joined;
      
      // Show confirmation dialog
      Swal.fire({
        title: 'View Admin Account?',
        html: `Do you want to view <strong>${username}</strong>'s account information?`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#4c6ef5',
        cancelButtonColor: '#94a3b8',
        confirmButtonText: 'Yes, View',
        cancelButtonText: 'Cancel',
        reverseButtons: true,
        allowOutsideClick: true,
        allowEscapeKey: true
      }).then((result) => {
        if (result.isConfirmed) {
          // Set title with admin's name
          document.getElementById('view-admin-modal-title').textContent = `${username}'s Account Information`;
          
          // Populate and show the view admin modal
          document.getElementById('view-admin-fullname').textContent = fullname || 'N/A';
          document.getElementById('view-admin-username').textContent = username;
          document.getElementById('view-admin-email').textContent = email;
          document.getElementById('view-admin-joined').textContent = joined;
          
          viewAdminModal.classList.add('show');
        }
      });
    };
  });

  // Disable User Handler
  document.querySelectorAll('.disable-user').forEach(btn => {
    btn.onclick = function() {
      const row = btn.closest('tr');
      const id = row.dataset.id;
      const username = row.children[0].querySelector('strong').innerText.trim();
      
      // Show confirmation dialog
      Swal.fire({
        title: 'Disable User Account?',
        html: `Are you sure you want to disable the account for <strong>${username}</strong>?<br><br>They will not be able to log in until the account is re-enabled.`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#dc3545',
        cancelButtonColor: '#64748b',
        confirmButtonText: 'Yes, disable account',
        cancelButtonText: 'Cancel'
      }).then((result) => {
        if (result.isConfirmed) {
          showLoading('Disabling account...');
          
          fetch('admin_disable_user.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: `id=${id}`
          })
          .then(res => {
            if (!res.ok) {
              throw new Error('Network response was not ok');
            }
            return res.json();
          })
          .then(data => {
            Swal.close();
            showNotification(data.message, data.status === 'success' ? 'success' : 'error');
            if (data.status === 'success') {
              refreshUsersTable();
              refreshStatistics();
            }
          })
          .catch((error) => {
            Swal.close();
            console.error('Error:', error);
            showNotification('Server error. Please try again.', 'error');
          });
        }
      });
    };
  });

  // Enable User Handler
  document.querySelectorAll('.enable-user').forEach(btn => {
    btn.onclick = function() {
      const row = btn.closest('tr');
      const id = row.dataset.id;
      const username = row.children[0].querySelector('strong').innerText.trim();
      
      // Show confirmation dialog
      Swal.fire({
        title: 'Enable User Account?',
        html: `Are you sure you want to enable the account for <strong>${username}</strong>?<br><br>They will be able to log in again.`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#4c6ef5',
        cancelButtonColor: '#64748b',
        confirmButtonText: 'Yes, enable account',
        cancelButtonText: 'Cancel'
      }).then((result) => {
        if (result.isConfirmed) {
          showLoading('Enabling account...');
          
          fetch('admin_enable_user.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: `id=${id}`
          })
          .then(res => {
            if (!res.ok) {
              throw new Error('Network response was not ok');
            }
            return res.json();
          })
          .then(data => {
            Swal.close();
            showNotification(data.message, data.status === 'success' ? 'success' : 'error');
            if (data.status === 'success') {
              refreshUsersTable();
              refreshStatistics();
            }
          })
          .catch((error) => {
            Swal.close();
            console.error('Enable user error:', error);
            showNotification('Server error. Please check your connection and try again.', 'error');
          });
        }
      });
    };
  });

  // Delete User Handler
  document.querySelectorAll('.delete-user').forEach(btn => {
    btn.onclick = function() {
      const row = btn.closest('tr');
      const id = row.dataset.id;
      deleteUserId = id;
      deleteUserModal.classList.add('show');
      hideNotification();
    };
  });
}

// Call once on page load
attachUserRowEvents();

// Refresh Users Table
function refreshUsersTable(filter = 'all') {
  console.log('=== REFRESH USERS TABLE CALLED ===');
  console.log('Filter:', filter);
  
  const tbody = document.getElementById('users-table-body');
  if (!tbody) {
    console.error('ERROR: Table body element not found!');
    return;
  }
  
  console.log('Table body found, fetching data...');
  
  // Add timestamp to prevent caching
  const timestamp = new Date().getTime();
  const url = `admin_users_table.php?filter=${filter}&t=${timestamp}`;
  console.log('Fetch URL:', url);
  
  fetch(url)
    .then(res => {
      console.log('Response received. Status:', res.status, res.statusText);
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      return res.text();
    })
    .then(html => {
      console.log('HTML received. Length:', html.length);
      console.log('First 200 chars:', html.substring(0, 200));
      
      tbody.innerHTML = html;
      console.log('Table body updated with new HTML');
      
      attachUserRowEvents();
      console.log('Event handlers reattached');
      
      // Refresh statistics after table update
      refreshStatistics();
      
      console.log('=== REFRESH COMPLETE ===');
    })
    .catch(error => {
      console.error('=== REFRESH FAILED ===');
      console.error('Error:', error);
      showNotification('Failed to refresh users table.', 'error');
    });
}

// Refresh Statistics (counts)
function refreshStatistics() {
  console.log('Refreshing statistics...');
  const timestamp = new Date().getTime();
  
  fetch(`admin_get_stats.php?t=${timestamp}`)
    .then(res => res.json())
    .then(data => {
      if (data.status === 'success') {
        const stats = data.data;
        console.log('Statistics received:', stats);
        
        // Update filter tab counts
        const allUsersTab = document.querySelector('.filter-tab[data-filter="all"] .tab-count');
        const staffTab = document.querySelector('.filter-tab[data-filter="staff"] .tab-count');
        const adminTab = document.querySelector('.filter-tab[data-filter="admin"] .tab-count');
        
        if (allUsersTab) allUsersTab.textContent = stats.total_users;
        if (staffTab) staffTab.textContent = stats.total_staff;
        if (adminTab) adminTab.textContent = stats.total_admins;
        
        // Update overview section statistics
        const overviewStats = document.querySelectorAll('.stat-card');
        overviewStats.forEach((card, index) => {
          const statNumber = card.querySelector('.stat-number');
          if (statNumber) {
            switch(index) {
              case 0: // Staff Members
                statNumber.textContent = stats.total_staff;
                break;
              case 1: // Administrators
                statNumber.textContent = stats.total_admins;
                break;
              case 2: // Total Patients
                statNumber.textContent = stats.total_patients;
                break;
              case 3: // Low Stock Items
                statNumber.textContent = stats.low_stock;
                break;
            }
          }
        });
        
        console.log('Statistics updated successfully');
      }
    })
    .catch(error => {
      console.error('Error refreshing statistics:', error);
    });
}

// Search functionality - Enhanced
document.querySelectorAll('.search-input').forEach(input => {
  input.addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase();
    const section = e.target.closest('.section');
    const tableBody = section ? section.querySelector('tbody') : null;
    
    if (tableBody) {
      const rows = tableBody.querySelectorAll('tr');
      let visibleCount = 0;
      
      rows.forEach(row => {
        // Skip the "no users found" row
        if (row.children.length === 1 && row.children[0].getAttribute('colspan')) {
          return;
        }
        
        const text = row.textContent.toLowerCase();
        const isVisible = text.includes(searchTerm);
        row.style.display = isVisible ? '' : 'none';
        
        if (isVisible) visibleCount++;
      });
      
      // Show "No results" message if needed
      const existingNoResults = tableBody.querySelector('.no-results-row');
      if (existingNoResults) {
        existingNoResults.remove();
      }
      
      if (visibleCount === 0 && searchTerm !== '') {
        const noResultsRow = document.createElement('tr');
        noResultsRow.className = 'no-results-row';
        noResultsRow.innerHTML = `
          <td colspan="5" style="text-align: center; padding: 40px; color: #94a3b8;">
            <div style="font-size: 48px; margin-bottom: 12px;">🔍</div>
            <div style="font-size: 16px; font-weight: 600; margin-bottom: 4px;">No results found</div>
            <div style="font-size: 14px;">Try searching with different keywords</div>
          </td>
        `;
        tableBody.appendChild(noResultsRow);
      }
    }
  });
});

// ============================================
// VIEW STAFF MODAL HANDLERS
// ============================================
const viewStaffModal = document.getElementById('view-staff-modal');
const closeViewStaff = document.getElementById('close-view-staff');

// View Staff Info
document.addEventListener('click', (e) => {
  if (e.target.closest('.view-staff-info')) {
    const btn = e.target.closest('.view-staff-info');
    const row = btn.closest('tr');
    
    const fullname = row.dataset.fullname;
    const username = row.dataset.username;
    const email = row.dataset.email;
    const joined = row.dataset.joined;
    
    // Show confirmation dialog
    Swal.fire({
      title: 'View Staff Account?',
      html: `Do you want to view <strong>${username}</strong>'s account information?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#4c6ef5',
      cancelButtonColor: '#94a3b8',
      confirmButtonText: 'Yes, View',
      cancelButtonText: 'Cancel',
      reverseButtons: true,
      allowOutsideClick: true,
      allowEscapeKey: true
    }).then((result) => {
      if (result.isConfirmed) {
        // Set title with staff's name
        document.getElementById('view-staff-modal-title').textContent = `${username}'s Account Information`;
        
        document.getElementById('view-staff-fullname').textContent = fullname || 'N/A';
        document.getElementById('view-staff-username').textContent = username;
        document.getElementById('view-staff-email').textContent = email;
        document.getElementById('view-staff-joined').textContent = joined;
        
        viewStaffModal.classList.add('show');
      }
    });
  }
});

if (closeViewStaff) {
  closeViewStaff.addEventListener('click', () => {
    viewStaffModal.classList.remove('show');
  });
}

// ============================================
// ADMIN PATIENTS CRUD HANDLERS
// ============================================
const adminPatientModal = document.getElementById('admin-patient-modal');
const adminPatientForm = document.getElementById('admin-patient-form');
const openAddPatientBtn = document.getElementById('open-add-patient-modal');
const cancelAdminPatient = document.getElementById('cancel-admin-patient');
const adminPatientSubmitBtn = document.getElementById('admin-patient-submit-btn');
const adminViewPatientModal = document.getElementById('admin-view-patient-modal');
const closeAdminViewPatient = document.getElementById('close-admin-view-patient');
const adminDeletePatientModal = document.getElementById('admin-delete-patient-modal');
const cancelDeletePatientAdmin = document.getElementById('cancel-delete-patient-admin');
const confirmDeletePatientAdmin = document.getElementById('confirm-delete-patient-admin');
let deletePatientIdAdmin = null;
let originalAdminPatientData = {};

// Open Add Patient Modal
if (openAddPatientBtn) {
  openAddPatientBtn.addEventListener('click', () => {
    adminPatientForm.reset();
    delete adminPatientForm.dataset.editId;
    originalAdminPatientData = {};
    
    // Reset image to default icon
    const imageContainer = document.getElementById('admin-edit-patient-image-container');
    if (imageContainer) {
      imageContainer.innerHTML = '<i class="fas fa-user" style="font-size: 48px; color: #94a3b8;"></i>';
    }
    
    document.getElementById('admin-patient-modal-title').textContent = 'Add Patient';
    document.getElementById('admin-patient-modal-text').textContent = 'Fill out the patient details below.';
    adminPatientSubmitBtn.textContent = 'Add Patient';
    
    adminPatientModal.classList.add('show');
  });
}

// Cancel Patient Modal
if (cancelAdminPatient) {
  cancelAdminPatient.addEventListener('click', () => {
    adminPatientModal.classList.remove('show');
  });
}

// Close View Patient Modal
if (closeAdminViewPatient) {
  closeAdminViewPatient.addEventListener('click', () => {
    adminViewPatientModal.classList.remove('show');
  });
}

// Cancel Delete Patient
if (cancelDeletePatientAdmin) {
  cancelDeletePatientAdmin.addEventListener('click', () => {
    adminDeletePatientModal.classList.remove('show');
    deletePatientIdAdmin = null;
  });
}

// Confirm Delete Patient
if (confirmDeletePatientAdmin) {
  confirmDeletePatientAdmin.addEventListener('click', () => {
    if (deletePatientIdAdmin) {
      adminDeletePatientModal.classList.remove('show');
      
      // First warning with 3-second timer
      let timerInterval;
      Swal.fire({
        title: 'Are you sure?',
        html: 'This patient record will be archived. You can proceed in <b></b> seconds.',
        icon: 'warning',
        timer: 3000,
        timerProgressBar: true,
        allowOutsideClick: false,
        allowEscapeKey: false,
        showConfirmButton: false,
        didOpen: () => {
          const b = Swal.getHtmlContainer().querySelector('b');
          timerInterval = setInterval(() => {
            const timeLeft = Math.ceil(Swal.getTimerLeft() / 1000);
            b.textContent = timeLeft;
          }, 100);
        },
        willClose: () => {
          clearInterval(timerInterval);
        }
      }).then((result) => {
        // After 3 seconds, show final confirmation
        if (result.dismiss === Swal.DismissReason.timer) {
          Swal.fire({
            title: 'Final Confirmation',
            text: 'Do you really want to archive this patient record? This action will move the record to the archive.',
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#64748b',
            confirmButtonText: 'Yes, archive it',
            cancelButtonText: 'Cancel',
            allowOutsideClick: true,
            allowEscapeKey: true
          }).then((result) => {
            if (result.isConfirmed) {
              // Proceed with archiving
              Swal.fire({
                title: 'Archiving...',
                allowOutsideClick: false,
                allowEscapeKey: false,
                didOpen: () => { Swal.showLoading(); }
              });
              
              const formData = new FormData();
              formData.append('id', deletePatientIdAdmin);
              
              fetch('admin_delete_patient.php', {
                method: 'POST',
                body: formData
              })
              .then(res => res.json())
              .then(data => {
                Swal.close();
                showNotification(data.message, data.status === 'success' ? 'success' : 'error');
                if (data.status === 'success') {
                  refreshAdminPatientsTable();
                  refreshRecentVisits();
                  refreshStatistics();
                  refreshArchiveTable();
                }
                deletePatientIdAdmin = null;
              })
              .catch(() => {
                Swal.close();
                showNotification('Server error. Please try again.', 'error');
                deletePatientIdAdmin = null;
              });
            } else {
              deletePatientIdAdmin = null;
            }
          });
        }
      });
    }
  });
}

// Handle Patient Row Events
function attachAdminPatientRowEvents() {
  // View Patient
  document.querySelectorAll('.view-patient-admin').forEach(btn => {
    btn.onclick = function() {
      const row = btn.closest('tr');
      const id = row.dataset.id;
      
      Swal.fire({
        title: 'Loading...',
        allowOutsideClick: false,
        didOpen: () => { Swal.showLoading(); }
      });
      
      fetch(`admin_get_patient.php?id=${id}`)
      .then(res => res.json())
      .then(data => {
        Swal.close();
        if (data.status === 'success') {
          const p = data.patient;
          
          // Update patient image
          const imageContainer = document.getElementById('admin-patient-image-container');
          if (p.patient_image && p.patient_image !== '') {
            imageContainer.innerHTML = `<img src="${p.patient_image}" alt="Patient Photo" class="patient-modal-image">`;
          } else {
            imageContainer.innerHTML = '<i class="fas fa-user" style="font-size: 48px; color: #94a3b8;"></i>';
          }
          
          // Format last_visit for display
          let lastVisitDisplay = 'N/A';
          if (p.last_visit) {
            const lastVisitDate = new Date(p.last_visit);
            const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true };
            lastVisitDisplay = lastVisitDate.toLocaleString('en-US', options);
          }
          
          document.getElementById('admin-patient-details').innerHTML = `
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 20px 0;">
              <div class="info-group">
                <label class="info-label">Patient Name</label>
                <p class="info-value">${p.patient_name || 'N/A'}</p>
              </div>
              <div class="info-group">
                <label class="info-label">Contact</label>
                <p class="info-value">${p.contact || 'N/A'}</p>
              </div>
              <div class="info-group">
                <label class="info-label">Email</label>
                <p class="info-value">${p.email || 'N/A'}</p>
              </div>
              <div class="info-group">
                <label class="info-label">Address</label>
                <p class="info-value">${p.address || 'N/A'}</p>
              </div>
              <div class="info-group" style="grid-column: 1 / -1;">
                <label class="info-label">Last Visit</label>
                <p class="info-value">${lastVisitDisplay}</p>
              </div>
              <div class="info-group" style="grid-column: 1 / -1;">
                <label class="info-label">Medical History</label>
                <p class="info-value">${p.medical_history || 'N/A'}</p>
              </div>
              <div class="info-group" style="grid-column: 1 / -1;">
                <label class="info-label">Clinical Findings</label>
                <p class="info-value">${p.clinical_findings || 'N/A'}</p>
              </div>
              <div class="info-group" style="grid-column: 1 / -1;">
                <label class="info-label">Diagnostic Tests</label>
                <p class="info-value">${p.diagnostic_tests || 'N/A'}</p>
              </div>
              <div class="info-group" style="grid-column: 1 / -1;">
                <label class="info-label">Diagnosis</label>
                <p class="info-value">${p.diagnosis || 'N/A'}</p>
              </div>
              <div class="info-group" style="grid-column: 1 / -1;">
                <label class="info-label">Conclusion</label>
                <p class="info-value">${p.conclusion || 'N/A'}</p>
              </div>
            </div>
          `;
          adminViewPatientModal.classList.add('show');
        } else {
          showNotification(data.message, 'error');
        }
      })
      .catch(() => {
        Swal.close();
        showNotification('Error loading patient data.', 'error');
      });
    };
  });
  
  // Edit Patient
  document.querySelectorAll('.edit-patient-admin').forEach(btn => {
    btn.onclick = function() {
      const row = btn.closest('tr');
      const id = row.dataset.id;
      
      Swal.fire({
        title: 'Loading...',
        allowOutsideClick: false,
        didOpen: () => { Swal.showLoading(); }
      });
      
      fetch(`admin_get_patient.php?id=${id}`)
      .then(res => res.json())
      .then(data => {
        Swal.close();
        if (data.status === 'success') {
          const p = data.patient;
          adminPatientForm.reset();
          
          // Update patient image
          const imageContainer = document.getElementById('admin-edit-patient-image-container');
          if (p.patient_image && p.patient_image !== '') {
            imageContainer.innerHTML = `<img src="${p.patient_image}" alt="Patient Photo" class="patient-modal-image">`;
          } else {
            imageContainer.innerHTML = '<i class="fas fa-user" style="font-size: 48px; color: #94a3b8;"></i>';
          }
          
          adminPatientForm.querySelector('[name="patient_name"]').value = p.patient_name || '';
          adminPatientForm.querySelector('[name="contact"]').value = p.contact || '';
          adminPatientForm.querySelector('[name="email"]').value = p.email || '';
          adminPatientForm.querySelector('[name="address"]').value = p.address || '';
          // Format last_visit for datetime-local input (YYYY-MM-DDTHH:MM)
          if (p.last_visit) {
            const lastVisitDate = new Date(p.last_visit);
            const formatted = lastVisitDate.getFullYear() + '-' + 
              String(lastVisitDate.getMonth() + 1).padStart(2, '0') + '-' + 
              String(lastVisitDate.getDate()).padStart(2, '0') + 'T' + 
              String(lastVisitDate.getHours()).padStart(2, '0') + ':' + 
              String(lastVisitDate.getMinutes()).padStart(2, '0');
            adminPatientForm.querySelector('[name="last_visit"]').value = formatted;
          }
          adminPatientForm.querySelector('[name="medical_history"]').value = p.medical_history || '';
          adminPatientForm.querySelector('[name="clinical_findings"]').value = p.clinical_findings || '';
          adminPatientForm.querySelector('[name="diagnostic_tests"]').value = p.diagnostic_tests || '';
          adminPatientForm.querySelector('[name="diagnosis"]').value = p.diagnosis || '';
          adminPatientForm.querySelector('[name="conclusion"]').value = p.conclusion || '';
          
          adminPatientForm.dataset.editId = id;
          originalAdminPatientData = {
            patient_name: p.patient_name || '',
            contact: p.contact || '',
            email: p.email || '',
            address: p.address || '',
            last_visit: p.last_visit || '',
            medical_history: p.medical_history || '',
            clinical_findings: p.clinical_findings || '',
            diagnostic_tests: p.diagnostic_tests || '',
            diagnosis: p.diagnosis || '',
            conclusion: p.conclusion || ''
          };
          
          document.getElementById('admin-patient-modal-title').textContent = 'Edit Patient';
          document.getElementById('admin-patient-modal-text').textContent = 'Update the patient details below.';
          adminPatientSubmitBtn.textContent = 'Update Patient';
          
          adminPatientModal.classList.add('show');
        } else {
          showNotification(data.message, 'error');
        }
      })
      .catch(() => {
        Swal.close();
        showNotification('Error loading patient data.', 'error');
      });
    };
  });
  
  // Delete Patient
  document.querySelectorAll('.delete-patient-admin').forEach(btn => {
    btn.onclick = function() {
      const row = btn.closest('tr');
      const id = row.dataset.id;
      deletePatientIdAdmin = id;
      adminDeletePatientModal.classList.add('show');
    };
  });
}

// Patient Image Preview Handler
const adminPatientImageInput = document.getElementById('admin-patient-image-input');
if (adminPatientImageInput) {
  adminPatientImageInput.addEventListener('change', function(e) {
    const file = e.target.files[0];
    const imageContainer = document.getElementById('admin-edit-patient-image-container');
    
    if (file) {
      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        showNotification('Image size must be less than 5MB', 'error');
        e.target.value = '';
        return;
      }
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        showNotification('Please select a valid image file', 'error');
        e.target.value = '';
        return;
      }
      
      // Preview the image
      const reader = new FileReader();
      reader.onload = function(event) {
        imageContainer.innerHTML = `<img src="${event.target.result}" alt="Patient Preview" class="patient-modal-image">`;
      };
      reader.readAsDataURL(file);
    }
  });
}

// Patient Form Submit
if (adminPatientForm) {
  adminPatientForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const formData = new FormData(adminPatientForm);
    const isEditing = !!adminPatientForm.dataset.editId;
    
    // Change detection for edit mode
    if (isEditing) {
      const currentData = {
        patient_name: formData.get('patient_name'),
        contact: formData.get('contact'),
        email: formData.get('email'),
        address: formData.get('address'),
        last_visit: formData.get('last_visit'),
        medical_history: formData.get('medical_history'),
        clinical_findings: formData.get('clinical_findings'),
        diagnostic_tests: formData.get('diagnostic_tests'),
        diagnosis: formData.get('diagnosis'),
        conclusion: formData.get('conclusion')
      };
      
      const hasChanges = Object.keys(currentData).some(key => 
        currentData[key] !== (originalAdminPatientData[key] || '')
      );
      
      if (!hasChanges) {
        showNotification('No changes detected.', 'error');
        return;
      }
      
      formData.append('id', adminPatientForm.dataset.editId);
    }
    
    const url = isEditing ? 'admin_edit_patient.php' : 'admin_add_patient.php';
    
    adminPatientModal.classList.remove('show');
    Swal.fire({
      title: isEditing ? 'Updating...' : 'Adding...',
      allowOutsideClick: false,
      didOpen: () => { Swal.showLoading(); }
    });
    
    fetch(url, {
      method: 'POST',
      body: formData
    })
    .then(res => res.json())
    .then(data => {
      Swal.close();
      showNotification(data.message, data.status === 'success' ? 'success' : 'error');
      if (data.status === 'success') {
        adminPatientForm.reset();
        delete adminPatientForm.dataset.editId;
        originalAdminPatientData = {};
        refreshAdminPatientsTable();
        refreshRecentVisits();
        refreshStatistics();
      }
    })
    .catch(() => {
      Swal.close();
      showNotification('Server error. Please try again.', 'error');
    });
  });
}

function refreshAdminPatientsTable() {
  fetch('admin_patients_table.php')
  .then(res => res.text())
  .then(html => {
    document.getElementById('admin-patients-table-body').innerHTML = html;
    attachAdminPatientRowEvents();
  });
}

function refreshRecentVisits() {
  fetch('admin_recent_visits.php')
  .then(res => res.text())
  .then(html => {
    const recentVisitsList = document.getElementById('recent-visits-list');
    if (recentVisitsList) {
      recentVisitsList.innerHTML = html;
    }
  })
  .catch(err => console.error('Error refreshing recent visits:', err));
}

attachAdminPatientRowEvents();

// ============================================
// ADMIN INVENTORY CRUD HANDLERS
// ============================================
const adminInventoryModal = document.getElementById('admin-inventory-modal');
const adminInventoryForm = document.getElementById('admin-inventory-form');
const openAddInventoryBtnAdmin = document.getElementById('open-add-inventory-modal-admin');
const cancelAdminInventory = document.getElementById('cancel-admin-inventory');
const adminInventorySubmitBtn = document.getElementById('admin-inventory-submit-btn');
const adminDeleteInventoryModal = document.getElementById('admin-delete-inventory-modal');
const cancelDeleteInventoryAdmin = document.getElementById('cancel-delete-inventory-admin');
const confirmDeleteInventoryAdmin = document.getElementById('confirm-delete-inventory-admin');
let deleteInventoryIdAdmin = null;
let originalAdminInventoryData = {};

// Open Add Inventory Modal
if (openAddInventoryBtnAdmin) {
  openAddInventoryBtnAdmin.addEventListener('click', () => {
    adminInventoryForm.reset();
    delete adminInventoryForm.dataset.editId;
    originalAdminInventoryData = {};
    
    const statusFieldGroup = document.getElementById('admin-status-field-group');
    if (statusFieldGroup) {
      statusFieldGroup.style.display = 'none';
    }
    
    document.getElementById('admin-inventory-modal-title').textContent = 'Add Inventory Item';
    document.getElementById('admin-inventory-modal-text').textContent = 'Fill out the details below to add a new item.';
    adminInventorySubmitBtn.textContent = 'Add Item';
    
    adminInventoryModal.classList.add('show');
  });
}

// Cancel Inventory Modal
if (cancelAdminInventory) {
  cancelAdminInventory.addEventListener('click', () => {
    adminInventoryModal.classList.remove('show');
  });
}

// Cancel Delete Inventory
if (cancelDeleteInventoryAdmin) {
  cancelDeleteInventoryAdmin.addEventListener('click', () => {
    adminDeleteInventoryModal.classList.remove('show');
    deleteInventoryIdAdmin = null;
  });
}

// Confirm Delete Inventory
if (confirmDeleteInventoryAdmin) {
  confirmDeleteInventoryAdmin.addEventListener('click', () => {
    if (deleteInventoryIdAdmin) {
      adminDeleteInventoryModal.classList.remove('show');
      
      Swal.fire({
        title: 'Deleting...',
        allowOutsideClick: false,
        didOpen: () => { Swal.showLoading(); }
      });
      
      const formData = new FormData();
      formData.append('id', deleteInventoryIdAdmin);
      
      fetch('admin_delete_inventory.php', {
        method: 'POST',
        body: formData
      })
      .then(res => res.json())
      .then(data => {
        Swal.close();
        showNotification(data.message, data.status === 'success' ? 'success' : 'error');
        if (data.status === 'success') {
          refreshAdminInventoryTable();
          refreshStatistics();
        }
        deleteInventoryIdAdmin = null;
      })
      .catch(() => {
        Swal.close();
        showNotification('Server error. Please try again.', 'error');
        deleteInventoryIdAdmin = null;
      });
    }
  });
}

// Handle Inventory Row Events
function attachAdminInventoryRowEvents() {
  // Edit Inventory
  document.querySelectorAll('.edit-inventory-admin').forEach(btn => {
    btn.onclick = function() {
      const row = btn.closest('tr');
      const id = row.dataset.id;
      const item_name = row.dataset.itemName || '';
      const category = row.dataset.category || '';
      const quantity = row.dataset.quantity || '';
      
      adminInventoryForm.reset();
      adminInventoryForm.querySelector('[name="item_name"]').value = item_name;
      adminInventoryForm.querySelector('[name="category"]').value = category;
      adminInventoryForm.querySelector('[name="quantity"]').value = quantity;
      
      const statusFieldGroup = document.getElementById('admin-status-field-group');
      if (statusFieldGroup) {
        statusFieldGroup.style.display = 'none';
      }
      
      adminInventoryForm.dataset.editId = id;
      originalAdminInventoryData = {
        item_name: item_name,
        category: category,
        quantity: quantity
      };
      
      document.getElementById('admin-inventory-modal-title').textContent = 'Edit Inventory Item';
      document.getElementById('admin-inventory-modal-text').textContent = 'Update the details below for this item.';
      adminInventorySubmitBtn.textContent = 'Update Item';
      
      adminInventoryModal.classList.add('show');
    };
  });
  
  // Delete Inventory
  document.querySelectorAll('.delete-inventory-admin').forEach(btn => {
    btn.onclick = function() {
      const row = btn.closest('tr');
      const id = row.dataset.id;
      deleteInventoryIdAdmin = id;
      adminDeleteInventoryModal.classList.add('show');
    };
  });
}

// Inventory Form Submit
if (adminInventoryForm) {
  adminInventoryForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const formData = new FormData(adminInventoryForm);
    const isEditing = !!adminInventoryForm.dataset.editId;
    
    // Validation
    const quantity = parseInt(formData.get('quantity'));
    if (quantity < 0) {
      showNotification('Quantity cannot be negative.', 'error');
      return;
    }
    if (quantity > 100) {
      showNotification('Quantity cannot exceed 100 items.', 'error');
      return;
    }
    
    // Change detection for edit mode
    if (isEditing) {
      const currentData = {
        item_name: formData.get('item_name'),
        category: formData.get('category'),
        quantity: formData.get('quantity')
      };
      
      const hasChanges = Object.keys(currentData).some(key => 
        currentData[key] !== (originalAdminInventoryData[key] || '')
      );
      
      if (!hasChanges) {
        showNotification('No changes detected.', 'error');
        return;
      }
      
      formData.append('id', adminInventoryForm.dataset.editId);
    }
    
    const url = isEditing ? 'admin_edit_inventory.php' : 'admin_add_inventory.php';
    
    adminInventoryModal.classList.remove('show');
    Swal.fire({
      title: isEditing ? 'Updating...' : 'Adding...',
      allowOutsideClick: false,
      didOpen: () => { Swal.showLoading(); }
    });
    
    fetch(url, {
      method: 'POST',
      body: formData
    })
    .then(res => res.json())
    .then(data => {
      Swal.close();
      showNotification(data.message, data.status === 'success' ? 'success' : 'error');
      if (data.status === 'success') {
        adminInventoryForm.reset();
        delete adminInventoryForm.dataset.editId;
        originalAdminInventoryData = {};
        refreshAdminInventoryTable();
        refreshStatistics();
      }
    })
    .catch(() => {
      Swal.close();
      showNotification('Server error. Please try again.', 'error');
    });
  });
}

function refreshAdminInventoryTable() {
  fetch('admin_inventory_table.php')
  .then(res => res.text())
  .then(html => {
    document.getElementById('admin-inventory-table-body').innerHTML = html;
    attachAdminInventoryRowEvents();
  });
}

attachAdminInventoryRowEvents();

// ============================================
// ARCHIVE MANAGEMENT
// ============================================
const viewArchiveModal = document.getElementById('view-archive-modal');
const closeArchiveView = document.getElementById('close-archive-view');
const restoreArchiveModal = document.getElementById('restore-archive-modal');
const cancelRestoreArchive = document.getElementById('cancel-restore-archive');
const confirmRestoreArchive = document.getElementById('confirm-restore-archive');
const deleteArchiveModal = document.getElementById('delete-archive-modal');
const cancelDeleteArchive = document.getElementById('cancel-delete-archive');
const confirmDeleteArchive = document.getElementById('confirm-delete-archive');
let currentArchiveId = null;

// Close view archive modal
if (closeArchiveView && viewArchiveModal) {
  closeArchiveView.addEventListener('click', () => {
    viewArchiveModal.classList.remove('show');
  });
}

// Cancel restore
if (cancelRestoreArchive && restoreArchiveModal) {
  cancelRestoreArchive.addEventListener('click', () => {
    restoreArchiveModal.classList.remove('show');
    currentArchiveId = null;
  });
}

// Cancel delete permanently
if (cancelDeleteArchive && deleteArchiveModal) {
  cancelDeleteArchive.addEventListener('click', () => {
    deleteArchiveModal.classList.remove('show');
    currentArchiveId = null;
  });
}

// Attach archive row events
function attachArchiveRowEvents() {
  const viewArchiveBtns = document.querySelectorAll('.view-archive');
  const restoreArchiveBtns = document.querySelectorAll('.restore-archive');
  const deleteArchiveBtns = document.querySelectorAll('.delete-archive-permanent');
  
  // View archive
  if (viewArchiveBtns.length > 0) {
    viewArchiveBtns.forEach(btn => {
      btn.onclick = function() {
        const row = btn.closest('tr');
        const id = row.dataset.id;
      
      Swal.fire({
        title: 'Loading...',
        allowOutsideClick: false,
        didOpen: () => { Swal.showLoading(); }
      });
      
      fetch(`admin_get_archive.php?id=${id}`)
      .then(res => res.json())
      .then(data => {
        Swal.close();
        if (data.status === 'success') {
          const p = data.patient;
          
          // Update patient image
          const imageContainer = document.getElementById('archive-patient-image-container');
          if (p.patient_image && p.patient_image !== '') {
            imageContainer.innerHTML = `<img src="${p.patient_image}" alt="Patient Photo" class="patient-modal-image">`;
          } else {
            imageContainer.innerHTML = '<i class="fas fa-user" style="font-size: 48px; color: #94a3b8;"></i>';
          }
          
          // Format dates
          let lastVisitDisplay = 'N/A';
          if (p.last_visit) {
            const lastVisitDate = new Date(p.last_visit);
            const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true };
            lastVisitDisplay = lastVisitDate.toLocaleString('en-US', options);
          }
          
          const archivedDate = new Date(p.archived_at);
          const archivedDisplay = archivedDate.toLocaleString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true });
          
          document.getElementById('archive-patient-details').innerHTML = `
            <div class="detail-group">
              <span class="detail-label">Patient Name:</span>
              <span class="detail-value">${p.patient_name || 'N/A'}</span>
            </div>
            <div class="detail-group">
              <span class="detail-label">Contact:</span>
              <span class="detail-value">${p.contact || 'N/A'}</span>
            </div>
            <div class="detail-group">
              <span class="detail-label">Email:</span>
              <span class="detail-value">${p.email || 'N/A'}</span>
            </div>
            <div class="detail-group">
              <span class="detail-label">Address:</span>
              <span class="detail-value">${p.address || 'N/A'}</span>
            </div>
            <div class="detail-group">
              <span class="detail-label">Last Visit:</span>
              <span class="detail-value">${lastVisitDisplay}</span>
            </div>
            <div class="detail-group">
              <span class="detail-label">Medical History:</span>
              <span class="detail-value">${p.medical_history || 'N/A'}</span>
            </div>
            <div class="detail-group">
              <span class="detail-label">Clinical Findings:</span>
              <span class="detail-value">${p.clinical_findings || 'N/A'}</span>
            </div>
            <div class="detail-group">
              <span class="detail-label">Diagnostic Tests:</span>
              <span class="detail-value">${p.diagnostic_tests || 'N/A'}</span>
            </div>
            <div class="detail-group">
              <span class="detail-label">Diagnosis:</span>
              <span class="detail-value">${p.diagnosis || 'N/A'}</span>
            </div>
            <div class="detail-group">
              <span class="detail-label">Conclusion:</span>
              <span class="detail-value">${p.conclusion || 'N/A'}</span>
            </div>
            <hr style="margin: 16px 0; border: none; border-top: 1px solid #e2e8f0;">
            <div class="detail-group">
              <span class="detail-label">Archived By:</span>
              <span class="detail-value">${p.archived_by_username} (${p.archived_by_role == 2 ? 'Admin' : 'Staff'})</span>
            </div>
            <div class="detail-group">
              <span class="detail-label">Archived Date:</span>
              <span class="detail-value">${archivedDisplay}</span>
            </div>
          `;
          
          viewArchiveModal.classList.add('show');
        } else {
          showNotification(data.message, 'error');
        }
      })
      .catch(() => {
        Swal.close();
        showNotification('Error loading archived data.', 'error');
      });
    };
  });
  }
  
  // Restore archive
  if (restoreArchiveBtns.length > 0) {
    restoreArchiveBtns.forEach(btn => {
      btn.onclick = function() {
        const row = btn.closest('tr');
        currentArchiveId = row.dataset.id;
        if (restoreArchiveModal) {
          restoreArchiveModal.classList.add('show');
        }
      };
    });
  }
  
  // Delete archive permanently
  if (deleteArchiveBtns.length > 0) {
    deleteArchiveBtns.forEach(btn => {
      btn.onclick = function() {
        const row = btn.closest('tr');
        currentArchiveId = row.dataset.id;
        if (deleteArchiveModal) {
          deleteArchiveModal.classList.add('show');
        }
      };
    });
  }
}

// Confirm restore
if (confirmRestoreArchive) {
  confirmRestoreArchive.addEventListener('click', () => {
    if (currentArchiveId) {
      restoreArchiveModal.classList.remove('show');
      
      Swal.fire({
        title: 'Restoring...',
        allowOutsideClick: false,
        didOpen: () => { Swal.showLoading(); }
      });
      
      const formData = new FormData();
      formData.append('id', currentArchiveId);
      
      fetch('admin_restore_archive.php', {
        method: 'POST',
        body: formData
      })
      .then(res => res.json())
      .then(data => {
        Swal.close();
        showNotification(data.message, data.status === 'success' ? 'success' : 'error');
        if (data.status === 'success') {
          refreshArchiveTable();
          refreshAdminPatientsTable();
          refreshRecentVisits();
          refreshStatistics();
        }
        currentArchiveId = null;
      })
      .catch(() => {
        Swal.close();
        showNotification('Server error. Please try again.', 'error');
        currentArchiveId = null;
      });
    }
  });
}

// Confirm delete permanently
if (confirmDeleteArchive) {
  confirmDeleteArchive.addEventListener('click', () => {
    if (currentArchiveId) {
      deleteArchiveModal.classList.remove('show');
      
      // Show warning with timer
      let timerInterval;
      Swal.fire({
        title: 'Final Warning!',
        html: 'This will PERMANENTLY delete the record. You can proceed in <b></b> seconds.',
        icon: 'error',
        timer: 3000,
        timerProgressBar: true,
        allowOutsideClick: false,
        allowEscapeKey: false,
        showConfirmButton: false,
        didOpen: () => {
          const b = Swal.getHtmlContainer().querySelector('b');
          timerInterval = setInterval(() => {
            const timeLeft = Math.ceil(Swal.getTimerLeft() / 1000);
            b.textContent = timeLeft;
          }, 100);
        },
        willClose: () => {
          clearInterval(timerInterval);
        }
      }).then((result) => {
        if (result.dismiss === Swal.DismissReason.timer) {
          Swal.fire({
            title: 'Are you absolutely sure?',
            text: 'This action CANNOT be undone! The record will be permanently deleted.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#dc2626',
            cancelButtonColor: '#64748b',
            confirmButtonText: 'Yes, delete forever',
            cancelButtonText: 'Cancel'
          }).then((result) => {
            if (result.isConfirmed) {
              Swal.fire({
                title: 'Deleting...',
                allowOutsideClick: false,
                didOpen: () => { Swal.showLoading(); }
              });
              
              const formData = new FormData();
              formData.append('id', currentArchiveId);
              
              fetch('admin_delete_archive.php', {
                method: 'POST',
                body: formData
              })
              .then(res => res.json())
              .then(data => {
                Swal.close();
                showNotification(data.message, data.status === 'success' ? 'success' : 'error');
                if (data.status === 'success') {
                  refreshArchiveTable();
                }
                currentArchiveId = null;
              })
              .catch(() => {
                Swal.close();
                showNotification('Server error. Please try again.', 'error');
                currentArchiveId = null;
              });
            } else {
              currentArchiveId = null;
            }
          });
        }
      });
    }
  });
}

function refreshArchiveTable() {
  const archiveTableBody = document.getElementById('archive-table-body');
  if (archiveTableBody) {
    fetch('admin_archive_table.php')
    .then(res => res.text())
    .then(html => {
      archiveTableBody.innerHTML = html;
      attachArchiveRowEvents();
    });
  }
}

// Only attach archive events if archive table exists
const archiveTableBody = document.getElementById('archive-table-body');
if (archiveTableBody) {
  attachArchiveRowEvents();
}
