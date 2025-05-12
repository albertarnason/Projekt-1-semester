fetch("svg.html") // henter filen svg.html
  .then((response) => response.text()) // Når det er gjort, konverterer det til tekst (HTML-strenge)
  .then((html) => {
    document.getElementById("svg-pladsholder").innerHTML = html;
  });
