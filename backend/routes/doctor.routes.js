const express=require('express');
const router=express.Router();
const upload=require('../services/multer.service');
const{
    getDoctor, deleteDoctor, 
    getDoctors,updateDoctorProfile
    
} =require('../controllers/doctor.controller');

const checkPermission = require('../middleware/permission.middleware');
const roleMiddleware = require('../middleware/role.middleware');
const authUser=require('../middleware/auth.middleware');

router.get('/',
    roleMiddleware(['admin','doctor','patient']),
    checkPermission('view_doctors'),
    getDoctors);
router.get('/:id',
    authUser, 
    roleMiddleware(['doctor','admin','patient']), 
    checkPermission('view-self'),
    getDoctor);
router.put('/profile/:id',
    upload.single('image'), 
    authUser, 
    roleMiddleware(['doctor']), 
    checkPermission('update-self'), 
    updateDoctorProfile);
router.delete('/:id',
    roleMiddleware(['admin']), 
    checkPermission('delete_patient'), 
    deleteDoctor);

module.exports=router;