﻿const faceModel = require('../models/modelLoader');
const ImageProcessor = require('../utils/imageProcessing');
const ImageOptimizer = require('../utils/imageOptimizer');
const SimilarityCalculator = require('../utils/similarity');
const EnhancedValidation = require('../utils/validation');
const ort = require('onnxruntime-node');

class CompareController {
  async compareFaces(req, res) {
    try {
      console.log('\nðŸ” Enhanced compare endpoint called');

      // Validate inputs
      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: 'No image file provided.'
        });
      }

      if (!req.body.storedEmbedding) {
        return res.status(400).json({
          success: false,
          error: 'No storedEmbedding provided.'
        });
      }

      // Validate image
      try {
        EnhancedValidation.validateImageFile(req.file);
      } catch (validationError) {
        return res.status(400).json({
          success: false,
          error: validationError.message
        });
      }

      console.log(`Processing image: ${req.file.originalname}`);

      // Parse and validate stored embedding
      let storedEmbedding;
      try {
        storedEmbedding = EnhancedValidation.parseEmbedding(req.body.storedEmbedding);
        console.log('âœ… Stored embedding validated');
      } catch (embeddingError) {
        return res.status(400).json({
          success: false,
          error: `Invalid stored embedding: ${embeddingError.message}`
        });
      }

      // Optimize image if needed
      let processedBuffer = req.file.buffer;
      if (req.file.size > 5 * 1024 * 1024) {
        processedBuffer = await ImageOptimizer.optimizeImage(req.file.buffer);
      }

      // Preprocess image
      let processedImage;
      try {
        processedImage = await ImageProcessor.preprocessHumanFace(processedBuffer);
        console.log('âœ… Image preprocessing completed');
      } catch (faceError) {
        return res.status(400).json({
          success: false,
          error: `Face processing failed: ${faceError.message}`
        });
      }

      // Generate embedding for new image
      let newEmbedding;
      try {
        console.log('ðŸ”„ Generating embedding for comparison...');
        const tensor = new ort.Tensor('float32', processedImage, [1, 112, 112, 3]);
        newEmbedding = await faceModel.generateEmbedding(tensor);
        console.log(`âœ… New embedding generated: ${newEmbedding.length} dimensions`);
      } catch (modelError) {
        console.error('Model error:', modelError);
        return res.status(500).json({
          success: false,
          error: `Model inference failed: ${modelError.message}`
        });
      }

      // Calculate similarity
      let similarity;
      try {
        similarity = SimilarityCalculator.cosineSimilarity(newEmbedding, storedEmbedding);
        console.log(`ðŸ“Š Similarity score: ${similarity.toFixed(4)}`);
      } catch (similarityError) {
        return res.status(500).json({
          success: false,
          error: `Similarity calculation failed: ${similarityError.message}`
        });
      }

      // Determine match
      const threshold = parseFloat(process.env.THRESHOLD) || 0.6;
      const isMatch = SimilarityCalculator.isMatch(similarity, threshold);
      const confidence = SimilarityCalculator.getMatchConfidence(similarity);

      console.log(`ðŸŽ¯ Match: ${isMatch}, Threshold: ${threshold}, Confidence: ${confidence}`);

      // Success response
      res.json({
        success: true,
        isMatch: isMatch,
        similarity: parseFloat(similarity.toFixed(4)),
        confidence: confidence,
        threshold: threshold,
        normalized: true
      });

    } catch (error) {
      console.error('Unexpected error in compare:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error during face comparison'
      });
    }
  }
}

module.exports = new CompareController();

