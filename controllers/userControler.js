const User = require("../models/userModel");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const otpModel = require("../models/otpModel");
const Product = require("../models/productModel");
const Address = require("../models/addressModel");
require('dotenv').config()

const loadRegister = async (req, res) => {
  try {
    if (req.query.referel) {
      req.session.referel = req.query.referel;
    }
    res.render("registration", { customer: "", user_id: "", count: "" });
  } catch (error) {
    console.log(error.message);
  }
};
const loadHome = async (req, res) => {
  try {
    const products = await Product.find({ status: true });
    if (req.session.user_id) {
      let customer = true;

      res.render("index", { customer, products, user_id: "", count: "" });
    } else {
      let customer = false;
      res.render("index", { customer, products, user_id: "", count: "" });
    }
  } catch (error) {
    console.log(error.message);
  }
};

const loadLogout = (req, res) => {
  try {
    req.session.destroy();
    res.redirect("/login");
  } catch (error) {
    console.log(error.message);
  }
};

const loadForgot = async (req, res) => {
  try {
    const otp = false;
    res.render("forgotOtp", { otp, customer: "", count: "", message: "" });
  } catch {
    console.log(error);
  }
};

const postForgot = async (req, res) => {
  try {
    const otp = true;
    const otpDb = await otpModel.findOne({ email: req.body.email });
    const userData = await User.findOne({ email: req.body.email });
    const user_id = userData._id;
    if (userData) {
      if (otpDb) {
        res.render("forgotOtp", {
          customer: "",
          otp,
          email: req.body.email,
          count: "",
          message: "",
        });
      } else {
        sendMail(req.body.name, req.body.email, user_id);
        res.render("forgotOtp", {
          customer: "",
          otp,
          email: req.body.email,
          count: "",
          message: "",
        });
      }
    } else {
      res.render("registration", {
        message: "Your not registered user, Please Register first",
        count: "",
      });
    }
  } catch (error) {
    console.log(error);
  }
};

const resetOTP = async (req, res) => {
  try {
    const otp = true;
    let otpRecieved = req.body.otp;
    let email = req.body.email;
    let otpDb = await otpModel.findOne({ email: email });
    const spassword = await securePassword(req.body.new_password);
    if (otpRecieved == otpDb.otp) {
      await User.updateOne({ email: email }, { $set: { password: spassword } });
      await otpModel.findByIdAndRemove(otpDb._id);
      res.redirect("/login");
    } else {
      res.render("forgotOtp", {
        customer: "",
        otp,
        email: req.body.email,
        count: "",
        message: "Wrong OTP",
      });
    }
  } catch (error) {
    console.log(error);
  }
};

const loadLogin = async (req, res) => {
  try {
    if (req.session.user_id) {
      res.redirect("/");
    } else {
      let customer = false;
      res.render("login", { customer, message: "", user_id: "", count: "" });
    }
  } catch (error) {
    console.log(error.message);
  }
};

const securePassword = async (password) => {
  try {
    const passwordHash = bcrypt.hash(password, 10);
    return passwordHash;
  } catch (error) {
    console.log(error.message);
  }
};

const userProfile = async (req, res) => {
  try {
    let address = await Address.findOne({ userId: req.session.user_id });
    let userDb = await User.findOne({ _id: req.session.user_id });
    res.render("userProfile", {
      message: "",
      customer: userDb,
      address: address,
      user: req.session.user,
      userDb,
      count: req.cartCount,
    });
  } catch (error) {
    console.log(error);
  }
};

//for send OTP mail

function generateOTP() {
  var min = 1000;
  var max = 9999;
  var otp = Math.floor(Math.random() * (max - min + 1)) + min;
  return otp;
}
let otp;
let tempMail;

const sendMail = async (name, email, user_id) => {
  otp = generateOTP();

  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    requireTLS: true,
    auth: {
      user: "shyamkumarbeypore@gmail.com",
      pass: process.env.PASSWORD,
    },
  });
  const mailOptions = {
    from: "shyamkumarbeypore@gmail.com",
    to: email,
    subject: "For verification mail",
    html: "<p>Hii" + name + " ,please enter " + otp + " for verification</p>",
  };
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log(error);
    } else {
      console.log(otp);
      console.log("Email has been sent:-", info.response);
    }
  });

  const otpToSave = new otpModel({
    email: email,
    otp: otp,
  });
  let saveOtp = await otpToSave.save();
};

