// ========================================
// Chart.js – globale Bibliothek
// ========================================

/** @type {any} */
const Chart = window.Chart;


// ========================================
// Altersfrage oben und unten
// ========================================

const ageRange =
    document.querySelector('#ageRange');

const ageOutput =
    document.querySelector('#ageOutput');

const saveAgeButton =
    document.querySelector('#saveAge');

const saveMessage =
    document.querySelector('#saveMessage');


const finalAgeRange =
    document.querySelector('#finalAgeRange');

const finalAgeOutput =
    document.querySelector('#finalAgeOutput');

const saveFinalAgeButton =
    document.querySelector('#saveFinalAge');

const finalSaveMessage =
    document.querySelector('#finalSaveMessage');


// Gespeicherte Antwort laden

const savedAge =
    localStorage.getItem('selectedAge');


if (savedAge !== null) {

    ageRange.value = savedAge;
    ageOutput.textContent = savedAge;

    finalAgeRange.value = savedAge;
    finalAgeOutput.textContent = savedAge;
}


// Oberen Regler bewegen

ageRange.addEventListener('input', () => {

    const selectedAge =
        ageRange.value;

    ageOutput.textContent =
        selectedAge;

    finalAgeRange.value =
        selectedAge;

    finalAgeOutput.textContent =
        selectedAge;

    updateFinalAgeChart(
        Number(selectedAge)
    );
});


// Unteren Regler bewegen

finalAgeRange.addEventListener('input', () => {

    const selectedAge =
        finalAgeRange.value;

    finalAgeOutput.textContent =
        selectedAge;

    ageRange.value =
        selectedAge;

    ageOutput.textContent =
        selectedAge;

    updateFinalAgeChart(
        Number(selectedAge)
    );
});


// Antwort oben speichern

saveAgeButton.addEventListener('click', () => {

    const selectedAge =
        ageRange.value;

    localStorage.setItem(
        'selectedAge',
        selectedAge
    );

    finalAgeRange.value =
        selectedAge;

    finalAgeOutput.textContent =
        selectedAge;

    saveMessage.textContent =
        `Vielen Dank. Ihre Antwort: ${selectedAge} Jahre. Wir kommen am Ende des Artikels darauf zurück.`;

    finalSaveMessage.textContent =
        '';

    updateFinalAgeChart(
        Number(selectedAge)
    );
});


// Antwort unten anpassen

saveFinalAgeButton.addEventListener('click', () => {

    const selectedAge =
        finalAgeRange.value;

    localStorage.setItem(
        'selectedAge',
        selectedAge
    );

    ageRange.value =
        selectedAge;

    ageOutput.textContent =
        selectedAge;

    finalSaveMessage.textContent =
        `Ihre Antwort wurde angepasst: ${selectedAge} Jahre.`;

    saveMessage.textContent =
        `Ihre aktuelle Antwort: ${selectedAge} Jahre.`;

    updateFinalAgeChart(
        Number(selectedAge)
    );
});



// ========================================
// Daten laden
// ========================================

// Eine gemeinsame Anfrage für alle Diagramme
let trafficDataPromise = null;

function loadTrafficData() {

    // Wenn bereits eine Anfrage läuft oder
    // Daten geladen wurden, diese wiederverwenden.
    if (trafficDataPromise) {
        return trafficDataPromise;
    }

    // JSON nur einmal vom Server anfordern
    trafficDataPromise = fetch(
        'https://zu-alt-fuers-steuer-im3.isobopad.myhostpoint.ch/unload.php'
    )
        .then(response => {

            if (!response.ok) {
                throw new Error(
                    'Die Daten konnten nicht geladen werden.'
                );
            }

            return response.json();
        })
        .catch(error => {

            // Bei einem Fehler einen neuen Versuch erlauben
            trafficDataPromise = null;

            throw error;
        });

    return trafficDataPromise;
}

// ========================================
// Absolute Unfallzahlen 2025
// ========================================

const absoluteAccidentsCanvas =
    document.querySelector(
        '#absoluteAccidentsChart'
    );


async function createAbsoluteAccidentsChart() {

    const trafficData =
        await loadTrafficData();

    /* ========================================
       Daten für das Balkendiagramm vorbereiten
    ======================================== */

    // Für diese Grafik werden nur die
    // absoluten Unfallbeteiligungen von 2025 benötigt.

    const data2025 =
        trafficData.filter(row => {
            return Number(row.year) === 2025;
        });


    const labels =
        data2025.map(row => {
            return row.age_group;
        });


    const values =
        data2025.map(row => {
            return Number(
                row.causally_involved
            );
        });

    // Balkendiagramm erstellen

    new Chart(
        absoluteAccidentsCanvas,
        {
            type: 'bar',

            data: {
                labels: labels,

                datasets: [
                    {
                        label:
                            'Ursächlich beteiligte PW-Lenkende',

                        data:
                        values,

                        // Alle Balken einheitlich hellblau
                        backgroundColor:
                            '#8AB8F5',

                        // Hover-Farbe
                        hoverBackgroundColor:
                            '#E38500',

                        borderRadius:
                            6,

                        borderSkipped:
                            false
                    }
                ]
            },

            options: {
                responsive:
                    true,

                maintainAspectRatio:
                    false,

                plugins: {
                    legend: {
                        display:
                            false
                    },

                    tooltip: {
                        callbacks: {
                            label:
                                function (context) {

                                    return `${context.raw.toLocaleString('de-CH')} Beteiligte`;
                                }
                        }
                    }
                },

                scales: {

                    // X-Achse: Altersgruppen
                    x: {
                        grid: {
                            display: false
                        },

                        ticks: {
                            color: '#FFFCFE'
                        },

                        title: {
                            display: true,

                            text: 'Altersgruppe',

                            color: '#FFFCFE',

                            font: {
                                weight: 'bold'
                            },

                            padding: {
                                top: 12
                            }
                        }
                    },

                    // Y-Achse: Anzahl Beteiligte
                    y: {
                        beginAtZero:
                            true,

                        grid: {
                            color:
                                'rgba(255, 252, 254, 0.15)'
                        },

                        ticks: {
                            color:
                                '#FFFCFE',

                            callback:
                                function (value) {

                                    return Number(value).toLocaleString(
                                        'de-CH'
                                    );
                                }
                        },

                        title: {
                            display:
                                true,

                            text:
                                'Ursächlich beteiligte PW-Lenkende',

                            color:
                                '#FFFCFE',

                            font: {
                                weight:
                                    'bold'
                            },

                            padding: {
                                bottom:
                                    12
                            }
                        }
                    }
                }
            }
        }
    );
}

