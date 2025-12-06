const express=require('express');
const mongoose=require('mongoose');
const userSchema=require('../schemas/user.schema');

const userModel = mongoose.model('userModel', userSchema,'user');
module.exports=userModel;