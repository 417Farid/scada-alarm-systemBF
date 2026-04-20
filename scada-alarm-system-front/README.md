# 🎨 Frontend - SCADA Alarm Dashboard

## 📌 Descripción

Este frontend es un dashboard interactivo desarrollado en React para visualizar y analizar alarmas SCADA procesadas por el backend.

Permite explorar datos en tiempo real mediante tablas, métricas y agregaciones.

---

## 🧰 Tecnologías

- React
- Vite
- JavaScript (JSX)
- Tailwind CSS
- Axios
- ESLint
- PostCSS
- Autoprefixer

---

## 🚀 Funcionalidades

- 📊 Visualización de métricas(Stats):
  - Total de alarmas
  - Anomalías
  - Distribución por criticidad

- 🏷️ Top tags dinámico:
  - Filtrado por rango de tiempo (24h, 7d, 30d)

- 📋 Tabla de alarmas:
  - Paginación
  - Filtros por:
    - tag
    - criticidad
    - rango de fechas

- 🎨 UI moderna:
  - Tema oscuro estilo dashboard industrial
  - Colores por criticidad
  - Componentes responsivos


## 🔌 Conexión con backend

El frontend consume la API mediante Axios.
http://localhost:5173

## Archivo clave:

src/api/client.js

## 🧠 Decisiones técnicas
Uso de componentes desacoplados para facilitar mantenimiento
Manejo de estado local (sin Redux) por simplicidad
Paginación controlada mediante skip y limit
Consumo dinámico de endpoints con filtros
Diseño enfocado en claridad y análisis de datos

## 🚀 Consideraciones
La UI prioriza legibilidad sobre complejidad visual
Se manejan correctamente estados sin datos (rangos vacíos)
El frontend depende completamente del backend para la información

## ⚠️ Carga de datos

El frontend requiere que existan datos en el backend.

Para cargar datos:

Ir a: http://localhost:8000/docs
Ejecutar el endpoint POST /process-file con el file_path = data.csv
Refrescar el frontend

## 🐳 Ejecución con Docker (recomendado)

El frontend está preparado para ejecutarse dentro de un contenedor Docker.

Desde la raíz del proyecto:

```bash
docker-compose up --build

---
