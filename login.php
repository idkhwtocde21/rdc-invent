<?php 
session_start();

// Redirect to dashboard if already logged in
if (isset($_SESSION['user_id'])) {
    header("Location: dashboard.php");
    exit;
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Romero's Dental Clinic - Login</title>
  <link rel="stylesheet" href="login.css">
  <link rel="icon" type="image" href="logos/rom_logo.png">
</head>
<body>

  <!-- Main Container -->
  <div class="container">
    <!-- Login Form -->
    <div class="login-card" id="login-box">
      <div class="header">
        <div class="logo">🦷</div>
        <h1 class="title">Welcome Back</h1>
        <p class="subtitle">Romero's Dental Clinic</p>
      </div>

      <form id="loginForm">
        <div class="form-group">
          <label class="form-label" for="username">Username or Email</label>
          <div class="input-wrapper">
            <input 
              type="text" 
              class="form-input" 
              id="username" 
              name="username"
              placeholder="Enter your username or email"
              required
            >
          </div>
        </div>

        <!-- Login Form Password Field -->
        <div class="form-group">
          <label class="form-label">Password</label>
          <div class="input-wrapper">
            <input 
              type="password" 
              class="form-input" 
              name="password"
              placeholder="Enter your password"
              required
            >
            <button type="button" class="password-toggle" aria-label="Toggle password visibility">
              <span class="eye-icon">👁️</span>
            </button>
          </div>
        </div>

        <button type="submit" class="btn">Sign In</button>
      </form>

      <div class="footer">
        <p class="footer-text">
          Don't have an account? 
          <a href="#" class="footer-link" id="show-signup">Create one</a>
        </p>
      </div>
    </div>

    <!-- Signup Form -->
    <div class="login-card hidden" id="signup-box">
      <div class="header">
        <div class="logo">🦷</div>
        <h1 class="title">Create Account</h1>
        <p class="subtitle">Join Romero's Dental Clinic</p>
      </div>

      <form id="signupForm">
        <div class="form-group">
          <label class="form-label" for="signup-username">Username</label>
          <input 
            type="text" 
            class="form-input" 
            id="signup-username"
            name="username"
            placeholder="Choose a username"
            required
          >
        </div>

        <div class="form-group">
          <label class="form-label" for="signup-email">Email</label>
          <input 
            type="email" 
            class="form-input" 
            id="signup-email"
            name="email"
            placeholder="Enter your email"
            required
          >
        </div>

        <!-- Signup Form Password Field -->
        <div class="form-group">
          <label class="form-label" for="signup-password">Password</label>
          <div class="input-wrapper">
            <input 
              type="password" 
              class="form-input" 
              id="signup-password"
              name="password"
              placeholder="Create a password"
              required
            >
            <button type="button" class="password-toggle" aria-label="Toggle password visibility">
              <span class="eye-icon">👁️</span>
            </button>
          </div>
        </div>

        <!-- Signup Form Confirm Password Field -->
        <div class="form-group">
          <label class="form-label" for="signup-confirm">Confirm Password</label>
          <div class="input-wrapper">
            <input 
              type="password" 
              class="form-input" 
              id="signup-confirm"
              name="confirm_password"
              placeholder="Confirm your password"
              required
            >
            <button type="button" class="password-toggle" aria-label="Toggle password visibility">
              <span class="eye-icon">👁️</span>
            </button>
          </div>
        </div>

        <button type="submit" class="btn">Create Account</button>
      </form>

      <div class="footer">
        <p class="footer-text">
          Already have an account? 
          <a href="#" class="footer-link" id="show-login">Sign in</a>
        </p>
      </div>
    </div>
  </div>

  <!-- Notification -->
  <div class="notification" id="notification">
    <span class="notification-icon">✓</span>
    <span class="notification-text" id="notification-text">Success!</span>
  </div>

  <script src="login.js"></script>
 
</body>
</html>