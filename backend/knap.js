// Hent elementet med id 'toggle' (checkboxen)
const toggle = document.getElementById('toggle');

// Hent elementet med id 'thumbText' (den bevægelige tekst i slideren)
const thumbText = document.getElementById('thumbText');

// Lyt efter ændringer på 'toggle'-input (når checkboxen bliver ændret)
toggle.addEventListener('change', function () {
  // Hvis checkboxen er checked (slideren er til højre eller venstre)
  if (this.checked) {
    thumbText.textContent = "Salg"; // Sætter teksten i slideren til "Salg"
  } else {
    thumbText.textContent = "Produktion"; // Sætter teksten i slideren til "Produktion"
  }
});

// Optional: Ændre tekst ved at lytte på sliderens position
toggle.addEventListener('input', function () {
  if (this.checked) {
    thumbText.textContent = "Salg"; // Sætter teksten til Salg når slideren er på højre
  } else {
    thumbText.textContent = "Produktion"; // Sætter teksten til Produktion når slideren er på venstre
  }
});