// ========================================
// Gemeinsame Sticky-Scrollsteuerung
// ========================================

// Steuert den schrittweisen Aufbau der
// drei Diagramme während des Scrollens.
// Die Diagramme werden beim Scrollen
// angehalten und nach Abschluss freigegeben.

function initStickyChartScroll(
    scrollySelector,
    graphicSelector,
    renderProgress
) {

    const scrolly =
        document.querySelector(scrollySelector);

    const graphic =
        document.querySelector(graphicSelector);


    /* Ohne Grafik vollständig anzeigen */

    if (!scrolly || !graphic) {
        renderProgress(1);
        return;
    }


    /* ========================================
       Barrierefreiheit
    ======================================== */

    const reducedMotion = window.matchMedia(
        '(prefers-reduced-motion: reduce)'
    ).matches;

    if (reducedMotion) {
        renderProgress(1);
        scrolly.classList.add('is-complete');
        return;
    }


    /* ========================================
       Zustand der Scrollanimation
    ======================================== */

    let progress = 0;
    let finished = false;
    let active = false;
    let lastTouchY = null;
    let lastScrollY = window.scrollY;


    /* ========================================
       Halteposition der Diagramme
    ======================================== */

    // Abstand zwischen Bildschirmoberkante
    // und Grafik beim Anhalten des Scrollens.
    // Maximal 180 Pixel oder 22 % der Fensterhöhe.

    const getStopOffset = () => {

        // Standardposition für alle Diagramme
        const standardOffset = Math.min(
            180,
            window.innerHeight * 0.22
        );

        // Erste animierte Grafik nochmals früher anhalten
        if (scrollySelector === '.licence-development-scrolly') {
            return standardOffset + 190;
        }

        return standardOffset;
    };


    // Absolute Scrollposition bestimmen,
    // an welcher die Grafik angehalten wird.

    const getStopY = () => {

        const rect =
            graphic.getBoundingClientRect();

        return Math.max(
            0,
            window.scrollY
            + rect.top
            - getStopOffset()
        );
    };


    /* ========================================
       Animation berechnen
    ======================================== */

    const easeInOut = value => {
        return value * value * (3 - 2 * value);
    };


    /* ========================================
       Scrollsteuerung entfernen
    ======================================== */

    function removeListeners() {

        window.removeEventListener(
            'wheel',
            onWheel
        );

        window.removeEventListener(
            'keydown',
            onKeyDown
        );

        window.removeEventListener(
            'touchstart',
            onTouchStart
        );

        window.removeEventListener(
            'touchmove',
            onTouchMove
        );

        window.removeEventListener(
            'touchend',
            onTouchEnd
        );

        window.removeEventListener(
            'touchcancel',
            onTouchEnd
        );

        window.removeEventListener(
            'scroll',
            onScroll
        );
    }


    /* ========================================
       Animation abschliessen
    ======================================== */

    function finishAnimation() {

        progress = 1;
        finished = true;
        active = false;

        renderProgress(1);

        scrolly.classList.add(
            'is-complete'
        );

        removeListeners();
    }


    /* ========================================
       Scrollanimation aktivieren
    ======================================== */

    function activateAnimation() {

        if (finished || active) {
            return;
        }

        active = true;

        // Bei einem grossen Scrollsprung die
        // Grafik an ihre Halteposition setzen.

        const stopY = getStopY();

        window.scrollTo({
            top: stopY,
            behavior: 'instant'
        });

        lastScrollY = stopY;
    }


    /* ========================================
       Diagramm schrittweise aufbauen
    ======================================== */

    function advance(distance) {

        if (
            finished ||
            !active ||
            distance <= 0
        ) {
            return;
        }

        // Sehr grosse einzelne Scrollimpulse
        // begrenzen, damit die Grafik nicht
        // mit einem Ereignis fertig wird.

        const limitedDistance = Math.min(
            distance,
            window.innerHeight * 0.45
        );

        progress = Math.min(
            1,
            progress
            + limitedDistance
            / (window.innerHeight * 1.5)
        );

        renderProgress(
            easeInOut(progress)
        );

        if (progress >= 1) {
            finishAnimation();
        }
    }


    /* ========================================
       Erkennen, ob die Grafik erreicht wird
    ======================================== */

    function willReachGraphic(distance) {

        if (finished) {
            return false;
        }

        if (active) {
            return true;
        }

        const rect =
            graphic.getBoundingClientRect();

        // Grafik liegt noch unterhalb
        // der Halteposition.

        return (
            rect.bottom > 0
            && rect.top - distance
            <= getStopOffset()
        );
    }


    /* ========================================
       Maus und Trackpad
    ======================================== */

    function onWheel(event) {

        if (
            finished ||
            event.defaultPrevented ||
            event.ctrlKey ||
            event.deltaY <= 0
        ) {
            return;
        }

        const factor =
            event.deltaMode === 1
                ? 16
                : event.deltaMode === 2
                    ? window.innerHeight
                    : 1;

        const distance =
            event.deltaY * factor;

        if (!willReachGraphic(distance)) {
            return;
        }

        // Normales Scrollen anhalten,
        // auch bei grossen Scrollimpulsen.

        event.preventDefault();

        activateAnimation();

        advance(distance);
    }


    /* ========================================
       Tastatur
    ======================================== */

    function onKeyDown(event) {

        if (
            finished ||
            event.defaultPrevented ||
            event.altKey ||
            event.ctrlKey ||
            event.metaKey ||
            event.target?.closest?.(
                'input, textarea, select, button, [contenteditable="true"]'
            )
        ) {
            return;
        }

        let distance = 0;

        if (event.key === 'ArrowDown') {

            distance = 50;

        } else if (
            event.key === 'PageDown'
            || (
                event.key === ' '
                && !event.shiftKey
            )
        ) {

            distance =
                window.innerHeight * 0.8;
        }

        if (
            distance <= 0 ||
            !willReachGraphic(distance)
        ) {
            return;
        }

        event.preventDefault();

        activateAnimation();

        advance(distance);
    }


    /* ========================================
       Touch-Steuerung
    ======================================== */

    function onTouchStart(event) {

        lastTouchY =
            event.touches.length === 1
                ? event.touches[0].clientY
                : null;
    }


    function onTouchMove(event) {

        if (
            finished ||
            lastTouchY === null ||
            event.touches.length !== 1
        ) {
            return;
        }

        const currentY =
            event.touches[0].clientY;

        const distance =
            lastTouchY - currentY;

        lastTouchY = currentY;

        if (
            distance <= 0 ||
            event.defaultPrevented ||
            !willReachGraphic(distance)
        ) {
            return;
        }

        event.preventDefault();

        activateAnimation();

        advance(distance);
    }


    function onTouchEnd() {
        lastTouchY = null;
    }


    /* ========================================
       Grosse Scrollsprünge erkennen
    ======================================== */

    // Fängt auch Scrollbewegungen ab,
    // die nicht über wheel oder touchmove
    // abgefangen werden konnten.

    function onScroll() {

        if (finished) {
            return;
        }

        const currentScrollY =
            window.scrollY;

        /* Zurückscrollen während der Animation */

        if (active) {

            const stopY = getStopY();

            // Beim Zurückscrollen die Sperre aufheben.
            // Der bisherige Animationsfortschritt bleibt erhalten.
            if (currentScrollY < stopY - 2) {

                active = false;
                lastScrollY = currentScrollY;

                return;
            }

            // Bei einem Scrollsprung nach unten
            // zur Halteposition zurückkehren.
            if (currentScrollY > stopY + 2) {

                window.scrollTo({
                    top: stopY,
                    behavior: 'instant'
                });
            }

            lastScrollY = window.scrollY;
            return;
        }

        const stopY = getStopY();

        // Halteposition wurde beim Scrollen
        // nach unten überquert.

        if (
            currentScrollY > lastScrollY
            && lastScrollY <= stopY
            && currentScrollY >= stopY
        ) {
            activateAnimation();
        }

        lastScrollY = window.scrollY;
    }


    /* ========================================
       Scrollsteuerung aktivieren
    ======================================== */

    window.addEventListener(
        'wheel',
        onWheel,
        { passive: false }
    );

    window.addEventListener(
        'keydown',
        onKeyDown
    );

    window.addEventListener(
        'touchstart',
        onTouchStart,
        { passive: true }
    );

    window.addEventListener(
        'touchmove',
        onTouchMove,
        { passive: false }
    );

    window.addEventListener(
        'touchend',
        onTouchEnd
    );

    window.addEventListener(
        'touchcancel',
        onTouchEnd
    );

    window.addEventListener(
        'scroll',
        onScroll,
        { passive: true }
    );


    /* Anfangszustand */

    renderProgress(0);
}

