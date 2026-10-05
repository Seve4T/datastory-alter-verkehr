// Erste Altersfrage

const ageRange = document.querySelector('#ageRange');
const ageOutput = document.querySelector('#ageOutput');
const saveAgeButton = document.querySelector('#saveAge');
const saveMessage = document.querySelector('#saveMessage');


// Zahl während des Verschiebens anzeigen

ageRange.addEventListener('input', () => {
    ageOutput.textContent = ageRange.value;
});


// Gewählte Antwort speichern

saveAgeButton.addEventListener('click', () => {
    const selectedAge = ageRange.value;

    localStorage.setItem('selectedAge', selectedAge);

    saveMessage.textContent =
        `Deine Antwort wurde gespeichert: ${selectedAge} Jahre.`;
});


// Absolute Unfallzahlen 2025

const absoluteAccidentsCanvas =
    document.querySelector('#absoluteAccidentsChart');


// Daten laden

async function loadTrafficData() {

    const response = await fetch('https://zu-alt-fuers-steuer-im3.isobopad.myhostpoint.ch/unload.php');

    if (!response.ok) {
        throw new Error('Die Daten konnten nicht geladen werden.');
    }

    return await response.json();
}


// Grafik erstellen

async function createAbsoluteAccidentsChart() {

    const trafficData = await loadTrafficData();


    // Nur das Jahr 2025 verwenden

    const data2025 = trafficData.filter(row => {
        return Number(row.year) === 2025;
    });


    // Altersgruppen für Chart.js

    const labels = data2025.map(row => {
        return row.age_group;
    });


    // Absolute Unfallzahlen

    const values = data2025.map(row => {
        return Number(row.causally_involved);
    });


    // Farben für die Balken

    const barColors = labels.map(ageGroup => {

        if (ageGroup === '20-29') {
            return '#E38500';
        }

        return '#6594DB';
    });


    // Diagramm erstellen

    new Chart(absoluteAccidentsCanvas, {
        type: 'bar',

        data: {
            labels: labels,

            datasets: [
                {
                    label: 'Ursächlich Beteiligte',

                    data: values,

                    backgroundColor: barColors,

                    borderRadius: 4
                }
            ]
        },

        options: {
            responsive: true,

            maintainAspectRatio: false,

            plugins: {
                legend: {
                    display: false
                },

                tooltip: {
                    callbacks: {
                        label: function (context) {

                            return `${context.raw.toLocaleString('de-CH')} Beteiligte`;
                        }
                    }
                }
            },

            scales: {
                x: {
                    grid: {
                        display: false
                    },

                    ticks: {
                        color: '#FFFCFE'
                    }
                },

                y: {
                    beginAtZero: true,

                    grid: {
                        color: 'rgba(255, 252, 254, 0.15)'
                    },

                    ticks: {
                        color: '#FFFCFE'
                    }
                }
            }
        }
    });
}


// Grafik starten

createAbsoluteAccidentsChart().catch(error => {
    console.error(error);
});

// Entwicklung der Führerausweisinhaber:innen 2016–2025

const licenceDevelopmentCanvas =
    document.querySelector('#licenceDevelopmentChart');

let licenceDevelopmentChart;


// Grafik erstellen

async function createLicenceDevelopmentChart() {

    const trafficData = await loadTrafficData();


    // Daten von 2016

    const data2016 = trafficData.filter(row => {
        return Number(row.year) === 2016;
    });


    // Daten von 2025

    const data2025 = trafficData.filter(row => {
        return Number(row.year) === 2025;
    });


    // Altersgruppen

    const labels = data2016.map(row => {
        return row.age_group;
    });


    // Führerausweisinhaber:innen 2016

    const values2016 = data2016.map(row => {
        return Number(row.license_holders);
    });


    // Führerausweisinhaber:innen 2025

    const values2025 = data2025.map(row => {
        return Number(row.license_holders);
    });


    // Diagramm zuerst nur mit 2016 erstellen

    licenceDevelopmentChart = new Chart(
        licenceDevelopmentCanvas,
        {
            type: 'bar',

            data: {
                labels: labels,

                datasets: [
                    {
                        label: '2016',
                        data: values2016,

                        backgroundColor: '#6594DB',

                        borderRadius: 4
                    }
                ]
            },

            options: {
                responsive: true,
                maintainAspectRatio: false,

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
                                    context.raw.toLocaleString('de-CH');

                                return `${context.dataset.label}: ${value}`;
                            }
                        }
                    }
                },

                scales: {
                    x: {
                        grid: {
                            display: false
                        },

                        ticks: {
                            color: '#FFFCFE'
                        }
                    },

                    y: {
                        beginAtZero: true,

                        grid: {
                            color: 'rgba(255, 252, 254, 0.15)'
                        },

                        ticks: {
                            color: '#FFFCFE',

                            callback: function (value) {
                                return value.toLocaleString('de-CH');
                            }
                        }
                    }
                }
            }
        }
    );


    // Scroll-Beobachtung starten

    observeLicenceChart(values2025);
}


