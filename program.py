from fastapi import FastAPI
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
import uvicorn

# 1. Capa de Datos (Backend / GeoJSON virtual)
# Generamos la posición en Bogotá de la mascota (chip imaginario)
mascota_data = {
    "type": "FeatureCollection",
    "features": [
        {
            "type": "Feature",
            "geometry": {
                "type": "Point",
                "coordinates": [-74.0721, 4.6097] # Longitud, Latitud de Bogotá (Centro)
            },
            "properties": {
                "name": "Firulais (Tu Mascota)",
                "status": "🐾 Chip Rastreado Activo",
                "color": "#f43f5e"
            }
        }
    ]
}

# 2. Capa de Backend (FastAPI / Servidor)
app = FastAPI(title="Encuentro de Animales API")

# Servimos los archivos estáticos de la capa de presentación (Frontend)
app.mount("/static", StaticFiles(directory="."), name="static")

@app.get("/")
def read_root():
    """Servir nuestro archivo HTML principal"""
    return FileResponse('index.html')

@app.get("/api/mascota/ubicacion")
def get_ubicacion():
    """Endpoint para enviar el archivo GeoJSON al frontend"""
    return mascota_data

if __name__ == "__main__":
    print("Iniciando el servidor de Encuentro de Animales en http://localhost:8888")
    uvicorn.run(app, host="0.0.0.0", port=8888)