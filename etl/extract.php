<?php

// Führerausweis-Daten einlesen
$handle = fopen(__DIR__ . '/data/fuehrerausweise_rohdaten.csv', 'r');

$header = array_map('trim', fgetcsv($handle, null, ';', '"', ''));

$licenseHolders = [];

while (($row = fgetcsv($handle, null, ';', '"', '')) !== false) {

    // Leere Zeilen überspringen
    if ($row[0] === '') {
        continue;
    }

    $licenseHolders[] = array_combine($header, $row);
}

fclose($handle);


// Unfall-Daten einlesen
$handle = fopen(__DIR__ . '/data/unfaelle_rohdaten.csv', 'r');

$header = array_map('trim', fgetcsv($handle, null, ';', '"', ''));

$accidents = [];

while (($row = fgetcsv($handle, null, ';', '"', '')) !== false) {

    // Leere Zeilen überspringen
    if ($row[0] === '') {
        continue;
    }

    $accidents[] = array_combine($header, $row);
}

fclose($handle);


// Beide Datensätze weitergeben
return [
    'license_holders' => $licenseHolders,
    'accidents' => $accidents
];