const express = require('express');
const router = express.Router();
const {getClient, getDesignEmployees, getPlantList, createProject, getMaterialReq} = require('../controllers/designHod');

router.route('/clients').get(getClient)
router.route('/designemployees').get(getDesignEmployees)
router.route('/plants').get(getPlantList)
router.route('/project').post(createProject)
router.route('/materialreq').post(getMaterialReq)

module.exports = router;