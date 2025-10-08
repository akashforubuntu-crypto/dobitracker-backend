const axios = require('axios');

const validateEmailFormat = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// In-memory storage for OTP state IDs (in production, use Redis or database)
const otpStates = new Map();

const sendMojoAuthOTP = async (email) => {
  try {
    // Real MojoAuth API implementation using their REST API
    const response = await axios.post('https://api.mojoauth.com/users/emailotp', {
      email: email,
      language: 'en',
      redirect_url: 'https://dobitracker-backend.onrender.com'
    }, {
      headers: {
        'X-API-Key': process.env.MOJOAUTH_CLIENT_ID,
        'Content-Type': 'application/json'
      }
    });
    
    // Store the state_id for verification
    if (response.data && response.data.state_id) {
      otpStates.set(email, {
        state_id: response.data.state_id,
        expires_at: Date.now() + 10 * 60 * 1000 // 10 minutes
      });
    }
    
    return {
      success: true,
      message: 'OTP sent successfully',
      state_id: response.data.state_id
    };
  } catch (error) {
    console.error('MojoAuth OTP send error:', error.response?.data || error.message);
    throw new Error('Failed to send OTP: ' + (error.response?.data?.message || error.message));
  }
};

const verifyMojoAuthOTP = async (email, otp) => {
  try {
    // Get the stored state_id for this email
    const otpState = otpStates.get(email);
    if (!otpState) {
      throw new Error('No OTP session found for this email');
    }
    
    if (Date.now() > otpState.expires_at) {
      otpStates.delete(email);
      throw new Error('OTP session has expired');
    }
    
    // Real MojoAuth API implementation for verification
    const response = await axios.post('https://api.mojoauth.com/users/emailotp/verify', {
      state_id: otpState.state_id,
      otp: otp
    }, {
      headers: {
        'X-API-Key': process.env.MOJOAUTH_CLIENT_ID,
        'Content-Type': 'application/json'
      }
    });
    
    // Clean up the stored state
    otpStates.delete(email);
    
    return {
      success: true,
      message: 'OTP verified successfully',
      verified: response.data.verified || false
    };
  } catch (error) {
    console.error('MojoAuth OTP verify error:', error.response?.data || error.message);
    throw new Error('Failed to verify OTP: ' + (error.response?.data?.message || error.message));
  }
};

module.exports = {
  validateEmailFormat,
  sendMojoAuthOTP,
  verifyMojoAuthOTP
};
