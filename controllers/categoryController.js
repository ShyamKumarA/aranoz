const Category = require("../models/categoryModel");
// const us=require('upper-case');

const getListCategory=async(req,res)=>{
    try{
       if(req.session.login){

        const data=await Category.find();
        console.log(data);
        res.render("admin/category",{data});
      }else{
            console.log('/admin');
        }
    }catch(error){  
        console.log(error.message);
    }

}

const getAddCategory=(req,res)=>{
    try{
        if(req.session.login){
            res.render('admin/addCategory')
        }else{
            res.redirect('/admin')
        }
    }catch(error){
        console.log(error.message);
    }
}
const getBlockUnblock=async(req,res)=>{
    try{
        const user=await Category.findById(req.query.id)
        if(user.is_blocked){
            await Category.findByIdAndUpdate(req.query.id,{is_blocked:false})
        } else{
            await Category.findByIdAndUpdate(req.query.id,{is_blocked:true})
        }
        res.redirect('/admin/listCategory')
    }catch(error){
        console.log(error);
    }
}
const postAddCategory=async(req,res)=>{
    try{
        const Name=req.body.name;
        const data=await Category.findOne({
            categoryName:{$regex:Name,$options:'i'}
        })
        if(data){
            res.render("admin/addCategory",{message:'Category is already defined'})
        }else{
            const data1=await new Category({
                categoryName:Name
            })
            const result=await data1.save();
            console.log(result);
            if(result){
                res.redirect('/admin/listCategory')
            }else{
                res.render('admin/addCategory',{message:"Error while adding to then database"})
            }
        }
    }catch(error){
        console.log(error.message);
    }
}

module.exports={
    getListCategory,
    getAddCategory,
    postAddCategory,
    getBlockUnblock
}