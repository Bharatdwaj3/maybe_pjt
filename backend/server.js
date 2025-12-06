require('dotenv').config();

const express=require("express");
const passport = require('passport');
const session = require('express-session');
const MongoStore = require('connect-mongo')
const dbMiddleware =require('./middleware/db.middleware');


const doctorRoutes=require('./routes/doctor.routes');
const diseaseRoutes=require('./routes/disease.routes');
const userRoutes=require('./routes/user.routes');
const patientRoutes=require('./routes/patient.routes');

const { PORT, SESSION_SECRECT, MONGO_URI } = require('./config/env.config');
const connectDB=require('./config/db.config');
const morganConfig = require('./config/morgan.config');
require('./strategy/google.aouth');
require('./strategy/discord.aouth');

const {
   validate,
    sanitizeInput,
    rateLimitGlobal,
    rateLimitAuth,
    csrfProtection,
    corsMiddleware,
    helmetMiddleware,
    cookieParser
} = require("./middleware/security.middleware");

const app=express();

connectDB();
app.use(morganConfig);

app.set('trust proxy', 1);

app.use(cookieParser());
app.use(corsMiddleware);
app.use(helmetMiddleware);
app.use(sanitizeInput);
app.use('/api/', rateLimitGlobal);
app.use(express.json({ limit: '8kb' }));

app.use(express.urlencoded({ extended: true, limit: '8kb' }));

app.use(session({
    secret:SESSION_SECRECT,
    resave: false,
    saveUninitialized: true,
    store: new MongoStore({
        mongoUrl: MONGO_URI,
    }),
    cookie: {
        maxAge :10*24*60*60*1000,
        httpOnly: true,
        secure: process.env.NODE_ENV='production',
        sameSite: 'lax'
    },
}));

app.use(passport.initialize());
app.use(passport.session());

app.get('/',(req,res)=>{ res.send('Server is ready'); });
app.use('/api/patient',patientRoutes);
app.use('/api/disease',diseaseRoutes);
app.use('/api/doctor',doctorRoutes);
app.use('/api/user',userRoutes);

app.use(dbMiddleware);

app.listen(PORT, () => console.log('Server Started at port : ',PORT));