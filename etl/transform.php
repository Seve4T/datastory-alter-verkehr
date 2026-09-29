<?php

// ---------------------------------------------------------
// 1. DATEN AUS EXTRACT.PHP EINLESEN
// ---------------------------------------------------------
// extract.php liest unsere beiden CSV-Dateien ein und gibt
// sie als PHP-Arrays zurück.

$rawData = include __DIR__ . '/extract.php';

// Die beiden Datensätze separat speichern.
$licenseHoldersRaw = $rawData['license_holders'];
$accidentsRaw = $rawData['accidents'];


// ---------------------------------------------------------
// 2. AUDIT VORBEREITEN
// ---------------------------------------------------------
// Im Audit halten wir fest, wie viele Datensätze
// hineinkommen, herausgefiltert werden und übrig bleiben.

$audit = [
    'license_holders_input' => count($licenseHoldersRaw),
    'accidents_input' => count($accidentsRaw),

    'license_holders_filtered' => 0,
    'accidents_filtered' => 0,

    'license_holders_output' => 0,
    'accidents_output' => 0,

    'final_output' => 0
];


// ---------------------------------------------------------
// 3. ERLAUBTE ALTERSGRUPPEN FESTLEGEN
// ---------------------------------------------------------
// Für unsere Fragestellung verwenden wir nur diese
// Altersgruppen.

$allowedAgeGroups = [
    '20-29',
    '30-39',
    '40-49',
    '50-59',
    '60-69',
    '70-79',
    '80-89',
    '90+'
];


// ---------------------------------------------------------
// 4. FÜHRERAUSWEISDATEN TRANSFORMIEREN
// ---------------------------------------------------------

$licenseHolders = [];

foreach ($licenseHoldersRaw as $row) {

    // Jahr und Altersgruppe aus den Rohdaten holen.
    $year = (int) $row['Jahr'];
    $ageGroup = trim($row['Altersgruppe']);


    // FILTER:
    // Nur Daten von 2016 bis 2025 behalten.
    if ($year < 2016 || $year > 2025) {
        $audit['license_holders_filtered']++;
        continue;
    }


    // FILTER:
    // Nur die für unsere Analyse definierten
    // Altersgruppen behalten.
    if (!in_array($ageGroup, $allowedAgeGroups, true)) {
        $audit['license_holders_filtered']++;
        continue;
    }


    // RENAME + TYPE:
    // Die ursprünglichen CSV-Felder werden auf die
    // Feldnamen unseres Datenvertrags übertragen.
    //
    // Zahlen aus einer CSV sind zunächst Text.
    // Deshalb wandeln wir die Anzahl hier in Integer um.

    $licenseHolders[] = [
        'year' => $year,
        'age_group' => $ageGroup,
        'license_holders' => (int) $row['F√ºhrerausweisinhaber']
    ];
}


// Anzahl der nach dem Filter verbleibenden Datensätze.
$audit['license_holders_output'] = count($licenseHolders);


// ---------------------------------------------------------
// 5. UNFALLDATEN TRANSFORMIEREN
// ---------------------------------------------------------

$accidents = [];

foreach ($accidentsRaw as $row) {

    // Jahr und Altersgruppe aus den Rohdaten holen.
    $year = (int) $row['Jahr'];
    $ageGroup = trim($row['Altersgruppe']);


    // FILTER:
    // Nur Daten von 2016 bis 2025 behalten.
    if ($year < 2016 || $year > 2025) {
        $audit['accidents_filtered']++;
        continue;
    }


    // FILTER:
    // Nur unsere definierten Altersgruppen behalten.
    if (!in_array($ageGroup, $allowedAgeGroups, true)) {
        $audit['accidents_filtered']++;
        continue;
    }


    // RENAME + TYPE:
    // Die ursprünglichen Feldnamen werden auf die
    // Namen unseres Datenvertrags übertragen.
    //
    // Gleichzeitig werden die Zahlen in Integer umgewandelt.

    $accidents[] = [
        'year' => $year,

        'age_group' => $ageGroup,

        'fatal' =>
            (int) $row['Beteiligungen an Unf√§llen mit Get√∂teten'],

        'serious_injuries' =>
            (int) $row['Beteiligungen an Unf√§llen mit Schwerverletzten'],

        'minor_injuries' =>
            (int) $row['Beteiligungen an Unf√§llen mit Leichtverletzten'],

        'causally_involved' =>
            (int) $row['Urs√§chlich Beteiligte gesamt']
    ];
}


// Anzahl der nach dem Filter verbleibenden Datensätze.
$audit['accidents_output'] = count($accidents);


// ---------------------------------------------------------
// 6. BEIDE DATENQUELLEN ZUSAMMENFÜHREN
// ---------------------------------------------------------
// Eine Zeile soll am Ende eine Altersgruppe in einem
// bestimmten Jahr darstellen.
//
// Deshalb verbinden wir Führerausweis- und Unfalldaten
// über die Kombination:
//
// Jahr + Altersgruppe

$transformedData = [];

foreach ($accidents as $accident) {

    foreach ($licenseHolders as $license) {

        // Prüfen, ob Jahr UND Altersgruppe übereinstimmen.
        if (
            $accident['year'] === $license['year']
            && $accident['age_group'] === $license['age_group']
        ) {


            // -------------------------------------------------
            // 7. RATE PRO 100'000 BERECHNEN
            // ---------------------------------------------------------
            // Anzahl ursächlich Beteiligter geteilt durch
            // Führerausweisinhaber × 100'000.
            //
            // Das Ergebnis wird auf eine Dezimalstelle gerundet.

            $ratePer100k = round(
                $accident['causally_involved']
                / $license['license_holders']
                * 100000,
                1
            );


            // -------------------------------------------------
            // 8. ANTEIL SCHWER / TÖDLICH BERECHNEN
            // ---------------------------------------------------------
            // Unfälle mit Getöteten + Schwerverletzten
            // geteilt durch alle ursächlich Beteiligten × 100.
            //
            // Auch hier runden wir auf eine Dezimalstelle.

            $seriousShare = round(
                (
                    $accident['fatal']
                    + $accident['serious_injuries']
                )
                / $accident['causally_involved']
                * 100,
                1
            );


            // -------------------------------------------------
            // 9. FINALEN DATENSATZ ERSTELLEN
            // ---------------------------------------------------------
            // Die Struktur entspricht jetzt unserem
            // festgelegten Datenvertrag.

            $transformedData[] = [
                'year' => $accident['year'],
                'age_group' => $accident['age_group'],
                'license_holders' => $license['license_holders'],
                'causally_involved' => $accident['causally_involved'],
                'rate_per_100k' => $ratePer100k,
                'fatal' => $accident['fatal'],
                'serious_injuries' => $accident['serious_injuries'],
                'minor_injuries' => $accident['minor_injuries'],
                'serious_share' => $seriousShare
            ];


            // Passender Führerausweis-Datensatz wurde gefunden.
            // Deshalb muss die innere Schleife nicht
            // weiter durchsucht werden.
            break;
        }
    }
}


// ---------------------------------------------------------
// 10. AUDIT ABSCHLIESSEN
// ---------------------------------------------------------
// Festhalten, wie viele fertige Datensätze entstanden sind.

$audit['final_output'] = count($transformedData);


// ---------------------------------------------------------
// 11. DATEN ZURÜCKGEBEN
// ---------------------------------------------------------
// transform.php gibt sowohl die fertigen Daten
// als auch den Audit zurück.

return [
    'data' => $transformedData,
    'audit' => $audit
];