const express = require("express");
const user_route = express();
const bodyparser = require("body-parser");
const multer = require("multer");
const session = require("express-session");
const auth = require("../middleware/auth");
// const midData=require('../middleware/midData')

// const config=require('../config/config')

user_route.set("view engine", "ejs");
user_route.set("views", "./views/users");
user_route.use(bodyparser.json());
user_route.use(bodyparser.urlencoded({ extended: true }));

const userController = require("../controllers/userControler");
const shopController = require("../controllers/shopController");
const cartController = require("../controllers/cartController");
const orderController = require("../controllers/orderController");
const couponController = require("../controllers/couponController");
const wishlistController = require("../controllers/wishlistController");
//const { config } = require('dotenv');

// user_route.get('/login',auth.isLogout,userController.loadLogin)
user_route.get("/", userController.loadHome);
user_route.get("/login", auth.isLogout, userController.loadLogin);
user_route.get("/register", userController.loadRegister);
user_route.get("/logout", auth.isLogout, userController.loadLogout);
user_route.get("/single_product", userController.loadSingleProduct);
user_route.get("/shop", shopController.getShop);
user_route.get("/cart", auth.isLogin, cartController.loadCart);
user_route.get("/removeProduct", auth.isLogin, cartController.removeProduct);
user_route.get("/checkout", auth.isLogin, orderController.loadCheckout);
user_route.get("/forgot-password", auth.isLogout, userController.loadForgot);
user_route.get("/confirmation", auth.isLogin, orderController.loadConfirmation);
user_route.get("/myOrders", auth.isLogin, orderController.loadMyOrder);
user_route.get("/invoice", orderController.invoice);
user_route.get("/exportInvoicePDF", orderController.exportInvoicePDF);
user_route.get("/userProfile", auth.isLogin, userController.userProfile);
user_route.get("/loadWishlist",auth.isLogin,wishlistController.loadWishlist)
user_route.get("/removewishProduct",auth.isLogin,wishlistController.removewishProduct)

user_route.post("/register", userController.insertUser);
user_route.post("/verify", userController.verifyMail);
user_route.post("/resendOTP", userController.resendOTP);
user_route.post("/sendMail", userController.sendMail);
user_route.post("/login", userController.verifyUser);
user_route.post("/postCart", cartController.postCart);
user_route.post("/changeProductQuantity", cartController.incrementQty);
user_route.post("/applyCoupon", couponController.applyCoupon);
user_route.post("/forgot-password", auth.isLogout, userController.postForgot);
user_route.post("/reset-password", auth.isLogout, userController.resetOTP);
user_route.post("/post_address", orderController.postAddress);
user_route.post("/deleteAddress", orderController.deleteAddress);
user_route.post("/post_editAddress", orderController.postEditAddress);
user_route.post("/checkout", auth.isLogin, orderController.placeOrder);
user_route.post("/cancelOrder", orderController.cancelOrder);
user_route.post("/verifyPayment", orderController.verifyPayment);
user_route.post("/addToWishlist",wishlistController.addToWishlist)

user_route.put("/returnOrder", orderController.returnOrder);

user_route.use((req, res, next) => {
  res.status(404).render("404");
});

module.exports = user_route;
