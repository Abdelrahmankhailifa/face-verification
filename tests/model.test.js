const faceModel = require('../models/modelLoader');

describe('Model Loading', () => {
  test('should load model successfully', async () => {
    const session = await faceModel.getSession();
    expect(session).toBeDefined();
    expect(faceModel.isModelLoaded).toBe(true);
  }, 30000); // 30 second timeout for model loading
});