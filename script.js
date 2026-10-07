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

async function loadTrafficData() {

    const response =
        await fetch(
            'https://zu-alt-fuers-steuer-im3.isobopad.myhostpoint.ch/unload.php'
        );


    if (!response.ok) {

        throw new Error(
            'Die Daten konnten nicht geladen werden.'
        );
    }


    return await response.json();
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


    const barColors =
        labels.map(ageGroup => {

            if (ageGroup === '20-29') {
                return '#E38500';
            }

            return '#6594DB';
        });


    new Chart(
        absoluteAccidentsCanvas,
        {
            type: 'bar',

            data: {
                labels: labels,

                datasets: [
                    {
                        label:
                            'Ursächlich Beteiligte',

                        data:
                        values,

                        backgroundColor:
                        barColors,

                        borderRadius:
                            4
                    }
                ]
            },

            options: {
                responsive: true,

                maintainAspectRatio:
                    false,

                plugins: {
                    legend: {
                        display: false
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
                    x: {
                        grid: {
                            display:
                                false
                        },

                        ticks: {
                            color:
                                '#FFFCFE'
                        }
                    },

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
                        }
                    }
                }
            }
        }
    );
}


// ========================================
// Führerausweisentwicklung 2016 / 2025
// ========================================

const licenceDevelopmentCanvas =
    document.querySelector(
        '#licenceDevelopmentChart'
    );

let licenceDevelopmentChart;


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


    licenceDevelopmentChart =
        new Chart(
            licenceDevelopmentCanvas,
            {
                type: 'bar',

                data: {
                    labels:
                    labels,

                    datasets: [
                        {
                            label:
                                '2016',

                            data:
                            values2016,

                            backgroundColor:
                                '#6594DB',

                            borderRadius:
                                4
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
                                            context.raw.toLocaleString(
                                                'de-CH'
                                            );

                                        return `${context.dataset.label}: ${value}`;
                                    }
                            }
                        }
                    },

                    scales: {
                        x: {
                            grid: {
                                display:
                                    false
                            },

                            ticks: {
                                color:
                                    '#FFFCFE'
                            }
                        },

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

                                        return value.toLocaleString(
                                            'de-CH'
                                        );
                                    }
                            }
                        }
                    }
                }
            }
        );


    observeLicenceChart(
        values2025
    );
}


// 2025 beim Scrollen ergänzen

function observeLicenceChart(
    values2025
) {

    const licenceGraphic =
        document.querySelector(
            '.graphic--licence-development'
        );


    const observer =
        new IntersectionObserver(
            entries => {

                entries.forEach(entry => {

                    if (
                        entry.isIntersecting
                    ) {

                        showLicenceData2025(
                            values2025
                        );

                        observer.unobserve(
                            licenceGraphic
                        );
                    }
                });
            },

            {
                threshold: 0.6
            }
        );


    observer.observe(
        licenceGraphic
    );
}


function showLicenceData2025(
    values2025
) {

    licenceDevelopmentChart
        .data
        .datasets
        .push(
            {
                label:
                    '2025',

                data:
                values2025,

                backgroundColor:
                    '#E38500',

                borderRadius:
                    4
            }
        );


    licenceDevelopmentChart.update();
}


// ========================================
// Relative Unfallbeteiligung 2025
// ========================================

const accidentRateCanvas =
    document.querySelector(
        '#accidentRateChart'
    );

