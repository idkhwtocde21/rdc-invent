<?php session_start(); ?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Romero's Dental Clinic Login Page</title>
  <link rel="stylesheet" href="login.css">

  <script>
  document.addEventListener("DOMContentLoaded", function() {
  const bubbles = document.querySelectorAll('.background-animation span');
  const colors = [
    "#ffb6c1", "#ff69b4", "#ffe4ec", "#000", "#f8e1ff"
  ];
  const vw = () => Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
  const vh = () => Math.max(document.documentElement.clientHeight, window.innerHeight || 0);

  bubbles.forEach((bubble, i) => {
    // Randomize size, color, and initial position
    const size = Math.random() * 100 + 60; // 60px - 160px
    bubble.style.width = size + "px";
    bubble.style.height = size + "px";
    bubble.style.background = colors[Math.floor(Math.random() * colors.length)];
    moveBubble(bubble, true);
  });

  function moveBubble(bubble, first = false) {
    const maxX = vw() - parseFloat(bubble.style.width);
    const maxY = vh() - parseFloat(bubble.style.height);
    const left = Math.random() * maxX;
    const top = Math.random() * maxY;
    const duration = Math.random() * 8 + 8; // 8s - 16s

    if (first) {
      bubble.style.transition = "none";
      bubble.style.left = left + "px";
      bubble.style.top = top + "px";
      setTimeout(() => moveBubble(bubble), 100);
    } else {
      bubble.style.transition = `left ${duration}s linear, top ${duration}s linear`;
      bubble.style.left = left + "px";
      bubble.style.top = top + "px";
      setTimeout(() => moveBubble(bubble), duration * 1000);
    }
  }

  window.addEventListener('resize', () => {
    bubbles.forEach(bubble => moveBubble(bubble, true));
  });
});
</script>

</head>
<body>
  <header>
    Romero's Dental Clinic
  </header>

  <div class="container">
    <!-- Login Box -->
    <div class="login-box" id="login-box">
      <h2>Login</h2>
      <form id="loginForm" method="POST" action="login_action.php">
        <div class="input-group">
          <label for="username">Username / Email</label>
          <input type="text" name="username" id="username" placeholder="Enter your username or email" required>
        </div>

        <div class="input-group">
          <label for="password">Password</label>
          <input type="password" name="password" id="password" placeholder="Enter your password" required>
        </div>

        <button type="submit" class="btn">Login</button>
      </form>

      <div class="footer-text">
        <p>Don’t have an account? <a href="#" id="show-signup">Sign up</a></p>
      </div>
    </div>

    <!-- Signup Box -->
    <div class="login-box hidden" id="signup-box">
      <h2>Sign Up</h2>
      <form id="signupForm" method="POST" action="signup.php">
        <div class="input-group">
          <label for="signup-username">Username</label>
          <input type="text" name="username" id="signup-username" placeholder="Choose a username" required>
        </div>

        <div class="input-group">
          <label for="signup-email">Email</label>
          <input type="email" name="email" id="signup-email" placeholder="Enter your email" required>
        </div>

        <div class="input-group">
          <label for="signup-password">Password</label>
          <input type="password" name="password" id="signup-password" placeholder="Create a password" required>
        </div>

        <div class="input-group">
          <label for="signup-confirm">Confirm Password</label>
          <input type="password" name="confirm_password" id="signup-confirm" placeholder="Confirm your password" required>
        </div>

        <button type="submit" class="btn">Sign Up</button>
      </form>

      <div class="footer-text">
        <p>Already have an account? <a href="#" id="show-login">Login</a></p>
      </div>
    </div>
  </div>

  <!-- Notifier -->
  <div class="notifier" id="notifier">
    <p id="notifier-message"></p>
  </div>

  <!-- Background animation -->
  <div class="background-animation">    
    <span></span><span></span><span></span><span></span>
    <span></span><span></span><span></span><span></span>
    <span></span><span></span><span></span><span></span>
    <span></span><span></span><span></span><span></span>
    <span></span><span></span><span></span><span></span>
  </div>

  <script src="login.js"></script>
</body>
</html>
