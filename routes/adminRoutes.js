const express = require('express');
const router = express.Router();
const {createUser, deleteUser, getUserList}= require('../controllers/adminController')

router.route('/').post(createUser).put(deleteUser).get(getUserList);


module.exports = router