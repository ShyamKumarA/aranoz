const Product = require("../models/productModel");
const Category = require("../models/categoryModel");

const getShop = async (req, res) => {
  const productData = await Product.find();
  const catData = await Category.find();

  try {
    let search = req.query.search;
    if (search) {
      search = search;
    } else {
      search = null;
    }
    res.render("shop", {
      search,
      customer: "",
      count: "",
      products: productData,
      category: catData,
    });
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  getShop,
};
