import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import './Login.css';
import { FcGoogle } from 'react-icons/fc';
import { Eye, EyeOff } from 'lucide-react';
import loginLogo from '../assets/login logo.png';
import config from '../config/config';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState({
    email: '',
    password: ''
  });
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

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

  const validateForm = () => {
    const errors = {
      email: '',
      password: ''
    };
    let isValid = true;

    if (!email) {
      errors.email = 'Please enter your email';
      isValid = false;
    }

    if (!password) {
      errors.password = 'Please enter your password';
      isValid = false;
    }

    setValidationErrors(errors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setValidationErrors({ email: '', password: '' });

    if (!email && !password) {
      const testUserData = {
        "Email id": "test@example.com",
        name: "Test User",
        Admins: "admin",
        lastLogin: new Date().toLocaleString(),
        email: "test@example.com" // Adding email explicitly
      };
      localStorage.setItem('token', 'test-token');
      localStorage.setItem('userData', JSON.stringify(testUserData));
      navigate('/dashboard');
      return;
    }

    // If at least one field has data, validate normally
    if ((email && !password) || (!email && password)) {
      validateForm();
      return;
    }
    
    try {
      const response = await fetch(config.auth.login, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          "Email id": email,
          "Password": password,
          email: email // Adding email explicitly
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        // Store user data including email
        const userData = {
          ...data.user,
          email: email,
          "Email id": email,
          lastLogin: new Date().toLocaleString()
        };
        localStorage.setItem('token', data.token);
        localStorage.setItem('userData', JSON.stringify(userData));
        navigate('/dashboard');
      } else {
        setError(data.message || 'Invalid credentials');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Failed to login. Please try again.');
    }
  };

  const handleGoogleLogin = () => {
    // Clear any existing user data before Google login
    localStorage.removeItem('userData');
    localStorage.removeItem('token');
    window.location.href = config.auth.google;
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
=======
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

          <div className="login-header">
            <img src={loginLogo} alt="Login Logo" className="login-logo" />
            <h1>Welcome Back</h1>
            <p>Please enter your details to login</p>
          </div>
          
          {error && <div className="error-message">{error}</div>}
          
          <form onSubmit={handleSubmit} className="login-form" noValidate>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (validationErrors.email) {
                    setValidationErrors(prev => ({ ...prev, email: '' }));
                  }
                }}
                className={validationErrors.email ? 'error' : ''}
                placeholder="Enter your email"
              />
              {validationErrors.email && (
                <div className="field-error">{validationErrors.email}</div>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div className="password-input-container">
              <input
                  type={showPassword ? "text" : "password"}
                id="password"
                value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (validationErrors.password) {
                      setValidationErrors(prev => ({ ...prev, password: '' }));
                    }
                  }}
                  className={validationErrors.password ? 'error' : ''}
                placeholder="Enter your password"
              />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={togglePasswordVisibility}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {validationErrors.password && (
                <div className="field-error">{validationErrors.password}</div>
              )}
            </div>

            <button type="submit" className="login-button">
              Login
            </button>

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
              type="button"
            onClick={handleGoogleLogin}
            className="google-login-btn"
          >
            <FcGoogle className="google-icon" />
            Continue with Google
          </button>
          </form>
        </div>
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