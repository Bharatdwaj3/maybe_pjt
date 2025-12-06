const mongoose=require('mongoose');
require('dotenv').config();
const { MONGO_URI } = require('./env.config');

const connectDB=()=>{
    mongoose
        .connect(MONGO_URI)
        .then(()=>console.log('DB Connected!!'))
        .catch((error)=>console.log('DB not connected!!'));
};

module.exports=connectDB;