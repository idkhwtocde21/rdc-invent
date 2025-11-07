document.addEventListener('DOMContentLoaded', function() {
  // Hero section navigation
  const heroSection = document.getElementById('hero-section');
  const loginContainer = document.getElementById('login-container');
  const backToHeroBtn = document.getElementById('back-to-hero');
  const gotoLoginBtn = document.getElementById('goto-login');

  gotoLoginBtn.addEventListener('click', () => {
    heroSection.classList.add('hidden');
    loginContainer.classList.remove('hidden');
    backToHeroBtn.classList.remove('hidden');
  });

  backToHeroBtn.addEventListener('click', () => {
    loginContainer.classList.add('hidden');
    backToHeroBtn.classList.add('hidden');
    heroSection.classList.remove('hidden');
    hideNotification();
  });

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
      icon.className = type === 'success' ? 'fas fa-check-circle notification-icon' : 'fas fa-times-circle notification-icon';
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

    // Show loading screen
    const loadingScreen = document.getElementById('loading-screen');
    loadingScreen.classList.add('active');

    fetch('login_handler.php', {
      method: 'POST',
      body: formData
    })
    .then(res => res.json())
    .then(data => {
      if (data.status === 'success') {
        // Keep loading screen and redirect after delay
        setTimeout(() => {
          window.location.href = data.redirect;
        }, 1500);
      } else {
        // Hide loading screen and show error
        loadingScreen.classList.remove('active');
        showNotification(data.message, 'error');
      }
    })
    .catch(err => {
      loadingScreen.classList.remove('active');
      showNotification('An error occurred. Please try again.', 'error');
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
        eyeIcon.className = 'fas fa-eye-slash eye-icon';
      } else {
        input.type = 'password';
        this.classList.remove('active');
        eyeIcon.className = 'fas fa-eye eye-icon';
      }
    });
  });
});