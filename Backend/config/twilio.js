const twilio = require('twilio');

// Initialize Twilio client
const client = twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
);

// Function to send OTP via SMS
const sendOTP = async (phoneNumber, otp) => {
    try {
        const message = await client.messages.create({
            body: `Your Student Fee Tracker verification code is: ${otp}. Valid for 5 minutes.`,
            from: process.env.TWILIO_PHONE_NUMBER,
            to: phoneNumber
        });
        return message;
    } catch (error) {
        console.error('Twilio SMS Error:', error);
        throw error;
    }
};

module.exports = {
    sendOTP
}; 