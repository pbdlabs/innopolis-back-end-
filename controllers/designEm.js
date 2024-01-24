const executeQuery = require('../config/db');


const getComponentType =async (req, res)=>{
    let query = "SELECT Id as type_id, ComponentType FROM componenttypemaster;";

    let componentTypeList = await executeQuery(query);

    res.status(200).json(componentTypeList);
}

const addComponentType = async (req, res) =>{

    const component_type = req.body.component_type;

    if(!component_type){
        res.status(400).json({ message: "Missing required fields." });
    }
    let query = `INSERT INTO componenttypemaster (ComponentType) values (${component_type});`;

    await executeQuery(query);

    res.status(200).json({ message : "Added new component type"});

}

const getItemType =async (req, res)=>{
    let id = req.query.type_id;
    let query = `SELECT Id as item_id, ItemType FROM itemmaster where refComponentType = ${id};`;

    let itemList = await executeQuery(query);

    res.status(200).json(itemList);
}

const addItemType = async (req, res) => {
    const {type_id, item} = req.body;

    if(!type_id || !item){
        res.status(400).json({ message: "Missing required fields." });
    }
    const query = "insert into itemmaster (ItemType, refComponentType) values (?, ?);";
    const params = [item, type_id];

    await executeQuery(query, params);
    res.status(200).json({ message : "Added new item"});

}

const getComponent =async (req, res)=>{
    let id = req.query.item_id;
    if(!id){
        res.status(400).json({ message: "Missing required fields." });
    }
    let query = `SELECT id as component_id, ComponentName FROM componentmaster where refItem = ${id};`;

    let itemList = await executeQuery(query);

    res.status(200).json(itemList);
}

const addComponent = async(req, res) =>{
    const {item_id, component_name} = req.body;

    if(!item_id || !component_name){
        res.status(400).json({ message: "Missing required fields." });
    }
    let query = "insert into componentmaster (ComponentName, refItem) values (?, ?);";
    let params = [component_name, item_id];

    await executeQuery(query, params);

    res.status(200).json({ message : "Added new component"});
}

const getSpecs =async (req, res)=>{
    let id = req.query.component_id;
    let query = `SELECT Id AS spec_id, Specs FROM specsmaster where refComponent = ${id};`;

    let specList = await executeQuery(query);

    res.status(200).json(specList);
}

const addSpecs = async (req, res)=>{
    const {component_id, specs} = req.body;

    if(!component_id || !specs){
        res.status(400).json({ message: "Missing required fields." });
    }

    let query = "insert into specsmaster (Specs, refComponent) values (?,?);";
    let params = [specs, component_id];
    await executeQuery(query, params);
    res.status(200).json({ message : "Added new specs"});
}

const getProjects = async(req, res) =>{

    let query = `select pm.Id "project_id", pm.ProjectName "project_name", pm.ProjectNumber "project_code", ssm.SubSystem "sub_system", plm.PlantName "plant_name", em.EmployeeName "project_lead", cm.ClientName "client_name", pm.status "status", pm.DateCreated "date_created" from projectmaster pm LEFT join employeemaster em on em.Id = pm.refProjectLead join clientmaster cm on cm.Id = pm.refClient join subsystemmaster ssm on ssm.Id = pm.refSubSystem join plantmaster plm on plm.Id = ssm.refPlant where pm.status = 'Active';`;
    let projectList = await executeQuery(query);
    //project_id, project_name, project_code, sub_system, plant_name, project_lead, client_name, status, date_created
    res.status(200).json(projectList);
}

const getMaterialList= async (req, res)=>{
    let query = `SELECT 
                    ct.ComponentType AS 'Component type',
                    COALESCE(im.ItemType, 'N/A') AS 'Item',
                    COALESCE(cm.ComponentName, 'N/A') AS 'Component name',
                    COALESCE(sm.Specs, 'N/A') AS 'Spec list'
                FROM 
                    componenttypemaster ct
                LEFT JOIN 
                    itemmaster im ON ct.Id = im.RefComponentType
                LEFT JOIN 
                    componentmaster cm ON im.Id = cm.RefItem
                LEFT JOIN 
                    specsmaster sm ON cm.Id = sm.RefComponent;`
    let materialList = await executeQuery(query);
    res.status(200).json(materialList);
}

const materialReq = async(req, res) =>{

    const { type_id, component_id, item_id, spec_id, project_id, user_id} = req.body;

    let query = "insert into materialmaster (refComponent, refComponentType, refSpecs, refItemType, refProject, RequestedBy) values(?,?,?,?,?,?);";
    let params = [component_id, type_id,spec_id, item_id, project_id, user_id]

    await executeQuery(query, params);

    res.status(200).json("Material request sent successfuly.");

}