// ========================================
// Führerausweisentwicklung 2016 / 2025
// ========================================

const licenceDevelopmentCanvas =
    document.querySelector(
        '#licenceDevelopmentChart'
    );

let licenceDevelopmentChart;


/*
 * Das Diagramm zeigt 2016 direkt.
 * Die Werte von 2025 werden später
 * abhängig vom Scrollfortschritt eingeblendet.
 */

async function createLicenceDevelopmentChart() {

    const trafficData =
        await loadTrafficData();


    const data2016 =
        trafficData.filter(row => {
            return Number(row.year) === 2016;
        });


    const data2025 =
        trafficData.filter(row => {
            return Number(row.year) === 2025;
        });


    const labels =
        data2016.map(row => {
            return row.age_group;
        });


    const values2016 =
        data2016.map(row => {
            return Number(
                row.license_holders
            );
        });


    const values2025 =
        data2025.map(row => {
            return Number(
                row.license_holders
            );
        });


    /*
     * 2025 startet bei 0.
     * Die tatsächlichen Werte werden
     * beim Scrollen schrittweise eingesetzt.
     */

    const initialValues2025 =
        values2025.map(() => 0);


    licenceDevelopmentChart =
        new Chart(
            licenceDevelopmentCanvas,
            {
                type: 'bar',

                data: {
                    labels: labels,

                    datasets: [

                        /* 2016 bleibt statisch */

                        {
                            label: '2016',

                            data: values2016,

                            backgroundColor: context => {

                                if (context.active) {
                                    return '#E38500';
                                }

                                return 'rgba(138, 184, 245, 0.45)';
                            },

                            borderRadius: 6,

                            borderSkipped: false
                        },


                        /* 2025 wird scrollgesteuert */

                        {
                            label: '2025',

                            data: initialValues2025,

                            backgroundColor: context => {

                                if (context.active) {
                                    return '#E38500';
                                }

                                return '#8AB8F5';
                            },

                            borderRadius: 6,

                            borderSkipped: false
                        }
                    ]
                },


                options: {

                    responsive: true,

                    maintainAspectRatio: false,


                    /*
                     * Chart.js soll nicht selbst animieren.
                     * Die Animation wird vollständig
                     * durch den Scrollfortschritt gesteuert.
                     */

                    animation: false,


                    /* Legende und Tooltip */

                    plugins: {

                        legend: {
                            display: true,

                            labels: {
                                color: '#FFFCFE'
                            }
                        },


                        tooltip: {

                            callbacks: {

                                label: function (context) {

                                    const value =
                                        context.raw.toLocaleString(
                                            'de-CH'
                                        );

                                    return `${context.dataset.label}: ${value}`;
                                }
                            }
                        }
                    },


                    /* ========================================
                       Achsen
                    ======================================== */

                    scales: {

                        /* X-Achse */

                        x: {

                            grid: {
                                display: false
                            },

                            ticks: {
                                color: '#FFFCFE'
                            },

                            title: {
                                display: true,
                                text: 'Altersgruppe',
                                color: '#FFFCFE',

                                font: {
                                    weight: 'bold'
                                },

                                padding: {
                                    top: 12
                                }
                            }
                        },


                        /* Y-Achse */

                        y: {

                            beginAtZero: true,

                            grid: {
                                color: 'rgba(255, 252, 254, 0.15)'
                            },

                            ticks: {
                                color: '#FFFCFE',

                                callback: function (value) {

                                    return Number(value).toLocaleString(
                                        'de-CH'
                                    );
                                }
                            },

                            title: {
                                display: true,
                                text: 'Anzahl Führerausweisinhaber:innen',
                                color: '#FFFCFE',

                                font: {
                                    weight: 'bold'
                                },

                                padding: {
                                    bottom: 12
                                }
                            }
                        }
                    }
                }
            }
        );


    /*
     * Nach dem Erstellen des Charts
     * wird die Scrollsteuerung aktiviert.
     */

    initLicenceScrollAnimation(
        values2025
    );
}


