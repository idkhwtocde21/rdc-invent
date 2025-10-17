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
  }, 2500);
});

// OPTION LANG TO! (DONT REMOVE IT AS A COMMENT!)

// Close modal on outside click
// logoutModal.addEventListener('click', (e) => {
// if (e.target === logoutModal) {
//     logoutModal.classList.remove('show');
//   }
// });
//

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
  }, 400);
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

// OPTION LANG TO! (DONT REMOVE IT AS A COMMENT!)

// Close save settings modal on outside click
// saveSettingsModal.addEventListener('click', (e) => {
//   if (e.target === saveSettingsModal) {
//     saveSettingsModal.classList.remove('show');
//     pendingSettingsData = null;
//     hideNotification();
//   }
// });

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

// Search functionality (scoped to the section where the search input lives)
document.querySelectorAll('.search-input').forEach(input => {
  input.addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase();
    // scope to closest section (patients or inventory)
    const section = e.target.closest('.section');
    const tableBody = section ? section.querySelector('tbody') : e.target.closest('.content').querySelector('tbody');
    
    if (tableBody) {
      const rows = tableBody.querySelectorAll('tr');
      rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(searchTerm) ? '' : 'none';
      });
    }
  });
});

// Inventory Management

const inventorySection = document.getElementById('inventory-section');
const addItemBtn = document.getElementById('open-add-inventory-modal'); // ✅ Use ID instead
const addInventoryModal = document.getElementById('add-inventory-modal');
const cancelAddInventory = document.getElementById('cancel-add-inventory');
const addInventoryForm = document.getElementById('add-inventory-form');
const inventorySubmitBtn = document.getElementById('inventory-submit-btn');

// Open modal when Add Item is clicked
addItemBtn.addEventListener('click', () => {
  addInventoryForm.reset();
  delete addInventoryForm.dataset.editId;
  addInventoryModal.classList.add('show');
  inventorySubmitBtn.textContent = 'Add Item';
  hideNotification();
});

// Close modal (Cancel)
cancelAddInventory.addEventListener('click', () => {
  addInventoryModal.classList.remove('show');
  hideNotification();
});

// OPTION LANG TO! (DONT REMOVE IT AS A COMMENT!)

// Close modal on outside click
// addInventoryModal.addEventListener('click', (e) => {
//   if (e.target === addInventoryModal) {
//     addInventoryModal.classList.remove('show');
//     hideNotification();
//  }
// });

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

// OPTION LANG TO! (DONT REMOVE IT AS A COMMENT!)

// Close delete modal on outside click
// deleteInventoryModal.addEventListener('click', (e) => {
//  if (e.target === deleteInventoryModal) {
//    deleteInventoryModal.classList.remove('show');
//    deleteItemId = null;
//    hideNotification();
//  }
// });

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

  // Delete Inventory Handler
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
addInventoryForm.addEventListener('submit', function(e) {
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
      attachInventoryRowEvents();
    });
}

// Patient Management
const patientsSection = document.getElementById('patients-section');
const addPatientBtn = document.getElementById('open-add-patient-modal');
const addPatientModal = document.getElementById('add-patient-modal');
const cancelAddPatient = document.getElementById('cancel-add-patient');
const addPatientForm = document.getElementById('add-patient-form');
const patientSubmitBtn = document.getElementById('patient-submit-btn');

// Open add patient modal
addPatientBtn.addEventListener('click', () => {
  addPatientForm.reset();
  delete addPatientForm.dataset.editId;
  addPatientModal.classList.add('show');
  patientSubmitBtn.textContent = 'Add Patient';
  hideNotification();
});

// Close add patient modal (Cancel)
cancelAddPatient.addEventListener('click', () => {
  addPatientModal.classList.remove('show');
  hideNotification();
});

// OPTION LANG TO! (DONT REMOVE IT AS A COMMENT!)

// Close add patient modal on outside click
// addPatientModal.addEventListener('click', (e) => {
//   if (e.target === addPatientModal) {
//    addPatientModal.classList.remove('show');
//     hideNotification();
//  }
// });

// Delete Patient Modal Logic
const deletePatientModal = document.getElementById('delete-patient-modal');
const cancelDeletePatient = document.getElementById('cancel-delete-patient');
const confirmDeletePatient = document.getElementById('confirm-delete-patient');
let deletePatientId = null;

// Close delete modal (Cancel)
cancelDeletePatient.addEventListener('click', () => {
  deletePatientModal.classList.remove('show');
  deletePatientId = null;
  hideNotification();
});

// OPTION LANG TO! (DONT REMOVE IT AS A COMMENT!)

// Close delete modal on outside click
//deletePatientModal.addEventListener('click', (e) => {
// if (e.target === deletePatientModal) {
//   deletePatientModal.classList.remove('show');
//  deletePatientId = null;
//   hideNotification();
// }
// });


// Confirm delete patient
confirmDeletePatient.addEventListener('click', () => {
  if (deletePatientId) {
    fetch('delete_patient.php', {
      method: 'POST',
      body: new URLSearchParams({id: deletePatientId})
    })
    .then(res => res.json())
    .then(data => {
      showNotification(data.message, data.status === 'success' ? 'success' : 'error');
      if (data.status === 'success') {
        refreshPatientTable();
      }
      deletePatientModal.classList.remove('show');
      deletePatientId = null;
    });
  }
});

