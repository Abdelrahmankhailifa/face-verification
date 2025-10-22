const request = require('supertest');
const app = require('../app');
const path = require('path');
const fs = require('fs');

describe('Face Verification API', () => {
  let testEmbedding = null;

  describe('POST /encode', () => {
    it('should encode a face image and return embedding', async () => {
      // This test requires an actual image file
      // For now, we'll skip if no test image exists
      const testImagePath = path.join(__dirname, '../test-images/test-face.jpg');
      
      if (!fs.existsSync(testImagePath)) {
        console.log('⚠️  No test image found. Skipping encode test.');
        console.log('💡 Please add a test image at test-images/test-face.jpg');
        return;
      }

      const response = await request(app)
        .post('/encode')
        .attach('image', testImagePath)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.embedding).toBeDefined();
      expect(response.body.embedding).toHaveLength(512);
      expect(response.body.id).toBeDefined();
      expect(response.body.message).toBe('Face encoded successfully');

      testEmbedding = response.body.embedding;
      console.log(`✅ Encoding test passed. Got embedding with ${testEmbedding.length} dimensions`);
    });

    it('should return error for no image', async () => {
      const response = await request(app)
        .post('/encode')
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('No image file provided');
    });
  });

  describe('POST /compare', () => {
    it('should compare faces and return match result', async () => {
      if (!testEmbedding) {
        console.log('⚠️  No embedding from encode test. Skipping compare test.');
        return;
      }

      const testImagePath = path.join(__dirname, '../test-images/test-face.jpg');
      if (!fs.existsSync(testImagePath)) {
        console.log('⚠️  No test image found. Skipping compare test.');
        return;
      }

      const response = await request(app)
        .post('/compare')
        .attach('image', testImagePath)
        .field('storedEmbedding', JSON.stringify(testEmbedding))
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.isMatch).toBeDefined();
      expect(typeof response.body.isMatch).toBe('boolean');
      expect(response.body.similarity).toBeDefined();
      expect(response.body.similarity).toBeGreaterThanOrEqual(-1);
      expect(response.body.similarity).toBeLessThanOrEqual(1);
      expect(response.body.confidence).toBeDefined();
      expect(response.body.threshold).toBeDefined();

      console.log(`✅ Compare test passed. Similarity: ${response.body.similarity}, Match: ${response.body.isMatch}`);
    });

    it('should return error for no stored embedding', async () => {
      const testImagePath = path.join(__dirname, '../test-images/test-face.jpg');
      if (!fs.existsSync(testImagePath)) return;

      const response = await request(app)
        .post('/compare')
        .attach('image', testImagePath)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('No storedEmbedding provided');
    });
  });

  describe('GET /health', () => {
    it('should return health status', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body.status).toBe('OK');
      expect(response.body.service).toBe('Face Verification Microservice');
      expect(response.body.timestamp).toBeDefined();
    });
  });

  describe('GET /', () => {
    it('should return API documentation', async () => {
      const response = await request(app)
        .get('/')
        .expect(200);

      expect(response.body.message).toBe('Face Verification Microservice API');
      expect(response.body.endpoints).toBeDefined();
      expect(response.body.endpoints.encode).toBeDefined();
      expect(response.body.endpoints.compare).toBeDefined();
    });
  });
});