// ========================================
// Führerausweisentwicklung: Sticky-Scroll
// ========================================

/*
 * Verbindet das Diagramm mit der gemeinsamen
 * Scrollsteuerung.
 *
 * Die Balken von 2016 bleiben sichtbar.
 * Die Balken von 2025 werden während
 * der Scrollanimation schrittweise aufgebaut.
 */

function initLicenceScrollAnimation(values2025) {

    if (!licenceDevelopmentChart) {
        return;
    }

    initStickyChartScroll(
        '.licence-development-scrolly',
        '.graphic--licence-development',

        progress => {

            /* 2016 bleibt sichtbar, 2025 wächst dazu */

            licenceDevelopmentChart.data.datasets[1].data =
                values2025.map(value => value * progress);

            licenceDevelopmentChart.update('none');
        }
    );
}
// ========================================
// Relative Unfallbeteiligung 2025
// ========================================

const accidentRateCanvas =
    document.querySelector(
        '#accidentRateChart'
    );

let accidentRateChart;


/*
 * Dieses Plugin schneidet ausschliesslich
 * die Datenlinie und ihre Punkte ab.
 *
 * Achsen, Raster und Beschriftungen bleiben
 * während des Aufbaus vollständig sichtbar.

 */const accidentRateRevealPlugin = {

    id:
        'accidentRateReveal',

    // Chart.js ruft diesen Hook automatisch auf.
    // Er begrenzt den sichtbaren Bereich der Datenlinie.
    ['beforeDatasetsDraw'](chart) {
        const progress =
            Math.min(
                Math.max(
                    chart.$revealProgress ?? 0,
                    0
                ),
                1
            );


        const {
            ctx,
            chartArea
        } = chart;


        if (!chartArea) {
            return;
        }


        ctx.save();

        ctx.beginPath();

        ctx.rect(
            chartArea.left,
            chartArea.top,
            chartArea.width * progress,
            chartArea.height
        );

        ctx.clip();


        chart.$revealClipActive =
            true;
    },


    ['afterDatasetsDraw'](chart) {

        if (
            chart.$revealClipActive
        ) {

            // Ursprünglichen Canvas-Zeichenkontext wiederherstellen
            const ctx = chart.canvas.getContext('2d');

            if (ctx) {
                ctx.restore();
            }

            chart.$revealClipActive =
                false;
        }
    }
};


async function createAccidentRateChart() {

    const trafficData =
        await loadTrafficData();


    const data2025 =
        trafficData.filter(row => {
            return Number(row.year) === 2025;
        });


    const ageGroupOrder = [
        '20-29',
        '30-39',
        '40-49',
        '50-59',
        '60-69',
        '70-79',
        '80-89',
        '90+'
    ];


    const sortedData =
        ageGroupOrder
            .map(ageGroup => {

                return data2025.find(
                    row => {
                        return row.age_group ===
                            ageGroup;
                    }
                );

            })
            .filter(row => {
                return row !== undefined;
            });


    const labels =
        sortedData.map(row => {
            return row.age_group;
        });

    /* ========================================
       Relative Unfallbeteiligung übernehmen
    ======================================== */

    const values =
        sortedData.map(row => {

            // Kennzahl aus den geladenen Daten
            // verwenden, nicht neu berechnen.
            const rate = row.rate_per_100k;

            // Fehlende oder ungültige Werte
            // nicht als 0 darstellen.
            if (
                rate === null ||
                rate === undefined ||
                rate === '' ||
                !Number.isFinite(Number(rate))
            ) {
                return null;
            }

            return Number(rate);
        });

    accidentRateChart =
        new Chart(
            accidentRateCanvas,
            {
                type:
                    'line',


                /*
                 * Scroll-Reveal nur für
                 * dieses eine Diagramm.
                 */

                plugins: [
                    accidentRateRevealPlugin
                ],


                data: {
                    labels:
                    labels,

                    datasets: [
                        {
                            label:
                                "Ursächlich Beteiligte pro 100'000 Führerausweisinhaber:innen",

                            data:
                            values,


                            /* Linie normal blau */

                            borderColor:
                                '#8AB8F5' ,

                            backgroundColor:
                                '#8AB8F5',


                            /* Punkte normal blau */

                            pointBackgroundColor:
                                '#8AB8F5',

                            pointBorderColor:
                                '#8AB8F5',


                            /* Punkt beim Hover orange */

                            pointHoverBackgroundColor:
                                '#E38500',

                            pointHoverBorderColor:
                                '#E38500',


                            pointRadius:
                                5,

                            pointHoverRadius:
                                7,

                            borderWidth:
                                3,


                            /*
                             * Gerade Verbindung zwischen
                             * den einzelnen Punkten.
                             */

                            tension:
                                0
                        }
                    ]
                },


                options: {

                    responsive:
                        true,

                    maintainAspectRatio:
                        false,


                    /*
                     * Chart.js führt keine eigene
                     * Animation aus.
                     */

                    animation:
                        false,


                    plugins: {

                        legend: {
                            display:
                                false
                        },

                        tooltip: {
                            callbacks: {
                                label:
                                    function (context) {

                                        const value =
                                            context.raw
                                                .toFixed(1)
                                                .replace(
                                                    '.',
                                                    ','
                                                );

                                        return `${value} pro 100'000`;
                                    }
                            }
                        }
                    },


                    scales: {

                        // X-Achse: zusätzlicher Abstand für die Randpunkte
                        x: {
                            offset: true,

                            grid: {
                                display: false
                            },

                            ticks: {
                                color: '#FFFCFE'
                            },

                            title: {
                                display: true,

                                text: 'Altersgruppe',

                                color: '#FFFCFE',

                                font: {
                                    weight: 'bold'
                                },

                                padding: {
                                    top: 12
                                }
                            }
                        },


                        /*
                         * Y-Achse
                         */

                        y: {

                            beginAtZero:
                                true,

                            grid: {
                                color:
                                    'rgba(255, 252, 254, 0.15)'
                            },

                            ticks: {
                                color:
                                    '#FFFCFE'
                            },

                            title: {
                                display:
                                    true,

                                text:
                                    "Beteiligte pro 100'000",

                                color:
                                    '#FFFCFE',

                                font: {
                                    weight:
                                        'bold'
                                },

                                padding: {
                                    bottom:
                                        12
                                }
                            }
                        }
                    }
                }
            }
        );


    /*
     * Anfangszustand:
     * Linie noch nicht sichtbar.
     */

    accidentRateChart.$revealProgress =
        0;


    accidentRateChart.update(
        'none'
    );


    /*
     * Scrollsteuerung starten.
     */

    initAccidentRateScrollReveal();
}


