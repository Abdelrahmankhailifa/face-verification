// test-compare.js
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

const BASE_URL = 'http://localhost:3001';

async function testCompare() {
  console.log('🧪 Testing /compare endpoint...\n');
  
  try {
    // First, get an embedding
    console.log('1. Getting embedding from /encode...');
    const encodeForm = new FormData();
    encodeForm.append('image', fs.createReadStream('./test_images/person1_test.jpg'));
    
    const encodeResponse = await axios.post(`${BASE_URL}/encode`, encodeForm, {
      headers: encodeForm.getHeaders()
    });
    
    const embedding = encodeResponse.data.embedding;
    console.log('✅ Got embedding with', embedding.length, 'dimensions');
    
    // Now test compare with the same image
    console.log('\n2. Testing /compare with same image...');
    const compareForm = new FormData();
    compareForm.append('image', fs.createReadStream('./test_images/person1_test.jpg'));
    compareForm.append('storedEmbedding', JSON.stringify(embedding));
    
    const compareResponse = await axios.post(`${BASE_URL}/compare`, compareForm, {
      headers: compareForm.getHeaders()
    });
    
    console.log('✅ COMPARE SUCCESS!');
    console.log('Response:', JSON.stringify(compareResponse.data, null, 2));
    
    // Verify it's working correctly
    if (compareResponse.data.isMatch && compareResponse.data.similarity > 0.9) {
      console.log('\n🎉 PERFECT! System is working correctly!');
      console.log('   - Same person verification: ✅');
      console.log('   - High similarity score: ✅');
      console.log('   - Match detection: ✅');
    }
    
  } catch (error) {
    console.log('❌ ERROR:');
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Error:', error.response.data.error);
    } else {
      console.log('Message:', error.message);
    }
  }
}

testCompare();