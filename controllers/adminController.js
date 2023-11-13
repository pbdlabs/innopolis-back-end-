const executeQuery = require('../config/db');

//@desc Insert user credential
//@routes POST /api/user/create
//@access PUBLIC

const createUser = async (req, res) =>{
    const {employee_name, employee_id, email_id, department, role, password} = req.body;
    const userpoolQuery = ('Insert into userpool (UserName, Password) values (?,?);');
    const userpoolParams = [email_id,password];
    const employeeQuery = ('INSERT INTO employeemaster (EmployeeName, EmployeeId, refDepartment, refRole) VALUES (?,?,?,?);');
    const employeeParams = [employee_name, employee_id, department,role];
    try{
        await Promise.all([executeQuery(userpoolQuery,userpoolParams ), executeQuery(employeeQuery,employeeParams)]);
        res.status(200).json({message: 'User created successfully'});
    }catch(e){
        res.status(400).json({message: 'Query executing failed.'});
    }
    
}

//@desc delete user
//@routes PUT /api/user/delete
//@access PUBLIC

const deleteUser = async (req, res)=>{
    const {employee_id} = req.query;
    const userDeleteQuery =`UPDATE employeemaster SET isActive = false WHERE EmployeeId = ${employee_id};`;
    await  executeQuery(userDeleteQuery);
    res.status(200).json({message: 'User deleted successfully'});
}

const getUserList = async (req, res)=>{
    const getUserQuery = `SELECT EM.Id, EM.EmployeeName, EM.EmployeeId, DM.DepartmentName, RM.RoleName  FROM employeemaster as EM Join departmentmaster as DM ON EM.refDepartment = DM.Id join rolemaster as RM ON RM.Id = EM.refRole WHERE EM.isActive = true;`;
    const userList = await executeQuery(getUserQuery);
    res.status(200).json(userList);
}

 
const employeeEdit =(req, res)=>{
    //req : employee_id, employee_name, employee_email, employee_password, employee_new_pass, dept, role
    const {employee_id, employee_name, email_id, department, role, admin_pass, employee_pass} = req.body;



}
module.exports = {createUser, deleteUser, employeeEdit, getUserList};