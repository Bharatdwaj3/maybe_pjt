const bycrypt = require('bcryptjs');
const jwt=require('jsonwebtoken');
const User=require('../models/user.model');
const {
  setAccessToken, setRefreshToken, clearAuthCookies, revokeRefreshToken, refreshTokenHandler, destroySession
}=require('../middleware/token.middleware');
const { sendVerificationEmail } = require('../middleware/email.middleware');

const registerUser=async(req, res)=>{
  try{
      const {userName, fullName, email, accountType, password}= req.body;

    if(!userName || !fullName || !email || !accountType || !password){
      return res.status(400).json({
        success: false,
        message: 'All fields are req!!',
        code: 'VALIDATION_ERROR'
      });
    }
    const existingUser = await User.findOne({ email });
      if(existingUser){
        return res.status(400).json({
          success:false,
          message: 'User with this email already exists!',
          code: 'EMAIL_EXISTS'
        });
      }

    const user=new User({
      userName: userName,
      fullName: fullName,
      email: email,
      accountType: accountType,
      password: password
    })
    const salt=await bycrypt.genSalt(10);
    user.password=await bycrypt.hash(password, salt);

    await user.save();
    
    setAccessToken(res, user);
    await setRefreshToken(res, user);
    sendVerificationEmail(user);
    return res.status(201).json({
      success: true,
      message: 'Registered Check email for verification code',
      requiresVerfication: true,
      user: {id: user._id, email: user.email}
    });


  }catch(error){
    console.error('Error registering user: ',error);
    res.status(500).json({
      success: false,
      message:'Server Error',
      code: 'REGISTRATION_FAILED'
    });
  }
};

const loginUser=async(req, res)=>{
  try{
    const {email, password}=req.body;
    if(!email || !password){
      return res.status(400).json({
        success: false,
        message: 'Email and password are required',
        code: 'MISSING_CREDENTIALS'
      });
    }
    const user=await User.findOne({email}).select('+password');
    if(!user){
      return res.status(400).json({
        success: false,
        message:'Invalid credentials',
        code: 'INVALID_CREDENTIALS'
      });
    }
    if(!user.isActive){
      return  res.status(403).json({
        success: false,
        message: 'Account is deactivated',
        code: 'ACCOUNT_INACTIVE'
      });
    }
    const isMatch=await bycrypt.compare(password, user.password);
    if(!isMatch){
        return res.status(400).json({
          success: false,
          message: 'Invalid credentials',
          code: 'INVALID_CREDENTIALS'
        });
    }

    setAccessToken(res, user);
    await setRefreshToken(res, user);

    res.json({
      success: true,
      message: 'Login successful',
      user: {
        id: user._id,
        userName: user.userName,
        fullName: user.fullName,
        email: user.email,
        accountType: user.accountType,
        lastLogin: user.lastLogin
      }
    });
  }catch(error){
    console.error('Error logging in : ',error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      code: 'LOGIN_FAILED'
    });
  }
};

const oauthSuccess=async(req, res)=>{
  try{
    if(!req.user){
      return res.status(401).json({
        success: false,
        message: 'OAuth authentication failed',
        code: 'OAUTH_FAILED'
      });
    }
    const user = await User.findById(req,user._id).select('isActive');
    if(!user || !user.isActive){
      return res.status(403).json({
        success: false,
        message: 'OAuth user account is inactive',
        code: 'USER_INACTIVE'
      });
    }

    setAccessToken(res, req.user);
    await setRefreshToken(res, req.user);
    destroySession(req, res);

    res.json({
      success: true,
      message: 'OAuth login successful',
      user: {
        id: req.user._id,
        userName: req.user.userName,
        fullName: req.user.fullName,
        email: req.user.email,
        accountType: req.user.accountType,
        avatar: req.user.avatar
      }
    });
  }catch(error){
    console.error('OAuth success error: ',error);
    res.status(500).json({
      success: false,
      message: 'OAuth processing failed',
      code: 'OAUTH_PROCESSING_FAILED'
    });
  }
};


const logoutUser=async(req, res)=>{
  try{
    if(req.user?.id){
      await revokeRefreshToken(req.user.id);
    }
    clearAuthCookies(res);
    destroySession(req, res);
    res.json({
      success: true,
      message: 'User logged out successfully',
      code: 'LOGOUT_SUCCESS'
    });
  }catch(error){
    console.error('Logout error: ',error);
    res.status(500).json({
      success: false,
      message: 'Logout failed',
      code: 'LOGOUT_FAILED'
    });
  }
}

const profileUser=async(req, res)=>{
  try{
    const user=await User.findById(req.user.id)
      .select('-password -accounType -refreshTokenn -googleId -discordId')
      
    if(!user){
      return res.status(404).json({
        success: false,
        message: 'User not found',
        code: 'USER_NOT_FOUND'
      });
    }
    res.status(200).json({
      success: true,
      message: 'Welcome to your dashboard!',
      user:{
        id: user._id,
        userName: user.userName,
        fullName: user.fullName,
        email: user.email,
        accountType: user.accountType,
        avatar: user.avatar,
        isEmailVerified: user.isEmailVerified,
        isActive: user.isActive,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        lastLogin: user.lastLogin
      }
    });
  }catch(error){
    console.error('Error fetching profile: ',error);
    res.status(500).json({message: 'Server error'});
  }
};

const refreshToken = async (req, res) => {
  return refreshTokenHandler(req, res);
};

const verifyEmail = async (req, res) => {
  const { userId, token } = req.body;
  if (!userId || !token) return res.status(400).json({ message: 'userId and token required' });

  const result = await verifyOTP(userId, token);
  res.status(result.success ? 200 : 400).json(result);
};

const verifyOTP=async(userId, token)=>{
  try{
    const user = await User.findById(userId);
    if(!user){
      return {
        success: false,
        message: 'Invalid verification code',
        code: 'OTP_EXPIRED'
      };
    }
    if(new Date()>user.emailVerificationExpires){
      return{
        success: false,
        message: 'Verification code expired',
        code: 'OTP_EXPIRED'
      };
    }
    user.isEmailVerified=true;
    user.emailVerificationToken=null;
    user.emailVerificationExpires=null;
    await user.save();
    return {
      success: true,
      message: 'Email verified success',
      code: 'OTP_VERIFIED'
    }
  }catch(error){
    console.error('OTP verification error: ',error);
    return {
      success: false,
      message: 'Server error during verification',
      code: 'SERVER_ERROR'
    };
  }
};



module.exports={
  registerUser,
  oauthSuccess,
  refreshToken,
  verifyEmail,
  loginUser,
  logoutUser,
  profileUser,
  oauthSuccess
};