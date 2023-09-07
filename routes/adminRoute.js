const express = require("express");
const admin_route = express();
const adminController = require("../controllers/adminController");
const adminAuth = require("../middleware/adminAuth");
const categoryController = require("../controllers/categoryController");
const productController = require("../controllers/productController");
const couponController = require("../controllers/couponController");
const orderController = require("../controllers/orderController");
const session = require("express-session");
const upload = require("../config /multiFileUpload");

admin_route.set("view engine", "ejs");
admin_route.set("adminviews", "./views/admin");

admin_route.get("/", adminAuth.isLogin, adminController.getAdminHome);
admin_route.get("/login", adminAuth.isLogout, adminController.getLogin);
admin_route.get("/logout", adminController.getLogout);

admin_route.get(
  "/user_management",
  adminAuth.isLogin,
  adminController.getUserManagement
);
admin_route.get(
  "/blockUnblock",
  adminAuth.isLogin,
  adminController.getBlockUnblock
);
admin_route.get(
  "/categoryUnblock",
  adminAuth.isLogin,
  categoryController.getBlockUnblock
);
admin_route.get(
  "/listCategory",
  adminAuth.isLogin,
  categoryController.getListCategory
);
admin_route.get(
  "/addCategory",
  adminAuth.isLogin,
  categoryController.getAddCategory
);
admin_route.get(
  "/productList",
  adminAuth.isLogin,
  productController.getProductManagement
);
admin_route.get(
  "/addProduct",
  adminAuth.isLogin,
  productController.getAddProduct
);
admin_route.get(
  "/action_product",
  adminAuth.isLogin,
  productController.getActionProduct
);
admin_route.get(
  "/edit_product",
  adminAuth.isLogin,
  productController.getEditProduct
);
admin_route.get(
  "/editCategory",
  adminAuth.isLogin,
  categoryController.getEditCategory
);
admin_route.get("/listCoupon", adminAuth.isLogin, couponController.listCoupon);
admin_route.get("/addCoupon", adminAuth.isLogin, couponController.getAddCoupon);
admin_route.get(
  "/deleteCoupon",
  adminAuth.isLogin,
  couponController.deleteCoupon
);
admin_route.get(
  "/editCoupon",
  adminAuth.isLogin,
  couponController.getEditCoupon
);
admin_route.get(
  "/orderDetails",
  adminAuth.isLogin,
  orderController.getOrderDetails
);
admin_route.get(
  "/editOrderStatus",
  adminAuth.isLogin,
  orderController.getEditOrder
);
admin_route.get(
  "/viewOrderProducts",
  adminAuth.isLogin,
  orderController.getOrderProducts
);
admin_route.get("/exportOrderPDF", orderController.exportOrderPDF);
admin_route.get("/exportFilterOrderPDF", orderController.exportFilterOrderPDF);
admin_route.get("/exportExcelOrder", orderController.exportExcelOrder);

admin_route.get("/sales", orderController.sales);
admin_route.get("/filterSales", orderController.filterSales);

// admin_route.get('/edit_product',adminAuth.isLogin,productController.getEditProduct)

admin_route.post("/", adminAuth.isLogin, adminController.postAdminHome);
admin_route.post("/login", adminController.postLogin);
admin_route.post("/addCategory", categoryController.postAddCategory);
admin_route.post(
  "/addProduct",
  adminAuth.isLogin,
  upload.array("images", 4),
  productController.postAddProduct
);
admin_route.post(
  "/edit_product",
  upload.array("images", 4),
  productController.postEditProduct
);
admin_route.post("/editCategory", categoryController.postEditCategory);
admin_route.post("/delete-image", productController.deleteSingleImage);
admin_route.post("/addCoupon", couponController.postAddCoupon);
admin_route.post(
  "/editCoupon",
  adminAuth.isLogin,
  couponController.postEditCoupon
);
admin_route.post(
  "/editOrderStatus",
  adminAuth.isLogin,
  orderController.postEditOrder
);
admin_route.patch(
  "/confirmReturn",
  adminAuth.isLogin,
  orderController.confirmReturn
);
admin_route.patch(
  "/cancelReturn",
  adminAuth.isLogin,
  orderController.cancelReturn
);

module.exports = admin_route;
