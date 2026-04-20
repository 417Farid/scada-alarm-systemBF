# SCADA Alarm System

Plataforma full stack para ingestar, validar, normalizar, almacenar y visualizar alarmas industriales tipo SCADA.

La solucion incluye:

- `Backend` en FastAPI para procesamiento e indicadores.
- `Base de datos` SQL Server para persistencia.
- `Frontend` en React + Vite para visualizacion operativa.
- `Docker Compose` para levantar todo el entorno de forma reproducible.

## Como probar rapidamente la solucion

----------------------------------------------------------------------------

Para una validacion rapida, el evaluador puede seguir este flujo:

1. clonar el repositorio
2. copiar los `.env.example` a `.env` para practicidad de la prueba
3. ejecutar `docker-compose up --build`, recomiendo usar Git Bash.
4. abrir `http://localhost:8000/docs` y hacer el post de /process-file con el file_path= data.csv. Esto iniciara el procesamiento de los datos y se enviara la informacion a la base de datos.
5. abrir `http://localhost:5173`
6. revisar dashboard, tabla, filtros y estadisticas
7. abrir `http://localhost:8000/docs` para validar endpoints(/alarms(Get Alarms), /alarms/top-tags(GET TOP TAGS), /alarms/stats(GET STATS))

----------------------------------------------------------------------------

### ⚠️ Carga de datos manual

El procesamiento de datos (`POST /process-file`) se realiza de forma manual y no automática al iniciar el sistema.

Esta decisión fue tomada para evitar la duplicación de registros en la base de datos en cada reinicio de la aplicación, ya que la ingestión no es idempotente por defecto.

Además, se buscó mantener una separación clara entre:

- la ingestión de datos (proceso controlado)
- la consulta y visualización (frontend)

Esto permite simular un escenario más realista, donde los datos llegan de manera controlada (por lotes) y no automáticamente en cada despliegue.

El sistema incluye una tabla de `ingestion_batches` para mantener trazabilidad de cada carga.

Para visualizar datos en el dashboard, es necesario ejecutar previamente el endpoint desde la documentación de la API.

----------------------------------------------------------------------------

## 1. Objetivo del proyecto

El proyecto busca simular un flujo realista de tratamiento de alarmas SCADA:

1. generar un dataset de eventos con comportamiento cercano a un entorno industrial
2. procesar registros validos e invalidos
3. normalizar la informacion para consulta analitica
4. almacenar trazabilidad de carga, datos crudos, datos limpios y errores
5. exponer endpoints para consulta de alarmas, estadisticas y top de tags
6. mostrar esa informacion en un dashboard web

## 2. Descripcion de la solucion

La solucion se organiza en tres componentes principales.

### Backend

Ubicado en `scada-alarm-system-back`, implementado con FastAPI, SQLAlchemy y `pyodbc`.

Responsabilidades principales:

- inicializar la base de datos al arrancar
- crear automaticamente la base `scada_db` si no existe
- generar un dataset de prueba en CSV/JSON. Se generan automáticamente ambos archivos de ejemplo, cada uno con 5.000 eventos. Si se desea crear un nuevo dataset con otra cantidad de registros o en un formato específico, basta con ejecutar en la consola del backend el comando python.exe scripts/generate_data.py both 5000`. En este caso, `both` indica que se generarán los dos formatos disponibles, se puede poner JSON o CSV como se desee, y `5000` corresponde al número de eventos a crear. El script `generate_data.py` incluye validaciones y manejo de errores para evitar parámetros inválidos.`
- leer y procesar archivos de entrada
- separar registros validos e invalidos
- normalizar estructura y valores
- guardar resultados en SQL Server
- exponer endpoints REST para consumo del frontend

### Base de datos

Se usa SQL Server 2022 en contenedor Docker.

La persistencia esta separada por capas de informacion:

- `ingestion_batches`: historial de cargas
- `alarm_raw`: datos crudos recibidos
- `alarm_clean`: eventos validados y normalizados
- `alarm_error`: registros rechazados y motivo del error

Esta separacion permite trazabilidad, auditoria y analitica simple sobre el pipeline.

Se hicieron indices en la tabla de alarm_clean para mejorar el rendiminento de las consultas.

### Frontend

Ubicado en `scada-alarm-system-front`, implementado con React y Vite.

El dashboard muestra:

- estadisticas globales
- distribucion por criticidad
- conteo de anomalias
- top tags
- tabla paginada de alarmas
- filtros por fecha, tag y criticidad

## 3. Arquitectura general

```text
Dataset CSV/JSON
        |
        v
FastAPI ingestion pipeline
        |
        +--> alarm_raw
        +--> alarm_clean
        +--> alarm_error
        +--> ingestion_batches
        |
        v
REST API
        |
        v
React Dashboard
```

