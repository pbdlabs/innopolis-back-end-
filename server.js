const express = require("express");
const dotenv = require("dotenv").config();
const cors = require("cors");
const app = express();
const port = process.env.PORT;

app.use(express.json());
app.use(cors());

app.use("/api/login", require('./routes/loginRoutes'));
app.use('/api/user/create', require('./routes/adminRoutes'));
app.use('/api/user/delete', require('./routes/adminRoutes'));
app.use('/api/user/get',require('./routes/adminRoutes'));
app.use('/api/user/edit',require('./routes/adminRoutes'));

app.listen( port, ()=>{
    console.info(`Server running on port : ${port}`);
})

