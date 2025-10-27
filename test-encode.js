// simple-test.js
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

const BASE_URL = 'http://localhost:3001';

async function testEncode() {
  console.log('🧪 Testing /encode endpoint...\n');
  
  try {
    const formData = new FormData();
    formData.append('image', fs.createReadStream('./test_images/person3_test.jpg'));

    const response = await axios.post(`${BASE_URL}/encode`, formData, {
      headers: formData.getHeaders()
    });
    
    console.log('✅ SUCCESS! Response:');
    console.log(JSON.stringify(response.data, null, 2));
    
    return response.data.embedding;
    
  } catch (error) {
    console.log('❌ ERROR:');
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Error message:', error.response.data.error);
    } else {
      console.log('Message:', error.message);
    }
  }
}

testEncode();
