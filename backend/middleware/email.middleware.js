const crypto=require('crypto');
const User =require('../models/user.model');
const {sendEmail}=require('../utils/email.util');
const { OTP_EXPIRES_MINUTES } = require('../config/env.config');

const generateOTP=()=>crypto.randomInt(100000, 999999).toString();

const sendVerificationEmail=async(user)=>{
    try{
        
    const token=generateOTP();
    const expires=Date.now()+OTP_EXPIRES_MINUTES*60*1000;

    await User.findByIdAndUpdate(user._id,{
        emailVerificationToken: token,
        emailVerificationExpires: expires,
    });
    
    const html=`
    <h2>Email verification!!</h2>
    <p><strong>${user.fullName}</strong></p>
    <h1>${token}</h1>
    <p>Expires in ${OTP_EXPIRES_MINUTES} minutes.</p>
    `;

    return await sendEmail(user.email, 'Verify Your email',html);
    console.log(`OTP sent to ${user.email}: ${token}`);
    }catch(error){
        console.log('Email Failed: ',error.message);
    }
}


const verifyOTP=async(userId, token)=>{
    try{
        const user=await User.findOne({
        _id: userId,
        emailVerificationToken: token,
        emailVerificationExpires: {$gt: Date.now()},
    });
    if(!user) return {
        success: false, 
        message: 'Invalid or expired OTP'
    };
    await User.findByIdAndUpdate(userId, {
        isEmailVerified: true,
        $unset: {emailVerificationToken:1, emailVerificationExpires:1},
    });
    return {success: true, message: 'Email verified'};
    }catch(error){
        return { success: false, message: 'Verification failed' };
    }
};

module.exports={sendVerificationEmail, verifyOTP, generateOTP};