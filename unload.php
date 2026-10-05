<?php

header('Content-Type: application/json; charset=utf-8');


// ------------------- DIE DATENBANK-KONFIGURATION LADEN -------------------

require __DIR__ . '/config.php';


try {

    // ------------------- DATENBANKVERBINDUNG HERSTELLEN -------------------

    $pdo = new PDO($dsn, $username, $password, $options);

    //echo "Verbindung steht (unload).\n\n";

    // ------------------- DATEN AUS DATENBANK LESEN -------------------

    $sql = '
        SELECT
            year,
            age_group,
            license_holders,
            causally_involved,
            fatal,
            serious_injuries,
            minor_injuries,
            rate_per_100k,
            serious_share
        FROM traffic_stats
        ORDER BY year, age_group
    ';


    // ------------------- SQL AUSFÜHREN -------------------

    $statement = $pdo->prepare($sql);

    $statement->execute();

    $rows = $statement->fetchAll();


    // ------------------- DATEN ALS JSON AUSGEBEN -------------------

    echo json_encode(
        $rows,
        JSON_THROW_ON_ERROR | JSON_UNESCAPED_UNICODE
    );


} catch (Throwable $error) {

    // ------------------- FEHLER ALS JSON AUSGEBEN -------------------

    http_response_code(500);

    error_log($error->getMessage());

    echo json_encode([
        'error' => 'Die Daten konnten nicht geladen werden.'
    ]);
}