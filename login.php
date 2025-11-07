<?php 
session_start();

// Redirect to appropriate dashboard if already logged in
if (isset($_SESSION['user_id'])) {
    if ($_SESSION['role'] == 2) {
        header("Location: admin_dashboard.php");
    } else {
        header("Location: dashboard.php");
    }
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
  
  <!-- Font Awesome Icons -->
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
</head>
<body>
  
  <!-- Animated Background -->
  <div class="bg-animation">
    <span></span>
    <span></span>
    <span></span>
    <span></span>
    <span></span>
    <span></span>
  </div>

  <!-- Geometric Shapes Background -->
  <div class="bg-shapes">
    <div class="shape shape-circle"></div>
    <div class="shape shape-square"></div>
    <div class="shape shape-triangle"></div>
  </div>

  <!-- Hero Section -->
  <div class="hero-section" id="hero-section">
    <div class="hero-content">
      <div class="hero-logo">
        <img src="logos/rom_logo.png" alt="Romero's Dental Clinic Logo" class="hero-logo-img">
      </div>
      <h1 class="hero-title">Romero's Dental Clinic</h1>
      <p class="hero-subtitle">Your Smile, Our Priority</p>
      <p class="hero-description">Professional dental care with compassion and excellence. Join us in creating healthy, beautiful smiles.</p>
      <button class="hero-btn" id="goto-login">
        <span>Get Started</span>
        <i class="fas fa-arrow-right arrow"></i>
      </button>
    </div>
    <div class="hero-features">
      <div class="feature-card">
        <i class="fas fa-tooth feature-icon"></i>
        <h3>Expert Care</h3>
        <p>Experienced professionals</p>
      </div>
      <div class="feature-card">
        <i class="fas fa-heart feature-icon"></i>
        <h3>Patient First</h3>
        <p>Compassionate service</p>
      </div>
    </div>
  </div>

  <!-- Main Container -->
  <div class="container hidden" id="login-container">
    <!-- Login Form -->
    <div class="login-card" id="login-box">
      <div class="header">
        <div class="logo">
        <img src="logos/rom_logo.png" alt="Romero's Dental Clinic Logo" class="logo-img">
        </div>
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
              <i class="fas fa-eye eye-icon"></i>
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
        <div class="logo">
        <img src="logos/rom_logo.png" alt="Romero's Dental Clinic Logo" class="logo-img">
        </div>
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
              <i class="fas fa-eye eye-icon"></i>
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
              <i class="fas fa-eye eye-icon"></i>
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

  <!-- Back to Hero Button -->
  <button class="back-to-hero hidden" id="back-to-hero">
    <i class="fas fa-arrow-left"></i>
  </button>

  <!-- Notification -->
  <div class="notification" id="notification">
    <i class="fas fa-check-circle notification-icon"></i>
    <span class="notification-text" id="notification-text">Success!</span>
  </div>

  <script src="login.js"></script>
 
</body>
</html>