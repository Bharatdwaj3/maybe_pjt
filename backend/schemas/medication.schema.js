const mongoose=require('mongoose');
const medicationSchema=new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
    name: {type:String, required: true, trim: true},
    
    effects: {
        sideEffects:{type: String, required: true, trim:true},
        neurological:{type:String,required: true, trim: true},
        genetic:{type: Boolean,required : true, trim: true},
        physical:{type:String,required: true, trim: true} 
    },
    disorders: {
        genetic:{type: Boolean,requied : true, trim: true},
        devlopmental: {type: Boolean,required: true, trim: true}
    },
    
    medication_rank: {type:CharacterData, required: true, trim: true},
    medication_shedule: {type: String, required: true, trim: true},
    prescription: {type:Boolean, required: true, trim:true},

    pastHistory: {type:Boolean, required: true, trim: true},
    emergency: {type:Boolean, required: true, trim: true},

    imageUrl:{type:String},
    cloudinaryId:{type:String}
}, 
    { timestamps: true }
);

module.exports=medicationSchema;

