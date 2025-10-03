// Quick test script to debug AI insights endpoint
import axios from 'axios';

const testInsights = async () => {
  try {
    // First get a token (you'll need to replace with valid credentials)
    const loginResponse = await axios.post('http://localhost:3000/api/auth/login', {
      email: 'test@example.com', // Replace with your test credentials
      password: 'password123'     // Replace with your test password
    });
    
    const token = loginResponse.data.token;
    console.log('Login successful, token obtained');
    
    // Now test the insights endpoint
    const insightsResponse = await axios.get('http://localhost:3000/api/ai/insights', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('Insights response:', insightsResponse.data);
    
  } catch (error) {
    console.error('Error testing insights:', error.response?.data || error.message);
  }
};

testInsights();