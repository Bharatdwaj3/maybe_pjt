const mongoose=require('mongoose');
const diseaseSchema=new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
    name: {type:String, required: true, trim: true},
    
    effects: {
        sideEffects:{type: String, required: true, trim:true},
        neurological:{type:String,required: true, trim: true},
        genetic:{type: Boolean,required : true, trim: true},
        physical:{type:String,required: true, trim: true} 
    },
    
    origin: {type:Boolean, required: true, trim: true},
    contagious:{type:Boolean,required: true, trim: true},
    prescription: {type:Boolean, required: true, trim:true},
    contagious: {type:Boolean, required: true, trim: true},

    imageUrl:{type:String},
    cloudinaryId:{type:String}
}, 
    { timestamps: true }
);

module.exports=diseaseSchema;

