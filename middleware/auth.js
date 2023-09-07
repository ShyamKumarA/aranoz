const User = require('../models/userModel');


const isLogin=async(req,res,next)=>{
    const user=req.session.user_id;
    const userData=await User.findOne({_id:user})
    console.log(userData);
    if(req.session.user_id && !userData.is_blocked){
        next();
    }else{
        req.session.user_id=''
        res.redirect('/login')
    }
  
}


const isLogout=(req,res,next)=>{
    if(req.session.user_id){
        res.redirect('/')
    }
    next();
}

module.exports={
    isLogin,
    isLogout
}