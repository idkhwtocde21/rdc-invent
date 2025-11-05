document.addEventListener('DOMContentLoaded', function() {
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

  // Notification system
  let notificationTimeout = null;

  function showNotification(message, type = 'success') {
    const notification = document.getElementById('notification');
    const notificationText = document.getElementById('notification-text');
    const icon = notification.querySelector('.notification-icon');
    
    if (notificationTimeout) {
      clearTimeout(notificationTimeout);
    }
    
    notification.classList.remove('show', 'hide', 'success', 'error');
    notification.style.display = 'none';
    
    setTimeout(() => {
      notificationText.textContent = message;
      icon.textContent = type === 'success' ? '✓' : '✕';
      notification.className = 'notification show ' + type;
      notification.style.display = 'flex';
      
      notificationTimeout = setTimeout(() => {
        hideNotification();
      }, 3500);
    }, 50);
  }

  function hideNotification() {
    const notification = document.getElementById('notification');
    if (!notification) return;
    
    if (notificationTimeout) {
      clearTimeout(notificationTimeout);
      notificationTimeout = null;
    }
    
    if (notification.classList.contains('show')) {
      notification.classList.remove('show');
      notification.classList.add('hide');
      
      setTimeout(() => {
        notification.style.display = 'none';
        notification.classList.remove('hide', 'success', 'error');
      }, 400);
    }
  }

  // Login Form Handler - UPDATED
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
          window.location.href = data.redirect; // Use dynamic redirect
        }, 1500);
      }
    })
    .catch(() => {
      showNotification('✕ Server error. Please try again.', 'error');
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
      showNotification('✕ Server error. Please try again.', 'error');
    });
  });

  // Password visibility toggle
  document.querySelectorAll('.password-toggle').forEach(btn => {
    btn.addEventListener('click', function() {
      const inputWrapper = this.parentElement;
      const input = inputWrapper.querySelector('input[type="password"], input[type="text"]');
      const eyeIcon = this.querySelector('.eye-icon');
      
      if (input.type === 'password') {
        input.type = 'text';
        this.classList.add('active');
        eyeIcon.textContent = '👁️‍🗨️';
      } else {
        input.type = 'password';
        this.classList.remove('active');
        eyeIcon.textContent = '👁️';
      }
    });
  });
});