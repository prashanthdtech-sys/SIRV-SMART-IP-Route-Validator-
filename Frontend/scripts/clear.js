// clear.js

function clearRoutes() {
  localStorage.removeItem("routesInput");
  localStorage.removeItem("routesResults");

  const input = document.getElementById("routesInput");
  const results = document.getElementById("routesResults");

  if (input) input.value = "";
  if (results) {
    results.innerHTML = "";
    results.classList.add("hidden");
  }
}
