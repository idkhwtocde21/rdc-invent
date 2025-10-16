// Navigation
const navLinks = document.querySelectorAll('.nav-link[data-section]');
const sections = document.querySelectorAll('.section');

navLinks.forEach(link => {
  link.addEventListener('click', () => {
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
  }, 2500); // Increased from 1500ms to 2500ms (2.5 seconds)
});

// Close modal on outside click
logoutModal.addEventListener('click', (e) => {
  if (e.target === logoutModal) {
    logoutModal.classList.remove('show');
  }
});

// Notification System (improved with animations)
let notificationTimeout = null;
function showNotification(message, type = 'success') {
  const notification = document.getElementById('notification');
  const notificationText = document.getElementById('notification-text');
  const notificationIcon = document.getElementById('notification-icon');
  
  // clear previous timeout
  if (notificationTimeout) {
    clearTimeout(notificationTimeout);
  }

  // ensure visible immediately
  notificationText.textContent = message;
  notificationIcon.textContent = type === 'success' ? '✓' : '✕';
  notification.className = 'notification show ' + type;
  notification.style.display = 'flex';

  // hide after 3000ms with animation
  notificationTimeout = setTimeout(() => {
    hideNotification();
  }, 3000);
}

function hideNotification() {
  const notification = document.getElementById('notification');
  if (!notification) return;
  
  // clear timeout
  if (notificationTimeout) {
    clearTimeout(notificationTimeout);
    notificationTimeout = null;
  }
  
  // Add hide animation
  notification.classList.remove('show');
  notification.classList.add('hide');
  
  // After animation completes, fully hide
  setTimeout(() => {
    notification.style.display = 'none';
    notification.classList.remove('hide', 'success', 'error');
    
    // reset icon/text
    const notificationText = document.getElementById('notification-text');
    const notificationIcon = document.getElementById('notification-icon');
    if (notificationText) notificationText.textContent = '';
    if (notificationIcon) notificationIcon.textContent = '';
  }, 400); // matches animation duration
}

// Save Settings Modal Logic
const saveSettingsModal = document.getElementById('save-settings-modal');
const cancelSaveSettings = document.getElementById('cancel-save-settings');
const confirmSaveSettings = document.getElementById('confirm-save-settings');
let pendingSettingsData = null;

// Close save settings modal (Cancel)
cancelSaveSettings.addEventListener('click', () => {
  saveSettingsModal.classList.remove('show');
  pendingSettingsData = null;
  hideNotification();
});

// Close save settings modal on outside click
saveSettingsModal.addEventListener('click', (e) => {
  if (e.target === saveSettingsModal) {
    saveSettingsModal.classList.remove('show');
    pendingSettingsData = null;
    hideNotification();
  }
});

// Settings Form Handler
document.getElementById('settings-form').addEventListener('submit', (e) => {
  e.preventDefault();
  
  // Remove previous error states
  const formInputs = document.querySelectorAll('#settings-form .form-input');
  formInputs.forEach(input => input.classList.remove('error'));
  
  const formData = new FormData(document.getElementById('settings-form'));
  const username = formData.get('username').trim();
  const email = formData.get('email').trim();
  const password = formData.get('password');
  
  // Client-side validation
  if (!username) {
    document.querySelector('#settings-form input[name="username"]').classList.add('error');
    showNotification('Username is required.', 'error');
    return;
  }
  
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    document.querySelector('#settings-form input[name="email"]').classList.add('error');
    showNotification('Valid email is required.', 'error');
    return;
  }
  
  if (password && password.length < 6) {
    document.querySelector('#settings-form input[name="password"]').classList.add('error');
    showNotification('Password must be at least 6 characters.', 'error');
    return;
  }
  
  // Store form data and show confirmation modal
  pendingSettingsData = { formData, username };
  saveSettingsModal.classList.add('show');
  hideNotification();
});

