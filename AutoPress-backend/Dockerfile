# Use official Python image
FROM python:3.10-slim

# Set working directory
WORKDIR /app

# Copy files
COPY . .

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Expose port (Cloud Run uses 8080)
ENV PORT=8080

# Run app with gunicorn
CMD ["gunicorn", "--bind", "0.0.0.0:8080", "app:app"]