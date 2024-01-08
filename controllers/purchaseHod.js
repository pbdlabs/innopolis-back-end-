const executeQuery = require("../config/db");

const getActiveQuotationReq = async (req, res)=>{
    const query = `SELECT QM.Id 'QuotationId', QM.QuotationNumber, QM.QuotationValue, JSON_LENGTH(CAST(QM.refMaterialArray AS JSON)) AS NumberOfMaterials, SM.Name 'SupplierName', EM.EmployeeName 'SubmittedBy', QM.SubmittedDate FROM quotationmaster QM left join suppliermaster SM ON SM.Id = QM.refSupplier left JOIN employeemaster EM on EM.Id = QM.QuotationSubmittedBy where QM.QuotStatus = 'Active';`;
    const activeQuotationList = await executeQuery(query);
    res.status(200).send(activeQuotationList);
}
const getApprovedQuotList = async (req, res)=>{
    const query = `SELECT QM.Id 'QuotationId', QM.QuotationNumber, QM.QuotationValue, JSON_LENGTH(CAST(QM.refMaterialArray AS JSON)) AS NumberOfMaterials, SM.Name 'SupplierName', EM.EmployeeName 'SubmittedBy', QM.SubmittedDate FROM quotationmaster QM left join suppliermaster SM ON SM.Id = QM.refSupplier left JOIN employeemaster EM on EM.Id = QM.QuotationSubmittedBy where QM.FinanceApprovalStatus = 'Y' AND QM.QuotStatus = 'Active';`;
    const approvedQuotList = await executeQuery(query);
    res.status(200).send(approvedQuotList);
}
const getArchivedQuotList = async (req, res)=>{
    const query = `SELECT QM.Id 'QuotationId', QM.QuotationNumber, QM.QuotationValue, JSON_LENGTH(CAST(QM.refMaterialArray AS JSON)) AS NumberOfMaterials, SM.Name 'SupplierName', EM.EmployeeName 'SubmittedBy', QM.SubmittedDate FROM quotationmaster QM left join suppliermaster SM ON SM.Id = QM.refSupplier left JOIN employeemaster EM on EM.Id = QM.QuotationSubmittedBy where QM.QuotStatus = 'Archive';`;
    const archivedQuotList = await executeQuery(query);
    res.status(200).send(archivedQuotList);
}

const approveOrDeclineQuotation = async (req, res)=>{
    const {QuotationId, action} = req.body;
    if (action=='Y'){
        const materialQuery = `SELECT refMaterialArray FROM quotationmaster where Id = ${QuotationId};`
        const materialArray = await executeQuery(materialQuery);
        const archiveQuery = `update quotationmaster set QuotStatus = 'Archive' where refMaterialArray = ${materialArray} and Id != ${QuotationId};`;
        const approveQuery = `update quotationmaster set HoDApprovalStatus = 'Y' where Id = ${QuotationId};`;
        await Promise.all([executeQuery(archiveQuery),executeQuery(approveQuery)]);
        res.status(200).send('Approved quotation');
    }else{
        const declineQuery = `update quotationmaster set HoDApprovalStatus = 'N' where Id = ${QuotationId};`;
        await executeQuery(declineQuery);
        res.status(200).send('Declined quotation');
    }
    
}
module.exports= {getActiveQuotationReq, approveOrDeclineQuotation, getApprovedQuotList, getArchivedQuotList}
