require('dotenv').config()
const mongoose = require('mongoose');
//const path = require('path');
const nocache = require('nocache');
const session = require("express-session");
const bodyparser = require("body-parser");







require('./config /config')
const express = require('express');
const app = express();
const PORT=process.env.PORT||4000
app.use(nocache());



app.use(express.static('public'));
app.use(express.static('public/admin'));


app.use(bodyparser.json());
app.use(bodyparser.urlencoded({ extended: true }));

app.use(
    session({
      secret: "shyam",
      saveUninitialized: true,
      resave: true,
    })
  );
  





//for user route

const adminRoute = require('./routes/adminRoute')
app.use('/admin', adminRoute)

const userRoute = require('./routes/userRoute')
app.use('/', userRoute);




app.listen(PORT, () => {
    console.log('server is running...');
});