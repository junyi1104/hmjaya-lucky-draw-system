<?php
header("Content-Type: application/vnd.ms-excel");
header("Content-Disposition: attachment; filename=names.xls");

$names = file("names.txt", FILE_IGNORE_NEW_LINES);
echo "Name\n";
foreach ($names as $name) {
    echo "$name\n";
}
?>
