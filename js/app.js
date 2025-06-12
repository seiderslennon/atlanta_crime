// **1**: define your bounds _before_ you use them
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

// 1) fetch and cache your GeoJSON
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
  
  // draw the initial data
  updateHeat();
}

// 2) wire up the checkboxes
function initFilters() {
  const inputs = document
    .querySelectorAll('#crime-filters input[type=checkbox]');
  inputs.forEach(cb => cb.addEventListener('change', updateHeat));
}

// 3) filter + re-draw
function updateHeat() {
  // which types are checked?
  const active = Array.from(
    document.querySelectorAll('#crime-filters input:checked')
  ).map(cb => cb.value);
  
  // build new heatData
  const heatData = allFeatures
    .filter(f => active.includes(f.properties.Crime_Against))
    .map(f => {
      const [lon, lat] = f.geometry.coordinates;
      return [lat, lon, 1];
    });
  
  // replace the points in the heat layer
  heatLayer.setLatLngs(heatData);
}
