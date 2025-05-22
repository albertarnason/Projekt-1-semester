
const toggle = document.getElementById("toggle");

const thumbText = document.getElementById("thumbText");

toggle.addEventListener("change", function () {

  if (this.checked) {
    thumbText.textContent = "Produktion"; 
    produktion_or_sale = "produktion";
    if (buttonyear == 2024) {
      worldstate = produktion2024;
    } else {
      worldstate = produktion2025;
    }
  } else {
    thumbText.textContent = "Salg"; 
    produktion_or_sale = "salg";
    if (buttonyear == 2024) {
      worldstate = salg2024;
    } else {
      worldstate = salg2025;
    }
  }
  updateData(worldstate);
});

const buttons = document.querySelectorAll(".yearButtons button");

buttons.forEach((btn) => {
  btn.addEventListener("click", () => {
  
    buttons.forEach((b) => b.classList.remove("active"));

    btn.classList.add("active");

    buttonyear = parseInt(btn.dataset.year, 10);


    if (buttonyear == 2024 && produktion_or_sale == "salg") {
      worldstate = salg2024;
    } else if (buttonyear == 2025 && produktion_or_sale == "salg") {
      worldstate = salg2025;
    } else if (buttonyear == 2024 && produktion_or_sale == "produktion") {
      worldstate = produktion2024;
    } else {
      worldstate = produktion2025;
    }
    updateData(worldstate);
  });
});

