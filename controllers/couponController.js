const Coupon=require('../models/couponModel')



const listCoupon=async(req,res)=>{
    try{
        const couponData=await Coupon.find();
        res.render("admin/listCoupon",{couponData})

    }catch(error){
        console.log(error);
    }
}

const getAddCoupon=async(req,res)=>{
    try{
        res.render("admin/addCoupon")
    }catch(error){
        console.log(error);
    }
}


const postAddCoupon = async(req,res)=>{
    try{
        const coupon = new Coupon({
            code:req.body.code,
            discountType:req.body.discountType,
            expiryDate:req.body.date,
            discountAmount:req.body.amount,
            maxCartAmount:req.body.cartAmount,
            maxDiscountAmount:req.body.discountAmount,
            maxUsers:req.body.couponCount
        })
        const couponData = await coupon.save();
        if(couponData){
            res.redirect('/admin/listCoupon')
        }else{
            res.redirect('/admin/listCoupon')
        }
    }catch(error){
        console.log(error.message);
    }
}


const applyCoupon = async(req,res)=>{
    try{
        const code = req.body.code;
        const amount = Number(req.body.amount);
        const userExist = await Coupon.findOne({code:code,user:{$in:[req.session.user_id]}});
        if(userExist){
            res.json({user:true});
        }else{
            const couponData = await Coupon.findOne({code:code});
            if(couponData){
                if(couponData.maxUsers<=0){
                    res.json({limit:true});
                }else{
                    if(couponData.status == false){
                        res.json({status:true})
                    }else{
                        if(couponData.expiryDate<=new Date()){
                            res.json({date:true});
                        }else{
                            if(couponData.maxCartAmount >= amount){
                                res.json({cartAmount:true});
                            }else{
                                // await Coupon.findByIdAndUpdate({_id:couponData._id},{$push:{user:req.session.user_id}});
                                // await Coupon.findByIdAndUpdate({_id:couponData._id},{$inc:{maxUsers:-1}});
                                if(couponData.discountType == "Fixed"){
                                    const disAmount = couponData.discountAmount;
                                    const disTotal = amount - disAmount;
                                    
                                    return res.json({amountOkey:true,disAmount,disTotal});
                                }else if(couponData.discountType == "Percentage Type"){
                                    const perAmount = (amount * couponData.discountAmount)/100;
                                    if(perAmount <= maxDiscountAmount){
                                        const disAmount = perAmount;
                                        const disTotal = Math.round(amount-disAmount);
                                        

                                        return res.json({amountOkey:true,disAmount,disTotal});
                                    }
                                }else{
                                    const disAmount = couponData.maxDiscountAmount;
                                    const disTotal = Math.round(amount-disAmount);
                                  
                                    return res.json({amountOkey:true,disAmount,disTotal});
                                }
                            }
                        }
                    }
                }
            }else{
                res.json({invalid:true});
            }
        }

    }catch(error){
        console.log(error.message);
    }
}

const getEditCoupon = async (req,res)=>{
    try{
        const couponId = req.query.id;
        const couponData = await Coupon.findOne({_id:couponId});
        res.render('admin/editCoupon',{coupon:couponData});
    }catch(error){
        console.log(error.message);
    }
}


const postEditCoupon = async (req,res)=>{
    try{
        const couponId = req.query.id;
        const coupon = await Coupon.findByIdAndUpdate({_id:couponId},{
            code:req.body.code,
            discountType:req.body.discountType,
            discountAmount:req.body.amount,
            expiryDate:req.body.date,
            maxCartAmount:req.body.cartAmount,
            maxDiscountAmount:req.body.discountAmount,
            maxUsers:req.body.couponCount
        })
        await coupon.save();
        res.redirect('/admin/listCoupon');
    }catch(error){
        console.log(error.message);
    }
}





const deleteCoupon = async (req,res)=>{
    try{
        const couponId = req.query.id;
        await Coupon.deleteOne({_id:couponId});
        res.redirect('/admin/listCoupon');
    }catch(error){
        console.log(error.message);
    }
}






module.exports={
    listCoupon,
    getAddCoupon,
    postAddCoupon,
    deleteCoupon,
    getEditCoupon,
    postEditCoupon,
    applyCoupon
}