// const User = require('../models/userModel');
const Category = require("../models/categoryModel");
const Product = require("../models/productModel");
// const { render } = require('../routes/adminRoute');

const getProductManagement = async (req, res) => {
  try {
    const products = await Product.find();
    res.render("admin/products", { products });
  } catch (error) {
    console.log(error);
  }
};

const getAddProduct = async (req, res) => {
  try {
    const category = await Category.find({ is_blocked: false });
    res.render("admin/addProduct", { category });
  } catch (error) {
    console.log(error);
  }
};

const postAddProduct = async (req, res) => {
  try {
    const image = [];
    for (let i = 0; i < req.files.length; i++) {
      image[i] = req.files[i].filename;
    }
    await Category.findOneAndUpdate(
      { categoryName: req.body.category },
      { $inc: { product_count: 1 } }
    );

    const discount = req.body.discount;
    const price = req.body.price;
    if (discount > 0) {
      let discountedPrice = Math.round(price - (price * discount) / 100);
      const product = new Product({
        productName: req.body.name,
        price: discountedPrice,
        discount: req.body.discount,
        image: image,
        category: req.body.category,
        stock: req.body.stock,
        status: true,
        description: req.body.description,
      });
      const productData = await product.save();
      if (productData) {
        res.redirect("/admin/productList");
      }
    } else {
      const product = new Product({
        productName: req.body.name,
        price: price,
        discount: req.body.discount,
        image: image,
        category: req.body.category,
        stock: req.body.stock,
        status: true,
        description: req.body.description,
      });
      const productData = await product.save();
      if (productData) {
        res.redirect("/admin/productList");
      }
    }

    // await Category.updateOne({categoryName:req.body.category},{$set:{product_count:}})
  } catch (error) {
    console.log(error);
  }
};

const getActionProduct = async (req, res) => {
  try {
    const id = req.query.id;
    const productData = await Product.findOne({ _id: id });
    if (productData.status === true) {
      const data = await Product.findByIdAndUpdate(id, { status: false });
      if (data) {
        res.redirect("/admin/productList");
      }
    } else {
      const data = await Product.findByIdAndUpdate(id, { status: true });
      if (data) {
        res.redirect("/admin/productList");
      }
    }
  } catch (error) {
    console.log(error);
  }
};

const getEditProduct = async (req, res) => {
  try {
    const id = req.query.id;
    const productData = await Product.findOne({ _id: id })
      .populate("category")
      .exec();
    const catData = await Category.find();
    if (productData) {
      res.render("admin/editProduct", {
        product: productData,
        category: catData,
      });
    } else {
      res.redirect("admin/dashboard");
    }
  } catch (error) {
    console.log(error);
  }
};

const deleteSingleImage = async (req, res) => {
  try {
    const position = req.body.position;
    const id = req.body.id;
    const productImage = await Product.findById(id);

    const image = productImage.image[position];
    const data = await Product.updateOne(
      { _id: id },
      {
        $pullAll: {
          image: [image],
        },
      }
    );

    if (data) {
      res.json({ success: true });
    }
    res.redirect("/admin/productList");
  } catch (error) {
    console.log(error.message);
  }
};

const postEditProduct = async (req, res) => {
  const id = req.query.id;
  const data = await Product.findOne({ _id: id });
  const catData = data.category;
  if (catData != req.body.category) {
    await Category.findOneAndUpdate(
      { categoryName: req.body.category },
      { $inc: { product_count: 1 } }
    );
    await Category.findOneAndUpdate(
      { categoryName: catData },
      { $inc: { product_count: -1 } }
    );
  }
  try {
    const image = [];
    for (let i = 0; i < req.files.length; i++) {
      image[i] = req.files[i].filename;
      await Product.updateOne({ _id: id }, { $push: { image: image[i] } });
    }

    const discount = parseInt(req.body.discount);
    const price = req.body.price;
    if (discount > 0) {
      let discountedPrice = Math.ceil(price - (price * discount) / 100);

      await Product.findByIdAndUpdate(id, {
        productName: req.body.name,
        price: discountedPrice,
        discount: req.body.discount,
        category: req.body.category,
        stock: req.body.stock,
        description: req.body.description,
      });
    } else {
      await Product.updateOne(
        { _id: id },
        {
          $set: {
            productName: req.body.name,
            price: price,
            discount: req.body.discount,
            category: req.body.category,
            stock: req.body.stock,
            description: req.body.description,
          },
        }
      );
    }
    res.redirect("/admin/productList");
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  getProductManagement,
  getAddProduct,
  postAddProduct,
  getActionProduct,
  getEditProduct,
  postEditProduct,
  deleteSingleImage,
};
