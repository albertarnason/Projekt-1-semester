
const toggle = document.getElementById('toggle');

const thumbText = document.getElementById('thumbText');

toggle.addEventListener('change', function () {
  if (this.checked) {
    thumbText.textContent = "Salg"; 
  } else {
    thumbText.textContent = "Produktion"; 
  }
});

