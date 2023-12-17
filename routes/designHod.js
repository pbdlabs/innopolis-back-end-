const express = require('express');
const router = express.Router();
const {getClient, getDesignEmployees, getPlantList, createProject, getMaterialReq, addClient, editClient, approveMaterialReq} = require('../controllers/designHod');

router.route('/clients').get(getClient).post(addClient).put(editClient)
router.route('/designemployees').get(getDesignEmployees)
router.route('/plants').get(getPlantList)
router.route('/project').post(createProject)
router.route('/materialreq').get(getMaterialReq).post(approveMaterialReq)

module.exports = router;