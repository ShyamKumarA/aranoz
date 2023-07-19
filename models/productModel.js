const mongoose=require('mongoose')
const productSchema=new mongoose.Schema({
    productName:{
        type:String,
        require:true,
    },
    image:{
        type:Array,
        required:true
    },
    category:{
        type:String,
        required:true
    },
    price:{
        type:Number,
        require:true
    },
    stock:{
        type:Number,
        required:true
    },
    status:{
        type:Boolean,
        required:true
    },
    description:{
        type:String,
        required:true
    }


})

module.exports=mongoose.model('product',productSchema);