const cityBounds = [
  [33.6501, -84.27],
  [33.8501, -84.4885]
];

const map = L.map('map', {
  minZoom: 13,
  maxZoom: 17,
  maxBounds: cityBounds,
  maxBoundsViscosity: 1.0,
  zoomControl: false,     // ← disable the [+]/[-] buttons
}).fitBounds(cityBounds);

L.tileLayer(
  'https://tiles.stadiamaps.com/tiles/stamen_toner/{z}/{x}/{y}{r}.png',
  { attribution: '© Stadia Maps, © OpenStreetMap' }
).addTo(map);

let allFeatures = [];
fetch('data/crimes_reduced.geojson')
  .then(res => res.json())
  .then(gj => {
    allFeatures = gj.features;
    initHeat();
    initFilters();
  })
  .catch(err => console.error('Could not load GeoJSON', err));

let heatLayer;
function initHeat() {
  // create empty heat layer and add to map
  heatLayer = L.heatLayer([], {
    radius: 7,
    blur: 20,
    maxZoom: 17,
    gradient: {
      0.1: 'rgba(0,0,255,0.8)',
      0.3: 'rgba(0,255,0,0.8)',
      0.5: 'rgba(255,255,0,0.8)',
      0.7: 'rgba(255,0,0,0.8)'
    }
  }).addTo(map);
  
  updateHeat();
}

function initFilters() {
  const inputs = document
    .querySelectorAll('#crime-filters input[type=checkbox]');
  inputs.forEach(cb => cb.addEventListener('change', updateHeat));
}

const countEl = document.getElementById('crime-count');

function updateHeat() {
  const active = Array.from(
    document.querySelectorAll('#crime-filters input:checked')
  ).map(cb => cb.value);

  const filtered = allFeatures.filter(f =>
    active.includes(f.properties.Crime_Against)
  );
  const heatData = filtered.map(f => {
    const [lon, lat] = f.geometry.coordinates;
    return [lat, lon, 1];
  });

  heatLayer.setLatLngs(heatData);

  countEl.textContent = filtered.length.toLocaleString();
}
