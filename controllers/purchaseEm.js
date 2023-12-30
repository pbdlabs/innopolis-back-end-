const fs = require("fs");
const executeQuery = require("../config/db");

const getSupplier = async (req, res)=>{
  const query = `SELECT SM.Id 'supplier_id', SM.Name 'supplier_name', SM.Email 'supplier_email', SM.Address 'supplier_address', SM.ContactNumber 'supplier_number' FROM suppliermaster SM;`;
  const supplierList = await executeQuery(query);
  res.status(200).send(supplierList);
}

const addSupplier = async (req, res)=>{
  const {supplier_name,supplier_address, supplier_email, supplier_number} = req.body;
  const query = `insert into suppliermaster ( Name, Address, Email, ContactNumber) values ( ?, ?, ?, ?);`;
  const params = [supplier_name,supplier_address, supplier_email, supplier_number];
  await executeQuery(query, params);
  res.status(200).send("Supplier added successfully!");
}

const editSupplier = async (req, res)=>{
  const {supplier_id, supplier_name,supplier_address, supplier_email, supplier_number} = req.body;
  const query = `update suppliermaster set Name = ? , Email = ?,Address= ?, ContactNumber = ?  where Id = ?;`;
  const params = [supplier_name, supplier_email, supplier_address, supplier_number, supplier_id];
  await executeQuery(query, params);
  res.status(200).send("Supplier edited successfully!")

}

const getMaterialReq = async (req, res) => {
  const query = `SELECT  mm.Id AS 'material_id', cm.ComponentName 'component_name', ct.ComponentType 'component_type', sm.Specs 'specs', im.ItemType 'item', pm.ProjectNumber 'project_number', pl.PlantName 'plant_name', pm.ProjectName 'project_name', em.EmployeeName 'requested_by', RequestedDate 'requested_date'
FROM
  materialmaster mm
  JOIN
componentmaster cm ON mm.refComponent = cm.Id
  JOIN
componenttypemaster ct ON mm.refComponentType = ct.Id
  JOIN 
specsmaster sm ON mm.refSpecs = sm.Id
  JOIN
itemmaster im ON mm.refItemType = im.Id
  JOIN
projectmaster pm ON mm.refProject = pm.Id
  JOIN
plantmaster pl ON pm.refPlant = pl.Id
  JOIN
employeemaster em ON mm.RequestedBy = em.Id
where refQuotation is null;`;
const reqList = await executeQuery(query);
res.status(200).send(reqList);

};

const addQuotation = async (req, res) => {

    const { materialArray, quotation_number, quotation_value, supplier_id, submitted_by } = req.body;
    if (
      !materialArray ||
      !quotation_number ||
      !quotation_value ||
      !supplier_id ||
      !submitted_by
    ) {
      res.status(400).json({ message: "Missing required fields." });
    }
    const materials = JSON.parse(materialArray);
    const materialInsertQuery = `UPDATE materialmaster SET refQuotation = CASE WHEN refQuotation IS NULL OR refQuotation = '' THEN ? ELSE CONCAT(refQuotation, ',', ?) END WHERE Id = ?;`;
    await Promise.all([
      materials.map(async (material) => {
        let params = [quotation_number, quotation_number, material];
        await executeQuery(materialInsertQuery, params);
      }),
    ]);
    const quotDetailsQuery = `INSERT INTO quotationmaster ( refMaterialArray, QuotationNumber, QuotationValue, refSupplier, QuotationSubmittedBy, SubmittedDate) VALUES (?,?,?,?,?, CURRENT_DATE)`;
    const quotationParams = [
      materialArray,
      quotation_number,
      quotation_value,
      supplier_id,
      submitted_by
    ];
    const response = await executeQuery(quotDetailsQuery,quotationParams);
    if(req.file?.path){
      const query = `UPDATE quotationmaster SET QuotationFile = ? WHERE Id = ${response.insertId}`;
      await savePdfToDatabaseC(req.file.path,query)
    }else{
      console.info("No file attached")
    }
    res.status(200).send("Quotation added successfully");
};