## 4. Flujo de procesamiento

El flujo principal del backend es:

1. se recibe una ruta de archivo mediante `POST /process-file`
2. se registra un lote de ingestion
3. se lee el archivo con pandas
4. cada fila pasa por validacion
5. si el registro es valido, se normaliza
6. si el registro es invalido, se almacena como error
7. se guardan datos crudos, datos limpios y errores
8. se actualiza el estado final del lote

Esto permite diferenciar claramente entre:

- lo que llego al sistema
- lo que fue aceptado
- lo que fue rechazado

## 5. Endpoints principales

El backend expone los siguientes endpoints:

- `GET /alarms`
  Devuelve alarmas limpias con filtros opcionales por `start_time`, `end_time`, `tag`, `criticality`, `skip` y `limit`.

- `GET /alarms/stats`
  Devuelve el total de alarmas, distribucion por criticidad y total de anomalias.

- `GET /alarms/top-tags`
  Devuelve los tags mas frecuentes, con conteo y porcentaje sobre el total filtrado.

- `POST /process-file`
  Procesa un archivo CSV o JSON indicado por ruta.

Documentacion interactiva:

- `http://localhost:8000/docs`

## 6. Decisiones tecnicas y justificacion

### FastAPI en el backend

Se eligio FastAPI por:

- rapidez de desarrollo
- tipado claro
- documentacion Swagger automatica
- buena integracion con servicios REST

Es una opcion muy adecuada para una prueba tecnica donde importa claridad, velocidad de implementacion y facilidad de validacion.

### SQL Server como motor relacional

Se eligio SQL Server porque encaja bien con escenarios empresariales e industriales donde suelen existir plataformas Microsoft, integraciones ODBC y necesidades de consulta estructurada.

Adicionalmente:

- funciona bien con `pyodbc`
- permite modelar entidades relacionales de forma simple
- facilita agregaciones para indicadores operativos

### Separacion en tablas raw, clean y error

Esta fue una decision importante para no perder trazabilidad.

- `raw` conserva lo que llego
- `clean` conserva lo que el sistema acepta como util para consumo
- `error` conserva lo que fallo y por que fallo

Esto es mejor que sobrescribir o descartar registros, porque ayuda a explicar el comportamiento del pipeline y facilita debugging.

### Docker Compose para entorno reproducible

Docker era opcional, pero se incorporo porque mejora mucho la experiencia de evaluacion.

Beneficios:

- evita instalar SQL Server localmente
- deja versionadas las dependencias principales
- reduce diferencias entre entornos
- permite levantar backend, frontend y base con un solo comando

### Ajustes realizados para robustez del entorno

Durante la puesta a punto del proyecto se realizaron ajustes para asegurar que el sistema funcione de forma consistente al clonar el repositorio:

- backend fijado sobre `python:3.11-slim-bookworm` para compatibilidad con ODBC
- instalacion de `msodbcsql18` con repositorio Microsoft actualizado
- espera activa del backend hasta que SQL Server este saludable
- creacion automatica de `scada_db` al arrancar
- configuracion del frontend para consumir `http://localhost:8000`

## 7. Supuestos realizados para la generacion del dataset

El dataset fue generado artificialmente para simular alarmas industriales con mezcla de casos validos e invalidos.

Supuestos principales:

- los equipos monitoreados se representan mediante tags como `MOTOR_1`, `PUMP_1`, `VALVE_1`, `TEMP_SENSOR`, etc.
- la criticidad puede tomar valores `LOW`, `MEDIUM`, `HIGH` y `CRITICAL`
- los estados operativos principales son `ACTIVE` y `CLEARED`
- el porcentaje de errores intencionales es `30%`
- el `70%` de eventos se concentra en los ultimos 7 dias
- el `30%` restante representa historico de hasta aproximadamente 6 años
- algunos timestamps antiguos anteriores al ano 2000 se tratan como anomalias
- los timestamps no deben superar la fecha actual local del entorno configurado

Errores sinteticos inyectados:

- ausencia de campos
- timestamps invalidos
- valores numericos corruptos
- tags nulos
- cadenas sucias con espacios y minusculas
- estados no validos
- timestamps excesivamente antiguos

La idea de estos supuestos fue simular un escenario razonable de calidad de datos industrial, donde no todo lo que entra al sistema llega limpio.

## 8. Normalizacion y reglas de validacion

El pipeline aplica reglas simples pero utiles:

