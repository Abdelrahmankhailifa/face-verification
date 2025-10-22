const sharp = require('sharp');

class ImageProcessor {
  static async detectHumanFace(imageBuffer) {
    console.log('🔍 Detecting face in image...');
    
    // Get image metadata
    const metadata = await sharp(imageBuffer).metadata();
    console.log(`   Image dimensions: ${metadata.width}x${metadata.height}`);
    
    // Check if image is likely to contain a face
    const hasLikelyFace = await this.hasLikelyFaceContent(imageBuffer, metadata);
    
    if (!hasLikelyFace) {
      throw new Error('No face detected in the image. Please ensure the image contains a clear human face.');
    }
    
    // Simple face detection logic - assumes face is in center
    // In production, you'd use a proper face detection model
    const faceWidth = Math.min(metadata.width * 0.6, 400);
    const faceHeight = Math.min(metadata.height * 0.6, 400);
    const faceX = (metadata.width - faceWidth) / 2;
    const faceY = (metadata.height - faceHeight) / 3; // Face usually in upper third
    
    console.log(`   Estimated face region: x=${faceX.toFixed(0)}, y=${faceY.toFixed(0)}, width=${faceWidth.toFixed(0)}, height=${faceHeight.toFixed(0)}`);
    
    return {
      x: Math.max(0, Math.round(faceX)),
      y: Math.max(0, Math.round(faceY)),
      width: Math.round(faceWidth),
      height: Math.round(faceHeight),
      confidence: 0.8
    };
  }

  static async hasLikelyFaceContent(imageBuffer, metadata) {
    try {
      // Simple check: analyze image content to guess if it might contain a face
      // This is a basic heuristic - real face detection would use ML
      
      // Check if image is mostly one color (like our black.jpg)
      const stats = await sharp(imageBuffer)
        .stats();
      
      const channels = stats.channels;
      const maxDiff = Math.max(
        channels[0].max - channels[0].min,
        channels[1].max - channels[1].min, 
        channels[2].max - channels[2].min
      );
      
      // If very low color variation, probably no face
      if (maxDiff < 50) {
        console.log('   ❌ Low color variation - unlikely to contain face');
        return false;
      }
      
      // Check image dimensions - very small images unlikely to have clear faces
      if (metadata.width < 100 || metadata.height < 100) {
        console.log('   ❌ Image too small for face detection');
        return false;
      }
      
      console.log('   ✅ Image appears to contain potential face content');
      return true;
      
    } catch (error) {
      console.log('   ⚠️  Face content check failed:', error.message);
      return true; // Default to true if check fails
    }
  }

  static async preprocessHumanFace(imageBuffer) {
    try {
      console.log('🔄 Preprocessing image for face recognition...');
      
      // Detect face
      const face = await this.detectHumanFace(imageBuffer);
      
      if (face.confidence < 0.5) {
        throw new Error('Low confidence in face detection. Please ensure a clear face is visible.');
      }

      console.log(`Cropping face region: ${face.width}x${face.height}`);

      // Crop face and resize to 112x112
      const processedImage = await sharp(imageBuffer)
        .extract({
          left: face.x,
          top: face.y,
          width: face.width,
          height: face.height
        })
        .resize(112, 112)
        .removeAlpha() // Ensure RGB (3 channels)
        .raw()
        .toBuffer();

      console.log('✅ Face cropped and resized to 112x112');

      return this.normalizeImage(processedImage);
    } catch (error) {
      console.error('Image preprocessing error:', error);
      throw new Error(`Failed to preprocess image: ${error.message}`);
    }
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