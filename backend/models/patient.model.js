const express = require('express')
const mongoose = require('mongoose');
const patientSchema = require('../schemas/patient.schema');

const patientModel = mongoose.model('patientModel', patientSchema,'patient');
module.exports=patientModel;