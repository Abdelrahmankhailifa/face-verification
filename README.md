# AI Face-Verification Microservice

A complete, standalone Node.js microservice for face verification using ONNX models.

## Quick Start (Evaluation Command)

```bash
docker compose up --build
```

This command will:
- Build the Docker image
- Start the face verification service
- Make it available on port 3000

## API Endpoints

- `GET /health` - Health check
- `GET /` - API documentation
- `POST /encode` - Encode face image to embedding
- `POST /compare` - Compare face with stored embedding

## Test the Service

Once running, test the service:

```bash
# Health check
curl http://localhost:3000/health

# API info
curl http://localhost:3000/

# Test with an image (replace with actual image file)
curl -X POST -F "image=@test_images/person1_test.jpg" http://localhost:3000/encode
```

## Features

- ✅ **Standalone Docker Setup** - Runs with `docker compose up --build`
- ✅ **Face Detection & Cropping** - Proper face region extraction
- ✅ **ONNX Model Integration** - ArcFace-based face recognition
- ✅ **L2 Normalization** - Consistent embedding normalization
- ✅ **Error Handling** - Robust validation and error responses
- ✅ **Performance Optimized** - Efficient image processing

## Requirements

- Docker and Docker Compose
- Face model file (`face_model.onnx`) in `models/` directory

## Architecture

```
├── controllers/     # API controllers
├── models/         # ONNX model files
├── routes/         # Express routes
├── utils/          # Utility functions
├── test_images/    # Sample test images
├── Dockerfile      # Docker configuration
└── docker-compose.yml
```

The service is designed to run completely standalone without external dependencies.
