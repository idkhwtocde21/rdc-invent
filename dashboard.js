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
    .then((data) => {
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
const addItemBtn = document.getElementById('open-add-inventory-modal');
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
      const item_name = row.children[0].querySelector('strong').innerText.trim();
      const category = row.children[1].innerText.trim();
      const quantity = row.children[2].innerText.trim();
      const status = row.children[3].innerText.replace(/[^a-zA-Z ]/g, '').trim();

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
  
  // Hide last visit field for new patients
  document.getElementById('last-visit-group').style.display = 'none';
  
  // Hide image preview for new patients
  const imagePreview = document.getElementById('image-preview');
  if (imagePreview) {
    imagePreview.style.display = 'none';
  }
  
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

      viewModal.classList.add('show');
      hideNotification();
    };
  });

  // Edit Patient Handler
  document.querySelectorAll('.edit-patient').forEach(btn => {
    btn.onclick = function() {
      const row = btn.closest('tr');
      const id = row.dataset.id;
      const patient_name = row.children[0].querySelector('strong').innerText.trim();
      const contact = row.children[1].innerText.trim();
      const email = row.dataset.email || '';
      const address = row.dataset.address || '';
      const lastVisit = row.dataset.lastVisit || '';

      addPatientForm.reset();
      addPatientForm.patient_name.value = patient_name;
      addPatientForm.contact.value = contact;
      addPatientForm.email.value = email;
      addPatientForm.address.value = address;
      
      // Hide image preview when editing
      const imagePreview = document.getElementById('image-preview');
      if (imagePreview) {
        imagePreview.style.display = 'none';
      }
      
      // Show and populate last visit field for editing
      const lastVisitGroup = document.getElementById('last-visit-group');
      if (lastVisitGroup) {
        lastVisitGroup.style.display = 'block';
        addPatientForm.last_visit.value = lastVisit;
      }
      
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
    
    // Function to generate PDF with or without image
    const generatePDF = (imgData = null) => {
      // Header
      doc.setFontSize(20);
      doc.setTextColor(102, 126, 234);
      doc.text("Romero's Dental Clinic", 105, 20, { align: 'center' });
      
      doc.setFontSize(16);
      doc.setTextColor(0, 0, 0);
      doc.text('Patient Record', 105, 30, { align: 'center' });
      
      // Add horizontal line
      doc.setLineWidth(0.5);
      doc.setDrawColor(102, 126, 234);
      doc.line(20, 35, 190, 35);
      
      let y = 50;
      
      // Add patient image if available
      if (imgData) {
        try {
          // Add colored border circle
          doc.setDrawColor(102, 126, 234);
          doc.setLineWidth(3);
          doc.circle(105, y + 21, 22, 'S');
          
          // Add the circular clipped image on top (fills entire circle)
          doc.addImage(imgData, 'PNG', 83, y - 1, 44, 44);
          
          y += 55;
        } catch (error) {
          console.log('Error adding image to PDF:', error);
          // Continue without image - just add space
          y += 10;
        }
      } else {
        // No placeholder - just continue with patient details
        y += 10;
      }
      
      // Patient details
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      
      doc.setFont(undefined, 'bold');
      doc.text('Name:', 20, y);
      doc.setFont(undefined, 'normal');
      doc.text(name, 60, y);
      
      y += 10;
      doc.setFont(undefined, 'bold');
      doc.text('Contact:', 20, y);
      doc.setFont(undefined, 'normal');
      doc.text(contact, 60, y);
      
      y += 10;
      doc.setFont(undefined, 'bold');
      doc.text('Email:', 20, y);
      doc.setFont(undefined, 'normal');
      doc.text(email, 60, y);
      
      y += 10;
      doc.setFont(undefined, 'bold');
      doc.text('Address:', 20, y);
      doc.setFont(undefined, 'normal');
      const splitAddress = doc.splitTextToSize(address, 130);
      doc.text(splitAddress, 60, y);
      
      y += (splitAddress.length * 7) + 3;
      doc.setFont(undefined, 'bold');
      doc.text('Last Visit:', 20, y);
      doc.setFont(undefined, 'normal');
      doc.text(lastVisit, 60, y);
      
      y += 15;
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text(created, 20, y);
      
      // Footer
      doc.setLineWidth(0.3);
      doc.setDrawColor(200, 200, 200);
      doc.line(20, 275, 190, 275);
      
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text('Generated on: ' + new Date().toLocaleString(), 105, 280, { align: 'center' });
      doc.text("Romero's Dental Clinic - Patient Management System", 105, 285, { align: 'center' });
      
      // Save PDF
      const fileName = `patient_${name.replace(/\s+/g, '_')}_record.pdf`;
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
  const formData = new FormData(form); // This will handle file uploads
  let url = 'add_patient.php';
  const isEditing = !!form.dataset.editId;
  
  if (isEditing) {
    formData.append('id', form.dataset.editId);
    url = 'edit_patient.php';
  }
  
  fetch(url, {
    method: 'POST',
    body: formData // Don't set Content-Type header, let browser set it
  })
  .then(res => res.json())
  .then(data => {
    showNotification(data.message, data.status === 'success' ? 'success' : 'error');
    if (data.status === 'success') {
      form.reset();
      const imagePreview = document.getElementById('image-preview');
      if (imagePreview) {
        imagePreview.style.display = 'none';
      }
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