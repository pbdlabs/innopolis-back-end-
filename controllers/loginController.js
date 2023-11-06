//@desc Check user credential
//@routes GET /api/login
//@access PUBLIC

const getLogin = (req, res) =>{
    const { username , password}  = req.body;
    if( !username, !password){
        res.status(400);
        res.json({message: "all fields are mandatory"})
    }
    res.status(200).json({message : "Login successfull"});
}

module.exports = {getLogin}