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

    saveMessage.textContent = `Deine Antwort wurde gespeichert: ${selectedAge} Jahre.`;
});