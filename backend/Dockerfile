FROM python:3.11-slim

# 1. Install system tools for Paramiko & C-based extensions
RUN apt-get update && apt-get install -y \
    build-essential \
    libssl-dev \
    libffi-dev \
    && rm -rf /var/lib/apt/lists/*

# 2. Set working directory
WORKDIR /app

# 3. Install dependencies first (Optimization!)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 4. Copy the project files
COPY . .

# 5. Run FastAPI with Uvicorn
# Replace 'main:app' with 'your_filename:your_fastapi_instance'
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]