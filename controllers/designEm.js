const executeQuery = require('../config/db');


const getComponentType =async (req, res)=>{
    let query = "SELECT Id as type_id, ComponentType FROM componenttypemaster;";

    let componentTypeList = await executeQuery(query);

    res.status(200).json(componentTypeList);
}

const getItemType =async (req, res)=>{
    let id = req.body.type_id;
    let query = `SELECT Id as item_id, ItemType FROM itemmaster where refComponentType = ${id};`;

    let itemList = await executeQuery(query);

    res.status(200).json(itemList);
}

const getComponent =async (req, res)=>{
    let id = req.body.item_id;
    let query = `SELECT id as component_id, ComponentName FROM componentmaster where refItem = ${id};`;

    let itemList = await executeQuery(query);

    res.status(200).json(itemList);
}

const getSpecs =async (req, res)=>{
    let id = req.body.component_id;
    let query = `SELECT Id AS spec_id, Specs FROM specsmaster where refComponent = ${id};`;

    let specList = await executeQuery(query);

    res.status(200).json(specList);
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

    const { component_type, component_name, item, specs, project_id, user_id} = req.body;

    let query = "insert into materialmaster (refComponent, refComponentType, refSpecs, refItemType, refProject, RequestedBy) values(?,?,?,?,?,?);";
    let params = [component_name, component_type,specs, item, project_id, user_id]

    await executeQuery(query, params);

    res.status(200).json("Material request sent successfuly.");

}

module.exports = {getComponentType, getComponent, getItemType, getSpecs, getMaterialList, materialReq};