const getActiveQuotList = async (req, res) => {
  const query = `SELECT QM.Id 'quotation_id', QM.QuotationNumber 'quotation_number', QM.QuotationValue 'quotation_value', JSON_LENGTH(CAST(QM.refMaterialArray AS JSON)) AS no_of_materials, SM.Name 'supplier_name', CASE WHEN QM.HoDApprovalStatus = "P" THEN 'Pending' WHEN QM.HoDApprovalStatus = "Y" THEN "Forwarded to finance" END AS 'status' FROM quotationmaster QM join suppliermaster SM ON SM.Id = QM.refSupplier where QM.QuotStatus = "Active";`;
  const activeQuotList = await executeQuery(query);
  res.status(200).send(activeQuotList);
}
const getArchivedQuotList = async (req, res) => {
  const query = `SELECT QM.Id 'quotation_id', QM.QuotationNumber 'quotation_number', QM.QuotationValue 'quotation_value', JSON_LENGTH(CAST(QM.refMaterialArray AS JSON)) AS no_of_materials, SM.Name 'supplier_name' FROM quotationmaster QM join suppliermaster SM ON SM.Id = QM.refSupplier where QM.QuotStatus = "Archived";`;
  const ArchivedQuotList = await executeQuery(query);
  res.status(200).send(ArchivedQuotList);
}
const getApprovedQuotList = async (req, res) =>{
  const query = `SELECT QM.Id 'quotation_id', QM.QuotationNumber 'quotation_number', QM.QuotationValue 'quotation_value', JSON_LENGTH(CAST(QM.refMaterialArray AS JSON)) AS no_of_materials, SM.Name 'supplier_name' FROM quotationmaster QM join suppliermaster SM ON SM.Id = QM.refSupplier where QM.FinanceApprovalStatus = "Y";`;
  const approvedQuotList = await executeQuery(query);
  res.status(200).send(approvedQuotList);
}

const viewQuot = async (req, res) =>{
  const quotation_id = req.query.quotation_id;
  const quotationDetailsQuery = `SELECT QM.Id 'quotation_id', QM.QuotationNumber 'quotation_number', QM.QuotationValue 'quotation_value', SM.Name 'supplier_name', QM.refMaterialArray 'material_array'  FROM quotationmaster QM LEFT JOIN suppliermaster SM ON SM.Id = QM.refSupplier where QM.Id = ${quotation_id};`;
  const quotationDetails = await executeQuery(quotationDetailsQuery);
  const materialArray = quotationDetails[0].material_array.length>0 ? JSON.parse(quotationDetails[0].material_array) : [];
   const materialsPromises = materialArray.map(async (id) => {
      let query = `SELECT CM.ComponentName 'component_name', CTM.ComponentType 'component_type', SM.Specs 'specs', IM.ItemType 'item', PM.ProjectName 'project_name', date(MM.RequestedDate) 'requested_date', EM.EmployeeName 'requested_by' FROM materialmaster MM join componentmaster CM ON CM.Id = MM.refComponent JOIN componenttypemaster CTM ON CTM.Id = MM.refComponentType JOIN specsmaster SM ON SM.Id = MM.refSpecs JOIN projectmaster PM ON PM.Id = MM.refProject JOIN employeemaster EM ON EM.Id = MM.RequestedBy JOIN itemmaster IM ON IM.Id = MM.refItemType where MM.Id=${id}`;
      const materialResult = await executeQuery(query);
      return materialResult[0];
    });

    const materials = await Promise.all(materialsPromises);
  let response = {quot_details : quotationDetails, materials: materials}
  res.status(200).send(response);
}
const getQuotPdf= async (req, res)=>{
  const quotation_id = req.query.quotation_id;
  const query = `SELECT QM.QuotationFile FROM quotationmaster QM where QM.Id = ${quotation_id};`;
  const response = await executeQuery(query);
  if(response.length > 0 && response[0].QuotationFile != null){
  const pdfBuffer = response[0].QuotationFile;
  const contentType = findContentType(pdfBuffer);
  res.setHeader('Content-Type', contentType);
  res.status(200).send(pdfBuffer);
  }else{
    res.status(404).send("Invoice not found");
  }

}

const placeOrder = async(req, res)=>{
  const {quotation_id, invoice_number, supplier_id,submitted_by, invoice_value, delivery_date } = req.body;
  const addQuotationDetailQuery = `INSERT INTO invoicemaster (InvoiceNumber, InvoiveValue, DeliveryDate, refQuotation, refSupplier, refEmployee) values( ?,?,?,?,?,?);`
  const params = [invoice_number,invoice_value,delivery_date,quotation_id,supplier_id, submitted_by];
  
  const response = await executeQuery(addQuotationDetailQuery,params );

  if(req.file?.path){
    const path = req.file.path;
    const query = `UPDATE invoicemaster SET InvoiceFile = ? where Id = ${response.insertId}`
    savePdfToDatabaseC(path,query)
  }else{
    console.info("No file attached");
  }
  res.status(200).send("Order added successfuly!");
}

