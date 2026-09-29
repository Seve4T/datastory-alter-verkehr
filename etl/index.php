<?php

// Transform ausführen.
// transform.php führt wiederum automatisch extract.php aus.
$result = include __DIR__ . '/transform.php';

echo '<pre>';

// Audit anzeigen
echo "=== AUDIT ===\n";
print_r($result['audit']);

// Transformierte Daten anzeigen
echo "\n=== TRANSFORMIERTE DATEN ===\n";
print_r($result['data']);

echo '</pre>';