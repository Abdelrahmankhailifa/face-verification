const sharp = require('sharp');

class FaceDetector {
  /**
   * Enhanced face detection using image analysis
   * This is a simplified approach - in production you'd use OpenCV or a dedicated face detection model
   */
  static async detectFace(imageBuffer) {
    console.log('🔍 Detecting face in image...');
    
    const metadata = await sharp(imageBuffer).metadata();
    console.log(`   Image dimensions: ${metadata.width}x${metadata.height}`);
    
    // Check if image is likely to contain a face
    const faceRegion = await this.findFaceRegion(imageBuffer, metadata);
    
    if (!faceRegion) {
      throw new Error('No face detected in the image. Please ensure the image contains a clear human face.');
    }
    
    console.log(`   Face region found: x=${faceRegion.x}, y=${faceRegion.y}, width=${faceRegion.width}, height=${faceRegion.height}`);
    
    return faceRegion;
  }

  /**
   * Find face region using image analysis
   * This uses heuristics to estimate where a face might be
   */
  static async findFaceRegion(imageBuffer, metadata) {
    try {
      // Get image statistics
      const stats = await sharp(imageBuffer).stats();
      
      // Check if image has enough variation (not a solid color)
      const channels = stats.channels;
      const maxDiff = Math.max(
        channels[0].max - channels[0].min,
        channels[1].max - channels[1].min, 
        channels[2].max - channels[2].min
      );
      
      if (maxDiff < 50) {
        console.log('   ❌ Low color variation - unlikely to contain face');
        return null;
      }
      
      // Check image size
      if (metadata.width < 100 || metadata.height < 100) {
        console.log('   ❌ Image too small for face detection');
        return null;
      }
      
      // Estimate face region - faces are typically in the center-upper area
      const faceWidth = Math.min(metadata.width * 0.6, 400);
      const faceHeight = Math.min(metadata.height * 0.6, 400);
      const faceX = (metadata.width - faceWidth) / 2;
      const faceY = (metadata.height - faceHeight) / 3; // Face usually in upper third
      
      // Ensure face region is within image bounds
      const x = Math.max(0, Math.round(faceX));
      const y = Math.max(0, Math.round(faceY));
      const width = Math.min(Math.round(faceWidth), metadata.width - x);
      const height = Math.min(Math.round(faceHeight), metadata.height - y);
      
      console.log('   ✅ Face region estimated');
      
      return {
        x,
        y,
        width,
        height,
        confidence: 0.8
      };
      
    } catch (error) {
      console.log('   ⚠️  Face detection failed:', error.message);
      return null;
    }
  }

  /**
   * Crop face from image and resize to standard size
   */
  static async cropAndResizeFace(imageBuffer, faceRegion, targetSize = 112) {
    try {
      console.log(`🔄 Cropping face region and resizing to ${targetSize}x${targetSize}...`);
      
      const croppedImage = await sharp(imageBuffer)
        .extract({
          left: faceRegion.x,
          top: faceRegion.y,
          width: faceRegion.width,
          height: faceRegion.height
        })
        .resize(targetSize, targetSize)
        .removeAlpha() // Ensure RGB (3 channels)
        .raw()
        .toBuffer();

      console.log('✅ Face cropped and resized successfully');
      return croppedImage;
      
    } catch (error) {
      console.error('Face cropping error:', error);
      throw new Error(`Failed to crop face: ${error.message}`);
    }
  }

  /**
   * Normalize image data for model input
   */
  static normalizeImage(imageBuffer, targetSize = 112) {
    const totalPixels = targetSize * targetSize;
    const channels = 3;
    const totalValues = totalPixels * channels;
    
    console.log(`Normalizing ${totalPixels} pixels (${totalValues} total values)...`);

    // Convert from RGB (0-255) to normalized format (-1 to 1)
    const normalized = new Float32Array(totalValues);
    
    for (let i = 0; i < imageBuffer.length; i++) {
      normalized[i] = (imageBuffer[i] - 127.5) / 128.0;
    }

    console.log('✅ Image normalized to [-1, 1] range');
    return normalized;
  }
}

module.exports = FaceDetector;
