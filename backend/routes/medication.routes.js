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
    roleMiddleware(['doctor','admin']),
    checkPermission('create_disease'),
    createDisease);
router.put('/:id',
    authMiddleware,
    roleMiddleware(['doctor','admin']),
    checkPermission('update_disease'),
    updateDisease);
router.delete('/:id',
    authMiddleware,
    roleMiddleware(['doctor','admin']),
    checkPermission('delete_disease'),
    deleteDisease);

module.exports=router;