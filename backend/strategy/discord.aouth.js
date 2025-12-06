const passport = require('passport');
const User=require('../models/user.model');
const DiscordStrategy=require('passport-discord').Strategy;
const { DISCORD_CLIENT_SECRET, DISCORD_CLIENT_ID, DISCORD_CALLBACK_URI } = require('../config/env.config');
passport.use(new DiscordStrategy({
        clientID: DISCORD_CLIENT_ID,
        clientSecret: DISCORD_CLIENT_SECRET,
        callbackURL: DISCORD_CALLBACK_URI,
        scope: ['identify','email'],
        passReqToCallback: true
    },async (req, accessToken, refreshToken, profile, done)=>{

        try{
            const email=profile.email;
            const username=profile.username;
            const globalName=profile.global_name;

            if(!email){
                return done(null, false, {message: 'Email scope not granted'});
            }
            const avatar = profile.avatar
            ? `https://cdn.discordapp.com/avatars/${profile.id}/${profile.avatar}.png`
            : null;
            
        const user = await User.findOneAndUpdate(
      { discordId: profile.id },
      {
        $set: {
          email,
          fullName: globalName || `${username}#${profile.discriminator}`,
          userName: username,
          accountType: 'patient', 
          avatar,
          discordId: profile.id,
          isEmailVerified: profile.verified,
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
        runValidators: true 
      }
    );
        return done(null, user);
         }catch(error){
            return done(error);
        }   
    }
));

passport.serializeUser(function(user, done){
    done(null, user._id);
});

passport.deserializeUser(async(id, done)=>{
    try{
      const user=await User.findById(id);
      done(null, user);
    }catch(err){
      done(err);
    }
});