// Edit Patient Handler (initial rows)
document.querySelectorAll('.edit-patient').forEach(btn => {
  btn.addEventListener('click', function() {
    const row = btn.closest('tr');
    const id = row.dataset.id;
    const patient_name = row.children[1].querySelector('strong').innerText.trim();
    const contact = row.children[2].innerText.trim();

    addPatientForm.reset();
    addPatientForm.patient_name.value = patient_name;
    addPatientForm.contact.value = contact;
    addPatientForm.dataset.editId = id;
    addPatientModal.classList.add('show');
    patientSubmitBtn.textContent = 'Finish Editing';
    hideNotification();
  });
});

// View Patient modal close button and outside click
const viewPatientModal = document.getElementById('view-patient-modal');
const closeViewPatient = document.getElementById('close-view-patient');
if (closeViewPatient) {
  closeViewPatient.addEventListener('click', () => {
    if (viewPatientModal) viewPatientModal.classList.remove('show');
  });
}
if (viewPatientModal) {
  viewPatientModal.addEventListener('click', (e) => {
    if (e.target === viewPatientModal) {
      viewPatientModal.classList.remove('show');
    }
  });
}

function attachPatientRowEvents() {
  // View Patient Handler
  document.querySelectorAll('.view-patient').forEach(btn => {
    btn.onclick = function() {
      const row = btn.closest('tr');
      if (!row) return;
      const id = row.dataset.id || '';
      const name = row.querySelector('strong') ? row.querySelector('strong').innerText.trim() : '';
      const contact = row.children[2] ? row.children[2].innerText.trim() : '';
      const email = row.dataset.email || '';
      const address = row.dataset.address || '';
      const created = row.children[3] ? row.children[3].innerText.trim() : '';

      const viewModal = document.getElementById('view-patient-modal');
      if (!viewModal) return;

      document.getElementById('view-patient-name').textContent = name;
      document.getElementById('view-patient-contact').textContent = contact;
      document.getElementById('view-patient-email').textContent = email || '—';
      document.getElementById('view-patient-address').textContent = address || '—';
      document.getElementById('view-patient-created').textContent = created ? `Added: ${created}` : '';

      viewModal.classList.add('show');
      hideNotification();
    };
  });

  // Edit Patient Handler
  document.querySelectorAll('.edit-patient').forEach(btn => {
    btn.onclick = function() {
      const row = btn.closest('tr');
      const id = row.dataset.id;
      const patient_name = row.children[1].querySelector('strong').innerText.trim();
      const contact = row.children[2].innerText.trim();
      const email = row.dataset.email || '';
      const address = row.dataset.address || '';

      addPatientForm.reset();
      addPatientForm.patient_name.value = patient_name;
      addPatientForm.contact.value = contact;
      addPatientForm.email.value = email;
      addPatientForm.address.value = address;
      addPatientForm.dataset.editId = id;
      addPatientModal.classList.add('show');
      patientSubmitBtn.textContent = 'Finish Editing';
      hideNotification();
    };
  });

  // Delete Patient Handler
  document.querySelectorAll('.delete-patient').forEach(btn => {
    btn.onclick = function() {
      const row = btn.closest('tr');
      const id = row.dataset.id;
      deletePatientId = id;
      deletePatientModal.classList.add('show');
      hideNotification();
    };
  });
}

// Call once on page load
attachPatientRowEvents();

// Handle Add/Edit Patient Form Submission
addPatientForm.addEventListener('submit', function(e) {
  e.preventDefault();

  // Remove previous error states
  addPatientForm.querySelectorAll('.form-input').forEach(input => {
    input.classList.remove('error');
  });

  // Client-side validation
  const patientName = addPatientForm.patient_name.value.trim();
  const contact = addPatientForm.contact.value.trim();

  if (!patientName || !contact) {
    if (!patientName) {
      addPatientForm.patient_name.classList.add('error');
      addPatientForm.patient_name.focus();
    } else if (!contact) {
      addPatientForm.contact.classList.add('error');
      addPatientForm.contact.focus();
    }
    return;
  }

  const form = e.target;
  const formData = new FormData(form);
  let url = 'add_patient.php';
  const isEditing = !!form.dataset.editId;
  
  if (isEditing) {
    formData.append('id', form.dataset.editId);
    url = 'edit_patient.php';
  }
  
  fetch(url, {
    method: 'POST',
    body: formData
  })
  .then(res => res.json())
  .then(data => {
    showNotification(data.message, data.status === 'success' ? 'success' : 'error');
    if (data.status === 'success') {
      form.reset();
      addPatientModal.classList.remove('show');
      delete form.dataset.editId;
      
      // Just refresh the table for both add and edit
      refreshPatientTable();
    }
  })
  .catch(() => {
    showNotification('Server error. Please try again.', 'error');
  });
});

function refreshPatientTable() {
  return fetch('patient_table.php')
    .then(res => res.text())
    .then(html => {
      document.getElementById('patient-table-body').innerHTML = html;
      attachPatientRowEvents();
    });
}