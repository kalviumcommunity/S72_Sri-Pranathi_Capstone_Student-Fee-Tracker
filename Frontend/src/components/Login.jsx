import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../utils/api';
import './Login.css';
import { FcGoogle } from 'react-icons/fc';
import OTPVerification from './OTPVerification';
import axios from 'axios';
import Logo from '../assets/login logo.png';
import { FaEnvelope, FaLock, FaKey } from 'react-icons/fa';
import logo from '../assets/login logo.png';

const Login = () => {
  const [formData, setFormData] = useState({
    "Email id": '',
    Password: '',
    otp: ''
  });
  const [showOTP, setShowOTP] = useState(false);
  const [error, setError] = useState('');
  const [isOTPDialogOpen, setIsOTPDialogOpen] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loginEmail, setLoginEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (error) {
      localStorage.setItem('loginError', error);
    } else {
      localStorage.removeItem('loginError');
    }
  }, [error]);

  useEffect(() => {
    const errorType = searchParams.get('error');
    if (errorType === 'server_error') {
      setError('Server configuration error. Please try again later.');
    } else if (errorType === 'auth_failed') {
      setError('Authentication failed. Please try again.');
    }
  }, [searchParams]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    setError('');
    setIsSubmitting(true);

    try {
      const response = await axios.post('http://localhost:5000/login', {
        "Email id": formData["Email id"],
        Password: formData.Password
      });
      
      if (response.data.success) {
        setShowOTP(true);
        setError('');
      }
    } catch (error) {
      console.error('Error:', error);
      setError(error.response?.data?.message || 'Login failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOTPVerify = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/verify-otp', {
        "Email id": formData["Email id"],
        otp: formData.otp
      });

      if (response.data.success) {
        localStorage.setItem('token', response.data.token);
        navigate('/dashboard');
      }
    } catch (error) {
      setError('Invalid or expired OTP');
    }
  };

  const handleOTPVerification = (token) => {
    localStorage.removeItem('loginError');
    localStorage.setItem('token', token);
    window.location.href = '/dashboard';
  };

  const handleGoogleLogin = () => {
    try {
      setError('');
      console.log('Initiating Google login...');
      const googleAuthUrl = 'http://localhost:5000/auth/google';
      window.location.href = `${googleAuthUrl}?redirect_uri=${encodeURIComponent(window.location.origin)}`;
    } catch (err) {
      console.error('Error initiating Google login:', err);
      setError('Failed to initiate Google login. Please try again.');
    }
  };

  const handleTryAgain = () => {
    setShowOTP(false);
    setError('');
    setFormData({
      "Email id": '',
      Password: '',
      otp: ''
    });
  };

  return (
    <>
      <div className="login-container">
        <div className="login-box">
          <div className="login-logo">
            <img src={logo} alt="Logo" className="logo-image" />
          </div>
          
          <h1>Welcome Back</h1>
          <p className="subtitle">Enter your credentials to access your account.</p>
          
          {error && <div className="error-message">{error}</div>}

          <form onSubmit={showOTP ? handleOTPVerify : handleSubmit}>
            <div className="input-group">
              <FaEnvelope className="input-icon" />
              <input
                type="email"
                name="Email id"
                placeholder="Email"
                value={formData["Email id"]}
                onChange={handleChange}
                disabled={showOTP}
              />
            </div>

            <div className="input-group">
              <FaLock className="input-icon" />
              <input
                type="password"
                name="Password"
                placeholder="Password"
                value={formData.Password}
                onChange={handleChange}
                disabled={showOTP}
              />
            </div>

            {showOTP && (
              <div className="input-group">
                <FaKey className="input-icon" />
                <input
                  type="text"
                  name="otp"
                  placeholder="Enter OTP"
                  value={formData.otp}
                  onChange={handleChange}
                />
              </div>
            )}

            <button
              type="submit"
              className="sign-in-button"
              disabled={isSubmitting}
            >
              {showOTP ? 'Verify OTP' : 'Sign In'}
            </button>
          </form>

          {showOTP && (
            <button
              type="button"
              onClick={handleTryAgain}
              className="try-again-button"
              disabled={isSubmitting}
            >
              Try Again
            </button>
          )}

          <div className="forgot-password">
            <a href="/reset-password" className="reset-link">Reset Password</a>
          </div>

          <div className="or-divider">
            <span>OR</span>
          </div>

          <button
            onClick={handleGoogleLogin}
            className="google-login-btn"
          >
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" />
            Continue with Google
          </button>
        </div>
      </div>

      <OTPVerification
        isOpen={isOTPDialogOpen}
        onClose={() => setIsOTPDialogOpen(false)}
        email={formData["Email id"]}
        onVerify={handleOTPVerification}
      />
    </>
  );
};

export default Login; 