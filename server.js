const express = require("express");
const dotenv = require("dotenv").config();
const cors = require("cors");
const app = express();
const port = process.env.PORT;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

app.use("/api/login", require('./routes/loginRoutes'));
app.use('/user/create', require('./routes/adminRoutes'));
app.use('/user/delete', require('./routes/adminRoutes'));
app.use('/user/get',require('./routes/adminRoutes'));
app.use('/user/edit',require('./routes/adminRoutes'));
app.use('/designem', require('./routes/designEm'));
app.use('/designhd', require('./routes/designHod'));
app.use('/purchaseem', require('./routes/purchaseEm'))
 
app.listen( port, ()=>{
    console.info(`Server running on port : ${port}`);
})

