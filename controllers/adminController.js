const userModel = require("../models/userModel");
const Product = require("../models/productModel");
const Cart = require("../models/cartModel");
const Order = require("../models/orderModel");

const getLogin = async (req, res) => {
  try {
    res.render("admin/adminLogin", { message: undefined });
  } catch (error) {
    console.log(error);
  }
};

const postLogin = (req, res) => {
  try {
    const adminEmail = "admin@gmail.com";
    const adminPassword = 12345678;

    if (req.body.email == adminEmail && req.body.password == adminPassword) {
      req.session.login = true;
      res.redirect("/admin/");
    } else {
      res.render("admin/adminLogin", { message: "Invalid credencials" });
    }
  } catch (error) {
    console.log(error);
  }
};

const getAdminHome = async (req, res) => {
  try {
    const salesreport = false;
    const orderCount = await Order.countDocuments();
    const userCount = await userModel.countDocuments();
    const productCount = await Product.countDocuments();
    const orderData = await Order.find();

    const onlineCount = await Order.aggregate([
      { $group: { _id: "$paymentMethod", totalPayment: { $count: {} } } },
    ]);

    let sales = [];
    var date = new Date();
    var year = date.getFullYear();
    var currentyear = new Date(year, 0, 1);
    let salesByYear = await Order.aggregate([
      { $match: { date: { $gte: currentyear }, status: { $ne: "cancelled" } } },
      {
        $group: {
          _id: { $dateToString: { format: "%m", date: "$date" } },
          total: { $sum: "$Amount" },
        },
      },
      { $sort: { _id: 1 } },
    ]);
    for (let i = 1; i <= 12; i++) {
      let result = true;
      for (let k = 0; k < salesByYear.length; k++) {
        result = false;
        if (salesByYear[k]._id == i) {
          sales.push(salesByYear[k]);
          break;
        } else {
          result = true;
        }
      }
      if (result) sales.push({ _id: i, total: 0 });
    }
    let salesData = [];
    for (let i = 0; i < sales.length; i++) {
      salesData.push(sales[i].total);
    }

    res.render("admin/adminHome", {
      orderCount,
      userCount,
      productCount,
      salesreport,
      orderData,
      breakLoop: false,
      payment: onlineCount,
    });
  } catch (error) {
    console.log(error);
  }
};

const postAdminHome = async (req, res) => {
  try {
    const salesreport = true;
    const orderCount = await Order.countDocuments();
    const userCount = await userModel.countDocuments();
    const productCount = await Product.countDocuments();
    const startDate = req.body.startDate;
    const endDate = req.body.endDate;
    const orderData = await Order.find({
      date: { $gte: startDate, $lte: endDate },
    });
    res.render("admin/adminHome", {
      orderData,
      salesreport,
      orderCount,
      startDate,
      endDate,
      userCount,
      productCount,
    });
  } catch (error) {
    console.log(error);
  }
};

const getUserManagement = async (req, res) => {
  try {
    if (req.session.login) {
      const user = await userModel.find();
      res.render("admin/userManagement", { user });
    } else {
      res.redirect("/admin/");
    }
  } catch (error) {
    console.log(error.message);
  }
};

const getBlockUnblock = async (req, res) => {
  try {
    const user = await userModel.findById(req.query.id);
    if (user.is_blocked) {
      await userModel.findByIdAndUpdate(req.query.id, { is_blocked: false });
    } else {
      await userModel.findByIdAndUpdate(req.query.id, { is_blocked: true });
    }
    res.redirect("/admin/user_management");
  } catch (error) {
    console.log(error.message);
  }
};

const getLogout = (req, res) => {
  try {
    req.session.destroy();
    res.redirect("/admin/login");
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  getAdminHome,
  getLogin,
  postLogin,
  getLogout,
  getUserManagement,
  getBlockUnblock,
  postAdminHome,
};
