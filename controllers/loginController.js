const executeQuery = require('../config/db')

//@desc Check user credential
//@routes GET /api/login
//@access PUBLIC

const getLogin = async (req, res) =>{
    const { email_id , password}  = req.body;
    if( !email_id, !password){
        return res.json({message: "all fields are mandatory"})
    }
    try{
        let query = `SELECT EM.EmployeeId, EM.EmployeeName, U.EmailId, DM.DepartmentName, RM.RoleName FROM userpool AS U JOIN employeemaster AS EM ON EM.Id = U.refEmployeeMaster JOIN departmentmaster AS DM ON DM.Id = EM.refDepartment JOIN rolemaster AS RM ON RM.Id = EM.refRole WHERE U.EmailId = ? AND U.password =?;`;
        let params = [email_id, password];
        let result = await executeQuery(query, params);
        console.info(result)
        if(result.length > 0){
            res.status(200).json({message : "Login successfull",employee_id: result[0].EmployeeId, name:result[0].EmployeeName, email: result[0].EmailId,  role : result[0].RoleName, department: result[0].DepartmentName, })
        }else{
            res.status(404).json({message: 'User Not Found!'})
        }
    }catch(e){
        res.status(500).json({ message: 'Internal server error.' });
    }
    
}

module.exports = {getLogin}