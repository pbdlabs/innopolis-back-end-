const express = require("express");
const router = express.Router();
const {
  getComponentType,
  addComponentType,
  getComponent,
  addComponent,
  getItemType,
  addItemType,
  getSpecs,
  addSpecs,
  getProjects,
  getMaterialList,
  materialReq,
} = require("../controllers/designEm");

router.route("/componenttype").get(getComponentType).post(addComponentType);
router.route("/item").get(getItemType).post(addItemType);
router.route("/component").get(getComponent).post(addComponent);
router.route("/specs").get(getSpecs).post(addSpecs);
router.route("/materials").get(getMaterialList);
router.route("/materialreq").post(materialReq);
router.route('/projects').get(getProjects)

module.exports = router;
