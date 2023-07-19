const express = require('express');
const admin_route=express();
const adminController=require("../controllers/adminController")
const adminAuth=require('../middleware/adminAuth')
const categoryController=require('../controllers/categoryController')
const productController=require('../controllers/productController')

const fs=require('fs')
const multer = require('multer');
const path=require('path')
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
       let dir= path.join(__dirname, "../public/product_images")
       if(!fs.existsSync(dir)){
        fs.mkdirSync(dir)
       }
      cb(null,dir );
    },
    filename: (req, file, cb) => {
      const name = Date.now() + "-" + file.originalname;
      cb(null, name);
    },

  });
  
  const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
      if (
        file.mimetype == "image/png" ||
        file.mimetype == "image/jpg" ||
        file.mimetype == "image/jpeg" ||
        file.mimetype == "image/webp"
      ) {
        cb(null, true);
      } else {
        cb(null, false);
        return cb(new Error("Only .png, .jpg and .jpeg .webp format allowed!"));
      }
    },
  });

admin_route.set('view engine','ejs')
admin_route.set('adminviews','./views/admin')

admin_route.get('/login',adminAuth.isLogout,adminController.getLogin)
admin_route.get('/logout',adminController.getLogout)
admin_route.get('/',adminAuth.isLogin,adminController.getAdminHome)

admin_route.get('/user_management',adminAuth.isLogin,adminController.getUserManagement)
admin_route.get('/blockUnblock',adminAuth.isLogin,adminController.getBlockUnblock)
admin_route.get('/categoryUnblock',adminAuth.isLogin,categoryController.getBlockUnblock)
admin_route.get('/listCategory',adminAuth.isLogin,categoryController.getListCategory)
admin_route.get('/addCategory',adminAuth.isLogin,categoryController.getAddCategory)

admin_route.get('/productList',adminAuth.isLogin,productController.getProductManagement)
admin_route.get('/addProduct',adminAuth.isLogin,productController.getAddProduct)
admin_route.get('/action_product',adminAuth.isLogin,productController.getActionProduct)
admin_route.get('/edit_product',adminAuth.isLogin,productController.getEditProduct)

// admin_route.get('/edit_product',adminAuth.isLogin,productController.getEditProduct)

admin_route.post('/login',adminController.postLogin)
admin_route.post('/addCategory',categoryController.postAddCategory)
admin_route.post('/addProduct',adminAuth.isLogin,upload.array('images',4),productController.postAddProduct)
admin_route.post('/edit_product',upload.array('images',4),productController.postEditProduct)

module.exports=admin_route;