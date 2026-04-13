// CAPA DE LÓGICA FRONTEND (Javascript)

let map;
let dogMarker;

// 1. Inicializar el mapa centrado en BOGOTÁ
function initMap() {
    // Coordenadas base de Bogotá, Zoom 13
    map = L.map('map').setView([4.6097, -74.0817], 12);

    // Mapa estándar y claro (OpenStreetMap)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19
    }).addTo(map);
}

// 2. Icono personalizado para nuestro chip / mascota
const petIcon = L.icon({
    // Usamos el icono de un perrito
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/10555/10555621.png',
    iconSize: [50, 50],
    iconAnchor: [25, 50],
    popupAnchor: [0, -50]
});

// 3. Consumir el Backend e insertar los datos en el mapa (GeoJSON)
async function fetchPetLocation() {
    try {
        const response = await fetch('/api/mascota/ubicacion');
        if (!response.ok) {
            throw new Error(`Error en el servidor: ${response.status}`);
        }
        
        const geojsonData = await response.json();
        
        // Cargar GeoJSON en el mapa
        const geoJsonLayer = L.geoJSON(geojsonData, {
            pointToLayer: function(feature, latlng) {
                // Instanciar el marcador
                dogMarker = L.marker(latlng, {icon: petIcon});
                return dogMarker;
            },
            onEachFeature: function(feature, layer) {
                if (feature.properties && feature.properties.name) {
                    const popupContent = `
                        <div class="popup-title">${feature.properties.name}</div>
                        <div>${feature.properties.status}</div>
                    `;
                    layer.bindPopup(popupContent);
                }
            }
        }).addTo(map);

        // Automáticamente abrir el popup indicando que lo encontró y centrar el mapa en la mascota de inmediato
        if(dogMarker) {
            map.flyTo(dogMarker.getLatLng(), 16, { animate: true, duration: 1.5 });
            dogMarker.openPopup();
            
            // Forzar actualización visual del mapa (previene que se vea gris al cargar muy rápido)
            setTimeout(() => { map.invalidateSize(); }, 500);
        }

    } catch (error) {
        console.error('Error cargando la ubicación del chip:', error);
        alert("Ops! No se pudo conectar al Backend para encontrar a tu mascota. Verifica que el servidor program.py está corriendo.");
        
        // --- FALLBACK (Solo visual, en caso de fallo) ---
        // Si el usuario abre el html directamente, le mostramos el perrito igual a modo de muestra
        dogMarker = L.marker([4.6097, -74.0721], {icon: petIcon}).addTo(map);
        dogMarker.bindPopup(`<div class="popup-title">Firulais (Modo Prueba)</div><div>🐾 Chip de respaldo activo</div>`).openPopup();
        map.flyTo(dogMarker.getLatLng(), 16, { animate: true, duration: 1.5 });
        setTimeout(() => { map.invalidateSize(); }, 500);
    }
}

// 4. Lógica de los botones y arranque
document.addEventListener('DOMContentLoaded', () => {
    initMap();
    fetchPetLocation();

    // Evento de botón para centrar en la mascota
    const btn = document.getElementById('locate-btn');
    btn.addEventListener('click', () => {
        if (dogMarker) {
            map.flyTo(dogMarker.getLatLng(), 16, {
                animate: true,
                duration: 1.5
            });
            dogMarker.openPopup();
        }
    });
});
