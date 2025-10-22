const sharp = require('sharp');
const path = require('path');

class ImageOptimizer {
  static async optimizeImage(imageBuffer, maxWidth = 1024, quality = 80) {
    try {
      console.log('🔄 Optimizing image for processing...');
      
      const metadata = await sharp(imageBuffer).metadata();
      console.log(`Original image: ${metadata.width}x${metadata.height}, Size: ${(imageBuffer.length / 1024 / 1024).toFixed(2)}MB`);
      
      // Only resize if image is larger than maxWidth
      let optimizedBuffer = imageBuffer;
      
      if (metadata.width > maxWidth) {
        console.log(`Resizing image from ${metadata.width}px to ${maxWidth}px wide`);
        optimizedBuffer = await sharp(imageBuffer)
          .resize(maxWidth, null, { // Maintain aspect ratio
            withoutEnlargement: true,
            fit: 'inside'
          })
          .jpeg({ 
            quality: quality,
            mozjpeg: true 
          })
          .toBuffer();
      } else {
        // Just convert to JPEG with compression if it's not already
        optimizedBuffer = await sharp(imageBuffer)
          .jpeg({ 
            quality: quality,
            mozjpeg: true 
          })
          .toBuffer();
      }
      
      const optimizedMetadata = await sharp(optimizedBuffer).metadata();
      console.log(`Optimized image: ${optimizedMetadata.width}x${optimizedMetadata.height}, Size: ${(optimizedBuffer.length / 1024 / 1024).toFixed(2)}MB`);
      
      return optimizedBuffer;
    } catch (error) {
      console.error('Image optimization failed:', error);
      // Return original buffer if optimization fails
      return imageBuffer;
    }
  }

  static async checkImageRequirements(imageBuffer) {
    try {
      const metadata = await sharp(imageBuffer).metadata();
      
      const requirements = {
        hasValidFormat: ['jpeg', 'jpg', 'png'].includes(metadata.format?.toLowerCase()),
        hasReasonableSize: imageBuffer.length <= 20 * 1024 * 1024, // 20MB
        hasReasonableDimensions: metadata.width <= 5000 && metadata.height <= 5000,
        width: metadata.width,
        height: metadata.height,
        format: metadata.format,
        sizeMB: (imageBuffer.length / 1024 / 1024).toFixed(2)
      };
      
      console.log('📊 Image analysis:', requirements);
      
      return requirements;
    } catch (error) {
      console.error('Image analysis failed:', error);
      return null;
    }
  }
}

module.exports = ImageOptimizer;