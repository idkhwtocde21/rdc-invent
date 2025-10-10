document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("loginForm");
  const signupForm = document.getElementById("signupForm");
  const notifier = document.getElementById("notifier");
  const notifierMessage = document.getElementById("notifier-message");

  // show message
  function showMessage(msg, success = false) {
    notifierMessage.textContent = msg;
    notifier.classList.remove("success", "error");
    notifier.classList.add(success ? "success" : "error");
    notifier.classList.add("show");
    setTimeout(() => notifier.classList.remove("show"), 3000);
  }

  // Login AJAX
  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const formData = new FormData(loginForm);

    fetch("login_handler.php", {
      method: "POST",
      body: formData,
    })
      .then((res) => res.json())
      .then((data) => {
        showMessage(data.message, data.status === "success");
        if (data.status === "success") {
          setTimeout(() => {
            window.location.href = "dashboard.php";
          }, 1500);
        }
      })
      .catch(() => showMessage("❌ Server error."));
  });

  // Signup AJAX
  signupForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const formData = new FormData(signupForm);

    fetch("signup.php", {
      method: "POST",
      body: formData,
    })
      .then((res) => res.json())
      .then((data) => {
        showMessage(data.message, data.status === "success");
        if (data.status === "success") {
          signupForm.reset();
          document.getElementById("show-login").click();
        }
      })
      .catch(() => showMessage("❌ Server error."));
  });

  // Toggle forms
  document.getElementById("show-signup").addEventListener("click", () => {
    document.getElementById("login-box").classList.add("hidden");
    document.getElementById("signup-box").classList.remove("hidden");
  });
  document.getElementById("show-login").addEventListener("click", () => {
    document.getElementById("signup-box").classList.add("hidden");
    document.getElementById("login-box").classList.remove("hidden");
  });
});
