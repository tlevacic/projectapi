const express=require("express");
const mongoose=require("mongoose");
const app = express();
require('dotenv/config');
const bodyParser=require("body-parser");
const cors=require("cors");
const jwt=require("jsonwebtoken");

//Middlewares-function which runs when route is hitted
app.use(bodyParser.json()); //If there is no route argument, then middleware whill always run
app.use(cors()); //that is to allow fetching data from another domain


//Import Routes
const userRoute=require('./routes/user');
const projectsRoute=require('./routes/project');



app.use('/api/user',userRoute)
app.use('/api/project',projectsRoute)

//ROUTES
app.get('/',(req,res) => {
    res.send("Home page")
})




//Connect to DB
mongoose.connect(
    process.env.DB_CONNECTION,
    {useNewUrlParser: true},
    console.log("Connected to DB"));


//Start listening to the server
app.listen(process.env.PORT || 2000);