const express = require('express')
const mongoose = require('mongoose');
const diseaseSchema = require('../schemas/disease.schema');

const diseaseModel = mongoose.model('diseaseModel', diseaseSchema,'disease');
module.exports=diseaseModel;