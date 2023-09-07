const User = require("../models/userModel");
const Product = require("../models/productModel");
const Cart = require("../models/cartModel");
const Address = require("../models/addressModel");
const Coupon = require("../models/couponModel");
const Order = require("../models/orderModel");
const Razorpay = require("razorpay");
const exceljs = require("exceljs");

// const exceljs = require('exceljs');
const puppeteer = require("puppeteer");
const path = require("path");
const dotenv = require("dotenv");
dotenv.config();

var instance = new Razorpay({
  key_id: "rzp_test_gsURN1Zv7sXXUx",
  key_secret: process.env.RAZORKEY,
});

const postAddress = async (req, res) => {
  try {
    const userData = await User.findOne({ _id: req.session.user_id });
    const addressDetails = await Address.findOne({
      userId: req.session.user_id,
    });
    if (addressDetails) {
      const updatedOne = await Address.updateOne(
        { userId: req.session.user_id },
        {
          $push: {
            addresses: {
              userName: req.body.name,
              mobile: req.body.mobile,
              alternativeMob: req.body.alterMobile,
              address: req.body.address,
              city: req.body.city,
              state: req.body.district,
              pincode: req.body.pincode,
              landmark: req.body.landmark,
            },
          },
        }
      );
      if (updatedOne) {
        res.redirect("/checkout");
      } else {
        res.redirect("/checkout");
      }
    } else {
      const address = new Address({
        userId: userData._id,
        addresses: [
          {
            userName: req.body.name,
            mobile: req.body.mobile,
            alternativeMob: req.body.alterMobile,
            address: req.body.address,
            city: req.body.city,
            state: req.body.district,
            pincode: req.body.pincode,
            landmark: req.body.landmark,
          },
        ],
      });
      const addressData = await address.save();
      if (addressData) {
        res.redirect("/checkout");
      } else {
        res.redirect("/checkout");
      }
    }
  } catch (error) {
    console.log(error.message);
  }
};

const deleteAddress = async (req, res) => {
  try {
    let addressId = req.query.id;
    await Address.updateOne(
      { userId: req.session.user_id, "addresses._id": addressId },
      { $pull: { addresses: { _id: addressId } } }
    ).then((data) => {});
    let addressNew = await Address.findOne({ userId: req.session.user_id });
    res
      .status(200)
      .json({ success: true, message: "address removed", address: addressNew });
  } catch (error) {
    console.log(error);
  }
};

const postEditAddress = async (req, res) => {
  try {
    let addressId = req.query.id;
    await Address.findOneAndUpdate(
      { userId: req.session.user_id, "addresses._id": addressId },
      {
        $set: {
          "addresses.$.userName": req.body.name,
          "addresses.$.mobile": req.body.mobile,
          "addresses.$.alternativeMob": req.body.alterMobile,
          "addresses.$.address": req.body.adress,
          "addresses.$.city": req.body.city,
          "addresses.$.state": req.body.district,
          "addresses.$.pincode": req.body.pincode,
          "addresses.$.landmark": req.body.landmark,
        },
      }
    );
    res.redirect("/checkout");
    // res.json({ success: true });
  } catch (error) {
    console.log(error);
  }
};

const loadCheckout = async (req, res) => {
  try {
    const couponData = await Coupon.find();
    const userData = await User.findOne({ _id: req.session.user_id });
    const addressData = await Address.findOne({ userId: req.session.user_id });
    const cartData = await Cart.findOne({ userId: userData }).populate(
      "products.productId"
    );
    const products = cartData.products;
    if (userData) {
      const total = await Cart.aggregate([
        { $match: { userName: userData.username } },
        { $unwind: "$products" },
        {
          $project: {
            productPrice: "$products.productPrice",
            count: "$products.count",
          },
        },
        {
          $group: {
            _id: null,
            total: { $sum: { $multiply: ["$productPrice", "$count"] } },
          },
        },
      ]);
      const Total = total[0].total;
      res.render("checkout", {
        addressDb: addressData,
        products,
        Total,
        couponData,
        customer: true,
        count: "",
      });
    } else {
      res.redirect("/login");
    }
  } catch (error) {
    console.log(error);
  }
};

