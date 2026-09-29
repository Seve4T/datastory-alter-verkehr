<?php

// ---------------------------------------------------------
// 1. DATEN AUS EXTRACT.PHP EINLESEN
// ---------------------------------------------------------
// extract.php liest die beiden Roh-CSV-Dateien ein
// und gibt sie als PHP-Arrays zurück.

$rawData = include __DIR__ . '/extract.php';

$licenseHoldersRaw = $rawData['license_holders'];
$accidentsRaw = $rawData['accidents'];


// ---------------------------------------------------------
// 2. AUDIT VORBEREITEN
// ---------------------------------------------------------
// Hier dokumentieren wir, wie viele Datensätze
// hineinkommen, gefiltert werden und übrig bleiben.

$audit = [
    'license_holders_input' => count($licenseHoldersRaw),
    'accidents_input' => count($accidentsRaw),

    'license_holders_filtered' => 0,
    'accidents_filtered' => 0
];


// ---------------------------------------------------------
// 3. ERLAUBTE ALTERSGRUPPEN FESTLEGEN
// ---------------------------------------------------------
// Für unsere Hauptanalyse verwenden wir nur diese Gruppen.

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

    // Prüfen, ob die benötigten Zahlenwerte gültig sind.
    if (
        !isset($row['Jahr'], $row['Altersgruppe'], $row['Führerausweisinhaber'])
        || !is_numeric($row['Jahr'])
        || !is_numeric($row['Führerausweisinhaber'])
    ) {
        $audit['license_holders_filtered']++;
        continue;
    }

    // Werte aus den Rohdaten holen.
    $year = (int) $row['Jahr'];
    $ageGroup = trim($row['Altersgruppe']);
    $holders = (int) $row['Führerausweisinhaber'];


    // FILTER:
    // Nur Jahre 2016 bis 2025 behalten.
    if ($year < 2016 || $year > 2025) {
        $audit['license_holders_filtered']++;
        continue;
    }


    // FILTER:
    // Nur die festgelegten Altersgruppen behalten.
    if (!in_array($ageGroup, $allowedAgeGroups, true)) {
        $audit['license_holders_filtered']++;
        continue;
    }


    // RENAME:
    // Rohdaten-Felder in die Namen unseres Datenvertrags
    // überführen.
    $licenseHolders[] = [
        'year' => $year,
        'age_group' => $ageGroup,
        'license_holders' => $holders
    ];
}


// Anzahl der verbleibenden Führerausweis-Datensätze.
$audit['license_holders_output'] = count($licenseHolders);


// ---------------------------------------------------------
// 5. UNFALLDATEN TRANSFORMIEREN
// ---------------------------------------------------------

$accidents = [];

foreach ($accidentsRaw as $row) {

    // Prüfen, ob alle benötigten Felder vorhanden sind.
    if (
        !isset(
            $row['Jahr'],
            $row['Altersgruppe'],
            $row['Beteiligungen an Unfällen mit Getöteten'],
            $row['Beteiligungen an Unfällen mit Schwerverletzten'],
            $row['Beteiligungen an Unfällen mit Leichtverletzten'],
            $row['Ursächlich Beteiligte gesamt']
        )
    ) {
        $audit['accidents_filtered']++;
        continue;
    }


    // Prüfen, ob alle benötigten Zahlenwerte numerisch sind.
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


    // Werte aus den Rohdaten holen.
    $year = (int) $row['Jahr'];
    $ageGroup = trim($row['Altersgruppe']);

    $fatal = (int) $row['Beteiligungen an Unfällen mit Getöteten'];

    $seriousInjuries =
        (int) $row['Beteiligungen an Unfällen mit Schwerverletzten'];

    $minorInjuries =
        (int) $row['Beteiligungen an Unfällen mit Leichtverletzten'];

    $causallyInvolved =
        (int) $row['Ursächlich Beteiligte gesamt'];


    // FILTER:
    // Nur Jahre 2016 bis 2025 behalten.
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
    // Rohdaten-Felder in die Namen unseres Datenvertrags
    // überführen.
    $accidents[] = [
        'year' => $year,
        'age_group' => $ageGroup,
        'fatal' => $fatal,
        'serious_injuries' => $seriousInjuries,
        'minor_injuries' => $minorInjuries,
        'causally_involved' => $causallyInvolved
    ];
}


// Anzahl der verbleibenden Unfall-Datensätze.
$audit['accidents_output'] = count($accidents);


// ---------------------------------------------------------
// 6. BEIDE DATENQUELLEN ZUSAMMENFÜHREN
// ---------------------------------------------------------
// Eine fertige Zeile entspricht einer Altersgruppe
// in einem bestimmten Jahr.
//
// Verbunden wird über:
// year + age_group

$transformedData = [];

foreach ($accidents as $accident) {

    foreach ($licenseHolders as $license) {

        if (
            $accident['year'] === $license['year']
            && $accident['age_group'] === $license['age_group']
        ) {


            // -------------------------------------------------
            // 7. RATE PRO 100'000 BERECHNEN
            // ---------------------------------------------------------

            $ratePer100k = round(
                $accident['causally_involved']
                / $license['license_holders']
                * 100000,
                1
            );


            // -------------------------------------------------
            // 8. ANTEIL SCHWER / TÖDLICH BERECHNEN
            // ---------------------------------------------------------

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
            // 9. FINALEN DATENSATZ NACH DATENVERTRAG ERSTELLEN
            // ---------------------------------------------------------

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

            // Passender Datensatz gefunden.
            break;
        }
    }
}


// ---------------------------------------------------------
// 10. AUDIT ABSCHLIESSEN
// ---------------------------------------------------------

$audit['final_output'] = count($transformedData);


// ---------------------------------------------------------
// 11. DATEN ZURÜCKGEBEN
// ---------------------------------------------------------

return [
    'data' => $transformedData,
    'audit' => $audit
];