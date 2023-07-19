const express = require('express');
const user_route=express();
const bodyparser = require('body-parser');
const multer = require('multer');
const session = require('express-session');
const auth=require("../middleware/auth")

// const config=require('../config/config')


user_route.use(session({
    secret:"shyam",
    saveUninitialized:true,
    resave:true
}))

user_route.set('view engine','ejs')
user_route.set('views','./views/users')
user_route.use(bodyparser.json())
user_route.use(bodyparser.urlencoded({extended:true}))


const userController= require("../controllers/userControler");
//const { config } = require('dotenv');

// user_route.get('/login',auth.isLogout,userController.loadLogin)
user_route.get('/',userController.loadHome)
user_route.get('/login',auth.isLogout,userController.loadLogin)
user_route.get('/register',userController.loadRegister)
user_route.get('/logout',auth.isLogout,userController.loadLogout)
user_route.get('/single_product',  userController.loadSingleProduct);

user_route.post('/register',userController.insertUser)
user_route.post('/verify',userController.verifyMail)
user_route.post('/sendMail',userController.sendMail)
user_route.post('/login',userController.verifyUser)


module.exports=user_route
