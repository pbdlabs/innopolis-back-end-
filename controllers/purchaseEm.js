
const fs = require('fs');
const executeQuery = require('../config/db');

const uploadPdf =async (req, res) =>{
    try {
        const pdfBuffer = fs.readFileSync(req.file.path);
        const pdfBase64 = pdfBuffer.toString('base64');
        await savePdfToDatabase(pdfBase64);
        fs.unlinkSync(req.file.path);
    
        res.status(200).send('PDF uploaded and saved successfully');
      } catch (error) {
        console.error('Error uploading and saving PDF:', error);
        res.status(500).send('Internal Server Error');
      }
}

const savePdfToDatabase = async (pdfBase64) => {
    const query = 'INSERT INTO quotationmaster (QuotationFile) VALUES (?)';
    await executeQuery(query, [Buffer.from(pdfBase64, 'base64')])
  };

module.exports = {uploadPdf}