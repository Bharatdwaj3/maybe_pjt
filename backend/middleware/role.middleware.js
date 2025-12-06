const jwt=require('jsonwebtoken');
const {JWT_ACC_SECRECT}=require('../config/env.config');

const roleMiddleware=(allowedRoles=[])=>{
    return(req, res, next)=>{
        const authHeader=req.headers['authorization'];
    if(!authHeader){
        return res.status(401).json({message: 'No token, authorization denied'});
    }
    const token=authHeader.split(' ')[1];
    if(!token){
        return res.status(401).json({message: 'No token, authorization denied'});
    }
    try{
        const decoded=jwt.verify(token, JWT_ACC_SECRECT);
        req.user=decoded.user;
        req.role = req.user.accountType;
        console.log('Decoded user:', req.user);
       if(allowedRoles.length && !allowedRoles.includes(req.user.accountType)){
            return res.status(403).json({message: 'Access denied insuffient role'})
       }
        next();
    }catch(error){
        console.error('Token verification error:', error.message);
        res.status(401).json({message: 'Token not valid'});
    }
    }
    
};

module.exports=roleMiddleware;