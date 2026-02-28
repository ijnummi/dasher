FROM python:3.12-slim

WORKDIR /app

# Install uv
COPY --from=ghcr.io/astral-sh/uv:latest /uv /usr/local/bin/uv

# Copy everything needed for install
COPY pyproject.toml .
COPY src/ src/

# Install package
RUN uv pip install --system .

# Create data directory
RUN mkdir -p data

CMD ["uvicorn", "dasher.main:app", "--host", "0.0.0.0", "--port", "8000"]
