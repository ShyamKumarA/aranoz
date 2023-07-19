// const User = require('../models/userModel');
const Category = require('../models/categoryModel');
const Product = require('../models/productModel');
// const { render } = require('../routes/adminRoute');

const getProductManagement=async (req,res)=>{
    try{
        const products=await Product.find()
        res.render('admin/products',{products})
    }catch(error){
        console.log(error);
    }
};

const getAddProduct=async(req,res)=>{
    try{
        //console.log('Hello');
        const category=await Category.find({is_blocked:false})
        res.render('admin/addProduct',{category})

    }catch(error){
        console.log(error);

    }
}

const postAddProduct=async(req,res)=>{
    try{
        const image=[];
        for(let i=0;i<req.files.length;i++){
            image[i]=req.files[i].filename;
        }
        const product =new Product({
            productName:req.body.name,
            price:req.body.price,
            image:image,
            category:req.body.category,
            stock:req.body.stock,
            status:req.body.status,
            description:req.body.description,
        })

        const productData=await product.save();
        if(productData){
            res.redirect('/admin/productList');
        }
        
    }catch(error){
        console.log(error);
    }

}

const getActionProduct=async(req,res)=>{
    try{
        const id=req.query.id;
        const productData=await Product.findOne({_id:id});
        if(productData.status===true){
            const data=await Product.findByIdAndUpdate(id,{status:false})
            if(data){
                res.redirect('/admin/productList');
            }
        }else{
            const data = await Product.findByIdAndUpdate(id, { status: true });
      if (data) {
        res.redirect("/admin/productList");
      } 
        }

    }catch(error){
        console.log(error);
    }
}

const getEditProduct=async(req,res)=>{
    try{

        const id=req.query.id;
        //console.log(id);
        const productData=await Product.findOne({_id:id}).populate("category").exec()
        const catData=await Category.find()
        if(productData){
            res.render('admin/editProduct',{product:productData,category:catData})

        }else{
            res.redirect('admin/dashboard')
        }

    }catch(error){
        console.log(error);
    }
}

const postEditProduct=async(req,res)=>{
        try{
           
            const image=[];
            for(let i=0;i<req.files.length;i++){
                image[i]=req.files[i].filename;
            }
            const id=req.query.id;
            console.log(id);
            const productUpdate = await Product.findByIdAndUpdate(id, {
                productName: req.body.name,
                price: req.body.price,
                image: image,
                category: req.body.category,
                stock: req.body.stock,
                status: req.body.status,
                description: req.body.description,
            })
            let productDb = await Product.find().populate("category").exec()
                    if (productUpdate) {
                res.render('admin/products', { products: productDb})
            } else {
                res.render('admin/products', { products : productDb})
            }
    




    }catch(error){

    }

}


module.exports={
    getProductManagement,
    getAddProduct,
    postAddProduct,
    getActionProduct,
    getEditProduct,
    postEditProduct
}
