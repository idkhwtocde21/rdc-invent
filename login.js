// Toggle between login and signup
document.getElementById('show-signup').addEventListener('click', (e) => {
  e.preventDefault();
  document.getElementById('login-box').classList.add('hidden');
  document.getElementById('signup-box').classList.remove('hidden');
  hideNotification();
});

document.getElementById('show-login').addEventListener('click', (e) => {
  e.preventDefault();
  document.getElementById('signup-box').classList.add('hidden');
  document.getElementById('login-box').classList.remove('hidden');
  hideNotification();
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
  
  // Ensure previous animation is cleared
  notification.classList.remove('show', 'hide', 'success', 'error');
  notification.style.display = 'none';
  
  // Small delay to ensure CSS reset
  setTimeout(() => {
    notificationText.textContent = message;
    icon.textContent = type === 'success' ? '✓' : '✕';
    notification.className = 'notification show ' + type;
    notification.style.display = 'flex';
    
    // Hide after 3.5 seconds
    notificationTimeout = setTimeout(() => {
      hideNotification();
    }, 3500);
  }, 50);
}

function hideNotification() {
  const notification = document.getElementById('notification');
  if (!notification) return;
  
  // Clear timeout
  if (notificationTimeout) {
    clearTimeout(notificationTimeout);
    notificationTimeout = null;
  }
  
  // Only hide if currently showing
  if (notification.classList.contains('show')) {
    notification.classList.remove('show');
    notification.classList.add('hide');
    
    // After animation completes, fully hide
    setTimeout(() => {
      notification.style.display = 'none';
      notification.classList.remove('hide', 'success', 'error');
    }, 400);
  }
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
      }, 2500);
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
      setTimeout(() => {
        document.getElementById('show-login').click();
      }, 2500);
    }
  })
  .catch(() => {
    showNotification('Server error. Please try again.', 'error');
  });
});