- `timestamp` debe existir y ser interpretable
- `tag` no puede ser nulo o vacio
- `criticality` debe pertenecer al conjunto permitido
- `value` debe ser numerico cuando exista
- los textos se limpian y se convierten a mayusculas cuando aplica
- eventos anteriores al ano 2000 se marcan como anomalia

Algunos campos se corrigen en vez de rechazar el registro por completo. Por ejemplo:

- `tag` y `criticality` se normalizan
- `state` ausente o invalido puede terminar en `UNKNOWN`
- `ack` faltante puede quedar en `UNACK`

Esto responde a un criterio pragmatica: no todo dato imperfecto debe descartarse si aun conserva valor operativo.

## 9. Estructura del repositorio

```text
.
├── docker-compose.yml
├── README.MD
├── scada-alarm-system-back
│   ├── Dockerfile
│   ├── requirements.txt
│   ├── scripts/generate_data.py
│   └── app
│       ├── api
│       ├── core
│       ├── ingestion
│       ├── models
│       ├── repositories
│       ├── schemas
│       └── services
└── scada-alarm-system-front
    ├── Dockerfile
    ├── package.json
    └── src
        ├── api
        ├── components
        └── pages
```

## 10. Instrucciones claras de ejecucion con Docker

Esta es la forma recomendada de correr el proyecto.

### Requisitos

- Docker
- Docker Compose

### Paso 1. Clonar el repositorio

```bash
git clone https://github.com/417Farid/scada-alarm-systemBF.git
cd scada-alarm-systemBF
```

### Paso 2. Crear archivos `.env` guiandose del .env.example

Backend:

```bash
cp scada-alarm-system-back/.env.example scada-alarm-system-back/.env

o se puede hacer manualmente.
```

Frontend:

```bash
cp scada-alarm-system-front/.env.example scada-alarm-system-front/.env

o se puede hacer manualmente.
```

Si estas en Windows PowerShell:

```powershell
Copy-Item .\scada-alarm-system-back\.env.example .\scada-alarm-system-back\.env
Copy-Item .\scada-alarm-system-front\.env.example .\scada-alarm-system-front\.env
```

### Paso 3. Levantar el entorno

```bash
docker-compose up --build
```

### Paso 4. Esperar inicializacion

En el primer arranque ocurren estas tareas:

- se construye backend y frontend
- SQL Server termina de iniciar
- el backend crea la base `scada_db` si no existe
- se genera un dataset CSV de prueba automaticamente.
- se levantan los endpoints y la interfaz web

### Paso 5. Acceder a la solucion

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:8000`
- Swagger: `http://localhost:8000/docs`

## 11. Ejecucion sin Docker

Docker es la via recomendada, pero el proyecto tambien puede ejecutarse manualmente.

### Backend

Requisitos sugeridos:

- Python 3.11
- SQL Server accesible
- ODBC Driver 18 for SQL Server

Pasos generales:

```bash
cd scada-alarm-system-back
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

En Windows PowerShell:

```powershell
cd .\scada-alarm-system-back
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

Luego:

```bash
uvicorn app.main:app --reload
```

### Frontend

Requisitos sugeridos:

- Node.js 22

Pasos:

```bash
cd scada-alarm-system-front
npm install
npm run dev
```

## 12. Datos generados automaticamente

El backend actualmente arranca ejecutando:

```bash
python scripts/generate_data.py csv 5000
```

Esto genera un archivo de prueba con 5000 registros antes de iniciar la API.

Notas importantes:

- el generador usa zona horaria `America/Bogota`
- no genera eventos por encima del dia y hora actual local
- mezcla eventos recientes con historicos
- incluye errores sinteticos para probar validacion y limpieza

## 13. Consideraciones funcionales

Aspectos positivos de la implementacion actual:

- el entorno se levanta de forma reproducible
- el backend espera a que la base de datos este lista
- el frontend ya queda apuntando al backend correcto para uso
- el sistema conserva trazabilidad de ingestion

## 15. Tecnologias usadas

Backend:

- FastAPI
- SQLAlchemy
- PyODBC
- Pandas
- NumPy
- Python 3.11

Frontend:

- React
- Vite
- Axios
- Tailwind CSS

Infraestructura:

- Docker
- Docker Compose
- SQL Server 2022

## 16. Conclusion

La solucion propone un flujo completo y practico para el tratamiento de alarmas SCADA, desde la generacion y limpieza de datos hasta su visualizacion final.

Mas alla de cumplir con la carga y consulta de eventos, el proyecto prioriza tres cosas:

- trazabilidad del dato
- facilidad de ejecucion
- claridad para evaluacion tecnica

Por eso se incorporo Docker Compose, una estructura separada por responsabilidades y un dataset sintetico con supuestos explicitos y casos de error deliberados.

