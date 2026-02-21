const timestamp = document.getElementById("desktop-launch-time");
if (timestamp) {
  timestamp.textContent = new Date().toLocaleString();
}
