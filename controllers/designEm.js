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
    let params = [item_id,component_name];

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

    let query = `select pm.Id "project_id", pm.ProjectName "project_name", pm.ProjectNumber "project_code", plm.PlantName "plant_name", em.EmployeeName "project_lead", cm.ClientName "client_name", pm.status "status", pm.DateCreated "date_created" from projectmaster pm join employeemaster em on em.Id = pm.refProjectLead join clientmaster cm on cm.Id = pm.refClient join plantmaster plm on plm.Id = pm.refPlant where pm.status = 'Active';`;
    let projectList = await executeQuery(query);
    
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

module.exports = {getComponentType,addComponentType, getComponent,addComponent, addItemType, getItemType, getSpecs,addSpecs,getProjects, getMaterialList, materialReq};