const faceModel = require('../models/modelLoader');
const ImageProcessor = require('../utils/imageProcessing');
const ImageOptimizer = require('../utils/imageOptimizer');
const Normalization = require('../utils/normalization');
const ValidationUtils = require('../utils/validation');
const ort = require('onnxruntime-node');

class EncodeController {
  async encodeFace(req, res) {
    try {
      console.log('\nðŸ“¸ Enhanced encoding endpoint called');
      
      // Validate request
      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: 'No image file provided.'
        });
      }

      // Validate image file
      try {
        ValidationUtils.validateImageFile(req.file);
      } catch (validationError) {
        return res.status(400).json({
          success: false,
          error: validationError.message
        });
      }

      console.log(`Processing image: ${req.file.originalname}, Size: ${(req.file.size / 1024 / 1024).toFixed(2)}MB`);

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

      // Generate embedding
      let embedding;
      try {
        console.log('ðŸ”„ Generating embedding...');
        const tensor = new ort.Tensor('float32', processedImage, [1, 112, 112, 3]);
        embedding = await faceModel.generateEmbedding(tensor);
        console.log(`âœ… Raw embedding generated: ${embedding.length} dimensions`);
      } catch (modelError) {
        console.error('Model inference error:', modelError);
        return res.status(500).json({
          success: false,
          error: `Model inference failed: ${modelError.message}`
        });
      }

      // L2 Normalize the embedding (CRITICAL REQUIREMENT)
      let normalizedEmbedding;
      try {
        normalizedEmbedding = Normalization.l2Normalize(embedding);
        console.log('âœ… Embedding L2 normalized');
        
        // Verify normalization
        if (Normalization.isNormalized(normalizedEmbedding)) {
          console.log('âœ… Normalization verified');
        } else {
          console.warn('âš ï¸ Normalization check failed');
        }
      } catch (normalizationError) {
        console.error('Normalization error:', normalizationError);
        return res.status(500).json({
          success: false,
          error: `Embedding normalization failed: ${normalizationError.message}`
        });
      }

      // Success response
      res.json({
        success: true,
        embedding: normalizedEmbedding,
        normalized: true,
        dimensions: normalizedEmbedding.length,
        message: 'Face encoded and L2 normalized successfully'
      });

    } catch (error) {
      console.error('Unexpected error in encode:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error during face encoding'
      });
    }
  }
}

module.exports = new EncodeController();

