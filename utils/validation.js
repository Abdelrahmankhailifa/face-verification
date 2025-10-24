class Validation {
  static validateImageFile(file) {
    if (!file) {
      throw new Error('No file provided');
    }

    // Check file exists and has buffer
    if (!file.buffer || file.buffer.length === 0) {
      throw new Error('File buffer is empty or corrupted');
    }

    const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new Error(`Invalid file type: ${file.mimetype}. Allowed types: ${allowedMimeTypes.join(', ')}`);
    }

    // Check file size (20MB max)
    const maxSize = 20 * 1024 * 1024;
    if (file.size > maxSize) {
      throw new Error(`File size exceeds ${maxSize / 1024 / 1024}MB limit`);
    }

    if (file.size === 0) {
      throw new Error('File is empty');
    }

    // Check filename
    if (!file.originalname || file.originalname.trim() === '') {
      throw new Error('Invalid filename');
    }

    return true;
  }

  static validateEmbedding(embedding) {
    if (!embedding) {
      throw new Error('No embedding provided');
    }

    if (!Array.isArray(embedding)) {
      throw new Error('Embedding must be an array');
    }

    if (embedding.length !== 512) {
      throw new Error(`Embedding must have 512 dimensions. Got: ${embedding.length}`);
    }

    // Check if all elements are valid numbers
    let hasValidNumbers = false;
    for (let i = 0; i < embedding.length; i++) {
      if (typeof embedding[i] !== 'number' || isNaN(embedding[i])) {
        throw new Error('Embedding must contain only valid numbers');
      }
      if (Math.abs(embedding[i]) > 0) {
        hasValidNumbers = true;
      }
    }

    if (!hasValidNumbers) {
      throw new Error('Embedding appears to be all zeros or invalid values');
    }

    return true;
  }

  static parseEmbedding(embeddingString) {
    if (typeof embeddingString !== 'string') {
      throw new Error('Embedding must be provided as a JSON string');
    }

    if (embeddingString.trim().length === 0) {
      throw new Error('Embedding string cannot be empty');
    }

    try {
      const embedding = JSON.parse(embeddingString);
      this.validateEmbedding(embedding);
      return embedding;
    } catch (error) {
      if (error instanceof SyntaxError) {
        throw new Error('Invalid JSON format for embedding');
      }
      throw new Error(`Invalid embedding format: ${error.message}`);
    }
  }

  static validateModelPath(modelPath) {
    const fs = require('fs');
    const path = require('path');
    
    if (!fs.existsSync(modelPath)) {
      throw new Error(`Model file not found at: ${modelPath}`);
    }

    const stats = fs.statSync(modelPath);
    if (stats.size === 0) {
      throw new Error('Model file is empty');
    }

    if (!modelPath.endsWith('.onnx')) {
      throw new Error('Model file must be in ONNX format (.onnx)');
    }

    return true;
  }
}

module.exports = Validation;