const Category = require("../models/categoryModel");
// const us=require('upper-case');

const getListCategory = async (req, res) => {
  try {
    if (req.session.login) {
      const data = await Category.find();
      res.render("admin/category", { data });
    } else {
    }
  } catch (error) {
    console.log(error.message);
  }
};

const getAddCategory = (req, res) => {
  try {
    if (req.session.login) {
      res.render("admin/addCategory");
    } else {
      res.redirect("/admin");
    }
  } catch (error) {
    console.log(error.message);
  }
};
const getBlockUnblock = async (req, res) => {
  try {
    const user = await Category.findById(req.query.id);
    if (user.is_blocked) {
      await Category.findByIdAndUpdate(req.query.id, { is_blocked: false });
    } else {
      await Category.findByIdAndUpdate(req.query.id, { is_blocked: true });
    }
    res.redirect("/admin/listCategory");
  } catch (error) {
    console.log(error);
  }
};
const postAddCategory = async (req, res) => {
  try {
    const Name = req.body.name;
    const discount = req.body.catDiscount;
    const data = await Category.findOne({
      categoryName: { $regex: Name, $options: "i" },
    });
    if (data) {
      res.render("admin/addCategory", {
        message: "Category is already defined",
      });
    } else {
      const data1 = await new Category({
        categoryName: Name,
        discount: discount,
      });
      const result = await data1.save();
      if (result) {
        res.redirect("/admin/listCategory");
      } else {
        res.render("admin/addCategory", {
          message: "Error while adding to then database",
        });
      }
    }
  } catch (error) {
    console.log(error.message);
  }
};

const getEditCategory = async (req, res) => {
  try {
    const id = req.query.id;
    const catData = await Category.findOne({ _id: id });
    if (catData) {
      res.render("admin/editCategory", { category: catData });
    } else {
      redirect("admin/dashboard");
    }
  } catch (error) {
    console.log(error);
  }
};

const postEditCategory = async (req, res) => {
  try {
    const id = req.query.id;
    const categoryUpdate = await Category.findByIdAndUpdate(id, {
      categoryName: req.body.name,
      discount: req.body.catDiscount,
    });
    let catData = await Category.findOne({ _id: id });
    if (categoryUpdate) {
      //res.render('admin/category',{data:catData})
      res.redirect("/admin/listCategory");
    } else {
      //res.render('admin/category',{data:catData})
      res.redirect("/admin/listCategory");
    }
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  getListCategory,
  getAddCategory,
  postAddCategory,
  getBlockUnblock,
  getEditCategory,
  postEditCategory,
};
