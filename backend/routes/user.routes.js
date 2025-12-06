const express=require('express');
const {registerUser,
  refreshToken,
  verifyEmail,
  loginUser,
  logoutUser,
  profileUser,
  oauthSuccess}=require('../controllers/user.controller');
const authUser = require('../middleware/auth.middleware');

const passport=require('passport');
const router=express.Router();


router.post('/register', registerUser);
router.post('/login',loginUser);
router.get('/profile',authUser,profileUser);
router.post('/logout',authUser,logoutUser);
router.get('/refresh',refreshToken);


router.get('/oauth/google',
    passport.authenticate('google',{scope: ['email','profile']}));
router.get('/oauth/discord',
    passport.authenticate('discord',{scope: ['identify','email']}));
router.get('/oauth/google/callback',
    passport.authenticate('google',{failureRedirect: 'ap/user/oauth/failure', session:true}));
router.get('/oauth/discord/callback',
    passport.authenticate('discord',{failureRedirect: 'ap/user/oauth/failure', session:true}), oauthSuccess);
router.get('/oauth/failure',(req, res)=>{
    res.status(401).json({
        success: false,
        message: 'OAuth Authentication failed',
        code: 'OAuth_FAILURE',
        errors: req.session.message || [] });
})

router.post('/verify-email', verifyEmail);



module.exports = router;