const placeOrder = async (req, res) => {
  try {
    const code = req.body.coupon;
    const couponData = await Coupon.findOne({ code: code });
    const userName = await User.findOne({ _id: req.session.user_id });
    const addressId = req.body.address;
    const deliveryAddress = await Address.findOne({
      userId: req.session.user_id,
    });
    const paymentMethod = req.body.payment;
    const cartData = await Cart.findOne({ userId: req.session.user_id });
    const products = cartData.products;
    const Total = parseInt(req.body.amount);
    const totalPrice = parseInt(req.body.total);
    const discount = parseInt(req.body.discount);
    const wallet = totalPrice - Total - discount;
    const status = paymentMethod === "COD" ? "placed" : "pending";
    const exist = deliveryAddress.addresses.filter(
      (value) => value._id.toString() == addressId
    );

    const order = new Order({
      deliveryAddress: {
        userName: exist[0].userName,
        mobile: exist[0].mobile,
        address: exist[0].address,
        city: exist[0].city,
        state: exist[0].state,
        pincode: exist[0].pincode,
        landmark: exist[0].landmark,
      },
      userId: req.session.user_id,
      userName: userName.username,
      paymentMethod: paymentMethod,
      products: products,
      totalAmount: Total,
      Amount: totalPrice,
      date: new Date(),
      status: status,
      orderWallet: wallet,
    });
    const orderData = await order.save();
    const date = orderData.date.toISOString().substring(5, 7);
    const orderId = orderData._id;
    if (orderData) {
      for (let i = 0; i < products.length; i++) {
        const pro = products[i].productId;
        const count = products[i].count;
        await Product.findByIdAndUpdate(
          { _id: pro },
          { $inc: { stock: -count } }
        );
      }
      if (order.status == "placed") {
        const wal = totalPrice - Total;
        await Order.updateOne({ _id: orderId }, { $set: { month: date } });
        await User.updateOne(
          { _id: req.session.user_id },
          { $inc: { wallet: -wal } }
        );
        await Cart.deleteOne({ userId: req.session.user_id });
        if (code) {
          await Coupon.findByIdAndUpdate(
            { _id: couponData._id },
            { $push: { user: req.session.user_id } }
          );
          await Coupon.findByIdAndUpdate(
            { _id: couponData._id },
            { $inc: { maxUsers: -1 } }
          );
        }
        res.json({ codSuccess: true });
      } else {
        if (code) {
          await Coupon.findByIdAndUpdate(
            { _id: couponData._id },
            { $push: { user: req.session.user_id } }
          );
          await Coupon.findByIdAndUpdate(
            { _id: couponData._id },
            { $inc: { maxUsers: -1 } }
          );
        }
        const orderId = orderData._id;
        await Order.updateOne({ _id: orderId }, { $set: { month: date } });
        const totalAmount = orderData.totalAmount;
        var options = {
          amount: totalAmount * 100,
          currency: "INR",
          receipt: "" + orderId,
        };
        // await instance.orders.create(options, function (err, order) {
        //   res.json({ order });
        // });

        const response = await instance.orders.create(options);
        res.json({ response });
      }
    } else {
      res.redirect("/checkout");
    }
  } catch (error) {
    console.log(error);
  }
};

const verifyPayment = async (req, res) => {
  try {
    const totalPrice = req.body.amount2;
    const total = req.body.amount;
    const wal = totalPrice - total;
    const details = req.body;
    const crypto = require("crypto");
    let hmac = crypto.createHmac("sha256", "wmqYfTDG25I70JWWPfrTFGVO");
    hmac.update(
      details.payment.razorpay_order_id +
        "|" +
        details.payment.razorpay_payment_id
    );
    hmac = hmac.digest("hex");
    if (hmac == details.payment.razorpay_signature) {
      await Order.findByIdAndUpdate(
        { _id: details.order.receipt },
        { $set: { status: "placed" } }
      );
      await User.updateOne(
        { _id: req.session.user_id },
        { $inc: { wallet: -wal } }
      );
      await Order.findByIdAndUpdate(
        { _id: details.order.receipt },
        { $set: { paymentId: details.payment.razorpay_payment_id } }
      );
      await Cart.deleteOne({ userName: req.session.user_id });
      res.json({ success: true });
    } else {
      await Order.findByIdAndRemove({ _id: details.order.receipt });
      res.json({ success: false });
    }
  } catch (error) {
    console.log(error.message);
  }
};

