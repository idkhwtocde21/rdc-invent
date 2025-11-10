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

// User Dropdown Menu Toggle
const userMenuToggle = document.getElementById('user-menu-toggle');
const userDropdown = document.querySelector('.user-dropdown');

userMenuToggle.addEventListener('click', (e) => {
  e.stopPropagation();
  userMenuToggle.classList.toggle('active');
});

// Close dropdown when clicking outside
document.addEventListener('click', (e) => {
  if (!userMenuToggle.contains(e.target)) {
    userMenuToggle.classList.remove('active');
  }
});

// Logout Modal
const logoutBtn = document.getElementById('logout-btn');
const logoutModal = document.getElementById('logout-modal');
const confirmLogout = document.getElementById('confirm-logout');
const cancelLogout = document.getElementById('cancel-logout');

logoutBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  userMenuToggle.classList.remove('active');
  logoutModal.classList.add('show');
});

cancelLogout.addEventListener('click', () => {
  logoutModal.classList.remove('show');
});

confirmLogout.addEventListener('click', () => {
  logoutModal.classList.remove('show');
  
  // Show loading screen
  const loadingScreen = document.getElementById('loading-screen');
  loadingScreen.classList.add('active');
  
  // Redirect after delay
  setTimeout(() => {
    window.location.href = 'logout.php';
  }, 1500);
});

// OPTION LANG TO! (DONT REMOVE IT AS A COMMENT!)

// Close modal on outside click
// logoutModal.addEventListener('click', (e) => {
// if (e.target === logoutModal) {
//     logoutModal.classList.remove('show');
//   }
// });
//

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

// Save Settings Modal Logic
const saveSettingsModal = document.getElementById('save-settings-modal');
const cancelSaveSettings = document.getElementById('cancel-save-settings');
const confirmSaveSettings = document.getElementById('confirm-save-settings');
let pendingSettingsData = null;

// Store original settings data for change detection
let originalSettingsData = {};

