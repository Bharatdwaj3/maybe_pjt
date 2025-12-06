const express = require('express')
const mongoose = require('mongoose');
const medicationSchema = require('../schemas/medication.schema');

const medicationModel = mongoose.model('medicationModel', medicationSchema,'medication');
module.exports=medicationModel;