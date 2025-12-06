const mongoose=require('mongoose');
const patientSchema=new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
    name: {type:String, required: true, trim: true},
    age: {type:Number, required: true},
    gender: {type:String, required: true, trim: true, enum:['male','female','other']},
    
    email: {type:String, required: true, trim: true},
    phone: {type:Number, required: true},
    
    disease: {
        contagious:{type:Boolean,required: true},
        neurological:{type:String,required: true, trim: true},
        genetic:{type: Boolean,required : true},
        physical:{type:String,required: true, trim: true} 
    },

    disorders: {
        genetic:{type: Boolean,required : true},
        devlopmental: {type: Boolean,required: true}, 
    },
    
    pastHistory: {type:Boolean, required: true},
    contagious: {type:Boolean, required: true},
    emergency: {type:Boolean, required: true},



    imageUrl:{type:String},
    cloudinaryId:{type:String}
}, 
    { timestamps: true }
);

module.exports=patientSchema;