// 2025 beim Scrollen einblenden

function observeLicenceChart(values2025) {

    const licenceGraphic =
        document.querySelector('.graphic--licence-development');


    const observer = new IntersectionObserver(
        entries => {

            entries.forEach(entry => {

                if (entry.isIntersecting) {

                    showLicenceData2025(values2025);

                    observer.unobserve(licenceGraphic);
                }
            });
        },

        {
            threshold: 0.6
        }
    );


    observer.observe(licenceGraphic);
}


// Daten von 2025 ergänzen

function showLicenceData2025(values2025) {

    licenceDevelopmentChart.data.datasets.push({
        label: '2025',

        data: values2025,

        backgroundColor: '#E38500',

        borderRadius: 4
    });


    licenceDevelopmentChart.update();
}


// Grafik starten

createLicenceDevelopmentChart().catch(error => {
    console.error(error);
});

// Relative Unfallbeteiligung pro 100'000 Führerausweisinhaber:innen

const accidentRateCanvas =
    document.querySelector('#accidentRateChart');

let accidentRateChart;


// Grafik erstellen

async function createAccidentRateChart() {

    const trafficData = await loadTrafficData();


    // Nur das Jahr 2025 verwenden

    const data2025 = trafficData.filter(row => {
        return Number(row.year) === 2025;
    });


    // Feste Reihenfolge der Altersgruppen

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


    // Daten in die richtige Reihenfolge bringen

    const sortedData = ageGroupOrder.map(ageGroup => {
        return data2025.find(row => {
            return row.age_group === ageGroup;
        });
    }).filter(row => {
        return row !== undefined;
    });


    // Altersgruppen für Chart.js

    const labels = sortedData.map(row => {
        return row.age_group;
    });


    // Rate berechnen

    const values = sortedData.map(row => {

        const causallyInvolved =
            Number(row.causally_involved);

        const licenseHolders =
            Number(row.license_holders);

        return (
            causallyInvolved
            / licenseHolders
            * 100000
        );
    });


    // Farben der Punkte

    const pointColors = labels.map(ageGroup => {

        if (
            ageGroup === '60-69'
            || ageGroup === '80-89'
            || ageGroup === '90+'
        ) {
            return '#E38500';
        }

        return '#6594DB';
    });


    // Diagramm erstellen

    accidentRateChart = new Chart(
        accidentRateCanvas,
        {
            type: 'line',

            data: {
                labels: labels,

                datasets: [
                    {
                        label:
                            "Ursächlich Beteiligte pro 100'000 Führerausweisinhaber:innen",

                        data: values,

                        borderColor: '#6594DB',

                        backgroundColor: '#6594DB',

                        pointBackgroundColor:
                        pointColors,

                        pointBorderColor:
                        pointColors,

                        pointRadius: 5,

                        pointHoverRadius: 7,

                        borderWidth: 3,

                        tension: 0.25
                    }
                ]
            },

            options: {
                responsive: true,

                maintainAspectRatio: false,

                plugins: {
                    legend: {
                        display: false
                    },

                    tooltip: {
                        callbacks: {
                            label: function (context) {

                                const value =
                                    context.raw
                                        .toFixed(1)
                                        .replace('.', ',');

                                return `${value} pro 100'000`;
                            }
                        }
                    }
                },

                scales: {
                    x: {
                        grid: {
                            display: false
                        },

                        ticks: {
                            color: '#FFFCFE'
                        }
                    },

                    y: {
                        beginAtZero: true,

                        grid: {
                            color:
                                'rgba(255, 252, 254, 0.15)'
                        },

                        ticks: {
                            color: '#FFFCFE'
                        },

                        title: {
                            display: true,

                            text:
                                "Beteiligte pro 100'000",

                            color: '#FFFCFE'
                        }
                    }
                }
            }
        }
    );
}