const loadConfirmation = async (req, res) => {
  try {
    let userId = req.session.user_id;
    const orderData = await Order.findOne({ userId: userId }).sort({
      date: -1,
    });
    const productData = await Order.findOne({ userId: userId })
      .sort({ date: -1 })
      .populate("products.productId");

    const count = await Order.countDocuments();
    const orderNum = 6000 + count;
    res.render("confirmation", {
      orderData,
      productData,
      orderNum,
      userId,
      count: "",
      customer: true,
    });
  } catch (error) {
    console.log(error);
  }
};

const getOrderDetails = async (req, res) => {
  try {
    const orderData = await Order.find({});
    res.render("admin/orderDetails", { orderData });
  } catch {
    console.log(error);
  }
};

const getEditOrder = async (req, res) => {
  try {
    const orderId = req.query.id;
    const orderData = await Order.findOne({ _id: orderId });
    res.render("admin/editOrder", { orderData });
  } catch (error) {
    console.log(error.message);
  }
};

const postEditOrder = async (req, res) => {
  try {
    const update = await Order.updateOne(
      { _id: req.query.id },
      { $set: { status: req.body.status } }
    );
    if (update) {
      res.redirect("/admin/orderDetails");
    } else {
      res.render("editOrder", { message: "Status not updated" });
    }
  } catch (error) {
    console.log(error.message);
  }
};

// const getOrderProducts = async(req,res)=>{
//     const userName = await User.findOne({_id:req.session.user_id});
//     const orderId = await Order.findOne({_id:req.query.id}).populate("products.productId");
//     const products = orderId.products;
//     if(req.session.user_id){
//         const customer = true;
//         if(products.length>0){
//             res.render('admin/viewOrderProducts',{userName,customer,products,orderId});
//         }else{
//             res.render('admin/viewOrderProducts',{userName,customer,products,orderId,message:"Order Cancelled...No more Order here"});
//         }
//     }else{
//         res.redirect('/');
//     }
// }

const getOrderProducts = async (req, res) => {
  const orderId = req.query.id;
  const orderData = await Order.findOne({ _id: orderId }).populate(
    "products.productId"
  );
  const productData = orderData.products;
  res.render("admin/viewOrderProducts", { productData });
};

const loadMyOrder = async (req, res) => {
  try {
    let userId = req.session.user_id;
    const orderData = await Order.find({ userId: userId })
      .sort({ date: -1 })
      .populate("products.productId");

    data = {
      customer: req.session.user_id,
      count: "",
      orderData,
    };
    res.render("myOrders", data);
  } catch (error) {
    console.log(error);
  }
};

const returnOrder = async (req, res) => {
  try {
    let id = req.query.id;
    let reason = req.body.reason;
    const orderUpdate = await Order.findByIdAndUpdate(id, {
      status: "returnRequest",
      returnReson: reason,
    });
    if (orderUpdate) {
      res.status(200).json({ success: true, message: "order returned" });
    }
  } catch (error) {
    console.log(error);
  }
};

const cancelOrder = async (req, res) => {
  try {
    let id = req.query.id;
    const orderDetails = await Order.find({ _id: id });
    if (orderDetails[0].paymentMethod == "online") {
      await User.updateOne(
        { _id: req.session.userId },
        { $inc: { wallet: orderDetails[0].Amount } }
      );
    }
    orderDetails[0].products.forEach(async (element) => {
      let orderedQnty = element.count;
      let a = await Product.findByIdAndUpdate(element.productId, {
        $inc: { stock: orderedQnty },
      });
    });
    const orderUpdate = await Order.findByIdAndUpdate(id, {
      status: "canceled",
    });
    if (orderUpdate) {
      res.status(200).json({ success: true, message: "order canceled" });
    }
  } catch (error) {
    console.log(error);
  }
};