// Load original settings on page load
window.addEventListener('DOMContentLoaded', () => {
  const settingsForm = document.getElementById('settings-form');
  if (settingsForm) {
    originalSettingsData = {
      username: settingsForm.username.value.trim(),
      email: settingsForm.email.value.trim()
    };
  }
});

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
  
  // Check if any fields changed
  const hasChanges = 
    username !== originalSettingsData.username ||
    email !== originalSettingsData.email ||
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
      // User confirmed, proceed with update directly
      showLoading('Updating settings...');
      
      fetch('update_settings.php', { 
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

// Password visibility toggle for settings
// Password visibility toggle for settings
const toggleSettingsPassword = document.getElementById('toggle-settings-password');
const settingsPasswordInput = document.getElementById('settings-password');

if (toggleSettingsPassword && settingsPasswordInput) {
  toggleSettingsPassword.addEventListener('click', function() {
    const type = settingsPasswordInput.getAttribute('type');
    const eyeIcon = toggleSettingsPassword.querySelector('.eye-icon');
    
    if (type === 'password') {
      settingsPasswordInput.setAttribute('type', 'text');
      toggleSettingsPassword.classList.add('active');
      eyeIcon.classList.remove('fa-eye');
      eyeIcon.classList.add('fa-eye-slash');
    } else {
      settingsPasswordInput.setAttribute('type', 'password');
      toggleSettingsPassword.classList.remove('active');
      eyeIcon.classList.remove('fa-eye-slash');
      eyeIcon.classList.add('fa-eye');
    }
  });
}

// Confirm save settings
confirmSaveSettings.addEventListener('click', () => {
  if (pendingSettingsData) {
    const { formData, username } = pendingSettingsData;
    
    // Close modal and show loading
    saveSettingsModal.classList.remove('show');
    showLoading('Updating settings...');
    
    fetch('update_settings.php', { 
      method: 'POST',
      body: formData
    })
    .then(res => res.json())
    .then((data) => {
      Swal.close(); // Close loading
      
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
      
      pendingSettingsData = null;
    })
    .catch(() => {
      Swal.close();
      showNotification('Server error. Please try again.', 'error');
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
const addItemBtn = document.getElementById('open-add-inventory-modal');
const addInventoryModal = document.getElementById('add-inventory-modal');
const cancelAddInventory = document.getElementById('cancel-add-inventory');
const addInventoryForm = document.getElementById('add-inventory-form');
const inventorySubmitBtn = document.getElementById('inventory-submit-btn');

// Open modal when Add Item is clicked
addItemBtn.addEventListener('click', () => {
  addInventoryForm.reset();
  delete addInventoryForm.dataset.editId;
  originalInventoryData = {};
  
  // Hide status field (it's auto-calculated)
  const statusFieldGroup = document.getElementById('status-field-group');
  if (statusFieldGroup) {
    statusFieldGroup.style.display = 'none';
  }
  
  // Reset modal title and text for adding
  const inventoryModalTitle = document.querySelector('#add-inventory-modal .modal-title');
  const inventoryModalText = document.querySelector('#add-inventory-modal .modal-text');
  if (inventoryModalTitle) inventoryModalTitle.textContent = 'Add Inventory Item';
  if (inventoryModalText) inventoryModalText.textContent = 'Fill out the details below to add a new item. Status will be automatically determined based on quantity.';
  
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
    deleteInventoryModal.classList.remove('show');
    showLoading('Deleting item...');
    
    fetch('delete_inventory.php', {
      method: 'POST',
      body: new URLSearchParams({id: deleteItemId})
    })
    .then(res => res.json())
    .then(data => {
      Swal.close();
      showNotification(data.message, data.status === 'success' ? 'success' : 'error');
      if (data.status === 'success') {
        refreshInventoryTable();
      }
      deleteItemId = null;
    })
    .catch(() => {
      Swal.close();
      showNotification('Server error. Please try again.', 'error');
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
      const item_name = row.dataset.itemName || row.children[0].querySelector('strong').innerText.trim();
      const category = row.dataset.category || row.children[1].innerText.trim();
      const quantity = row.dataset.quantity || row.children[2].innerText.trim();

      addInventoryForm.reset();
      addInventoryForm.item_name.value = item_name;
      addInventoryForm.category.value = category;
      addInventoryForm.quantity.value = quantity;
      
      // Hide status field since it's auto-calculated
      const statusFieldGroup = document.getElementById('status-field-group');
      if (statusFieldGroup) {
        statusFieldGroup.style.display = 'none';
      }
      
      addInventoryForm.dataset.editId = id;
      
      // Store original data for change detection
      originalInventoryData = {
        item_name: item_name,
        category: category,
        quantity: quantity
      };
      
      // Update modal title and text for editing
      const inventoryModalTitle = document.querySelector('#add-inventory-modal .modal-title');
      const inventoryModalText = document.querySelector('#add-inventory-modal .modal-text');
      if (inventoryModalTitle) inventoryModalTitle.textContent = 'Edit Inventory Item';
      if (inventoryModalText) inventoryModalText.textContent = 'Update the details below for this item.';
      
      addInventoryModal.classList.add('show');
      inventorySubmitBtn.textContent = 'Confirm';
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

// Store original inventory data for change detection
let originalInventoryData = {};

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

  // Error handling for required fields
  if (!itemName || !category || quantity === '') {
    let errorMessage = '';
    if (!itemName) {
      addInventoryForm.item_name.classList.add('error');
      errorMessage = 'Item name is required';
      addInventoryForm.item_name.focus();
    } else if (!category) {
      addInventoryForm.category.classList.add('error');
      errorMessage = 'Category is required';
      addInventoryForm.category.focus();
    } else if (quantity === '') {
      addInventoryForm.quantity.classList.add('error');
      errorMessage = 'Quantity is required';
      addInventoryForm.quantity.focus();
    }
    
    Swal.fire({
      icon: 'error',
      title: 'Validation Error',
      text: errorMessage,
      confirmButtonColor: '#4c6ef5'
    });
    return;
  }

  // Item name validation: must contain letters, not just numbers
  const itemNamePattern = /^[A-Za-z0-9\s\.\-(),]+$/;
  if (!itemNamePattern.test(itemName)) {
    addInventoryForm.item_name.classList.add('error');
    addInventoryForm.item_name.focus();
    Swal.fire({
      icon: 'error',
      title: 'Invalid Item Name',
      text: 'Item name can only contain letters, numbers, spaces, and basic punctuation (. - , ( ))',
      confirmButtonColor: '#4c6ef5'
    });
    return;
  }

  // Ensure item name is not just numbers
  if (/^\d+$/.test(itemName)) {
    addInventoryForm.item_name.classList.add('error');
    addInventoryForm.item_name.focus();
    Swal.fire({
      icon: 'error',
      title: 'Invalid Item Name',
      text: 'Item name cannot contain only numbers. Please include text.',
      confirmButtonColor: '#4c6ef5'
    });
    return;
  }

  // Item name length validation
  if (itemName.length < 2 || itemName.length > 100) {
    addInventoryForm.item_name.classList.add('error');
    addInventoryForm.item_name.focus();
    Swal.fire({
      icon: 'error',
      title: 'Invalid Item Name',
      text: 'Item name must be between 2 and 100 characters.',
      confirmButtonColor: '#4c6ef5'
    });
    return;
  }

  const quantityNum = Number(quantity);

  // Quantity validation
  if (quantityNum < 0) {
    addInventoryForm.quantity.classList.add('error');
    addInventoryForm.quantity.focus();
    Swal.fire({
      icon: 'error',
      title: 'Invalid Quantity',
      text: 'Quantity cannot be negative.',
      confirmButtonColor: '#4c6ef5'
    });
    return;
  }

  // Maximum quantity validation
  if (quantityNum > 100) {
    addInventoryForm.quantity.classList.add('error');
    addInventoryForm.quantity.focus();
    Swal.fire({
      icon: 'error',
      title: 'Quantity Limit Exceeded',
      text: 'Quantity cannot exceed 100 items.',
      confirmButtonColor: '#4c6ef5'
    });
    return;
  }

  const form = e.target;
  const isEditing = !!form.dataset.editId;
  
  // Check if any fields changed (for edit mode)
  if (isEditing) {
    const currentData = {
      item_name: itemName,
      category: category,
      quantity: quantityNum.toString()
    };

    const hasDataChanged = Object.keys(currentData).some(key => 
      currentData[key] !== (originalInventoryData[key] || '')
    );

    if (!hasDataChanged) {
      Swal.fire({
        icon: 'warning',
        title: 'No Changes Detected',
        text: 'Please modify at least one field to update.',
        confirmButtonColor: '#4c6ef5'
      });
      return;
    }
  }
  
  const formData = new FormData(form);
  let url = 'add_inventory.php';
  
  if (isEditing) {
    formData.append('id', form.dataset.editId);
    url = 'edit_inventory.php';
  }
  
  // Close modal and show loading
  addInventoryModal.classList.remove('show');
  showLoading(isEditing ? 'Updating item...' : 'Adding item...');
  
  fetch(url, {
    method: 'POST',
    body: formData
  })
  .then(res => {
    console.log('Response status:', res.status);
    if (!res.ok) {
      throw new Error('Network response was not ok');
    }
    return res.text();
  })
  .then(text => {
    console.log('Raw response:', text);
    const data = JSON.parse(text);
    console.log('Parsed data:', data);
    Swal.close();
    showNotification(data.message, data.status === 'success' ? 'success' : 'error');
    if (data.status === 'success') {
      form.reset();
      delete form.dataset.editId;
      originalInventoryData = {};
      refreshInventoryTable();
    }
  })
  .catch((error) => {
    Swal.close();
    console.error('Error:', error);
    showNotification('Server error. Please check your connection and try again.', 'error');
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
  
  // Hide last visit field for new patients
  document.getElementById('last-visit-group').style.display = 'none';
  
  // Hide image preview for new patients
  const imagePreview = document.getElementById('image-preview');
  if (imagePreview) {
    imagePreview.style.display = 'none';
  }
  
  // Reset modal title and text for adding
  const patientModalTitle = document.querySelector('#add-patient-modal .modal-title');
  const patientModalText = document.querySelector('#add-patient-modal .modal-text');
  if (patientModalTitle) patientModalTitle.textContent = 'Add Patient';
  if (patientModalText) patientModalText.textContent = 'Fill out the patient details below.';
  
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
    deletePatientModal.classList.remove('show');
    
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
            // Proceed with deletion/archiving
            Swal.fire({
              title: 'Archiving...',
              allowOutsideClick: false,
              didOpen: () => { Swal.showLoading(); }
            });
            
            fetch('delete_patient.php', {
              method: 'POST',
              body: new URLSearchParams({id: deletePatientId})
            })
            .then(res => res.json())
            .then(data => {
              Swal.close();
              showNotification(data.message, data.status === 'success' ? 'success' : 'error');
              if (data.status === 'success') {
                refreshPatientTable();
              }
              deletePatientId = null;
            })
            .catch(() => {
              Swal.close();
              showNotification('Server error. Please try again.', 'error');
              deletePatientId = null;
            });
          } else {
            deletePatientId = null;
          }
        });
      }
    });
  }
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

// Image preview functionality
const patientImageInput = document.getElementById('patient-image-input');
if (patientImageInput) {
  patientImageInput.addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function(event) {
        document.getElementById('preview-img').src = event.target.result;
        document.getElementById('image-preview').style.display = 'block';
      };
      reader.readAsDataURL(file);
    } else {
      document.getElementById('image-preview').style.display = 'none';
    }
  });
}

// Update attachPatientRowEvents function to include image handling
function attachPatientRowEvents() {
  // View Patient Handler
  document.querySelectorAll('.view-patient').forEach(btn => {
    btn.onclick = function() {
      const row = btn.closest('tr');
      if (!row) return;
      const id = row.dataset.id || '';
      const name = row.querySelector('strong') ? row.querySelector('strong').innerText.trim() : '';
      const contact = row.children[1] ? row.children[1].innerText.trim() : '';
      const email = row.dataset.email || '';
      const address = row.dataset.address || '';
      const lastVisit = row.children[2] ? row.children[2].innerText.trim() : '';
      const image = row.dataset.image || '';
      const created = row.dataset.created || '';
      
      // Medical information
      const medicalHistory = row.dataset.medicalHistory || '—';
      const clinicalFindings = row.dataset.clinicalFindings || '—';
      const diagnosticTests = row.dataset.diagnosticTests || '—';
      const diagnosis = row.dataset.diagnosis || '—';
      const conclusion = row.dataset.conclusion || '—';

      const viewModal = document.getElementById('view-patient-modal');
      if (!viewModal) return;

      // Handle patient image
      const patientImg = document.getElementById('view-patient-image');
      const noImage = document.getElementById('view-patient-no-image');
      if (image) {
        patientImg.src = image;
        patientImg.style.display = 'block';
        noImage.style.display = 'none';
      } else {
        patientImg.style.display = 'none';
        noImage.style.display = 'flex';
      }

      document.getElementById('view-patient-name').textContent = name;
      document.getElementById('view-patient-contact').textContent = contact;
      document.getElementById('view-patient-email').textContent = email || '—';
      document.getElementById('view-patient-address').textContent = address || '—';
      document.getElementById('view-patient-last-visit').textContent = lastVisit || 'No visit yet';
      document.getElementById('view-patient-created').textContent = created ? `Added: ${created}` : '';
      
      // Populate medical information
      document.getElementById('view-medical-history').textContent = medicalHistory;
      document.getElementById('view-clinical-findings').textContent = clinicalFindings;
      document.getElementById('view-diagnostic-tests').textContent = diagnosticTests;
      document.getElementById('view-diagnosis').textContent = diagnosis;
      document.getElementById('view-conclusion').textContent = conclusion;

      viewModal.classList.add('show');
      hideNotification();
    };
  });

  // Edit Patient Handler
  document.querySelectorAll('.edit-patient').forEach(btn => {
    btn.onclick = function() {
      const row = btn.closest('tr');
      if (!row) return;
      
      const id = row.dataset.id;
      const nameElement = row.querySelector('strong');
      const patient_name = nameElement ? nameElement.innerText.trim() : '';
      const contact = row.children[1] ? row.children[1].innerText.trim() : '';
      const email = row.dataset.email || '';
      const address = row.dataset.address || '';
      const lastVisit = row.dataset.lastVisit || '';
      
      // Medical information fields
      const medicalHistory = row.dataset.medicalHistory || '';
      const clinicalFindings = row.dataset.clinicalFindings || '';
      const diagnosticTests = row.dataset.diagnosticTests || '';
      const diagnosis = row.dataset.diagnosis || '';
      const conclusion = row.dataset.conclusion || '';

      addPatientForm.reset();
      addPatientForm.patient_name.value = patient_name;
      addPatientForm.contact.value = contact;
      addPatientForm.email.value = email;
      addPatientForm.address.value = address;
      
      // Populate medical information fields
      if (addPatientForm.medical_history) addPatientForm.medical_history.value = medicalHistory;
      if (addPatientForm.clinical_findings) addPatientForm.clinical_findings.value = clinicalFindings;
      if (addPatientForm.diagnostic_tests) addPatientForm.diagnostic_tests.value = diagnosticTests;
      if (addPatientForm.diagnosis) addPatientForm.diagnosis.value = diagnosis;
      if (addPatientForm.conclusion) addPatientForm.conclusion.value = conclusion;
      
      // Hide image preview when editing
      const imagePreview = document.getElementById('image-preview');
      if (imagePreview) {
        imagePreview.style.display = 'none';
      }
      
      // Show and populate last visit field for editing
      const lastVisitGroup = document.getElementById('last-visit-group');
      if (lastVisitGroup) {
        lastVisitGroup.style.display = 'block';
        if (addPatientForm.last_visit) {
          addPatientForm.last_visit.value = lastVisit;
        }
      }
      
      addPatientForm.dataset.editId = id;
      
      // Store original data for change detection
      originalPatientData = {
        patient_name: patient_name,
        contact: contact,
        email: email,
        address: address,
        last_visit: lastVisit,
        medical_history: medicalHistory,
        clinical_findings: clinicalFindings,
        diagnostic_tests: diagnosticTests,
        diagnosis: diagnosis,
        conclusion: conclusion
      };
      
      // Update modal title and text for editing
      const patientModalTitle = document.querySelector('#add-patient-modal .modal-title');
      const patientModalText = document.querySelector('#add-patient-modal .modal-text');
      if (patientModalTitle) patientModalTitle.textContent = 'Edit Patient';
      if (patientModalText) patientModalText.textContent = 'Update the patient details below.';
      
      addPatientModal.classList.add('show');
      patientSubmitBtn.textContent = 'Confirm';
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

// PDF Export functionality
const exportPdfBtn = document.getElementById('export-patient-pdf');
if (exportPdfBtn) {
  exportPdfBtn.addEventListener('click', function() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    const name = document.getElementById('view-patient-name').textContent;
    const contact = document.getElementById('view-patient-contact').textContent;
    const email = document.getElementById('view-patient-email').textContent;
    const address = document.getElementById('view-patient-address').textContent;
    const lastVisit = document.getElementById('view-patient-last-visit').textContent;
    const created = document.getElementById('view-patient-created').textContent;
    const patientImg = document.getElementById('view-patient-image');
    
    // Medical information
    const medicalHistory = document.getElementById('view-medical-history').textContent || '—';
    const clinicalFindings = document.getElementById('view-clinical-findings').textContent || '—';
    const diagnosticTests = document.getElementById('view-diagnostic-tests').textContent || '—';
    const diagnosis = document.getElementById('view-diagnosis').textContent || '—';
    const conclusion = document.getElementById('view-conclusion').textContent || '—';
    
    // Helper function to check if content is meaningful
    const hasContent = (text) => {
      return text && text.trim() !== '' && text.trim() !== '—' && text.trim().toLowerCase() !== 'ha';
    };
    
    // Function to generate PDF with or without image
    const generatePDF = (imgData = null) => {
      // Header with background
      doc.setFillColor(102, 126, 234);
      doc.rect(0, 0, 210, 40, 'F');
      
      doc.setFontSize(22);
      doc.setTextColor(255, 255, 255);
      doc.setFont(undefined, 'bold');
      doc.text("Romero's Dental Clinic", 105, 18, { align: 'center' });
      
      doc.setFontSize(14);
      doc.setFont(undefined, 'normal');
      doc.text('Patient Medical Record', 105, 28, { align: 'center' });
      
      let y = 50;
      
      // Add patient image if available (larger, more visible)
      if (imgData) {
        try {
          // Draw circular border for image
          doc.setDrawColor(102, 126, 234);
          doc.setLineWidth(3);
          doc.circle(35, y + 15, 17, 'S');
          
          // Add patient image (circular)
          doc.addImage(imgData, 'PNG', 18, y - 2, 34, 34);
          
          // Patient name beside image
          doc.setFontSize(16);
          doc.setTextColor(30, 41, 59);
          doc.setFont(undefined, 'bold');
          doc.text(name, 58, y + 10);
          
          doc.setFontSize(10);
          doc.setTextColor(100, 116, 139);
          doc.setFont(undefined, 'normal');
          doc.text(contact, 58, y + 18);
          
          y += 40;
        } catch (error) {
          console.log('Error adding image to PDF:', error);
          // Fallback if image fails
          doc.setFontSize(16);
          doc.setTextColor(30, 41, 59);
          doc.setFont(undefined, 'bold');
          doc.text(name, 20, y);
          
          doc.setFontSize(10);
          doc.setTextColor(100, 116, 139);
          doc.setFont(undefined, 'normal');
          doc.text(contact, 20, y + 6);
          
          y += 18;
        }
      } else {
        // No image - just show name prominently
        doc.setFontSize(16);
        doc.setTextColor(30, 41, 59);
        doc.setFont(undefined, 'bold');
        doc.text(name, 20, y);
        
        doc.setFontSize(10);
        doc.setTextColor(100, 116, 139);
        doc.setFont(undefined, 'normal');
        doc.text(contact, 20, y + 6);
        
        y += 18;
      }
      
      // Divider line
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.5);
      doc.line(20, y, 190, y);
      y += 8;
      
      // Patient details section - two column layout
      doc.setFontSize(11);
      doc.setTextColor(0, 0, 0);
      
      const leftCol = 20;
      const rightCol = 110;
      const labelWidth = 25;
      
      // Left column
      doc.setFont(undefined, 'bold');
      doc.text('Email:', leftCol, y);
      doc.setFont(undefined, 'normal');
      doc.text(email || 'Not provided', leftCol + labelWidth, y);
      
      // Right column
      doc.setFont(undefined, 'bold');
      doc.text('Last Visit:', rightCol, y);
      doc.setFont(undefined, 'normal');
      doc.text(lastVisit, rightCol + labelWidth, y);
      
      y += 6;
      
      // Address (full width)
      doc.setFont(undefined, 'bold');
      doc.text('Address:', leftCol, y);
      doc.setFont(undefined, 'normal');
      const splitAddress = doc.splitTextToSize(address || 'Not provided', 150);
      doc.text(splitAddress, leftCol + labelWidth, y);
      
      y += (splitAddress.length * 5) + 8;
      
      // Medical Information Section Header
      doc.setFillColor(241, 245, 249);
      doc.rect(18, y - 4, 170, 10, 'F');
      
      doc.setFontSize(10);
      doc.setTextColor(30, 41, 59);
      doc.setFont(undefined, 'bold');
      doc.text('Medical Information', 22, y + 2);
      
      y += 15;
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      
      // Only show medical fields that have content
      const medicalFields = [
        { label: 'Medical & Dental History', content: medicalHistory },
        { label: 'Clinical Examination Findings', content: clinicalFindings },
        { label: 'Diagnostic Tests', content: diagnosticTests },
        { label: 'Diagnosis', content: diagnosis },
        { label: 'Conclusion', content: conclusion }
      ];
      
      let hasAnyMedicalInfo = false;
      
      medicalFields.forEach(field => {
        if (hasContent(field.content)) {
          hasAnyMedicalInfo = true;
          
          // Check if we need a new page
          if (y > 240) {
            doc.addPage();
            y = 20;
          }
          
          // Field label with better spacing
          doc.setFont(undefined, 'bold');
          doc.setTextColor(51, 65, 85);
          doc.text(field.label + ':', 20, y);
          y += 7;
          
          // Field content with better formatting and indentation
          doc.setFont(undefined, 'normal');
          doc.setTextColor(0, 0, 0);
          const splitContent = doc.splitTextToSize(field.content, 165);
          doc.text(splitContent, 25, y);
          y += (splitContent.length * 5) + 8;
        }
      });
      
      // If no medical information, show message
      if (!hasAnyMedicalInfo) {
        doc.setFont(undefined, 'italic');
        doc.setTextColor(148, 163, 184);
        doc.text('No medical information recorded yet.', 22, y);
        y += 10;
      }
      
      y += 5;
      y += 5;
      
      // Footer on all pages
      const pageCount = doc.internal.getNumberOfPages();
      const currentDate = new Date().toLocaleString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit' 
      });
      
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        
        // Footer line
        doc.setLineWidth(0.3);
        doc.setDrawColor(226, 232, 240);
        doc.line(20, 280, 190, 280);
        
        // Footer text
        doc.setFontSize(8);
        doc.setTextColor(148, 163, 184);
        doc.text(`Generated: ${currentDate}`, 20, 285);
        doc.text("Romero's Dental Clinic", 105, 285, { align: 'center' });
        doc.text(`Page ${i}/${pageCount}`, 190, 285, { align: 'right' });
      }
      
      // Save PDF
      const fileName = `Patient_${name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(fileName);
      showNotification('PDF exported successfully!', 'success');
    };
    
    // Check if patient has an image
    if (patientImg && patientImg.src && patientImg.style.display !== 'none') {
      // Convert image to base64 for PDF with circular clipping
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.crossOrigin = 'Anonymous';
      img.onload = function() {
        // Set canvas size for circular image
        const size = 500; // Higher resolution for better quality
        canvas.width = size;
        canvas.height = size;
        
        // Fill with transparent background
        ctx.clearRect(0, 0, size, size);
        
        // Create circular clipping path
        ctx.beginPath();
        ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();
        
        // Calculate dimensions to completely fill the circle (cover mode)
        const scale = Math.max(size / img.width, size / img.height);
        const scaledWidth = img.width * scale;
        const scaledHeight = img.height * scale;
        
        // Center the image
        const offsetX = (size - scaledWidth) / 2;
        const offsetY = (size - scaledHeight) / 2;
        
        // Draw the image centered and scaled to fill entire circle
        ctx.drawImage(img, offsetX, offsetY, scaledWidth, scaledHeight);
        
        // Get base64 image data as PNG to preserve transparency
        const imgData = canvas.toDataURL('image/png', 1.0);
        generatePDF(imgData);
      };
      
      img.onerror = function() {
        console.log('Error loading image, generating PDF without image');
        generatePDF();
      };
      
      img.src = patientImg.src;
    } else {
      // No image available, generate PDF without image
      generatePDF();
    }
  });
}

// Store original patient data for change detection
let originalPatientData = {};

// Update form submission to handle file upload
addPatientForm.addEventListener('submit', function(e) {
  e.preventDefault();

  // Remove previous error states
  addPatientForm.querySelectorAll('.form-input').forEach(input => {
    input.classList.remove('error');
  });

  // Client-side validation
  const patientName = addPatientForm.patient_name.value.trim();
  const contact = addPatientForm.contact.value.trim();
  const email = addPatientForm.email.value.trim();

  // Error handling for required fields
  if (!patientName || !contact) {
    let errorMessage = '';
    if (!patientName) {
      addPatientForm.patient_name.classList.add('error');
      errorMessage = 'Patient name is required';
      addPatientForm.patient_name.focus();
    } else if (!contact) {
      addPatientForm.contact.classList.add('error');
      errorMessage = 'Contact number is required';
      addPatientForm.contact.focus();
    }
    
    Swal.fire({
      icon: 'error',
      title: 'Required Field Missing',
      text: errorMessage,
      confirmButtonColor: '#4c6ef5'
    });
    return;
  }

  // Patient name validation: must contain letters, not just numbers or special characters
  const namePattern = /^[A-Za-zÀ-ÿ\s\.\-']+$/;
  if (!namePattern.test(patientName)) {
    addPatientForm.patient_name.classList.add('error');
    addPatientForm.patient_name.focus();
    Swal.fire({
      icon: 'error',
      title: 'Invalid Name Format',
      text: 'Patient name can only contain letters, spaces, dots, hyphens, and apostrophes.',
      confirmButtonColor: '#4c6ef5'
    });
    return;
  }

  // Patient name length validation
  if (patientName.length < 2 || patientName.length > 100) {
    addPatientForm.patient_name.classList.add('error');
    addPatientForm.patient_name.focus();
    Swal.fire({
      icon: 'error',
      title: 'Invalid Name Length',
      text: 'Patient name must be between 2 and 100 characters.',
      confirmButtonColor: '#4c6ef5'
    });
    return;
  }

  // Validate contact number format
  const contactPattern = /^[0-9+\-\s()]+$/;
  if (!contactPattern.test(contact)) {
    addPatientForm.contact.classList.add('error');
    addPatientForm.contact.focus();
    Swal.fire({
      icon: 'error',
      title: 'Invalid Contact Format',
      text: 'Contact number can only contain numbers, +, -, spaces, and parentheses.',
      confirmButtonColor: '#4c6ef5'
    });
    return;
  }

  const contactDigits = contact.replace(/[\s\-\(\)+]/g, '');
  if (contactDigits.length < 10 || contactDigits.length > 20) {
    addPatientForm.contact.classList.add('error');
    addPatientForm.contact.focus();
    Swal.fire({
      icon: 'error',
      title: 'Invalid Contact Length',
      text: 'Contact number must contain between 10 and 20 digits.',
      confirmButtonColor: '#4c6ef5'
    });
    return;
  }

  // Validate email format if provided
  if (email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      addPatientForm.email.classList.add('error');
      addPatientForm.email.focus();
      Swal.fire({
        icon: 'error',
        title: 'Invalid Email Format',
        text: 'Please enter a valid email address.',
        confirmButtonColor: '#4c6ef5'
      });
      return;
    }
  }

  const form = e.target;
  const isEditing = !!form.dataset.editId;
  
  // Check for duplicate patient before proceeding
  checkDuplicatePatient(patientName, contact, email, isEditing ? form.dataset.editId : 0, () => {
    // Continue with the rest of the logic if no duplicate found
    proceedWithPatientSubmission(form, isEditing, patientName, contact, email);
  });
});

function checkDuplicatePatient(patientName, contact, email, excludeId, callback) {
  const formData = new FormData();
  formData.append('patient_name', patientName);
  formData.append('contact', contact);
  formData.append('email', email);
  formData.append('exclude_id', excludeId);

  fetch('check_duplicate_patient.php', {
    method: 'POST',
    body: formData
  })
  .then(res => res.json())
  .then(data => {
    if (data.status === 'duplicate') {
      Swal.fire({
        icon: 'warning',
        title: 'Duplicate Patient Detected',
        html: `A patient with similar information already exists:<br><br><strong>${data.duplicate_fields.join('<br>')}</strong><br><br>Please check the patient records before adding.`,
        confirmButtonColor: '#4c6ef5'
      });
    } else {
      callback(); // No duplicate, proceed
    }
  })
  .catch(error => {
    console.error('Duplicate check error:', error);
    callback(); // On error, allow to proceed
  });
}

function proceedWithPatientSubmission(form, isEditing, patientName, contact, email) {
  // Check if any fields changed (for edit mode)
  if (isEditing) {
    const currentData = {
      patient_name: patientName,
      contact: contact,
      email: email,
      address: addPatientForm.address.value.trim(),
      last_visit: addPatientForm.last_visit ? addPatientForm.last_visit.value : '',
      medical_history: addPatientForm.medical_history.value.trim(),
      clinical_findings: addPatientForm.clinical_findings.value.trim(),
      diagnostic_tests: addPatientForm.diagnostic_tests.value.trim(),
      diagnosis: addPatientForm.diagnosis.value.trim(),
      conclusion: addPatientForm.conclusion.value.trim()
    };

    const hasFileChanged = addPatientForm.patient_image.files.length > 0;
    const hasDataChanged = Object.keys(currentData).some(key => 
      currentData[key] !== (originalPatientData[key] || '')
    );

    if (!hasDataChanged && !hasFileChanged) {
      Swal.fire({
        icon: 'warning',
        title: 'No Changes Detected',
        text: 'Please modify at least one field to update.',
        confirmButtonColor: '#4c6ef5'
      });
      return;
    }

    // Check if critical fields (name, contact, email) are being changed
    const criticalFieldsChanged = 
      currentData.patient_name !== originalPatientData.patient_name ||
      currentData.contact !== originalPatientData.contact ||
      currentData.email !== originalPatientData.email;

    if (criticalFieldsChanged) {
      // Show confirmation dialog for credential changes
      Swal.fire({
        title: 'Confirm Credential Changes',
        html: 'You are about to change patient credentials:<br><strong>Name, Contact, or Email</strong><br><br>Are you sure you want to proceed?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#4c6ef5',
        cancelButtonColor: '#dc3545',
        confirmButtonText: 'Yes, update credentials',
        cancelButtonText: 'Cancel'
      }).then((result) => {
        if (result.isConfirmed) {
          submitPatientForm(form, isEditing);
        }
      });
      return;
    }
  }
  
  submitPatientForm(form, isEditing);
}

function submitPatientForm(form, isEditing) {
  const formData = new FormData(form);
  let url = 'add_patient.php';
  
  if (isEditing) {
    formData.append('id', form.dataset.editId);
    url = 'edit_patient.php';
  }
  
  // Close modal and show loading
  addPatientModal.classList.remove('show');
  showLoading(isEditing ? 'Updating patient...' : 'Adding patient...');
  
  fetch(url, {
    method: 'POST',
    body: formData
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
      form.reset();
      const imagePreview = document.getElementById('image-preview');
      if (imagePreview) {
        imagePreview.style.display = 'none';
      }
      delete form.dataset.editId;
      originalPatientData = {};
      
      refreshPatientTable();
    }
  })
  .catch((error) => {
    Swal.close();
    console.error('Error:', error);
    showNotification('Server error. Please check your connection and try again.', 'error');
  });
}

function refreshPatientTable() {
  return fetch('patient_table.php')
    .then(res => res.text())
    .then(html => {
      document.getElementById('patient-table-body').innerHTML = html;
      attachPatientRowEvents();
    });
}