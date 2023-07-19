const User=require('../models/userModel')
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const otpModel = require('../models/otpModel');
const Product=require('../models/productModel')


const loadRegister=async(req,res)=>{
    try{

        res.render('registration',{customer:''})
}

    catch(error){
        console.log(error.message);
    }
}
const loadHome=async(req,res)=>{
    try{
        const products=await Product.find({status:true})
        //console.log(req.session.user_id);
        if(req.session.user_id){
            let customer=true;
            
            res.render('index',{customer,products})
        }else{
            let customer=false;
            res.render('index',{customer,products})
        }
        
    }catch(error){
        console.log(error.message);
    }
}

const loadLogout = (req,res)=>{
    try{
        req.session.destroy();
        res.redirect('/login');
    }catch(error){
        console.log(error.message);
    }
}


const loadLogin=async(req,res)=>{
    try{
        if(req.session.user_id){
          
            res.redirect('/')
        }else{
            let customer=false
        res.render('login',{customer,message:''})
        }
    }
    catch(error){
        console.log(error.message);
    }
}

const securePassword=async(password)=>{

    try{

        const passwordHash=bcrypt.hash(password,10)
        return passwordHash;

    }catch(error){
        console.log(error.message);
    }

}

//for send OTP mail

function generateOTP() {
    var min = 1000;
    var max = 9999;
    var otp = Math.floor(Math.random() * (max - min + 1)) + min;
    return otp;
}
let otp;
let tempMail;

const sendMail=async(name,email,user_id)=>{

    otp=generateOTP();

      const transporter=  nodemailer.createTransport({
            host:'smtp.gmail.com',
            port:587,
            secure:false,
            requireTLS:true,
            auth:{
                user:'shyamkumarbeypore@gmail.com',
                pass:'texajepzeeoxsyjv'
            }
        })
        const mailOptions={
            from:'shyamkumarbeypore@gmail.com',
            to:email,
            subject:'For verification mail',
            html:'<p>Hii'+name+' ,please enter '+otp+' for verification</p>'

        }
        transporter.sendMail(mailOptions,(error,info)=>{
            if(error){
                console.log(error);
            }else{
                console.log(otp);
                console.log("Email has been sent:-",info.response);
            }
        })

        const otpToSave=new otpModel({
            email:email,
            otp:otp
        })
        let saveOtp=await otpToSave.save()
}



// const loadOtp=async(req,res)=>{
//     try{
//         res.render('otpPage')
//     }catch(error){

//         console.log(error.message);

//     }
// }

const insertUser=async(req,res)=>{
    try{
        const spassword=await securePassword(req.body.password);
        const user=new User({
            username:req.body.username,
            email:req.body.email,
            mobile:req.body.mobile,
            password:spassword,
            is_admin:0,

        })
        let userData;
        const checkEmail=await User.findOne({email:req.body.email});
        if(checkEmail){
            res.render('registration',{message:"This email is already exist",customer:''})
        }else{
            userData=await user.save();
        }

        tempMail=userData.email;
        // if(user.password===user.confirm_password){
            
        // }else{
        //     res.render('registration',{checkmessage:"Password not Matching"})
        // }


        

        if(userData){
            if(userData.is_verified==0){
               //let otp
                sendMail(req.body.name,req.body.email,user._id)
                res.render('otpPage',{customer:''})
            }else{
                res.render('registration',{message:"Your registration has been successfully"})
            }
            
            }else{
            res.render('registration',{checkmessage:"Your registration has been failed"})
        
        }

    }catch(error){
        console.log(error.message);
    }
}

const verifyMail=async(req,res)=>{
    try{
        //console.log(otp);

        let otpRecieved=req.body.otp;
        let otpDb=await otpModel.findOne({email:tempMail})
        if(otpRecieved==otpDb.otp){
            let id=otpDb._id
            const updateInfo= await User.updateOne({email:tempMail},{$set:{is_verified:1}})
            console.log(updateInfo);
            await otpModel.findByIdAndRemove(id)
            res.redirect('/login');
        }else{
            res.render('otpPage',{message:"Wrong OTP",customer:''})
        }
      

    }catch(error){
        console.log(error.message);
    }
}

const verifyUser=async (req,res)=>{
    try{
        
        const email=req.body.name;
        const password=req.body.password;
        
        const userData=await User.findOne({email:email})
        
        if(userData){
            if(userData.is_verified==1){
                if(userData){
                    const passwordMatch=await bcrypt.compare(password,userData.password)
                    if(passwordMatch){
                       
                        if(userData.is_blocked==false){
                            req.session.user_id=userData._id
                            res.redirect('/')
                        }else{
                            res.render('login',{message:"This user has been blocked",customer:''})
                
                        }

                    }else{
                        res.render('login',{message:"Incorrect email and password",customer:''})
                
                    }
                }else{
                    res.render('login',{message:"Incorrect email and password",customer:''})
                }

            }else{
                otp=''
                tempMail=email;
                sendMail(userData.name,userData.email,userData._id);
                res.render('otpPage')
            }
        }else{
            res.render('login',{message:"User not exist",customer:''})
        }   

    }catch(error){
        console.log(error.message);
    }
}

const loadSingleProduct=async(req,res)=>{
    try {
        
        const id=req.query.id;
    const products=await Product.find({_id:id});
    if(products){
        console.log(products);
        res.render('singleProduct',{products,customer:''})
    }

    } catch (error) {
        console.log(error);
    }
    
}

module.exports={
    loadRegister,
    loadHome,
    loadLogin,
    insertUser,
    sendMail,
    verifyMail,
    verifyUser,
    loadLogout,
    loadSingleProduct

}