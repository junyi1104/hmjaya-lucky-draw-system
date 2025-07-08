<?php
if ($_SERVER["REQUEST_METHOD"] === "POST") {
    $name = trim($_POST["username"]);
    if (!empty($name)) {
        file_put_contents("names.txt", $name . "\n", FILE_APPEND);
    }
    header("Location: index.html");
    exit();
}
?>
