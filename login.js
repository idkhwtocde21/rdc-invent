// Toggle between login and signup
document.getElementById('show-signup').addEventListener('click', (e) => {
  e.preventDefault();
  document.getElementById('login-box').classList.add('hidden');
  document.getElementById('signup-box').classList.remove('hidden');
});

document.getElementById('show-login').addEventListener('click', (e) => {
  e.preventDefault();
  document.getElementById('signup-box').classList.add('hidden');
  document.getElementById('login-box').classList.remove('hidden');
});

// Notification system (improved with animations)
let notificationTimeout = null;

function showNotification(message, type = 'success') {
  const notification = document.getElementById('notification');
  const notificationText = document.getElementById('notification-text');
  const icon = notification.querySelector('.notification-icon');
  
  // Clear previous timeout
  if (notificationTimeout) {
    clearTimeout(notificationTimeout);
  }
  
  notificationText.textContent = message;
  notification.className = 'notification show ' + type;
  notification.style.display = 'flex';
  icon.textContent = type === 'success' ? '✓' : '✕';
  
  // Hide after 3000ms with animation
  notificationTimeout = setTimeout(() => {
    hideNotification();
  }, 3000);
}

function hideNotification() {
  const notification = document.getElementById('notification');
  if (!notification) return;
  
  // Clear timeout
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
  }, 400); // matches animation duration
}

// Login Form Handler
document.getElementById('loginForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const formData = new FormData(document.getElementById('loginForm'));

  fetch('login_handler.php', {
    method: 'POST',
    body: formData
  })
  .then(res => res.json())
  .then(data => {
    showNotification(data.message, data.status === 'success' ? 'success' : 'error');
    if (data.status === 'success') {
      setTimeout(() => {
        window.location.href = 'dashboard.php';
      }, 4500); // 4.5 seconds delay
    }
  })
  .catch(() => {
    showNotification('Server error. Please try again.', 'error');
  });
});

// Signup Form Handler
document.getElementById('signupForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const formData = new FormData(document.getElementById('signupForm'));

  fetch('signup.php', {
    method: 'POST',
    body: formData
  })
  .then(res => res.json())
  .then(data => {
    showNotification(data.message, data.status === 'success' ? 'success' : 'error');
    if (data.status === 'success') {
      document.getElementById('signupForm').reset();
      // Switch back to login form after successful signup
      setTimeout(() => {
        document.getElementById('show-login').click();
      }, 2500);
    }
  })
  .catch(() => {
    showNotification('Server error. Please try again.', 'error');
  });
});