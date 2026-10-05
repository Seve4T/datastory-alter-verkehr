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

    const response = await fetch('unload.php');

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