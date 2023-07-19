const userModel=require('../models/userModel')
// const Product = require("../models/productModel");



const getLogin=(req,res)=>{
    try{
        res.render("admin/adminLogin",{message:undefined})

    }catch(error){
        console.log(error);

    }
}

const postLogin=(req,res)=>{
    try{

        const adminEmail="admin@gmail.com";
        const adminPassword=12345678;

        if(req.body.email==adminEmail && req.body.password==adminPassword){
            req.session.login=true;
            res.redirect('/admin/')
        }else{
            res.render('admin/adminLogin',{message:"Invalid credencials"})
        }

    }catch(error){
        console.log(error);
    }
}


const getAdminHome=(req,res)=>{
    try{

        res.render("admin/adminHome");

    }catch(error){
        console.log(error);

    }

}

const getUserManagement=async(req,res)=>{
    try{
        if(req.session.login){
        const user=await userModel.find();
        res.render('admin/userManagement',{user})
        }else{
            res.redirect('/admin/')
        }

    }catch(error){
        console.log(error.message);
    }
}

const getBlockUnblock=async(req,res)=>{

    try{
        
        const user=await userModel.findById(req.query.id);
        //console.log(user);
        if(user.is_blocked){
            await userModel.findByIdAndUpdate(req.query.id,{is_blocked:false})
        }else{
            await userModel.findByIdAndUpdate(req.query.id,{is_blocked:true})
        }
        res.redirect('/admin/user_management');
    }catch(error){
        console.log(error.message);
    }

}




const getLogout=(req,res)=>{
    try{

        req.session.destroy();
        res.redirect("/admin/login")

    }catch(error){

        console.log(error);

    }

}


module.exports={
    getAdminHome,
    getLogin,
    postLogin,
    getLogout,
    getUserManagement,
    getBlockUnblock
}