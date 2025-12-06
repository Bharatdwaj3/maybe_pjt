const passport = require('passport');
const GoogleStrategy=require('passport-google-oauth20').Strategy;
const User = require('../models/user.model');
require('dotenv').config();

const {  GOOGLE_CALLBACK_URI, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET } = require('../config/env.config');
passport.use(new GoogleStrategy({
        clientID: GOOGLE_CLIENT_ID,
        clientSecret: GOOGLE_CLIENT_SECRET,
        callbackURL: GOOGLE_CALLBACK_URI,
        passReqToCallback: true
    },async (req, accessToken, refreshToken, profile, done)=>{
        try{
            const email = profile.emails?.[0]?.value;
            if(!email){
                return done(null, false, {message: 'Email scope not garanted'});
            }
            const displayName = profile.displayName || 'User';
            const avatar = profile.photos?.[0]?.value || null;
            const user = await User.findOneAndUpdate(
                {googleId: profile.id},{
                    $set: {
                        email,
                        fullName: displayName,
                        userName: displayName.split(' ')[0]?.toLowerCase() || "user",
                        accountType: 'patient',
                        avatar,
                        googleId: profile.id,
                        isEmailVerified: profile.emails?.[0]?.verified || false,
                        lastLogin: new Date(),
                        isActive: true 
                    },
                    $setOnInsert: {
                        createdAt: new Date()
                    }
                },
                {
                    upsert: true,
                    new: true,
                    runValidators: true,
                }
            );
            return done(null, user);
        }catch(error){
            console.error('Google OAuth error: ',error);
            return done(error);
        }
    }
));

passport.serializeUser(function(user, done){
    done(null, user._id);
});

passport.deserializeUser(async (id, done)=>{
    
    try{
        const user= await User.findById(id);
        done(null, user);
    }catch(err){
        done(err);
    }
});