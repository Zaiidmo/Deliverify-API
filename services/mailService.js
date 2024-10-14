const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465, 
  secure: true, 
  auth: {
    user: process.env.EMAIL_USERNAME,
    pass: process.env.EMAIL_PASSWORD,
  },
});

const sendVerificationEmail = async (username, userEmail, verificationToken) => {
  const verificationUrl = `${process.env.CLIENT_URL}/verify-email?token=${verificationToken}`;
  
  const mailOptions = {
    from: "Vlpha Team" , 
    to: userEmail,
    subject: "Verify Your Email Address",
    text: `Hello ${username},\n\nPlease click the following link to verify your email: ${verificationUrl}\n\nIf you did not create an account, please ignore this email.`,
    html: `<p>Hello ${username},</p>
           <p>Please click the following link to verify your email:</p>
           <a href="${verificationUrl}">Verify your email</a>
           <br><br>
           <p>If you did not create an account, you can safely ignore this email.</p>`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Verification email sent successfully to ${userEmail}.`);
  } catch (error) {
    console.error(`Error sending verification email to ${userEmail}:`, error.message);
    throw new Error("Could not send verification email. Please try again later.");
  }
};

const sendOTP = async (email, otpCode) => {
  const mailOptions = { 
    from: "Vlpha Team",
    to: email,
    subject: "Login OTP",
    text: `Your OTP for login is: ${otpCode}`,
    html: `<p>Your OTP for login is:</p>
           <h1>${otpCode}</h1>`,
  };
  try {
    await transporter.sendMail(mailOptions);
    console.log(`OTP sent successfully to ${email}.`);
  } catch { 
    console.error(`Error sending OTP to ${email}:`, error.message);
    throw new Error("Could not send OTP. Please try again later.");
  }
};

const sendPasswordResetEmail = async (username, userEmail, resetToken) => {
  const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`;
  
  const mailOptions = {
    from: "Vlpha Team",
    to: userEmail,
    subject: "Reset Your Password",
    text: `Hello ${username},\n\nPlease click the following link to reset your password: ${resetUrl}\n\nIf you did not request a password reset, please ignore this email.`,
    html: `<p>Hello ${username},</p>
           <p>Please click the following link to reset your password:</p>
           <a href="${resetUrl}">Reset your password</a>
           <br><br>
           <p>If you did not request a password reset, you can safely ignore this email.</p>`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Password reset email sent successfully to ${userEmail}.`);
  } catch (error) {
    console.error(`Error sending password reset email to ${userEmail}:`, error.message);
    throw new Error("Could not send password reset email. Please try again later.");
  }
}

module.exports = { sendVerificationEmail, sendOTP, sendPasswordResetEmail };
