# Backend Dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
# antiword: for legacy .doc
# poppler-utils: for pdf
# tesseract-ocr: for images
# ffmpeg: for audio/video
RUN apt-get update && apt-get install -y \
    antiword \
    poppler-utils \
    tesseract-ocr \
    ffmpeg \
    libmagic1 \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Expose port
EXPOSE 8000

# Command to run the application
CMD uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}
