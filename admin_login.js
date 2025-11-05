// Update the login form handler
document.getElementById('loginForm').addEventListener('submit', (e) => {
  e.preventDefault();
  
  const formData = new FormData(e.target);
  
  fetch('login_handler.php', {
    method: 'POST',
    body: formData
  })
  .then(res => res.json())
  .then(data => {
    showNotification(data.message, data.status);
    
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