/* ========================================
   Relative Unfallbeteiligung: Sticky-Scroll
======================================== */

/*
 * Die Datenlinie wird schrittweise von
 * links nach rechts sichtbar gemacht.
 *
 * Die gemeinsame Scrollsteuerung hält
 * die Grafik während des Aufbaus an.
 *
 * Achsen und Beschriftungen bleiben
 * währenddessen vollständig sichtbar.
 *
 * Nach Abschluss wird das normale
 * Abwärtsscrollen wieder freigegeben.
 */

function initAccidentRateScrollReveal() {

    if (!accidentRateChart) {
        return;
    }


    /* Dieselbe Scrollsteuerung verwenden
       wie bei Führerausweisen und Unfallschwere */

    initStickyChartScroll(
        '.accident-rate-scrolly',
        '.graphic--accident-rate',

        progress => {

            /* Nur die Datenlinie wird
               nach und nach sichtbar.
               Achsen und Beschriftungen
               bleiben vollständig sichtbar. */

            accidentRateChart.$revealProgress =
                progress;


            /* Ohne zusätzliche Chart.js-Animation */

            accidentRateChart.update('none');
        }
    );
}


// ========================================
// Unfallschwere
// ========================================

const severityCanvas =
    document.querySelector(
        '#severityChart'
    );

let severityChart;


