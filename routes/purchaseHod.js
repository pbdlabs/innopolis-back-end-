const express = require('express');
const router = express.Router();
const {getActiveQuotationReq, approveOrDeclineQuotation, getApprovedQuotList,getArchivedQuotList} = require('../controllers/purchaseHod')
const {getMaterialReq}= require('../controllers/purchaseEm')

router.route('/activeQuot').get(getActiveQuotationReq);
router.route('/approvedQuot').get(getApprovedQuotList);
router.route('/archivedQuot').get(getArchivedQuotList);
router.route('/action').post(approveOrDeclineQuotation)
router.route('/materialreq').get(getMaterialReq)


module.exports = router;