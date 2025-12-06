const express = require('express')
const mongoose = require('mongoose');
const doctorSchema = require('../schemas/doctor.schema');

const doctorModel = mongoose.model('doctorModel', doctorSchema,'doctor');
module.exports=doctorModel;