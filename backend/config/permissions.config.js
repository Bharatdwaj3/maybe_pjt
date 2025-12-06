const PERMISSIONS ={
    admin:[
        'update_patient',
        'manage_users',
        'create_subject',
        'view_subjects',
        'update_subject',
        'delete_subject',
        'create_patient',
        'view_patients',
        'update_patient',
        'delete_patient',
        'create_doctor',
        'view_doctors',
        'update_doctor',
        'delete_doctor',
        'view-self',
        'update-self'
    ],
    doctor:[
        'view_subjects',
        'view_patients',
        'update_subject',
        'update_patient',
        'view-self',
        'update-self',
        'view_doctors'
        
    ],
    patient:[
        
        'view_subjects',
        'assign_subject',
        'view-self',
        'update_subject',
        'view_patients',
        'view_patient',
        'update-self',

        'create_subject',
        'update_subject',
        'delete_subject'
    ],
}

module.exports=PERMISSIONS;