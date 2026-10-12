<?php

header('Content-Type: text/plain; charset=utf-8');


// ------------------- DIE DATENBANK-KONFIGURATION LADEN -------------------

require __DIR__ . '/../config.php';


// ------------------- DIE TRANSFORMIERTEN DATEN LADEN -------------------

$result = include __DIR__ . '/transform.php';
$rows = $result['data'];


// ------------------- TESTEN OB TRANSFORM FUNKTIONIERT UND AUSGEBEN -------------------

echo 'Der Transform liefert ' . count($rows) . " Zeilen.\n\n";


// ------------------- VERBINDUNG AUFBAUEN -------------------

try {

    $pdo = new PDO($dsn, $username, $password, $options);


    // ------------------- BESTEHENDEN DATENSTAND LEEREN -------------------
    // bedeutet vorherige Daten löschen damit keine Duplikate entstehen.

    $pdo->exec('DELETE FROM traffic_stats');


    // ------------------- INSERT VORBEREITEN -------------------

    $insert = $pdo->prepare(
        'INSERT INTO traffic_stats (
            year,
            age_group,
            license_holders,
            causally_involved,
            fatal,
            serious_injuries,
            minor_injuries,
            rate_per_100k,
            serious_share
        ) VALUES (
            :year,
            :age_group,
            :license_holders,
            :causally_involved,
            :fatal,
            :serious_injuries,
            :minor_injuries,
            :rate_per_100k,
            :serious_share
        )'
    );


    // ------------------- DATEN IN DATENBANK SCHREIBEN -------------------
    // Jeder transformierte Datensatz wird als eigene Zeile in traffic_stats gespeichert.

    foreach ($rows as $row) {

        $insert->execute([
            'year' => $row['year'],
            'age_group' => $row['age_group'],
            'license_holders' => $row['license_holders'],
            'causally_involved' => $row['causally_involved'],
            'fatal' => $row['fatal'],
            'serious_injuries' => $row['serious_injuries'],
            'minor_injuries' => $row['minor_injuries'],
            'rate_per_100k' => $row['rate_per_100k'],
            'serious_share' => $row['serious_share']
        ]);
    }


    // ------------------- ERFOLG AUSGEBEN -------------------

    echo count($rows) . " Zeilen wurden erfolgreich in die Datenbank geladen.\n";


} catch (PDOException $e) {

    exit(
        'Datenbankfehler: '
        . $e->getMessage()
        . "\n"
    );
}