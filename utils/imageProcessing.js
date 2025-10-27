const sharp = require('sharp');
const FaceDetector = require('./faceDetector');

class ImageProcessor {
  /**
   * Enhanced face preprocessing with proper face cropping
   * This is the main method that should be used for face recognition
   */
  static async preprocessHumanFace(imageBuffer) {
    try {
      console.log('🔄 Preprocessing image for face recognition...');
      
      // Step 1: Detect face region
      const faceRegion = await FaceDetector.detectFace(imageBuffer);
      
      if (faceRegion.confidence < 0.5) {
        throw new Error('Low confidence in face detection. Please ensure a clear face is visible.');
      }

      // Step 2: Crop face and resize to 112x112
      const croppedFace = await FaceDetector.cropAndResizeFace(imageBuffer, faceRegion, 112);

      // Step 3: Normalize the cropped face
      const normalizedFace = FaceDetector.normalizeImage(croppedFace, 112);

      console.log('✅ Face preprocessing completed successfully');
      return normalizedFace;
      
    } catch (error) {
      console.error('Image preprocessing error:', error);
      throw new Error(`Failed to preprocess image: ${error.message}`);
    }
  }

  /**
   * Legacy method for backward compatibility
   * @deprecated Use preprocessHumanFace instead
   */
  static async detectHumanFace(imageBuffer) {
    console.log('⚠️  Using legacy face detection method');
    return await FaceDetector.detectFace(imageBuffer);
  }

  /**
   * Legacy method for backward compatibility
   * @deprecated Use preprocessHumanFace instead
   */
  static async hasLikelyFaceContent(imageBuffer, metadata) {
    console.log('⚠️  Using legacy face content check');
    const faceRegion = await FaceDetector.findFaceRegion(imageBuffer, metadata);
    return faceRegion !== null;
  }

  static normalizeImage(imageBuffer) {
    const totalPixels = 112 * 112;
    const channels = 3;
    const totalValues = totalPixels * channels;
    
    console.log(`Normalizing ${totalPixels} pixels (${totalValues} total values)...`);

    // Convert from RGB (0-255) to normalized format (-1 to 1)
    const normalized = new Float32Array(totalValues);
    
    for (let i = 0; i < imageBuffer.length; i++) {
      normalized[i] = (imageBuffer[i] - 127.5) / 128.0;
    }

    console.log('✅ Image normalized to [-1, 1] range');

    // The model expects NHWC format: [batch, height, width, channels]
    // We're returning [112, 112, 3] which will be reshaped to [1, 112, 112, 3]
    return normalized;
  }

  // Utility to get tensor shape info
  static getTensorShape() {
    return [1, 112, 112, 3]; // NHWC format: [batch, height, width, channels]
  }
}

module.exports = ImageProcessor;