class SimilarityCalculator {
  static cosineSimilarity(embedding1, embedding2) {
    if (!embedding1 || !embedding2) {
      throw new Error('Both embeddings must be provided');
    }

    if (embedding1.length !== embedding2.length) {
      throw new Error(`Embeddings must have the same length. Got ${embedding1.length} and ${embedding2.length}`);
    }

    let dotProduct = 0;
    let norm1 = 0;
    let norm2 = 0;

    for (let i = 0; i < embedding1.length; i++) {
      dotProduct += embedding1[i] * embedding2[i]; // FIXED: was embeddingding2
      norm1 += embedding1[i] * embedding1[i];
      norm2 += embedding2[i] * embedding2[i]; // FIXED: was embeddingding2
    }

    norm1 = Math.sqrt(norm1);
    norm2 = Math.sqrt(norm2);

    if (norm1 === 0 || norm2 === 0) {
      return 0;
    }

    const similarity = dotProduct / (norm1 * norm2);
    
    // Ensure similarity is between -1 and 1
    return Math.max(-1, Math.min(1, similarity));
  }

  static isMatch(similarity, threshold = null) {
    const matchThreshold = threshold || parseFloat(process.env.THRESHOLD) || 0.6;
    
    if (similarity < -1 || similarity > 1) {
      throw new Error(`Similarity score must be between -1 and 1. Got: ${similarity}`);
    }
    
    return similarity >= matchThreshold;
  }

  static getMatchConfidence(similarity) {
    if (similarity >= 0.8) return 'very_high';
    if (similarity >= 0.7) return 'high';
    if (similarity >= 0.6) return 'medium';
    if (similarity >= 0.5) return 'low';
    return 'very_low';
  }
}

module.exports = SimilarityCalculator;