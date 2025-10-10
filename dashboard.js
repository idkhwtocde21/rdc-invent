document.addEventListener("DOMContentLoaded", () => {
    // Sidebar navigation
    const menuSettings = document.getElementById("menu-settings");
    const menuPatients = document.getElementById("menu-patients");
    const menuInventory = document.getElementById("menu-inventory");
    const settingsSection = document.getElementById("settings-section");
    const patientsSection = document.getElementById("patients-section");
    const inventorySection = document.getElementById("inventory-section");

    function showSection(section) {
        [settingsSection, patientsSection, inventorySection].forEach(sec => {
            sec.style.display = "none";
            sec.classList.remove("fade-in");
        });
        section.style.display = "";
        setTimeout(() => section.classList.add("fade-in"), 10);
    }

    menuSettings.addEventListener("click", () => {
        menuSettings.classList.add("active");
        menuPatients.classList.remove("active");
        menuInventory.classList.remove("active");
        showSection(settingsSection);
    });
    menuPatients.addEventListener("click", () => {
        menuSettings.classList.remove("active");
        menuPatients.classList.add("active");
        menuInventory.classList.remove("active");
        showSection(patientsSection);
    });
    menuInventory.addEventListener("click", () => {
        menuSettings.classList.remove("active");
        menuPatients.classList.remove("active");
        menuInventory.classList.add("active");
        showSection(inventorySection);
    });

    // User Settings AJAX
    const settingsForm = document.getElementById("settingsForm");
    const settingsNotifier = document.getElementById("settings-notifier");
    const globalNotifier = document.getElementById("global-notifier");
    settingsForm.addEventListener("submit", function(e) {
        e.preventDefault();
        const formData = new FormData(settingsForm);
        fetch("update_settings.php", {
            method: "POST",
            body: formData
        })
        .then(res => res.json())
        .then(data => {
            settingsNotifier.textContent = data.message;
            settingsNotifier.className = "notifier";
            if (data.status === "success") {
                settingsNotifier.classList.add("success");
            } else {
                settingsNotifier.classList.add("error");
            }
            settingsNotifier.classList.add("show");
            setTimeout(() => settingsNotifier.classList.remove("show"), 3000);
        })
        .catch(() => {
            settingsNotifier.textContent = "❌ Server error.";
            settingsNotifier.className = "notifier error show";
            setTimeout(() => settingsNotifier.classList.remove("show"), 3000);
        });
    });

    // Logout with popup message and delay
    const logoutBtn = document.getElementById("logout-btn");
    logoutBtn.addEventListener("click", function(e) {
        e.preventDefault();
        globalNotifier.textContent = "Logging out...";
        globalNotifier.className = "notifier show";
        setTimeout(() => {
            window.location.href = "logout.php";
        }, 1500);
    });

    // Initial animation
    showSection(settingsSection);
});

// Add fade-in animation for sections
// Add this CSS to dashboard.css:
/*
.fade-in {
    animation: fadeInUp 0.6s;
}
*/