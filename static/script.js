const map = L.map('map').setView([60.1699, 24.9384], 13);

L.tileLayer('https://{s}.tile.openstreetmap.de/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);