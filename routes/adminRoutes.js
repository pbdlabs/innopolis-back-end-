const express = require('express');
const router = express.Router();
const {createUser, deleteUser, getUserList, employeeEdit}= require('../controllers/adminController')

router.route('/').post(createUser).put(deleteUser).get(getUserList).patch(employeeEdit);


module.exports = router