async function createSeverityChart() {

    const trafficData =
        await loadTrafficData();


    const ageGroupOrder = [
        '20-29',
        '30-39',
        '40-49',
        '50-59',
        '60-69',
        '70-79',
        '80-89',
        '90+'
    ];


    const severityData =
        ageGroupOrder.map(
            ageGroup => {

                const rows =
                    trafficData.filter(
                        row => {
                            return row.age_group ===
                                ageGroup;
                        }
                    );


                let fatal = 0;
                let serious = 0;
                let minor = 0;


                rows.forEach(
                    row => {

                        fatal +=
                            Number(
                                row.fatal
                            );

                        serious +=
                            Number(
                                row.serious_injuries
                            );

                        minor +=
                            Number(
                                row.minor_injuries
                            );
                    }
                );



                /* ========================================
                   Gesamtzahl der Unfallbeteiligungen
                ======================================== */

                const total =
                    fatal
                    + serious
                    + minor;

                /* ========================================
                   Prozentanteile berechnen
                ======================================== */

                // Ohne gültige Gesamtzahl können
                // keine Prozentanteile berechnet werden.

                const lightShare =
                    total > 0
                        ? (minor / total) * 100
                        : null;

                const seriousShare =
                    total > 0
                        ? (serious / total) * 100
                        : null;

                const fatalShare =
                    total > 0
                        ? (fatal / total) * 100
                        : null;


                return {
                    ageGroup:
                    ageGroup,

                    lightShare:
                    lightShare,

                    seriousShare:
                    seriousShare,

                    fatalShare:
                    fatalShare
                };

            }
        );


    const labels =
        severityData.map(
            row => {
                return row.ageGroup;
            }
        );


    /* Drei separate Unfallkategorien */

    const lightValues =
        severityData.map(
            row => {
                return row.lightShare;
            }
        );


    const seriousValues =
        severityData.map(
            row => {
                return row.seriousShare;
            }
        );


    const fatalValues =
        severityData.map(
            row => {
                return row.fatalShare;
            }
        );


    severityChart =
        new Chart(
            severityCanvas,
            {
                type:
                    'bar',

                data: {
                    labels:
                    labels,

                    datasets: [

                        /* Leichte Unfälle – Hellblau */

                        {
                            label:
                                'Leicht',


                            data:
                            lightValues,

                            backgroundColor:
                                context => context.active
                                    ? '#E38500'
                                    : '#8AB8F5',

                            borderRadius:
                                4,

                            stack:
                                'severity'
                        },


                        /* Schwere Unfälle – Mittelblau */

                        {
                            label:
                                'Schwer',

                            data:
                                labels.map(() => 0),

                            backgroundColor:
                                context => context.active
                                    ? '#E38500'
                                    : '#5F95E6',

                            borderRadius:
                                4,

                            stack:
                                'severity'
                        },


                        /* Tödliche Unfälle – Dunkelblau */

                        {
                            label:
                                'Tödlich',

                            data:
                                labels.map(() => 0),

                            backgroundColor:
                                context => context.active
                                    ? '#E38500'
                                    : '#244A83',

                            borderRadius:
                                4,

                            stack:
                                'severity'
                        }
                    ]

                },

                options: {
                    responsive:
                        true,

                    maintainAspectRatio:
                        false,

                    indexAxis:
                        'y',

                    /* Animation wird ausschliesslich durch Scrollen gesteuert */
                    animation:
                        false,

                    plugins: {
                        legend: {
                            display:
                                true,

                            labels: {
                                color:
                                    '#FFFCFE'
                            }
                        },

                        tooltip: {
                            callbacks: {
                                label:
                                    function (context) {

                                        const value =
                                            Number(
                                                context.raw
                                            )
                                                .toFixed(1)
                                                .replace(
                                                    '.',
                                                    ','
                                                );

                                        return `${context.dataset.label}: ${value} %`;
                                    }
                            }
                        }
                    },

                    /* ========================================
   Achsenbeschriftung Unfallschwere
======================================== */

                    scales: {

                        /* X-Achse: Prozentanteil */

                        x: {
                            stacked: true,

                            min: 0,
                            max: 100,

                            grid: {
                                color: 'rgba(255, 252, 254, 0.15)'
                            },

                            ticks: {
                                color: '#FFFCFE',

                                callback: function (value) {
                                    return `${value} %`;
                                }
                            },

                            title: {
                                display: true,

                                text: 'Anteil der Unfallbeteiligungen (%)',

                                color: '#FFFCFE',

                                font: {
                                    weight: 'bold'
                                },

                                padding: {
                                    top: 12
                                }
                            }
                        },


                        /* Y-Achse: Altersgruppen */

                        y: {
                            stacked: true,

                            grid: {
                                display: false
                            },

                            ticks: {
                                color: '#FFFCFE'
                            },

                            title: {
                                display: true,

                                text: 'Altersgruppe',

                                color: '#FFFCFE',

                                font: {
                                    weight: 'bold'
                                },

                                padding: {
                                    bottom: 12
                                }
                            }
                        }
                    }
                }
            }
        );


    observeSeverityChart(
        lightValues,
        seriousValues,
        fatalValues
    );

}


// ========================================
// Unfallschwere: Sticky-Scroll
// ========================================

function observeSeverityChart(
    lightValues,
    seriousValues,
    fatalValues
) {

    if (!severityChart) {
        return;
    }

    initStickyChartScroll(
        '.severity-scrolly',
        '.graphic--severity',

        progress => {

            /* Leicht bleibt von Beginn an sichtbar */

            severityChart.data.datasets[0].data =
                lightValues;


            /* Schwer wächst beim Scrollen dazu */

            severityChart.data.datasets[1].data =
                seriousValues.map(value => value * progress);


            /* Tödlich wächst beim Scrollen dazu */

            severityChart.data.datasets[2].data =
                fatalValues.map(value => value * progress);


            /* Diagramm ohne zusätzliche Animation aktualisieren */

            severityChart.update('none');
        }
    );
}


// ========================================
// Abschlussdiagramm mit aktuellem Alter
// ========================================

const finalAgeChartCanvas =
    document.querySelector('#finalAgeChart');

const finalAgeChartNote =
    document.querySelector('#finalAgeChartNote');

let finalAgeChart;


// Gewähltes Alter einer vorhandenen Altersklasse zuordnen

function getFinalAgeGroupIndex(age) {

    if (age < 20) {
        return -1;
    }

    if (age >= 90) {
        return 7;
    }

    return Math.floor((age - 20) / 10);
}


// ========================================
// Abschlussdiagramm erstellen
// ========================================

