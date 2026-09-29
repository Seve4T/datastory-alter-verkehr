<?php

// ---------------------------------------------------------
// 1. DATEN AUS EXTRACT.PHP EINLESEN
// ---------------------------------------------------------
// extract.php liest beide CSV-Dateien ein und gibt
// sie als PHP-Arrays zurück.

$rawData = include __DIR__ . '/extract.php';

$licenseHoldersRaw = $rawData['license_holders'];
$accidentsRaw = $rawData['accidents'];


// ---------------------------------------------------------
// 2. AUDIT VORBEREITEN
// ---------------------------------------------------------
// Der Audit dokumentiert, wie viele Datensätze eingelesen
// und wie viele durch unsere Regeln herausgefiltert werden.

$audit = [
    'license_holders_input' => count($licenseHoldersRaw),
    'accidents_input' => count($accidentsRaw),

    'license_holders_filtered' => 0,
    'accidents_filtered' => 0
];


// ---------------------------------------------------------
// 3. ERLAUBTE ALTERSGRUPPEN FESTLEGEN
// ---------------------------------------------------------
// Für unsere Fragestellung verwenden wir nur diese
// acht Altersgruppen.

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

    // CLEAN:
    // Prüfen, ob Jahr und Führerausweisinhaber Zahlen sind.
    // Ungültige Datensätze werden nicht verwendet.
    if (
        !is_numeric($row['Jahr'])
        || !is_numeric($row['Führerausweisinhaber'])
    ) {
        $audit['license_holders_filtered']++;
        continue;
    }

    // Datentypen festlegen.
    $year = (int) $row['Jahr'];
    $ageGroup = trim($row['Altersgruppe']);
    $holders = (int) $row['Führerausweisinhaber'];


    // FILTER:
    // Nur die Jahre 2016 bis 2025 behalten.
    if ($year < 2016 || $year > 2025) {
        $audit['license_holders_filtered']++;
        continue;
    }


    // FILTER:
    // Nur die für unsere Analyse festgelegten
    // Altersgruppen behalten.
    if (!in_array($ageGroup, $allowedAgeGroups, true)) {
        $audit['license_holders_filtered']++;
        continue;
    }


    // RENAME:
    // Die ursprünglichen CSV-Felder werden auf die
    // Namen unseres Datenvertrags übertragen.
    $licenseHolders[] = [
        'year' => $year,
        'age_group' => $ageGroup,
        'license_holders' => $holders
    ];
}


// Anzahl der Führerausweis-Datensätze nach dem Transform.
$audit['license_holders_output'] = count($licenseHolders);


// ---------------------------------------------------------
// 5. UNFALLDATEN TRANSFORMIEREN
// ---------------------------------------------------------

$accidents = [];

foreach ($accidentsRaw as $row) {

    // CLEAN:
    // Alle Felder, die später als Zahlen benötigt werden,
    // müssen tatsächlich numerisch sein.
    if (
        !is_numeric($row['Jahr'])
        || !is_numeric($row['Beteiligungen an Unfällen mit Getöteten'])
        || !is_numeric($row['Beteiligungen an Unfällen mit Schwerverletzten'])
        || !is_numeric($row['Beteiligungen an Unfällen mit Leichtverletzten'])
        || !is_numeric($row['Ursächlich Beteiligte gesamt'])
    ) {
        $audit['accidents_filtered']++;
        continue;
    }


    // Werte aus den Rohdaten holen und Datentypen festlegen.
    $year = (int) $row['Jahr'];
    $ageGroup = trim($row['Altersgruppe']);

    $fatal =
        (int) $row['Beteiligungen an Unfällen mit Getöteten'];

    $seriousInjuries =
        (int) $row['Beteiligungen an Unfällen mit Schwerverletzten'];

    $minorInjuries =
        (int) $row['Beteiligungen an Unfällen mit Leichtverletzten'];

    $causallyInvolved =
        (int) $row['Ursächlich Beteiligte gesamt'];


    // FILTER:
    // Nur die Jahre 2016 bis 2025 behalten.
    if ($year < 2016 || $year > 2025) {
        $audit['accidents_filtered']++;
        continue;
    }


    // FILTER:
    // Nur die festgelegten Altersgruppen behalten.
    if (!in_array($ageGroup, $allowedAgeGroups, true)) {
        $audit['accidents_filtered']++;
        continue;
    }


    // RENAME:
    // Die ursprünglichen CSV-Felder werden auf die
    // Namen unseres Datenvertrags übertragen.
    $accidents[] = [
        'year' => $year,
        'age_group' => $ageGroup,
        'fatal' => $fatal,
        'serious_injuries' => $seriousInjuries,
        'minor_injuries' => $minorInjuries,
        'causally_involved' => $causallyInvolved
    ];
}


// Anzahl der Unfall-Datensätze nach dem Transform.
$audit['accidents_output'] = count($accidents);


// ---------------------------------------------------------
// 6. BEIDE DATENQUELLEN ZUSAMMENFÜHREN
// ---------------------------------------------------------
// Eine Zeile im fertigen Datensatz steht für:
// eine Altersgruppe in einem bestimmten Jahr.
//
// Deshalb verbinden wir Führerausweis- und Unfalldaten
// über Jahr + Altersgruppe.

$transformedData = [];

foreach ($accidents as $accident) {

    foreach ($licenseHolders as $license) {

        // Nur zusammenführen, wenn Jahr UND Altersgruppe
        // in beiden Datensätzen übereinstimmen.
        if (
            $accident['year'] === $license['year']
            && $accident['age_group'] === $license['age_group']
        ) {


            // -------------------------------------------------
            // 7. RATE PRO 100'000 BERECHNEN (DERIVE)
            // ---------------------------------------------------------
            // Ursächlich Beteiligte
            // / Führerausweisinhaber
            // × 100'000.
            //
            // Auf eine Dezimalstelle runden.

            $ratePer100k = round(
                $accident['causally_involved']
                / $license['license_holders']
                * 100000,
                1
            );


            // -------------------------------------------------
            // 8. ANTEIL SCHWER / TÖDLICH BERECHNEN (DERIVE)
            // ---------------------------------------------------------
            // Beteiligungen bei Unfällen mit Getöteten
            // + Beteiligungen bei Unfällen mit Schwerverletzten
            // / alle ursächlich Beteiligten
            // × 100.
            //
            // Auf eine Dezimalstelle runden.

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
            // Diese Struktur entspricht unserem Datenvertrag.

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


            // Passender Datensatz wurde gefunden.
            // Die innere Schleife muss nicht weiterlaufen.
            break;
        }
    }
}


// ---------------------------------------------------------
// 10. AUDIT ABSCHLIESSEN
// ---------------------------------------------------------
// Anzahl der fertigen Datensätze dokumentieren.

$audit['final_output'] = count($transformedData);


// ---------------------------------------------------------
// 11. DATEN ZURÜCKGEBEN
// ---------------------------------------------------------
// transform.php gibt die fertigen Daten und den Audit zurück.

return [
    'data' => $transformedData,
    'audit' => $audit
];