const mongoose=require('mongoose');

const categorySchema=mongoose.Schema({
    categoryName:{
        type:String,
        required:true,
    },
    is_blocked:{
        type:Boolean,
        required:true,
        default:false
    },

})

module.exports=mongoose.model('category',categorySchema)