// Grafik starten

createAccidentRateChart().catch(error => {
    console.error(error);
});

// Unfallschwere nach Altersgruppe

const severityCanvas =
    document.querySelector('#severityChart');

let severityChart;


// Grafik erstellen

async function createSeverityChart() {

    const trafficData = await loadTrafficData();


    // Altersgruppen

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


    // Werte über alle Jahre zusammenfassen

    const severityData = ageGroupOrder.map(ageGroup => {

        const rows = trafficData.filter(row => {
            return row.age_group === ageGroup;
        });


        let fatal = 0;
        let serious = 0;
        let minor = 0;


        rows.forEach(row => {
            fatal += Number(row.fatal);
            serious += Number(row.serious_injuries);
            minor += Number(row.minor_injuries);
        });


        const total =
            fatal
            + serious
            + minor;


        const severeShare =
            ((fatal + serious) / total) * 100;


        const lightShare =
            (minor / total) * 100;


        return {
            ageGroup: ageGroup,
            lightShare: lightShare,
            severeShare: severeShare
        };
    });


    // Labels

    const labels = severityData.map(row => {
        return row.ageGroup;
    });


    // Leichte Unfälle

    const lightValues = severityData.map(row => {
        return row.lightShare;
    });


    // Schwere und tödliche Unfälle

    const severeValues = severityData.map(row => {
        return row.severeShare;
    });


    // Diagramm zuerst nur als 100%-Balken

    severityChart = new Chart(
        severityCanvas,
        {
            type: 'bar',

            data: {
                labels: labels,

                datasets: [
                    {
                        label: 'Leicht',

                        data: labels.map(() => {
                            return 100;
                        }),

                        backgroundColor: '#6594DB',

                        borderRadius: 4,

                        stack: 'severity'
                    },

                    {
                        label: 'Schwer / tödlich',

                        data: labels.map(() => {
                            return 0;
                        }),

                        backgroundColor: '#E38500',

                        borderRadius: 4,

                        stack: 'severity'
                    }
                ]
            },

            options: {
                responsive: true,

                maintainAspectRatio: false,

                indexAxis: 'y',

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
                                    context.raw.toFixed(1)
                                        .replace('.', ',');

                                return `${context.dataset.label}: ${value} %`;
                            }
                        }
                    }
                },

                scales: {
                    x: {
                        stacked: true,

                        min: 0,
                        max: 100,

                        grid: {
                            color:
                                'rgba(255, 252, 254, 0.15)'
                        },

                        ticks: {
                            color: '#FFFCFE',

                            callback: function (value) {
                                return `${value} %`;
                            }
                        }
                    },

                    y: {
                        stacked: true,

                        grid: {
                            display: false
                        },

                        ticks: {
                            color: '#FFFCFE'
                        }
                    }
                }
            }
        }
    );


    // Scroll-Beobachtung starten

    observeSeverityChart(
        lightValues,
        severeValues
    );
}


// Beim Scrollen schwere/tödliche Anteile zeigen

function observeSeverityChart(
    lightValues,
    severeValues
) {

    const severityGraphic =
        document.querySelector('.graphic--severity');


    const observer =
        new IntersectionObserver(
            entries => {

                entries.forEach(entry => {

                    if (entry.isIntersecting) {

                        showSeverityShares(
                            lightValues,
                            severeValues
                        );

                        observer.unobserve(
                            severityGraphic
                        );
                    }
                });
            },

            {
                threshold: 0.6
            }
        );


    observer.observe(severityGraphic);
}


// Echte Anteile einblenden

function showSeverityShares(
    lightValues,
    severeValues
) {

    severityChart.data.datasets[0].data =
        lightValues;

    severityChart.data.datasets[1].data =
        severeValues;


    severityChart.update();
}


// Grafik starten

createSeverityChart().catch(error => {
    console.error(error);
});