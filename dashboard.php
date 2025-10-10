<?php
session_start();
include("db.php");

// Redirect if not logged in
if (!isset($_SESSION['user_id'])) {
    header("Location: login.php");
    exit;
}

// Fetch user details
$user_id = $_SESSION['user_id'];
$stmt = $conn->prepare("SELECT username, email FROM users WHERE id=? LIMIT 1");
$stmt->bind_param("i", $user_id);
$stmt->execute();
$stmt->bind_result($username, $email);
$stmt->fetch();
$stmt->close();
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Dashboard - Romero's Dental Clinic</title>
    <link rel="stylesheet" href="dashboard.css">
</head>
<body>
<div class="dashboard-container">
    <aside class="sidebar">
        <h2>Menu</h2>
        <ul>
            <li class="active" id="menu-settings">User Settings</li>
            <li id="menu-patients">Patient List</li>
            <li id="menu-inventory">Inventory</li>
            <li><a href="#" id="logout-btn">Logout</a></li>
        </ul>
    </aside>
    <main class="main-content">
        <!-- Global Notifier for all actions -->
        <div class="notifier" id="global-notifier"></div>
        <!-- User Settings -->
        <section id="settings-section">
            <h2>User Settings</h2>
            <form id="settingsForm">
                <div class="input-group">
                    <label>Username</label>
                    <input type="text" name="username" value="<?php echo htmlspecialchars($username); ?>" required>
                </div>
                <div class="input-group">
                    <label>Email</label>
                    <input type="email" name="email" value="<?php echo htmlspecialchars($email); ?>" required>
                </div>
                <div class="input-group">
                    <label>New Password <small>(leave blank to keep current)</small></label>
                    <input type="password" name="password" placeholder="New password">
                </div>
                <button type="submit" class="btn">Update Settings</button>
            </form>
        </section>
        <!-- Placeholder for other sections -->
        <section id="patients-section" style="display:none;">
            <h2>Patient List</h2>
            <p>Coming soon...</p>
        </section>
        <section id="inventory-section" style="display:none;">
            <h2>Inventory</h2>
            <p>Coming soon...</p>
        </section>
    </main>
</div>
<script src="dashboard.js"></script>
</body>
</html>