let accidentRateChart;


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


    const values =
        sortedData.map(row => {

            const causallyInvolved =
                Number(
                    row.causally_involved
                );

            const licenseHolders =
                Number(
                    row.license_holders
                );


            return (
                causallyInvolved
                / licenseHolders
                * 100000
            );
        });


    const pointColors =
        labels.map(ageGroup => {

            if (
                ageGroup === '60-69'
                || ageGroup === '80-89'
                || ageGroup === '90+'
            ) {

                return '#E38500';
            }


            return '#6594DB';
        });


    accidentRateChart =
        new Chart(
            accidentRateCanvas,
            {
                type: 'line',

                data: {
                    labels:
                    labels,

                    datasets: [
                        {
                            label:
                                "Ursächlich Beteiligte pro 100'000 Führerausweisinhaber:innen",

                            data:
                            values,

                            borderColor:
                                '#6594DB',

                            backgroundColor:
                                '#6594DB',

                            pointBackgroundColor:
                            pointColors,

                            pointBorderColor:
                            pointColors,

                            pointRadius:
                                5,

                            pointHoverRadius:
                                7,

                            borderWidth:
                                3,

                            tension:
                                0.25
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
                        x: {
                            grid: {
                                display:
                                    false
                            },

                            ticks: {
                                color:
                                    '#FFFCFE'
                            }
                        },

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
                                    '#FFFCFE'
                            }
                        }
                    }
                }
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


                const total =
                    fatal
                    + serious
                    + minor;


                const severeShare =
                    ((fatal + serious)
                        / total)
                    * 100;


                const lightShare =
                    (minor / total)
                    * 100;


                return {
                    ageGroup:
                    ageGroup,

                    lightShare:
                    lightShare,

                    severeShare:
                    severeShare
                };
            }
        );


    const labels =
        severityData.map(
            row => {
                return row.ageGroup;
            }
        );


    const lightValues =
        severityData.map(
            row => {
                return row.lightShare;
            }
        );


    const severeValues =
        severityData.map(
            row => {
                return row.severeShare;
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
                        {
                            label:
                                'Leicht',

                            data:
                                labels.map(
                                    () => {
                                        return 100;
                                    }
                                ),

                            backgroundColor:
                                '#6594DB',

                            borderRadius:
                                4,

                            stack:
                                'severity'
                        },

                        {
                            label:
                                'Schwer / tödlich',

                            data:
                                labels.map(
                                    () => {
                                        return 0;
                                    }
                                ),

                            backgroundColor:
                                '#E38500',

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

                    scales: {
                        x: {
                            stacked:
                                true,

                            min:
                                0,

                            max:
                                100,

                            grid: {
                                color:
                                    'rgba(255, 252, 254, 0.15)'
                            },

                            ticks: {
                                color:
                                    '#FFFCFE',

                                callback:
                                    function (value) {

                                        return `${value} %`;
                                    }
                            }
                        },

                        y: {
                            stacked:
                                true,

                            grid: {
                                display:
                                    false
                            },

                            ticks: {
                                color:
                                    '#FFFCFE'
                            }
                        }
                    }
                }
            }
        );


    observeSeverityChart(
        lightValues,
        severeValues
    );
}


// Schwere Anteile beim Scrollen einblenden

function observeSeverityChart(
    lightValues,
    severeValues
) {

    const severityGraphic =
        document.querySelector(
            '.graphic--severity'
        );


    const observer =
        new IntersectionObserver(
            entries => {

                entries.forEach(
                    entry => {

                        if (
                            entry.isIntersecting
                        ) {

                            showSeverityShares(
                                lightValues,
                                severeValues
                            );

                            observer.unobserve(
                                severityGraphic
                            );
                        }
                    }
                );
            },

            {
                threshold:
                    0.6
            }
        );


    observer.observe(
        severityGraphic
    );
}


function showSeverityShares(
    lightValues,
    severeValues
) {

    severityChart
        .data
        .datasets[0]
        .data =
        lightValues;


    severityChart
        .data
        .datasets[1]
        .data =
        severeValues;


    severityChart.update();
}


// ========================================
// Abschlussdiagramm mit aktuellem Alter
// ========================================

const finalAgeChartCanvas =
    document.querySelector(
        '#finalAgeChart'
    );

const finalAgeChartNote =
    document.querySelector(
        '#finalAgeChartNote'
    );

let finalAgeChart;


// Wert auf der Kurve berechnen

function getFinalAgeRate(
    age,
    curveData
) {

    const firstPoint =
        curveData[0];

    const lastPoint =
        curveData[
        curveData.length - 1
            ];


    if (
        age <= firstPoint.x
    ) {

        return firstPoint.y;
    }


    if (
        age >= lastPoint.x
    ) {

        return lastPoint.y;
    }


    for (
        let i = 0;
        i < curveData.length - 1;
        i++
    ) {

        const current =
            curveData[i];

        const next =
            curveData[i + 1];


        if (
            age >= current.x
            && age <= next.x
        ) {

            const position =
                (age - current.x)
                / (next.x - current.x);


            return (
                current.y
                + (
                    next.y
                    - current.y
                )
                * position
            );
        }
    }


    return firstPoint.y;
}


// Abschlussdiagramm erstellen

