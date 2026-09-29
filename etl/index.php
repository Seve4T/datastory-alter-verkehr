<?php

ini_set('display_errors', '1');
error_reporting(E_ALL);

$result = include __DIR__ . '/transform.php';

echo '<pre>';

echo "=== AUDIT ===\n";
print_r($result['audit']);

echo "\n=== DATEN ===\n";
print_r($result['data']);

echo '</pre>';