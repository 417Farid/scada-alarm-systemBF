FROM python:3.11-slim

WORKDIR /app

# Evitar problemas de logs
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Dependencias
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copiar proyecto
COPY . .

# Exponer puerto
EXPOSE 8000

# Ejecutar app
CMD ["sh", "-c", "python scripts/generate_data.py csv 5000 && uvicorn app.main:app --host 0.0.0.0 --port 8000"]
