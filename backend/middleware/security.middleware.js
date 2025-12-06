const helmet = require('helmet');
const cors = require('cors');
const mongoSanitize = require('express-mongo-sanitize');
const sanitizeHtml = require('sanitize-html');
const {RateLimiterMemory} = require('rate-limiter-flexible');
const csurf = require('csurf');
const cookieParser = require('cookie-parser');
const Ajv = require('ajv');
const addFormats = require('ajv-formats');

const ajv = new Ajv({
    allErrors: true,
    removeAdditional:'all',
    useDefaults: true,
    coerceTypes: true,
    strict: true,
});
addFormats(ajv);

const validate=(schema)=>{
    const validateFn=ajv.compile(schema);
    return (req, res, next)=>{
        if(!validateFn(req.body)){
            return res.status(400).json({
                error:'Validation faile',
                deatails: validateFn.errors.map(e=>({
                    field:e.instancePath || e.params.missingProperty,
                    message: e.message,
                })),
            });
        }
        next();
    };
};


const sanitizeInput=(req, _, next)=>{
    if(req.body ){
        Object.keys(req.body).forEach(key=>{
            if(typeof req.body[key]=='string'){
                req.body[key]=sanitizeHtml(req.body[key],{
                    allowedTags: [],
                    allowedAttributes: {},
                });
            }
        });
        mongoSanitize.ssanitize(req.body);
    }
    next();
}

const globalLimiter=new RateLimiterMemory({
    points: 150, 
    duration: 900,
});

const rateLimitGlobal=async(req, res, next)=>{
    try{
        await globalLimiter.consume(req.ip); 
        next();
    }catch{
        req.status(429).json({
            error:'Too many requests - wait 15 minutes'
        });
    };
}

const authLimiter = new RateLimiterMemory({
        points: 10,
        duration: 3600
});
const rateLimitAuth=async(req, res, next)=>{
    try{
        await authLimiter.consume(req.ip);
        next();
    }catch{
        res.status(429).json({
            error:'Too many login attempt'
        });
    };
}

const isProd=process.env.NODE_ENV==='production';
const csrfProtection=csurf({
    cookie: {
        httpOnly: true,
        secure: isProd,
        sameSite:'strict'
    },
});

const allowedOrigins=isProd ? ['https://yourdomain.com'] : ['http://localhost:517','http://localhost:300'];
const corsMiddleware=cors({origin: (origin, cb)=>(!origin || allowedOrigins.includes(origin))
    ? cb(null,true)
    : cb(new Error('CORS blocked')),
    credentials: true,
});

const helmetMiddleware=helmet({
    contentSecurityPolicy:{
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'","'strict-dynamic'"],
            styleSrc: ["'self'","'unsafe-inline'"],
            imgSrc: ["'self'",'data','https'],
            connectSrc: ["'self'"],
            objectSrc: ["'none'"],
            frameAncestors: ["'none'"],
        },
    },
    hsts: {
        maxAge: 31536000, 
        includeSubDomains: true, 
        preload: true
    },
    referrerPolicy: {policy:'no-referrer'},
});

module.exports={
    validate,
    sanitizeInput,
    rateLimitGlobal,
    rateLimitAuth,
    csrfProtection,
    corsMiddleware,
    helmetMiddleware,
    cookieParser,
}; 