async function createFinalAgeChart() {

    const trafficData =
        await loadTrafficData();


    const data2025 =
        trafficData.filter(
            row => {
                return Number(
                    row.year
                ) === 2025;
            }
        );


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


    const agePoints = [
        25,
        35,
        45,
        55,
        65,
        75,
        85,
        95
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


    const curveData =
        sortedData.map(
            (row, index) => {

                const causallyInvolved =
                    Number(
                        row.causally_involved
                    );

                const licenseHolders =
                    Number(
                        row.license_holders
                    );


                const rate =
                    causallyInvolved
                    / licenseHolders
                    * 100000;


                return {
                    x:
                        agePoints[index],

                    y:
                    rate
                };
            }
        );


    const selectedAge =
        Number(
            finalAgeRange.value
        );


    const selectedRate =
        getFinalAgeRate(
            selectedAge,
            curveData
        );


    finalAgeChart =
        new Chart(
            finalAgeChartCanvas,
            {
                data: {
                    datasets: [

                        {
                            type:
                                'line',

                            label:
                                'Unfallbeteiligung 2025',

                            data:
                            curveData,

                            parsing:
                                false,

                            borderColor:
                                '#6594DB',

                            backgroundColor:
                                '#6594DB',

                            pointBackgroundColor:
                                '#6594DB',

                            pointBorderColor:
                                '#6594DB',

                            pointRadius:
                                5,

                            pointHoverRadius:
                                7,

                            borderWidth:
                                3,

                            tension:
                                0.25
                        },


                        {
                            type:
                                'scatter',

                            label:
                                'Ihre Auswahl',

                            data: [
                                {
                                    x:
                                    selectedAge,

                                    y:
                                    selectedRate
                                }
                            ],

                            parsing:
                                false,

                            backgroundColor:
                                '#E38500',

                            borderColor:
                                '#FFFCFE',

                            pointRadius:
                                10,

                            pointHoverRadius:
                                12,

                            pointBorderWidth:
                                3
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

                                        const value =
                                            context.raw.y
                                                .toFixed(1)
                                                .replace(
                                                    '.',
                                                    ','
                                                );


                                        if (
                                            context.dataset.label ===
                                            'Ihre Auswahl'
                                        ) {

                                            return `${context.raw.x} Jahre: ca. ${value} pro 100'000`;
                                        }


                                        return `${value} pro 100'000`;
                                    }
                            }
                        }
                    },

                    scales: {
                        x: {
                            type:
                                'linear',

                            min:
                                18,

                            max:
                                100,

                            grid: {
                                display:
                                    false
                            },

                            ticks: {
                                color:
                                    '#FFFCFE',

                                stepSize:
                                    10
                            },

                            title: {
                                display:
                                    true,

                                text:
                                    'Alter',

                                color:
                                    '#FFFCFE'
                            }
                        },

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
                                    '#FFFCFE'
                            }
                        }
                    }
                }
            }
        );


    updateFinalAgeChart(
        selectedAge
    );
}


// Abschlussdiagramm aktualisieren

function updateFinalAgeChart(
    age
) {

    if (
        !finalAgeChart
    ) {

        return;
    }


    const curveData =
        finalAgeChart
            .data
            .datasets[0]
            .data;


    const rate =
        getFinalAgeRate(
            age,
            curveData
        );


    finalAgeChart
        .data
        .datasets[1]
        .data = [
        {
            x:
            age,

            y:
            rate
        }
    ];


    finalAgeChart.update();


    const formattedRate =
        rate
            .toFixed(1)
            .replace(
                '.',
                ','
            );


    finalAgeChartNote.textContent =
        `${age} Jahre – ungefähr ${formattedRate} ursächlich Beteiligte pro 100'000 Führerausweisinhaber:innen.`;
}


// ========================================
// Alle Grafiken starten
// ========================================

createAbsoluteAccidentsChart()
    .catch(error => {
        console.error(error);
    });


createLicenceDevelopmentChart()
    .catch(error => {
        console.error(error);
    });


createAccidentRateChart()
    .catch(error => {
        console.error(error);
    });


createSeverityChart()
    .catch(error => {
        console.error(error);
    });


createFinalAgeChart()
    .catch(error => {
        console.error(error);
    });


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

                const textOpacity =
                    Math.max(
                        1 - rawProgress * 2.5,
                        0
                    );


                heroContent.style.opacity =
                    textOpacity;


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