// Confirm save settings
confirmSaveSettings.addEventListener('click', () => {
  if (pendingSettingsData) {
    const { formData, username } = pendingSettingsData;
    
    fetch('update_settings.php', { 
      method: 'POST',
      body: formData
    })
    .then(res => res.json())
    .then(data => {
      showNotification(data.message, data.status === 'success' ? 'success' : 'error');
      
      if (data.status === 'success') {
        // Clear password field after successful update
        document.querySelector('#settings-form input[name="password"]').value = '';
        
        // Update topbar username display
        const topbarUser = document.querySelector('.topbar-user span');
        if (topbarUser) {
          topbarUser.textContent = username;
        }
        
        // Update avatar initials
        const userAvatar = document.querySelector('.user-avatar');
        if (userAvatar) {
          userAvatar.textContent = username.substring(0, 2).toUpperCase();
        }
      }
      
      saveSettingsModal.classList.remove('show');
      pendingSettingsData = null;
    })
    .catch(() => {
      showNotification('Server error. Please try again.', 'error');
      saveSettingsModal.classList.remove('show');
      pendingSettingsData = null;
    });
  }
});

// Search functionality (demo)
document.querySelectorAll('.search-input').forEach(input => {
  input.addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase();
    const table = e.target.closest('.content').querySelector('tbody');
    
    if (table) {
      const rows = table.querySelectorAll('tr');
      rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(searchTerm) ? '' : 'none';
      });
    }
  });
});

// Remove demo "Add" handlers that conflict with modal logic
document.querySelectorAll('.btn-primary').forEach(btn => {
  // remove any demo click handlers previously attached by other code
  btn.onclick = null;
});

// Only keep inventory modal open logic:
const inventorySection = document.getElementById('inventory-section');
const addItemBtn = inventorySection.querySelector('.controls .btn-primary');
const addInventoryModal = document.getElementById('add-inventory-modal');
const cancelAddInventory = document.getElementById('cancel-add-inventory');
const addInventoryForm = document.getElementById('add-inventory-form');
const inventorySubmitBtn = document.getElementById('inventory-submit-btn');

// Open modal when Add Item is clicked (only for Inventory section)
addItemBtn.addEventListener('click', () => {
  addInventoryForm.reset();
  delete addInventoryForm.dataset.editId;
  addInventoryModal.classList.add('show');
  inventorySubmitBtn.textContent = 'Add Item';
  // make sure no stale notification shows when opening form
  hideNotification();
});

// Close modal (Cancel)
cancelAddInventory.addEventListener('click', () => {
  addInventoryModal.classList.remove('show');
  // do not show any notification on cancel
  hideNotification();
});

// Edit Inventory Handler (initial rows)
document.querySelectorAll('.edit-inventory').forEach(btn => {
  btn.addEventListener('click', function() {
    const row = btn.closest('tr');
    const id = row.dataset.id;
    const item_name = row.children[1].querySelector('strong').innerText.trim();
    const category = row.children[2].innerText.trim();
    const quantity = row.children[3].innerText.trim();
    const status = row.children[4].innerText.replace(/[^a-zA-Z ]/g, '').trim();

    addInventoryForm.reset();
    addInventoryForm.item_name.value = item_name;
    addInventoryForm.category.value = category;
    addInventoryForm.quantity.value = quantity;
    addInventoryForm.status.value = status;
    addInventoryForm.dataset.editId = id;
    addInventoryModal.classList.add('show');
    inventorySubmitBtn.textContent = 'Finish Editing';
    // hide any stale notification
    hideNotification();
  });
});

// Delete Inventory Modal Logic
const deleteInventoryModal = document.getElementById('delete-inventory-modal');
const cancelDeleteInventory = document.getElementById('cancel-delete-inventory');
const confirmDeleteInventory = document.getElementById('confirm-delete-inventory');
let deleteItemId = null;

// Close delete modal (Cancel)
cancelDeleteInventory.addEventListener('click', () => {
  deleteInventoryModal.classList.remove('show');
  deleteItemId = null;
  hideNotification();
});

// Close delete modal on outside click
deleteInventoryModal.addEventListener('click', (e) => {
  if (e.target === deleteInventoryModal) {
    deleteInventoryModal.classList.remove('show');
    deleteItemId = null;
    hideNotification();
  }
});

