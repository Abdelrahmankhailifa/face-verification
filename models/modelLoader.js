const ort = require('onnxruntime-node');
const path = require('path');
const fs = require('fs');

class FaceModel {
  constructor() {
    this.modelPath = path.join(__dirname, 'face_model.onnx');
    this.session = null;
    this.isModelLoaded = false;
    this.inputName = 'input_1'; // From your log output
    this.outputName = 'embedding'; // From your log output
  }

  async loadModel() {
    try {
      // Check if model file exists
      if (!fs.existsSync(this.modelPath)) {
        throw new Error(`Model file not found at: ${this.modelPath}. Please download the model file first.`);
      }

      console.log('Loading face recognition model...');
      
      // Set ONNX runtime options
      const options = {
        executionProviders: ['cpu'],
        graphOptimizationLevel: 'all'
      };

      this.session = await ort.InferenceSession.create(this.modelPath, options);
      this.isModelLoaded = true;
      
      console.log('✅ Face model loaded successfully');
      console.log('Model input names:', this.session.inputNames);
      console.log('Model output names:', this.session.outputNames);
      
      // Log expected input shape
      if (this.session.inputNames.length > 0) {
        const inputName = this.session.inputNames[0];
        // Note: We can't easily get the expected shape without running inference
        console.log('💡 Model expects input named:', inputName);
      }
      
      return this.session;
    } catch (error) {
      console.error('❌ Error loading model:', error.message);
      throw error;
    }
  }

  async getSession() {
    if (!this.session || !this.isModelLoaded) {
      await this.loadModel();
    }
    return this.session;
  }

  async generateEmbedding(inputTensor) {
    try {
      const session = await this.getSession();
      
      // Prepare feeds with the input tensor
      const feeds = {};
      const inputName = this.session.inputNames[0]; // Use the first input name
      feeds[inputName] = inputTensor;
      
      console.log(`Running inference with input shape: [${inputTensor.dims}]`);
      
      // Run inference
      const results = await session.run(feeds);
      
      // Get the output
      const outputName = this.session.outputNames[0];
      const embedding = results[outputName];
      
      // Convert to regular array
      const embeddingArray = Array.from(embedding.data);
      
      console.log(`Generated embedding with ${embeddingArray.length} dimensions`);
      
      return embeddingArray;
    } catch (error) {
      console.error('Error generating embedding:', error.message);
      
      // Provide more detailed error information
      if (error.message.includes('dimensions') || error.message.includes('indices')) {
        console.error('💡 Dimension mismatch detected.');
        console.error('   Expected format might be different from what we provided.');
        console.error('   Trying alternative format...');
        
        // We'll handle this in the controller by trying different formats
        throw new Error('DIMENSION_MISMATCH');
      }
      
      throw error;
    }
  }
}

// Create singleton instance
const faceModel = new FaceModel();
module.exports = faceModel;