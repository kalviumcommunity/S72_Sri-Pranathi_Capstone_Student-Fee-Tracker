import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from './ui/dialog';
import { Button } from './ui/button';
import '../styles/OTPVerification.css';

const OTPVerification = ({ isOpen, onClose, email, onVerify }) => {
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [isResending, setIsResending] = useState(false);

  const handleVerify = async () => {
    try {
      const response = await fetch('http://localhost:5000/auth/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          otp,
        }),
      });

      const data = await response.json();

      if (data.success) {
        onVerify(data.token);
      } else {
        setError('Invalid OTP. Please try again.');
      }
    } catch (err) {
      setError('Failed to verify OTP. Please try again.');
    }
  };

  const handleResendOTP = async () => {
    setIsResending(true);
    try {
      await fetch('http://localhost:5000/auth/resend-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });
      setError('');
    } catch (err) {
      setError('Failed to resend OTP. Please try again.');
    }
    setIsResending(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="otp-dialog">
        <DialogHeader>
          <DialogTitle>Enter Verification Code</DialogTitle>
          <DialogDescription>
            A 6-digit code has been sent to your email.
          </DialogDescription>
        </DialogHeader>

        {/* Debug message to ensure visibility */}
        <p style={{ color: 'red', marginTop: '10px' }}>Hello! Dialog is open!</p>

        <div className="otp-content">
          <p className="otp-description">
            We've sent a verification code to <strong>{email}</strong>
          </p>

          {error && <div className="otp-error">{error}</div>}

          <div className="otp-input-container">
            <input
              type="text"
              maxLength="6"
              placeholder="Enter 6-digit code"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="otp-input"
            />
          </div>

          <div className="otp-actions">
            <Button onClick={handleVerify} className="verify-button">
              Verify
            </Button>
            <button
              onClick={handleResendOTP}
              className="resend-button"
              disabled={isResending}
            >
              {isResending ? 'Sending...' : 'Resend Code'}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OTPVerification;
