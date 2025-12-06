const mongoose=require('mongoose');
const doctorSchema=new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
    name: {type:String, required: true, trim: true},
    age: {type:Number, required: true, trim: true},
    gender: {type:String, required: true, trim: true},
    
    email: {type:String, required: true, trim: true},
    phone: {type:Number, required: true, trim: true},

    dept: {type:String, required: true, trim: true},
    title: {type:String, required: true, trim: true},
    speciality: {type:String, required: true, trim: true},

    imageUrl:{type:String},
    cloudinaryId:{type:String}
},{timestamps:true});

module.exports=doctorSchema;

