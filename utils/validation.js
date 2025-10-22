class ValidationUtils {
  static validateImageFile(file) {
    if (!file) {
      throw new Error('No file provided');
    }

    const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new Error(`Invalid file type. Allowed types: ${allowedMimeTypes.join(', ')}`);
    }

    // Check file size (increased to 20MB)
    const maxSize = 20 * 1024 * 1024; // 20MB
    if (file.size > maxSize) {
      throw new Error('File size exceeds 20MB limit');
    }

    if (file.size === 0) {
      throw new Error('File is empty');
    }

    return true;
  }

  // ... rest of the validation methods remain the same
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

    // Check if all elements are numbers
    for (let i = 0; i < embedding.length; i++) {
      if (typeof embedding[i] !== 'number' || isNaN(embedding[i])) {
        throw new Error('Embedding must contain only numbers');
      }
    }

    return true;
  }

  static parseEmbedding(embeddingString) {
    try {
      const embedding = JSON.parse(embeddingString);
      this.validateEmbedding(embedding);
      return embedding;
    } catch (error) {
      throw new Error(`Invalid embedding format: ${error.message}`);
    }
  }
}

module.exports = ValidationUtils;