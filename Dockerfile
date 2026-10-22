# Dockerfile for Hugging Face Spaces (Docker SDK)
# Change 3.11 to the Python version you trained the model with.
FROM python:3.11-slim

# Hugging Face runs containers as a non-root user
RUN useradd -m -u 1000 user
USER user
ENV PATH="/home/user/.local/bin:$PATH"

WORKDIR /app

COPY --chown=user requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY --chown=user . .

# Hugging Face Spaces expects the app on port 7860
EXPOSE 7860
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "7860"]