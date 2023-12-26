const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

const {getMaterialReq,addQuotation, getActiveQuotList, getArchivedQuotList, getApprovedQuotList, viewQuot, getQuotPdf, placeOrder, getActiveOrderList, getDeliveredOrderList, updateOrder, getInvoiceFile} = require("../controllers/purchaseEm");

router.route('/quotation').post(upload.single('quotation_file'),addQuotation).get(viewQuot)
router.route('/materialreq').get(getMaterialReq);
router.route('/activequot').get(getActiveQuotList);
router.route('/archivedquot').get(getArchivedQuotList);
router.route('/approvedquot').get(getApprovedQuotList);
router.route('/quotfile').get(getQuotPdf)
router.route('/order').post(upload.single('invoice_file'),placeOrder).get(getActiveOrderList).put(upload.single('invoice_file'),updateOrder)
router.route('/completedorder').get(getDeliveredOrderList)
router.route('/invoicefile').get(getInvoiceFile)

module.exports = router;