const getSubmittedMaterials = async (req, res)=>{
    const subsystem = req.query.sub_system;

    let query = `SELECT 
                    mm.Id 'material_id',
                    JSON_OBJECT(mm.refComponent, cm.ComponentName) AS component,
                    JSON_OBJECT(mm.refComponentType, ctm.ComponentType) AS component_type,
                    JSON_OBJECT(mm.refSpecs, sm.Specs) AS specs,
                    JSON_OBJECT(mm.refItemType, im.ItemType) AS item,
                    JSON_OBJECT('tag_id', mm.TagId) AS 'tag_id'
                FROM
                    materialmaster mm
                        JOIN
                    componentmaster cm ON cm.Id = mm.refComponent
                        JOIN
                    componenttypemaster ctm ON ctm.Id = mm.refComponentType
                        JOIN
                    specsmaster sm ON sm.Id = mm.refSpecs
                        JOIN
                    itemmaster im ON im.Id = mm.refItemType
                WHERE
                    refSubSystem = ${subsystem} AND isForwarded = 0;`;
    
    const submittedMaterials = await executeQuery(query);
    res.status(200).json(submittedMaterials);

}

const submitMaterialReq = async (req, res)=>{
    const materialArray = req.body.materialArray;
    let query = "insert into materialmaster (refSubsystem, TagId, refComponent, refComponentType, refSpecs, refItemType, RequestedBy, isForwarded) values(?,?,?,?,?,?,?,?);"
    await Promise.all(materialArray.map(async(item)=>{
        let params = [item.sub_system, item.tag_id, item.component, item.component_type, item.specs, item.item, item.user_id, 0]
        await executeQuery(query,params)
    }))
    res.status(200).json("Material submitted successfuly.");
}

const forwardMaterialReq = async (req, res) => {
    const materialList = req.body.materialList;
    let query = "update materialmaster set isForwarded = 1 where Id = ?;"
    await Promise.all(materialList.map(async(item)=>{
        let params = [item]
        await executeQuery(query,params)
    }))
    res.status(200).json("Material request submitted successfuly.");
}

const materialReqStatus = async (req, res) => {
    let query = `SELECT 
    PM.ProjectNumber 'project_code',
    PM.ProjectName 'project_name',
    CTM.ComponentType 'component_type',
    CM.ComponentName 'component_name',
    SM.Specs 'specs',
    IM.ItemType 'item',
    CASE
        WHEN IVM.Id IS NULL THEN 'No Information'
        WHEN
            IVM.DeliveryDate IS NOT NULL
        THEN
            CASE
                WHEN
                    DATEDIFF(CURDATE(), IVM.DeliveryDate) >= 0
                THEN
                    CONCAT(DATEDIFF(CURDATE(), IVM.DeliveryDate),
                            ' days')
                ELSE 'Delivery Date Passed'
            END
    END AS 'lead_time',
    CASE
        WHEN MM.Status = 'Y' THEN 'Approved'
        WHEN MM.Status = 'N' THEN 'Rejected'
        WHEN MM.Status = 'P' THEN 'Pending'
    END AS status
FROM
    materialmaster MM
        JOIN
    componenttypemaster CTM ON CTM.Id = MM.refComponentType
        JOIN
    componentmaster CM ON CM.Id = MM.refComponent
        JOIN
    specsmaster SM ON SM.Id = MM.refSpecs
        JOIN
    itemmaster IM ON IM.Id = MM.refItemType
        JOIN
    projectmaster PM ON PM.Id = MM.refProject
        LEFT JOIN
    invoicemaster IVM ON IVM.Id = MM.refInvoice;`
    let response = await executeQuery(query);
    res.status(200).json(response);
}

const getAllComponentType = async (req, res) =>{
    let query = `SELECT CTM.Id 'type_id', CTM.ComponentType 'component_type' FROM componenttypemaster CTM;`;
    let allComponentType = await executeQuery(query)
    res.status(200).json(allComponentType);
}

const getAllItem = async(req, res) =>{
    let query = `SELECT IM.Id 'item_id', IM.ItemType 'item' FROM itemmaster IM;`;
    let allItem = await executeQuery(query);
    res.status(200).json(allItem);
}

const getAllComponent = async (req, res) => {
    let query = `SELECT CM.Id 'component_id', CM.ComponentName 'component_name' FROM componentmaster CM;`;
    let allComponent = await executeQuery(query)
    res.status(200).json(allComponent);
}

module.exports = {getComponentType,addComponentType, getComponent,addComponent, addItemType, getItemType, getSpecs,addSpecs,getProjects, getMaterialList, materialReq, materialReqStatus, getAllComponentType, getAllItem, getAllComponent, getSubmittedMaterials, submitMaterialReq, forwardMaterialReq};