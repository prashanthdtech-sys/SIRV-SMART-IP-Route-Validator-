// spinner.js

function showSpinner(spinnerId) {
  const spinner = document.getElementById(spinnerId);
  if (spinner) spinner.classList.remove("hidden");
}

function hideSpinner(spinnerId) {
  const spinner = document.getElementById(spinnerId);
  if (spinner) spinner.classList.add("hidden");
}
