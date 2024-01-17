
const executeQuery = require('../config/db');


const getClient = async(req, res) =>{

    let query = "SELECT CM.Id, CM.ClientName, CM.ClientAddress, CM.ContactPerson, CM.ContactEmail FROM clientmaster as CM;"

    let clientList = await executeQuery(query);

    res.status(200).json(clientList);

}

const addClient = async (req, res)=>{
    const {client_name, client_address, contact_person, contact_email} = req.body;

    if(!client_name || !client_address || !contact_person || !contact_email){
        res.status(400).json({ message: "Missing required fields." });
    }

    let query = "INSERT INTO clientmaster (ClientName, ClientAddress, ContactPerson, ContactEmail) values (?,?,?,?);"
    let params = [client_name, client_address, contact_person, contact_email];

    await executeQuery(query, params);

    res.status(200).json({Message: "Client added successfully."});

}

const editClient = async (req, res) =>{
    const {client_name, client_address, contact_person, contact_email, Id} = req.body;

    if(!client_name || !client_address || !contact_person || !contact_email || !Id){
        res.status(400).json({ message: "Missing required fields." });
    }

    let query = "UPDATE clientmaster SET ClientName = ?, ClientAddress = ?, ContactPerson = ? ,ContactEmail = ? WHERE Id = ?;"
    let params = [client_name, client_address, contact_person, contact_email, Id];

    await executeQuery(query, params);

    res.status(200).json({Message: "Client updated successfully."});

}

const getDesignEmployees = async (req, res)=>{
    
    let query = "SELECT Id, EmployeeName FROM employeemaster WHERE refDepartment = 1;"

    let designEmployeesList = await executeQuery(query);

    res.status(200).json(designEmployeesList);
}

const getPlantList = async (req, res) => {

    let query = "SELECT Id, PlantName FROM plantmaster;";

    let plantList = await executeQuery(query);

    res.status(200).json(plantList);
}

const createProject = async (req, res) =>{

    const {project_code, project_name, plant, project_lead, client } = req.body;

    if(!project_code || !project_name || !plant || !project_lead || !client){
        res.status(400).json({ message: "Missing required fields." });
    }

    let query = "INSERT INTO projectmaster (ProjectNumber, ProjectName, refPlant, refProjectLead, refClient) VALUES (?, ?, ?, ?, ?);";
    let params = [project_code, project_name, plant, project_lead, client];

    await executeQuery(query, params);

    res.status(200).json({Message: "Project created successfully."});
    
}

const getProjects = async(req, res) =>{

    let query = `select pm.Id "project_id", pm.ProjectName "project_name", pm.ProjectNumber "project_code", plm.PlantName "plant_name", em.EmployeeName "project_lead", em.Id "project_lead_id", cm.ClientName "client_name", cm.Id "client_id", pm.status "status", pm.DateCreated "date_created" from projectmaster pm join employeemaster em on em.Id = pm.refProjectLead join clientmaster cm on cm.Id = pm.refClient join plantmaster plm on plm.Id = pm.refPlant;`;
    let projectList = await executeQuery(query);
    
    res.status(200).json(projectList);
}

const editProject = async(req, res)=>{
    const {project_code, project_name, plant, project_lead, client, project_id, status } = req.body;

    if(!project_code || !project_name || !plant || !project_lead || !client || !project_id || !status){
        res.status(400).json({ message: "Missing required fields." });
    }

    let query = `UPDATE projectmaster SET ProjectNumber = ?, ProjectName = ?, refProjectLead= ?, refClient = ?, refPlant = ?, status = ?  where Id = ?;`;
    let params = [project_code, project_name,project_lead,client, plant, status, project_id];

    await executeQuery(query, params);
    res.status(200).json({Message: "Project updated successfully."});
}

const getMaterialReq = async (req, res) =>{

    let query = `SELECT 
                    mm.Id AS 'req_id',
                    cm.ComponentName,
                    ct.ComponentType,
                    sm.Specs,
                    im.ItemType,
                    pm.ProjectNumber,
                    pl.PlantName,
                    pm.ProjectName,
                    em.EmployeeName,
                    RequestedDate,
                    CASE WHEN mm.Status = 'Y' THEN 'Approved' WHEN mm.Status = 'N' THEN 'Rejected' WHEN mm.Status = 'P' THEN 'Pending' END AS 'Status'
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
                	employeemaster em ON mm.RequestedBy = em.Id;`;

    let materialReqList = await executeQuery(query);

    res.status(200).json(materialReqList);

} 

const approveMaterialReq = async (req, res) =>{

    const {status, Id} = req.body;

    if(!status || !Id){
        res.status(400).json({ message: "Missing required fields." });
    }

    let query = "UPDATE materialmaster set Status = ? , hodApprovedDate = CURRENT_TIMESTAMP where Id = ?;";
    let params = [status, Id]

    await executeQuery(query, params);

    let response = status === "Y" ? "Material request approved" : "Material request declined";

    res.status(200).json({Message : response});
}

module.exports = {getClient, getDesignEmployees, getPlantList, createProject, getProjects, editProject, getMaterialReq, addClient, editClient, approveMaterialReq}