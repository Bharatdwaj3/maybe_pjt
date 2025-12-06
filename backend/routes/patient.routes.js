const express=require('express');
const upload=require('../services/multer.service');
const router=express.Router();
const{
    getPatient,deletePatient,
    getPatients, updatePatientProfile

} =require('../controllers/patient.controller');

const checkPermission = require('../middleware/permission.middleware');
const roleMiddleware = require('../middleware/role.middleware');
const authUser=require('../middleware/auth.middleware');

router.get('/',
    roleMiddleware(['admin','faculty','Patient']),
    checkPermission('view_patients'),
    getPatients);
router.get('/:id',
    authUser, 
    roleMiddleware(['patient']), 
    checkPermission('view_Patients'),
    getPatient);
router.put('/profile/:id',
    upload.single('image'), 
    authUser, 
    roleMiddleware(['doctor']), 
    checkPermission('update-self'), 
    updatePatientProfile);
router.delete('/:id',
    roleMiddleware(['admin']), 
    checkPermission('delete_Patient'), 
    deletePatient,);

module.exports=router;