async function createFinalAgeChart() {

    const trafficData =
        await loadTrafficData();

    const data2025 = trafficData.filter(row =>
        Number(row.year) === 2025
    );


    /* Dieselben Altersklassen wie im
       grossen Liniendiagramm */

    const ageGroupOrder = [
        '20-29',
        '30-39',
        '40-49',
        '50-59',
        '60-69',
        '70-79',
        '80-89',
        '90+'
    ];

    /* Pro Altersklasse genau ein Datenpunkt */

    const values = ageGroupOrder.map(ageGroup => {

        // Passenden Datensatz für 2025 suchen
        const row = data2025.find(row =>
            row.age_group === ageGroup
        );

        // Fehlende oder ungültige Werte abfangen
        if (
            !row ||
            row.rate_per_100k === null ||
            row.rate_per_100k === undefined ||
            row.rate_per_100k === '' ||
            !Number.isFinite(Number(row.rate_per_100k))
        ) {
            return null;
        }

        // Berechnete Kennzahl direkt aus JSON verwenden
        return Number(row.rate_per_100k);
    });

    /* ========================================
       Chart.js-Diagramm
    ======================================== */

    finalAgeChart = new Chart(
        finalAgeChartCanvas,
        {
            type: 'line',

            data: {
                labels: ageGroupOrder,

                datasets: [

                    /* Blaue Linie:
                       Relative Unfallbeteiligung 2025 */

                    {
                        label: 'Unfallbeteiligung 2025',

                        data: values,

                        borderColor: '#8AB8F5',
                        backgroundColor: '#8AB8F5',

                        pointBackgroundColor: '#8AB8F5',
                        pointBorderColor: '#8AB8F5',

                        pointHoverBackgroundColor: '#E38500',
                        pointHoverBorderColor: '#E38500',

                        pointRadius: 5,
                        pointHoverRadius: 7,

                        borderWidth: 3,

                        /* Gerade Linien zwischen den Punkten */

                        tension: 0
                    },


                    /* Orangefarbener Auswahlpunkt */

                    {
                        label: 'Ihre Auswahl',

                        /* Zu Beginn wird der gewählte
                           Punkt weiter unten eingesetzt */

                        data: ageGroupOrder.map(() => null),

                        /* Keine Verbindungslinie */

                        showLine: false,

                        backgroundColor: '#E38500',
                        borderColor: '#E38500',

                        pointBackgroundColor: '#E38500',
                        pointBorderColor: '#FFFCFE',

                        pointHoverBackgroundColor: '#E38500',
                        pointHoverBorderColor: '#FFFCFE',

                        pointRadius: 10,
                        pointHoverRadius: 12,
                        pointBorderWidth: 3
                    }
                ]
            },


            /* ========================================
               Diagrammeinstellungen
            ======================================== */

            options: {

                responsive: true,

                maintainAspectRatio: false,

                /* Orangefarbener Punkt springt
                   ohne Übergangsanimation */

                animation: false,


                plugins: {

                    legend: {
                        display: false
                    },

                    tooltip: {

                        callbacks: {

                            label: function (context) {

                                const value =
                                    Number(context.parsed.y)
                                        .toFixed(1)
                                        .replace('.', ',');

                                if (
                                    context.dataset.label ===
                                    'Ihre Auswahl'
                                ) {

                                    return `Ihre Auswahl (${context.label}): ${value} pro 100'000`;
                                }

                                return `${value} pro 100'000`;
                            }
                        }
                    }
                },


                /* ========================================
                   Achsen wie im grossen Liniendiagramm
                ======================================== */

                scales: {

                    /* X-Achse: Altersgruppen */

                    x: {

                        /* Randpunkte vollständig sichtbar */

                        offset: true,

                        grid: {
                            display: false
                        },

                        ticks: {
                            color: '#FFFCFE'
                        },

                        title: {

                            display: true,

                            text: 'Altersgruppe',

                            color: '#FFFCFE',

                            font: {
                                weight: 'bold'
                            },

                            padding: {
                                top: 12
                            }
                        }
                    },


                    /* Y-Achse: Relative Unfallbeteiligung */

                    y: {

                        beginAtZero: true,

                        grid: {
                            color: 'rgba(255, 252, 254, 0.15)'
                        },

                        ticks: {
                            color: '#FFFCFE'
                        },

                        title: {

                            display: true,

                            text: "Beteiligte pro 100'000",

                            color: '#FFFCFE',

                            font: {
                                weight: 'bold'
                            },

                            padding: {
                                bottom: 12
                            }
                        }
                    }
                }
            }
        }
    );


    /* Gespeichertes Alter aus der
       ersten Altersfrage übernehmen */

    updateFinalAgeChart(
        Number(finalAgeRange.value)
    );
}


// ========================================
// Orangefarbenen Punkt aktualisieren
// ========================================

function updateFinalAgeChart(age) {

    if (!finalAgeChart) {
        return;
    }


    /* Passende Altersgruppe ermitteln */

    const groupIndex =
        getFinalAgeGroupIndex(age);

    const labels =
        finalAgeChart.data.labels;

    const values =
        finalAgeChart.data.datasets[0].data;


    /* Der orange Punkt wird nur auf
       der gewählten Altersgruppe angezeigt */

    finalAgeChart.data.datasets[1].data =
        values.map((value, index) => {

            return index === groupIndex
                ? value
                : null;
        });


    /* Sofort springen, ohne Animation */

    finalAgeChart.update('none');


    /* Unter 20 Jahren gibt es keine
       vergleichbaren Altersgruppen */

    if (
        groupIndex === -1
        || values[groupIndex] == null
    ) {

        finalAgeChartNote.textContent =
            `${age} Jahre – für diese Altersgruppe liegen keine vergleichbaren Daten vor.`;

        return;
    }


    /* Zahl für den Erklärungstext */

    const rate =
        Number(values[groupIndex])
            .toFixed(1)
            .replace('.', ',');


    /* Angezeigte Altersgruppe erklären */

    finalAgeChartNote.textContent =
        `${age} Jahre – Altersgruppe ${labels[groupIndex]}: ungefähr ${rate} ursächlich Beteiligte pro 100'000 Führerausweisinhaber:innen.`;
}


// ========================================
// Alle Grafiken starten
// ========================================

// Verständliche Fehlermeldung beim Diagramm anzeigen
function showChartError(canvasSelector) {

    const canvas = document.querySelector(canvasSelector);

    if (!canvas) {
        return;
    }

    const container = canvas.parentElement;

    if (!container) {
        return;
    }

    // Fehlermeldung nicht mehrfach einfügen
    if (container.querySelector('.chart-error')) {
        return;
    }

    // Canvas bei einem Fehler ausblenden
    canvas.hidden = true;

    const message = document.createElement('p');

    message.className = 'chart-error';
    message.textContent =
        'Die Grafik konnte momentan nicht geladen werden. Bitte versuchen Sie es später erneut.';

    message.setAttribute('role', 'alert');

    container.appendChild(message);
}


// Diagramme unabhängig voneinander starten
function startChart(createChart, canvasSelector) {

    Promise.resolve()
        .then(() => createChart())
        .catch(error => {

            // Technischen Fehler für die Entwicklung anzeigen
            console.error(error);

            // Verständliche Meldung für Besucher:innen
            showChartError(canvasSelector);
        });
}


// Alle fünf Diagramme starten
startChart(
    createAbsoluteAccidentsChart,
    '#absoluteAccidentsChart'
);

startChart(
    createLicenceDevelopmentChart,
    '#licenceDevelopmentChart'
);

startChart(
    createAccidentRateChart,
    '#accidentRateChart'
);

startChart(
    createSeverityChart,
    '#severityChart'
);

startChart(
    createFinalAgeChart,
    '#finalAgeChart'
);

// ========================================
// Scroll-Hero
// ========================================

