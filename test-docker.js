const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

const BASE_URL = 'http://localhost:3000';

async function testDockerService() {
  console.log('🧪 Testing Docker Face Verification Service...\n');
  
  try {
    // 1. Test health endpoint
    console.log('1. Testing health endpoint...');
    const health = await axios.get(\\/health\);
    console.log('✅ Health:', health.data.status);
    
    // 2. Test encode endpoint
    console.log('\n2. Testing encode endpoint...');
    const formData = new FormData();
    formData.append('image', fs.createReadStream('./test_images/person1_test.jpg'));
    
    const encodeResponse = await axios.post(\\/encode\, formData, {
      headers: formData.getHeaders()
    });
    
    console.log('✅ Encode successful!');
    console.log('   Embedding dimensions:', encodeResponse.data.embedding.length);
    console.log('   Normalized:', encodeResponse.data.normalized);
    
    // 3. Test compare endpoint
    console.log('\n3. Testing compare endpoint...');
    const compareForm = new FormData();
    compareForm.append('image', fs.createReadStream('./test_images/person1_test.jpg'));
    compareForm.append('storedEmbedding', JSON.stringify(encodeResponse.data.embedding));
    
    const compareResponse = await axios.post(\\/compare\, compareForm, {
      headers: compareForm.getHeaders()
    });
    
    console.log('✅ Compare successful!');
    console.log('   Similarity:', compareResponse.data.similarity);
    console.log('   Match:', compareResponse.data.isMatch);
    console.log('   Confidence:', compareResponse.data.confidence);
    
    console.log('\n🎉 DOCKER SERVICE WORKING PERFECTLY!');
    
  } catch (error) {
    console.log('❌ Test failed:', error.response?.data || error.message);
  }
}

testDockerService();
