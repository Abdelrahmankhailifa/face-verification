const faceModel = require('../models/modelLoader');
const ImageProcessor = require('../utils/imageProcessing');
const ImageOptimizer = require('../utils/imageOptimizer');
const { FaceEmbedding } = require('../database/models');
const ValidationUtils = require('../utils/validation');
const ort = require('onnxruntime-node');

class EncodeController {
  async encodeFace(req, res) {
    try {
      console.log('\n📸 Encoding endpoint called');
      
      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: 'No image file provided.'
        });
      }

      // Validate image
      try {
        ValidationUtils.validateImageFile(req.file);
      } catch (validationError) {
        return res.status(400).json({
          success: false,
          error: validationError.message
        });
      }

      console.log(`Processing image: ${req.file.originalname}, Size: ${(req.file.size / 1024 / 1024).toFixed(2)}MB`);

      // Optimize if needed
      let processedBuffer = req.file.buffer;
      if (req.file.size > 5 * 1024 * 1024) {
        processedBuffer = await ImageOptimizer.optimizeImage(req.file.buffer);
      }

      // Preprocess image
      let processedImage;
      try {
        processedImage = await ImageProcessor.preprocessHumanFace(processedBuffer);
        console.log('✅ Image preprocessing completed');
      } catch (faceError) {
        return res.status(400).json({
          success: false,
          error: `Face processing failed: ${faceError.message}`
        });
      }

      // Generate embedding - SIMPLE DIRECT CALL
      let embedding;
      try {
        console.log('🔄 Generating embedding...');
        const tensor = new ort.Tensor('float32', processedImage, [1, 112, 112, 3]);
        embedding = await faceModel.generateEmbedding(tensor);
        console.log(`✅ Embedding generated: ${embedding.length} dimensions`);
      } catch (modelError) {
        console.error('Model error:', modelError);
        return res.status(500).json({
          success: false,
          error: `Model inference failed: ${modelError.message}`
        });
      }

      // Store in database
      let dbRecord;
      try {
        dbRecord = await FaceEmbedding.create({ 
          embedding: embedding,
          imageSize: `${(req.file.size / 1024 / 1024).toFixed(2)}MB`,
          originalName: req.file.originalname
        });
        console.log(`✅ Embedding stored with ID: ${dbRecord.id}`);
      } catch (dbError) {
        console.error('Database error:', dbError);
        return res.status(500).json({
          success: false,
          error: 'Failed to store embedding'
        });
      }

      // Success
      res.json({
        success: true,
        embedding: embedding,
        id: dbRecord.id,
        message: 'Face encoded successfully'
      });

    } catch (error) {
      console.error('Unexpected error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }
}

module.exports = new EncodeController();