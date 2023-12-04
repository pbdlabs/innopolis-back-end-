const express = require('express');
const router = express.Router();
const {getComponentType, getComponent, getItemType, getSpecs, getMaterialList, materialReq} = require('../controllers/designEm');

router.route("/componenttype").get(getComponentType)
router.route("/item").get(getItemType)
router.route("/component").get(getComponent)
router.route("/specs").get(getSpecs)
router.route("/materials").get(getMaterialList)
router.route("/").post(materialReq)

module.exports = router;