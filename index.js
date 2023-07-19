const mongoose = require('mongoose');
//const path = require('path');
mongoose.connect("mongodb://127.0.0.1:27017/aranoz");
const nocache = require('nocache');



const express = require('express');
const app=express();

app.use(nocache());


app.use(express.static('public'));
app.use(express.static('public/admin'));





//for user route


const userRoute=require('./routes/userRoute')
app.use('/',userRoute);

const adminRoute=require('./routes/adminRoute')
app.use('/admin',adminRoute)


app.listen(3000,()=>{
    console.log('server is running...');
});