const confirmReturn = async (req, res) => {
  try {
    let id = req.query.id;
    const orderDetails = await Order.find({ _id: id });
    await User.updateOne(
      { _id: req.session.user_id },
      { $inc: { wallet: orderDetails[0].Amount } }
    );
    orderDetails[0].products.forEach(async (element) => {
      let orderedQnty = element.count;
      let a = await Product.findByIdAndUpdate(element.productId, {
        $inc: { stock: orderedQnty },
      });
    });
    const orderUpdate = await Order.findByIdAndUpdate(id, {
      status: "returned",
    });
    if (orderUpdate) {
      res.status(200).json({ success: true, message: "order returned" });
    }
  } catch (error) {
    console.log(error);
  }
};
const cancelReturn = async (req, res) => {
  try {
    let id = req.query.id;
    const orderUpdate = await Order.findByIdAndUpdate(id, {
      status: "delivered",
    });
    if (orderUpdate) {
      res.status(200).json({ success: true, message: "order return canceled" });
    }
  } catch (error) {
    console.log(error);
  }
};

const sales = async (req, res) => {
  try {
    const orderData = await Order.find({});
    res.render("admin/htmlToPdf", { orderData });
  } catch (error) {
    console.log(error.message);
  }
};
const filterSales = async (req, res) => {
  try {
    const startDate = req.query.start;
    const endDate = req.query.end;
    const orderData = await Order.find({
      date: { $gte: startDate, $lte: endDate },
    });
    res.render("admin/htmlToFilterPdf", { orderData });
  } catch (error) {
    console.log(error.message);
  }
};

const invoice = async (req, res) => {
  try {
    let userId = req.query.id;
    const orderData = await Order.findOne({ userId: userId }).sort({
      date: -1,
    });

    const productData = await Order.findOne({ userId: userId })
      .sort({ date: -1 })
      .populate("products.productId");
    const count = await Order.countDocuments();
    const orderNum = 6000 + count;
    res.render("userInvoice", { orderData, orderNum, productData });
  } catch (error) {
    console.log(error.message);
  }
};

const exportInvoicePDF = async (req, res) => {
  try {
    const userId = req.session.user_id;
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(`http://localhost:3000/invoice?id=${userId}`, {
      waitUntil: "networkidle2",
    });
    // redirect("invoice",{waitUntil:"networkidle2"})
    await page.setViewport({ width: 1680, height: 1050 });
    const todayDate = new Date();
    const pdfn = await page.pdf({
      path: `${path.join(
        __dirname,
        "../public/188 Aranoz shop DOC/invoicefiles",
        todayDate.getTime() + ".pdf"
      )}`,
      format: "A4",
    });

    await browser.close();

    const pdfUrl = path.join(
      __dirname,
      "../public/188 Aranoz shop DOC/invoicefiles",
      todayDate.getTime() + ".pdf"
    );

    res.set({
      "Content-Type": "application/pdf",
      "Content-Length": pdfn.length,
    });
    res.sendFile(pdfUrl);
  } catch (error) {
    console.log(error);
  }
};

const exportExcelOrder = async (req, res) => {
  try {
    const workbook = new exceljs.Workbook();
    const worksheet = workbook.addWorksheet("Orders");
    worksheet.columns = [
      { header: "S no.", key: "s_no" },
      { header: "User", key: "userName" },
      { header: "Payment Method", key: "paymentMethod" },
      { header: "Products", key: "productsa" },
      { header: "Total Amount", key: "Amount" },
      { header: "Date", key: "date" },
      { header: "Status", key: "status" },
    ];
    let counter = 1;
    const startDate = req.query.start;
    const endDate = req.query.end;
    const orderData = await Order.find({
      date: { $gte: startDate, $lte: endDate },
    }).populate("products.productId");
    orderData.forEach((order) => {
      if (order.status == "Delivered") {
        order.s_no = counter;
        const productInfo = order.products.map(
          (product) => `${product.count} x ${product.productId.productName}`
        );
        order.productsa = productInfo.join(", ");

        worksheet.addRow(order);
        counter++;
      }
    });

    worksheet.getRow(1).eachCell((cell) => {
      cell.font = { bold: true };
    });

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader("Content-Disposition", `attachment;filename=order.xlsx`);

    return workbook.xlsx.write(res).then(() => {
      res.status(200);
    });
  } catch (error) {
    console.log(error);
  }
};

