// Navigation
const navLinks = document.querySelectorAll('.nav-link[data-section]');
const sections = document.querySelectorAll('.section');

navLinks.forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    const targetSection = link.dataset.section;

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
    hideNotification();
  });
});

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
const gotoSettings = document.getElementById('goto-settings');

closeViewAdmin.addEventListener('click', () => {
  viewAdminModal.classList.remove('show');
  hideNotification();
});

gotoSettings.addEventListener('click', () => {
  viewAdminModal.classList.remove('show');
  // Switch to settings section
  document.querySelectorAll('.nav-link').forEach(link => {
    if (link.dataset.section === 'settings') {
      link.click();
    }
  });
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
      const username = row.dataset.username;
      const email = row.dataset.email;
      const joined = row.dataset.joined;
      
      document.getElementById('view-admin-username').textContent = username;
      document.getElementById('view-admin-email').textContent = email;
      document.getElementById('view-admin-joined').textContent = joined;
      
      viewAdminModal.classList.add('show');
      hideNotification();
    };
  });

  // View Other Admin Handler (Restricted)
  document.querySelectorAll('.view-other-admin').forEach(btn => {
    btn.onclick = function() {
      restrictedAdminModal.classList.add('show');
      hideNotification();
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