const heroScroll =
    document.querySelector('.hero-scroll');

const heroMap =
    document.querySelector('.hero__map');

const heroContent =
    document.querySelector('.hero__content');

const heroLead =
    document.querySelector('.hero__lead');


if (
    heroScroll
    && heroMap
    && heroContent
    && heroLead
) {

    fetch('assets/images/Karte_Hellblau.svg')

        .then(response => {

            if (!response.ok) {

                throw new Error(
                    'Die Schweizkarte konnte nicht geladen werden.'
                );
            }

            return response.text();

        })

        .then(svgCode => {

            // SVG direkt in den Hero einsetzen
            heroMap.innerHTML =
                svgCode;


            const heroSvg =
                heroMap.querySelector('svg');


            if (!heroSvg) {
                return;
            }


            // SVG soll den gesamten Hero ausfüllen
            heroSvg.setAttribute(
                'preserveAspectRatio',
                'xMidYMid slice'
            );


            // Ursprüngliche ViewBox aus der SVG lesen
            const viewBoxValues =
                heroSvg
                    .getAttribute('viewBox')
                    .split(/\s+/)
                    .map(Number);


            const originalX =
                viewBoxValues[0];

            const originalY =
                viewBoxValues[1];


            /*
             * Startausschnitt
             *
             * Die Karte ist bereits etwas vergrössert
             * und nach oben links verschoben.
             */

            const startViewBox = {
                x: originalX + 40,
                y: originalY + 35,
                width: 1120,
                height: 630
            };


            /*
             * Zielpunkt des Zooms
             *
             * Diesen Punkt haben wir direkt
             * in der SVG bestimmt.
             */

            const targetCenterX =
                591;

            const targetCenterY =
                402;


            /*
             * Grösse des finalen Ausschnitts.
             *
             * Je kleiner die Werte,
             * desto stärker der Zoom.
             */

            const endWidth =
                15;

            const endHeight =
                15;


            const endViewBox = {
                x:
                    targetCenterX
                    - endWidth / 2,

                y:
                    targetCenterY
                    - endHeight / 2,

                width:
                endWidth,

                height:
                endHeight
            };


            // Hilfsfunktion für Zwischenwerte

            const interpolate = (
                start,
                end,
                progress
            ) => {

                return (
                    start
                    + (end - start)
                    * progress
                );
            };


            // Natürlicherer Zoomverlauf

            const easeInOut =
                progress => {

                    return (
                        progress
                        * progress
                        * (3 - 2 * progress)
                    );
                };


            const updateHero = () => {

                const rect =
                    heroScroll
                        .getBoundingClientRect();


                const scrollDistance =
                    heroScroll.offsetHeight
                    - window.innerHeight;


                /*
                 * Gesamter Scrollfortschritt
                 * zwischen 0 und 1
                 */

                const rawProgress =
                    Math.min(
                        Math.max(
                            -rect.top
                            / scrollDistance,
                            0
                        ),
                        1
                    );


                /*
                 * Der Zoom soll bereits bei 72 %
                 * abgeschlossen sein.
                 *
                 * Danach bleibt die Karte ruhig,
                 * während der Lead eingeblendet wird.
                 */

                const zoomEnd =
                    0.72;


                const normalizedZoomProgress =
                    Math.min(
                        rawProgress / zoomEnd,
                        1
                    );


                const zoomProgress =
                    easeInOut(
                        normalizedZoomProgress
                    );


                // Aktuelle ViewBox berechnen

                const currentX =
                    interpolate(
                        startViewBox.x,
                        endViewBox.x,
                        zoomProgress
                    );


                const currentY =
                    interpolate(
                        startViewBox.y,
                        endViewBox.y,
                        zoomProgress
                    );


                const currentWidth =
                    interpolate(
                        startViewBox.width,
                        endViewBox.width,
                        zoomProgress
                    );


                const currentHeight =
                    interpolate(
                        startViewBox.height,
                        endViewBox.height,
                        zoomProgress
                    );


                // SVG-Ausschnitt verändern

                heroSvg.setAttribute(
                    'viewBox',
                    `${currentX} ${currentY} ${currentWidth} ${currentHeight}`
                );


                /*
            * Titel und Untertitel
            * relativ früh ausblenden.
            */

                heroContent.style.opacity =
                    Math.max(
                        1 - rawProgress * 2.5,
                        0
                    );

                /*
                 * Titel beim Ausblenden
                 * leicht nach oben bewegen.
                 */

                const textMove =
                    rawProgress * -30;


                heroContent.style.transform =
                    `translateY(${textMove}px)`;


                /*
                 * Lead am Ende des Zooms einblenden.
                 *
                 * Start: 72 %
                 * Komplett sichtbar: 84 %
                 */

                const leadStart =
                    0.72;

                const leadEnd =
                    0.84;


                const leadProgress =
                    Math.min(
                        Math.max(
                            (
                                rawProgress
                                - leadStart
                            )
                            /
                            (
                                leadEnd
                                - leadStart
                            ),
                            0
                        ),
                        1
                    );


                heroLead.style.opacity =
                    leadProgress;


                /*
                 * Lead fährt beim Einblenden
                 * leicht von unten nach oben.
                 */

                const leadMove =
                    (1 - leadProgress) * 30;


                heroLead.style.transform =
                    `translateY(${leadMove}px)`;

            };


            /*
             * Scroll-Events über
             * requestAnimationFrame bündeln.
             */

            let ticking =
                false;


            const requestHeroUpdate =
                () => {

                    if (!ticking) {

                        window.requestAnimationFrame(
                            () => {

                                updateHero();

                                ticking =
                                    false;
                            }
                        );


                        ticking =
                            true;
                    }
                };


            window.addEventListener(
                'scroll',
                requestHeroUpdate,
                { passive: true }
            );


            window.addEventListener(
                'resize',
                requestHeroUpdate
            );


            // Anfangszustand setzen

            updateHero();

        })

        .catch(error => {

            console.error(error);

        });

}