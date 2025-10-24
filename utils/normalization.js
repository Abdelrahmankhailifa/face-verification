class Normalization {
  static l2Normalize(vector) {
    if (!vector || !Array.isArray(vector)) {
      throw new Error('Invalid input: vector must be an array');
    }

    if (vector.length === 0) {
      throw new Error('Invalid input: vector cannot be empty');
    }

    // Calculate L2 norm (Euclidean norm)
    let sumSquares = 0;
    for (let i = 0; i < vector.length; i++) {
      if (typeof vector[i] !== 'number' || isNaN(vector[i])) {
        throw new Error('Invalid vector: all elements must be numbers');
      }
      sumSquares += vector[i] * vector[i];
    }
    
    const norm = Math.sqrt(sumSquares);
    
    // Avoid division by zero
    if (norm === 0) {
      console.warn('⚠️ Zero vector detected during normalization');
      return new Array(vector.length).fill(0);
    }
    
    // Normalize each dimension
    const normalized = new Array(vector.length);
    for (let i = 0; i < vector.length; i++) {
      normalized[i] = vector[i] / norm;
    }
    
    return normalized;
  }

  static isNormalized(vector, tolerance = 1e-6) {
    if (!vector || !Array.isArray(vector) || vector.length === 0) {
      return false;
    }

    let sumSquares = 0;
    for (let i = 0; i < vector.length; i++) {
      sumSquares += vector[i] * vector[i];
    }
    
    const computedNorm = Math.sqrt(sumSquares);
    return Math.abs(computedNorm - 1.0) < tolerance;
  }

  static getNorm(vector) {
    if (!vector || !Array.isArray(vector)) {
      return 0;
    }
    
    let sumSquares = 0;
    for (let i = 0; i < vector.length; i++) {
      sumSquares += vector[i] * vector[i];
    }
    
    return Math.sqrt(sumSquares);
  }
}

module.exports = Normalization;