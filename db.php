<?php

$server = "localhost";
$user = "root";
$pass = "";
$dbname = "rom";

$conn = new mysqli($server, $user, $pass, $dbname);
if($conn->connect_error){
die('Database is not connected, Failed' . $conn->connect_error);
}

?>