// const exportExcelOrder = async (req, res) => {
//   try {
//     const workbook = new exceljs.Workbook();
//     const worksheet = workbook.addWorksheet("Orders");
//     worksheet.columns = [
//       { header: "S no.", key: "s_no" },
//       { header: "User", key: "userName" },
//       { header: "Payment Method", key: "paymentMethod" },
//       { header: "Products", key: "products" },
//       { header: "Amount Paid", key: "totalAmount" },
//       { header: "Total Amount", key: "Amount" },
//       { header: "Date", key: "date" },
//       { header: "Status", key: "status" },
//     ];

//     let counter = 1;
//     const orderData = await Order.find({});
//     orderData.forEach((order) => {
//       order.s_no = counter;

//       // Extract product names and counts and format them as a string
//       const productInfo = order.products.map(
//         (product) => `${product.count} x ${product.productName}`
//       );
//       order.products = productInfo.join(", ");

//       worksheet.addRow(order);
//       counter++;
//     });

//     worksheet.getRow(1).eachCell((cell) => {
//       cell.font = { bold: true };
//     });

//     res.setHeader(
//       "Content-Type",
//       "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
//     );
//     res.setHeader("Content-Disposition", `attachment;filename=order.xlsx`);

//     return workbook.xlsx.write(res).then(() => {
//       res.status(200);
//     });
//   } catch (error) {
//     console.log(error.message);
//   }
// };

const exportOrderPDF = async (req, res) => {
  try {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(`http://localhost:3000/admin/sales`, {
      waitUntil: "networkidle2",
    });
    await page.setViewport({ width: 1680, height: 1050 });
    const todayDate = new Date();
    const pdfn = await page.pdf({
      path: `${path.join(
        __dirname,
        "../public/files",
        todayDate.getTime() + ".pdf"
      )}`,
      format: "A4",
    });

    await browser.close();

    const pdfUrl = path.join(
      __dirname,
      "../public/files",
      todayDate.getTime() + ".pdf"
    );

    res.set({
      "Content-Type": "application/pdf",
      "Content-Length": pdfn.length,
    });
    res.sendFile(pdfUrl);
  } catch (error) {
    console.log(error);
  }
};

const exportFilterOrderPDF = async (req, res) => {
  try {
    const startDate = req.query.start;
    const endDate = req.query.end;
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(
      `http://localhost:3000/admin/filterSales?start=${startDate}&end=${endDate}`,
      {
        waitUntil: "networkidle2",
      }
    );
    await page.setViewport({ width: 1680, height: 1050 });
    const todayDate = new Date();
    const pdfn = await page.pdf({
      path: `${path.join(
        __dirname,
        "../public/files",
        todayDate.getTime() + ".pdf"
      )}`,
      format: "A4",
    });

    await browser.close();

    const pdfUrl = path.join(
      __dirname,
      "../public/files",
      todayDate.getTime() + ".pdf"
    );

    res.set({
      "Content-Type": "application/pdf",
      "Content-Length": pdfn.length,
    });
    res.sendFile(pdfUrl);
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  loadCheckout,
  postAddress,
  placeOrder,
  loadConfirmation,
  getOrderDetails,
  getEditOrder,
  postEditOrder,
  getOrderProducts,
  verifyPayment,
  loadMyOrder,
  cancelOrder,
  deleteAddress,
  postEditAddress,
  exportOrderPDF,
  exportFilterOrderPDF,
  exportExcelOrder,
  filterSales,
  sales,
  exportInvoicePDF,
  invoice,
  returnOrder,
  confirmReturn,
  cancelReturn,
};