const getActiveOrderList = async (req, res)=>{
  const query = `SELECT IM.Id 'invoice_id', IM.InvoiceNumber 'invoice_number',DATE_FORMAT(IM.DeliveryDate, '%d-%m-%Y')  'expected_delivery_date', CASE WHEN IM.DeliveryStatus = 'Y' THEN 'Delivered' WHEN IM.DeliveryStatus = 'N' THEN 'Not delivered' END AS 'status',DATE_FORMAT(IM.ActualDeliveryDate, '%d-%m-%Y') 'actual_delivery_date', SM.Name 'supplier_name', EM.EmployeeName 'ordered_by' FROM invoicemaster IM LEFT JOIN quotationmaster QM ON QM.Id = IM.refQuotation LEFT JOIN suppliermaster SM ON SM.Id = IM.refSupplier LEFT JOIN employeemaster EM ON EM.Id = IM.refEmployee where DeliveryStatus = "N" ORDER BY IM.DeliveryDate ASC;`;
  const activeOrderList = await executeQuery(query);
  res.status(200).send(activeOrderList);
}

const getDeliveredOrderList = async (req, res)=>{
  const query = `SELECT IM.Id 'invoice_id', IM.InvoiceNumber 'invoice_number',DATE_FORMAT(IM.DeliveryDate, '%d-%m-%Y')  'expected_delivery_date', CASE WHEN IM.DeliveryStatus = 'Y' THEN 'Delivered' WHEN IM.DeliveryStatus = 'N' THEN 'Not delivered' END AS 'status',DATE_FORMAT(IM.ActualDeliveryDate, '%d-%m-%Y') 'actual_delivery_date', SM.Name 'supplier_name', EM.EmployeeName 'ordered_by' FROM invoicemaster IM LEFT JOIN quotationmaster QM ON QM.Id = IM.refQuotation LEFT JOIN suppliermaster SM ON SM.Id = IM.refSupplier LEFT JOIN employeemaster EM ON EM.Id = IM.refEmployee where DeliveryStatus = "Y" ORDER BY IM.DeliveryDate ASC;`;
  const deliveredOrderList = await executeQuery(query);
  res.status(200).send(deliveredOrderList);
}

const updateOrder = async (req, res)=>{
  const {status, actual_delivery_date, invoice_id} = req.body;
  const updateQuery = `UPDATE invoicemaster SET DeliveryStatus = '${status?status:null}', ActualDeliveryDate = ${actual_delivery_date?actual_delivery_date:null} WHERE Id = ${invoice_id};`;
  await executeQuery(updateQuery)
  if(req.file?.path){
    const path = req.file.path;
    const query = `UPDATE invoicemaster SET InvoiceFile = ? where Id = ${invoice_id}`
    savePdfToDatabaseC(path,query)
  }else{
    console.info("No file attached");
  }
  res.status(200).send("Order updated sucessfuly!");
}

const getInvoiceFile = async (req, res)=>{
  const invoice_id = req.query.invoice_id;
  const query = `SELECT IM.InvoiceFile FROM invoicemaster IM where IM.Id = ${invoice_id};`;
  const response = await executeQuery(query);
  if(response.length > 0 && response[0].InvoiceFile != null){
    const pdfBuffer = response[0].InvoiceFile;
    const contentType = findContentType(pdfBuffer);
    res.setHeader('Content-Type', contentType);
    res.status(200).send(pdfBuffer);
  }else{
    res.status(404).send("Invoice not found");
  }
  
}

const savePdfToDatabaseC = async (path, insertQuery)=>{
  try{
    const pdfBuffer = fs.readFileSync(path);
    const pdfBase64 = pdfBuffer.toString("base64");
    const params = [Buffer.from(pdfBase64, "base64")]
    await executeQuery(insertQuery,params);
    fs.unlinkSync(path);
  }catch(error){
    console.error("Error uploading pdf");
  }
  
}

function findContentType(buffer){
  const signature = buffer.toString('hex', 0, 8);
  if (signature.startsWith('89504e470d0a1a0a')) {
      return 'image/png';
  } else if (signature.startsWith('ffd8ff')) {
      return 'image/jpeg';
  } else if (signature.startsWith('25504446')) {
      return 'application/pdf';
  } else {
      return 'Unknown';
  }
}

module.exports = { getSupplier, addSupplier, editSupplier, getMaterialReq, addQuotation, getActiveQuotList, getArchivedQuotList, getApprovedQuotList, viewQuot, getQuotPdf, placeOrder, getActiveOrderList, getDeliveredOrderList, updateOrder, getInvoiceFile };