// Confirm delete
confirmDeleteInventory.addEventListener('click', () => {
  if (deleteItemId) {
    fetch('delete_inventory.php', {
      method: 'POST',
      body: new URLSearchParams({id: deleteItemId})
    })
    .then(res => res.json())
    .then(data => {
      showNotification(data.message, data.status === 'success' ? 'success' : 'error');
      if (data.status === 'success') {
        refreshInventoryTable();
      }
      deleteInventoryModal.classList.remove('show');
      deleteItemId = null;
    });
  }
});

function attachInventoryRowEvents() {
  // Edit Inventory Handler
  document.querySelectorAll('.edit-inventory').forEach(btn => {
    btn.onclick = function() {
      const row = btn.closest('tr');
      const id = row.dataset.id;
      const item_name = row.children[1].querySelector('strong').innerText.trim();
      const category = row.children[2].innerText.trim();
      const quantity = row.children[3].innerText.trim();
      const status = row.children[4].innerText.replace(/[^a-zA-Z ]/g, '').trim();

      addInventoryForm.reset();
      addInventoryForm.item_name.value = item_name;
      addInventoryForm.category.value = category;
      addInventoryForm.quantity.value = quantity;
      addInventoryForm.status.value = status;
      addInventoryForm.dataset.editId = id;
      addInventoryModal.classList.add('show');
      inventorySubmitBtn.textContent = 'Finish Editing';
      hideNotification();
    };
  });

  // Delete Inventory Handler - Open modal instead of confirm()
  document.querySelectorAll('.delete-inventory').forEach(btn => {
    btn.onclick = function() {
      const row = btn.closest('tr');
      const id = row.dataset.id;
      deleteItemId = id;
      deleteInventoryModal.classList.add('show');
      hideNotification();
    };
  });
}

// Call once on page load
attachInventoryRowEvents();

// Handle Add/Edit Inventory Form Submission
document.getElementById('add-inventory-form').addEventListener('submit', function(e) {
  e.preventDefault();

  // Remove previous error states
  addInventoryForm.querySelectorAll('.form-input').forEach(input => {
    input.classList.remove('error');
  });

  // Client-side validation
  const itemName = addInventoryForm.item_name.value.trim();
  const category = addInventoryForm.category.value.trim();
  const quantity = addInventoryForm.quantity.value.trim();
  const status = addInventoryForm.status.value.trim();

  if (!itemName || !category || !quantity || !status || Number(quantity) < 0) {
    // do not show notification per request; optionally focus first empty field with animation
    if (!itemName) {
      addInventoryForm.item_name.classList.add('error');
      addInventoryForm.item_name.focus();
    } else if (!category) {
      addInventoryForm.category.classList.add('error');
      addInventoryForm.category.focus();
    } else if (!quantity || Number(quantity) < 0) {
      addInventoryForm.quantity.classList.add('error');
      addInventoryForm.quantity.focus();
    } else {
      addInventoryForm.status.classList.add('error');
      addInventoryForm.status.focus();
    }
    return;
  }

  // Validation: If status is "Out of Stock", quantity must be 0
  if (status === 'Out of Stock' && Number(quantity) !== 0) {
    addInventoryForm.quantity.classList.add('error');
    showNotification('Quantity must be 0 when status is "Out of Stock".', 'error');
    addInventoryForm.quantity.focus();
    return;
  }

  const form = e.target;
  const formData = new FormData(form);
  let url = 'add_inventory.php';
  if (form.dataset.editId) {
    formData.append('id', form.dataset.editId);
    url = 'edit_inventory.php';
  }
  fetch(url, {
    method: 'POST',
    body: formData
  })
  .then(res => res.json())
  .then(data => {
    // show notification only for server response
    showNotification(data.message, data.status === 'success' ? 'success' : 'error');
    if (data.status === 'success') {
      form.reset();
      addInventoryModal.classList.remove('show');
      delete form.dataset.editId;
      refreshInventoryTable();
    }
  })
  .catch(() => {
    showNotification('Server error. Please try again.', 'error');
  });
});

function refreshInventoryTable() {
  fetch('inventory_table.php')
    .then(res => res.text())
    .then(html => {
      document.getElementById('inventory-table-body').innerHTML = html;
      attachInventoryRowEvents(); // Re-attach events to new buttons
    });
}