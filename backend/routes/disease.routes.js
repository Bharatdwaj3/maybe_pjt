const express=require('express');
const router=express.Router();

const{
    createDisease, updateDisease, deleteDisease,
    getDiseases, 
} =require('../controllers/disease.controller');

const authMiddleware = require('../middleware/auth.middleware');
const checkPermission = require('../middleware/permission.middleware');
const roleMiddleware = require('../middleware/role.middleware');


router.get('/',
    authMiddleware,
    roleMiddleware(['admin','doctor','patient']),
    checkPermission('view_Diseases'),
    getDiseases);
router.post('/:userId',
    authMiddleware,
    roleMiddleware(['patient','admin']),
    checkPermission('create_Disease'),
    createDisease);
router.put('/:id',
    authMiddleware,
    roleMiddleware(['patient','admin']),
    checkPermission('update_Disease'),
    updateDisease);
router.delete('/:id',
    authMiddleware,
    roleMiddleware(['patient','admin']),
    checkPermission('delete_Disease'),
    deleteDisease);

module.exports=router;