let timer = true;
const insertUser = async (req, res) => {
  try {
    const spassword = await securePassword(req.body.password);
    const user = new User({
      username: req.body.username,
      email: req.body.email,
      mobile: req.body.mobile,
      password: spassword,
      is_admin: 0,
    });
    let userData;
    const checkEmail = await User.findOne({ email: req.body.email });
    if (checkEmail) {
      res.render("registration", {
        message: "This email is already exist",
        customer: "",
        count: "",
      });
    } else {
      userData = await user.save();

      if (req.session.referel) {
        await User.updateOne(
          { _id: req.session.referel },
          { $inc: { wallet: 100 } }
        );
        await User.updateOne(
          { email: req.body.email },
          { $set: { wallet: 50 } }
        );
      }
    }

    tempMail = userData.email;
    // if(user.password===user.confirm_password){

    // }else{
    //     res.render('registration',{checkmessage:"Password not Matching"})
    // }

    if (userData) {
      if (userData.is_verified == 0) {
        //let otp
        sendMail(req.body.name, req.body.email, user._id);
        console.log("timer start");
        setTimeout(async () => {
          timer = false;
          let otpDb = await otpModel.findOne({ email: tempMail });
          let id = otpDb._id;
          await otpModel.findByIdAndRemove(id);
          console.log("timer end");
        }, 60000);
        res.render("otpPage", {
          customer: "",
          user_id: userData._id,
          count: "",
          message: "",
        });
      } else {
        res.render("registration", {
          message: "Your registration has been successfully",
          count: "",
        });
      }
    } else {
      res.render("registration", {
        checkmessage: "Your registration has been failed",
        count: "",
      });
    }
  } catch (error) {
    console.log(error);
  }
};

const verifyMail = async (req, res) => {
  try {
    let otpRecieved = req.body.otp;
    let userData = await User.findOne({ email: tempMail });
    let otpDb = await otpModel.findOne({ email: tempMail });
    if (timer) {
      if (otpRecieved == otpDb.otp) {
        let id=otpDb._id
        await User.updateOne({ email: tempMail }, { $set: { is_verified: 1 } });
        //  console.log(updateInfo);
        //await otpModel.findByIdAndRemove(id)
        res.redirect("/login");
      } else {
        res.render("otpPage", {
          message: "Wrong OTP",
          customer: "",
          user_id: userData._id,
          count: "",
        });
      }
    } else {
      timer = true;
      res.render("otpPage", {
        message: "TimeOut",
        customer: "",
        user_id: userData._id,
        count: "",
      });
    }
  } catch (error) {
    console.log(error.message);
  }
};

//-------resend OTP

const resendOTP = async (req, res) => {
  try {
    const user_id = req.body.id;
    const userData = await User.findOne({ _id: user_id });
    if (userData) {
      if (userData.is_verified == 0) {
        sendMail(userData.username, userData.email, userData._id);
        console.log("timer start");
        setTimeout(async () => {
          timer = false;
          let otpDb = await otpModel.findOne({ email: userData.email });
          let id = otpDb._id;
          await otpModel.findByIdAndRemove(id);
          console.log("timer end");
        }, 60000);
        res.render("otpPage", {
          customer: "",
          user_id: userData._id,
          count: "",
          message: "",
        });
      } else {
        res.render("registration", {
          message: "Your registration has been successfully",
          count: "",
          customer: "",
        });
      }
    } else {
      res.render("registration", {
        checkmessage: "Your registration has been failed",
        count: "",
        customer: "",
      });
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ success: false });
  }
};

const verifyUser = async (req, res) => {
  try {
    const email = req.body.email;
    const password = req.body.password;

    const userData = await User.findOne({ email: email });
    if (userData) {
      if (userData.is_verified == 1) {
        if (userData) {
          const passwordMatch = await bcrypt.compare(
            password,
            userData.password
          );
          if (passwordMatch) {
            if (userData.is_blocked == false) {
              req.session.user_id = userData._id;
              res.redirect("/");
            } else {
              res.render("login", {
                message: "This user has been blocked",
                customer: "",
                count: "",
              });
            }
          } else {
            res.render("login", {
              message: "Incorrect email and password",
              customer: "",
              count: "",
            });
          }
        } else {
          res.render("login", {
            message: "Incorrect email and password",
            customer: "",
            count: "",
          });
        }
      } else {
        otp = "";
        tempMail = email;
        sendMail(userData.name, userData.email, userData._id);
        console.log("timer start");
        setTimeout(async () => {
          timer = false;
          let otpDb = await otpModel.findOne({ email: userData.email });
          let id = otpDb._id;
          await otpModel.findByIdAndRemove(id);
          console.log("timer end");
        }, 60000);
        res.render("otpPage", {
          user_id: userData._id,
          customer: "",
          count: "",
          message: "",
        });
      }
    } else {
      res.render("login", {
        message: "User not exist",
        customer: "",
        count: "",
      });
    }
  } catch (error) {
    console.log(error);
  }
};

const loadSingleProduct = async (req, res) => {
  try {
    const id = req.query.id;
    const products = await Product.find({ _id: id });
    if (products) {
      res.render("singleProduct", { products, customer: "", count: "" });
    }
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  loadRegister,
  loadHome,
  loadLogin,
  insertUser,
  sendMail,
  verifyMail,
  verifyUser,
  loadLogout,
  loadSingleProduct,
  resendOTP,
  loadForgot,
  postForgot,
  resetOTP,
  userProfile,
};
