const nodemailer=require("nodemailer");
const {SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, EMAIL_FROM}=require('../config/env.config');

const transporter=nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_PORT == 465,
    auth: {user: SMTP_USER, pass: SMTP_PASS},
});

const sendEmail=async(to, subject, html)=>{
    const mailOptions = {
    from: FROM_EMAIL || `"Your App" <${SMTP_USER}>`,
    to,
    subject,
    html,
  };

  return await transporter.sendMail(mailOptions);
};

module.exports={sendEmail};