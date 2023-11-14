const executeQuery = require('../config/db');

//@desc Insert user credential
//@routes POST /api/user/create
//@access PUBLIC

const createUser = async (req, res) =>{

    const {employee_name, employee_id, email_id, department, role, password} = req.body;
    try{
        const emCheckQuery = `select Id, EmployeeId from employeemaster where EmployeeId = ${employee_id};`
        const emCheckQueryRes = await executeQuery(emCheckQuery);
        if(emCheckQueryRes.length !== 0){
            return res.status(400).json({message: 'Employee_id already exist'});
        }
        const userpoolQuery = ('Insert into userpool (EmailId, Password) values (?,?);');
        const userpoolParams = [email_id,password];
        const employeeQuery = ('INSERT INTO employeemaster (EmployeeName, EmployeeId, refDepartment, refRole) VALUES (?,?,?,?);');
        const employeeParams = [employee_name, employee_id, department,role];
    
        const result  = await Promise.all([executeQuery(userpoolQuery,userpoolParams ), executeQuery(employeeQuery,employeeParams)]);
        const updateUserpoolQuery = 'UPDATE userpool SET refEmployeeMaster = ? WHERE Id = ?;';
        const updateUserpoolParams = [result[1].insertId, result[0].insertId];
        await executeQuery(updateUserpoolQuery, updateUserpoolParams);
        res.status(200).json({message: 'User created successfully'});
    }catch(e){
        console.error("erro:::",e)
        res.status(500).json({ message: 'Internal server error.' });
    }
    
}

//@desc delete user
//@routes PUT /api/user/delete
//@access PUBLIC

const deleteUser = async (req, res)=>{

    const {employee_id} = req.query;

    const userDeleteQuery =`UPDATE employeemaster SET isActive = false WHERE EmployeeId = ${employee_id};`;
    try{
        await  executeQuery(userDeleteQuery);
        res.status(200).json({message: 'User deleted successfully'});
    }catch(e){
        res.status(500).json({ message: 'Internal server error.' });
    }
    
}

const getUserList = async (req, res)=>{

    const getUserQuery = `SELECT EM.Id, EM.EmployeeName, EM.EmployeeId, DM.DepartmentName, RM.RoleName  FROM employeemaster as EM Join departmentmaster as DM ON EM.refDepartment = DM.Id join rolemaster as RM ON RM.Id = EM.refRole WHERE EM.isActive = true;`;
    
    try{
        const userList = await executeQuery(getUserQuery);
        res.status(200).json(userList);
    }catch(e){
        res.status(500).json({ message: 'Internal server error.' });
    }
}

 
const employeeEdit = async (req, res) => {
    const { id, employee_id, employee_name, email_id, department, role, admin_pass, employee_pass } = req.body;

    try {
        // Validation
        if (!id || !employee_id || !employee_name || !email_id || !department || !role) {
            return res.status(400).json({ message: "Missing required fields." });
        }

        const emCheckQuery =`select Id, EmployeeId from employeemaster where EmployeeId = ${employee_id};`
        const emCheckQueryRes = await executeQuery(emCheckQuery);
        console.info(emCheckQueryRes)
        // check employee_id already exist or not
        if((emCheckQueryRes.length === 1 && id === emCheckQueryRes[0].Id) || emCheckQueryRes.length === 0){
            console.info("No overlapping");
        }else{
            return res.status(200).json({ message: "Employee Id already exist." });
        }
        
        // Admin password validation
        if (admin_pass !== "" && admin_pass !== process.env.ADMIN_PASS) {
            return res.status(200).json({ message: "Admin password is not correct." });
        }

        // Employee update query
        const employeeUpdateQuery = "UPDATE employeemaster SET EmployeeName = ?, EmployeeId = ?, refDepartment = ?, refRole = ? WHERE Id = ?;";
        const employeeUpdateParams = [employee_name, employee_id, department, role, id];

        // User update query
        let userUpdateQuery, userUpdateParams;

        if (admin_pass === "") {
            userUpdateQuery = "UPDATE userpool SET EmailId = ? WHERE refEmployeeMaster = ?;";
            userUpdateParams = [email_id, id];
        } else {
            userUpdateQuery = "UPDATE userpool SET EmailId = ?, Password = ? WHERE refEmployeeMaster = ?;";
            userUpdateParams = [email_id, employee_pass, id];
        }

        // Execute queries
        await Promise.all([executeQuery(employeeUpdateQuery, employeeUpdateParams), executeQuery(userUpdateQuery, userUpdateParams)]);

        res.status(200).json({ message: 'Employee updated successfully.' });
    } catch (error) {
        console.error("Error in employeeEdit:", error);
        res.status(500).json({ message: 'Internal server error.' });
    }
};



module.exports = {createUser, deleteUser, employeeEdit, getUserList};