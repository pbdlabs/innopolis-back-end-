const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

const {uploadPdf} = require("../controllers/purchaseEm");

router.route('/quotation').post(upload.single('pdfFile'),uploadPdf)


module.exports = router;