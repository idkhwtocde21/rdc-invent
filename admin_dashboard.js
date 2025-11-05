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

    // Hide any visible notification when navigating
    hideNotification();
  });
});

// Logout Modal
const logoutBtn = document.getElementById('logout-btn');
const logoutModal = document.getElementById('logout-modal');
const confirmLogout = document.getElementById('confirm-logout');
const cancelLogout = document.getElementById('cancel-logout');

logoutBtn.addEventListener('click', () => {
  logoutModal.classList.add('show');
});

cancelLogout.addEventListener('click', () => {
  logoutModal.classList.remove('show');
});

confirmLogout.addEventListener('click', () => {
  logoutModal.classList.remove('show');
  showNotification('Logging out...', 'success');
  setTimeout(() => {
    window.location.href = 'logout.php';
  }, 1500);
});

// Notification System
let notificationTimeout = null;

function showNotification(message, type = 'success') {
  const notification = document.getElementById('notification');
  const notificationText = document.getElementById('notification-text');
  const notificationIcon = document.getElementById('notification-icon');
  
  if (notificationTimeout) {
    clearTimeout(notificationTimeout);
  }

  notificationText.textContent = message;
  notificationIcon.textContent = type === 'success' ? '✓' : '✕';
  notification.className = 'notification show ' + type;
  notification.style.display = 'flex';

  notificationTimeout = setTimeout(() => {
    hideNotification();
  }, 3000);
}

function hideNotification() {
  const notification = document.getElementById('notification');
  if (!notification) return;
  
  if (notificationTimeout) {
    clearTimeout(notificationTimeout);
    notificationTimeout = null;
  }
  
  notification.classList.remove('show');
  
  setTimeout(() => {
    notification.style.display = 'none';
    notification.classList.remove('success', 'error');
  }, 300);
}

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
    
    fetch('admin_update_settings.php', {
      method: 'POST',
      body: formData
    })
    .then(res => res.json())
    .then((data) => {
      showNotification(data.message, data.status === 'success' ? 'success' : 'error');
      
      if (data.status === 'success') {
        // Clear password field
        document.getElementById('admin-password').value = '';
        
        // Update topbar username
        const topbarUser = document.querySelector('.topbar-user span');
        if (topbarUser) {
          topbarUser.textContent = username;
        }
        
        // Update avatar
        const userAvatar = document.querySelector('.user-avatar');
        if (userAvatar) {
          userAvatar.textContent = username.substring(0, 2).toUpperCase();
        }
      }
    })
    .catch(() => {
      showNotification('Server error. Please try again.', 'error');
    });
  });
}

// Password visibility toggle
const toggleAdminPassword = document.getElementById('toggle-admin-password');
const adminPasswordInput = document.getElementById('admin-password');

if (toggleAdminPassword && adminPasswordInput) {
  toggleAdminPassword.addEventListener('click', function() {
    const type = adminPasswordInput.getAttribute('type');
    
    if (type === 'password') {
      adminPasswordInput.setAttribute('type', 'text');
      toggleAdminPassword.classList.add('active');
      toggleAdminPassword.querySelector('.eye-icon').textContent = '👁️‍🗨️';
    } else {
      adminPasswordInput.setAttribute('type', 'password');
      toggleAdminPassword.classList.remove('active');
      toggleAdminPassword.querySelector('.eye-icon').textContent = '👁️';
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
  // Reset modal title
  document.querySelector('#add-user-modal .modal-title').textContent = 'Add New User';
  // Make password required for new user
  addUserForm.querySelector('[name="password"]').setAttribute('required', 'required');
  addUserModal.classList.add('show');
  hideNotification();
});

cancelAddUser.addEventListener('click', () => {
  addUserModal.classList.remove('show');
  hideNotification();
});

// Add/Edit User Form Handler
addUserForm.addEventListener('submit', function(e) {
  e.preventDefault();

  const formData = new FormData(addUserForm);
  const username = formData.get('username').trim();
  const email = formData.get('email').trim();
  const password = formData.get('password');
  const role = formData.get('role');

  if (!username || !email || (!password && !addUserForm.dataset.editId)) {
    showNotification('All fields are required.', 'error');
    return;
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    showNotification('Valid email is required.', 'error');
    return;
  }

  if (password && password.length < 6) {
    showNotification('Password must be at least 6 characters.', 'error');
    return;
  }

  let url = 'admin_add_user.php';
  if (addUserForm.dataset.editId) {
    formData.append('id', addUserForm.dataset.editId);
    url = 'admin_edit_user.php';
  }

  fetch(url, {
    method: 'POST',
    body: formData
  })
  .then(res => res.json())
  .then(data => {
    showNotification(data.message, data.status === 'success' ? 'success' : 'error');
    if (data.status === 'success') {
      addUserForm.reset();
      addUserModal.classList.remove('show');
      delete addUserForm.dataset.editId;
      refreshUsersTable(currentFilter);
    }
  })
  .catch(() => {
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
    fetch('admin_delete_user.php', {
      method: 'POST',
      body: new URLSearchParams({id: deleteUserId})
    })
    .then(res => res.json())
    .then(data => {
      showNotification(data.message, data.status === 'success' ? 'success' : 'error');
      if (data.status === 'success') {
        refreshUsersTable(currentFilter);
      }
      deleteUserModal.classList.remove('show');
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

  // Edit User Handler
  document.querySelectorAll('.edit-user').forEach(btn => {
    btn.onclick = function() {
      const row = btn.closest('tr');
      const id = row.dataset.id;
      const username = row.children[0].querySelector('strong').innerText.trim();
      const email = row.children[1].innerText.trim();
      const role = row.querySelector('.badge-admin') ? '2' : '1';

      addUserForm.reset();
      addUserForm.username.value = username;
      addUserForm.email.value = email;
      addUserForm.role.value = role;
      addUserForm.dataset.editId = id;
      
      // Make password optional for edit
      addUserForm.querySelector('[name="password"]').removeAttribute('required');
      
      // Update modal title
      document.querySelector('#add-user-modal .modal-title').textContent = 'Edit User';
      
      addUserModal.classList.add('show');
      hideNotification();
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
  fetch(`admin_users_table.php?filter=${filter}`)
    .then(res => res.text())
    .then(html => {
      document.getElementById('users-table-body').innerHTML = html;
      attachUserRowEvents();
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