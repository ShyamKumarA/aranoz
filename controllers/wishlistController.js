const Wishlist = require("../models/wishlistModel");
const Product = require("../models/productModel");
const Cart = require("../models/cartModel");
const User = require("../models/userModel");

const addToWishlist = async (req, res) => {
  try {
    const proId = req.body.query;
    const user = await User.findOne({ _id: req.session.user_id });
    const productData = await Product.findOne({ _id: proId });
    const wishlistData = await Wishlist.findOne({ user: req.session.user_id });
    if (wishlistData) {
      const checkWishlist = await wishlistData.products.findIndex(
        (wish) => wish.productId == proId
      );
      if (checkWishlist != -1) {
        res.json({ check: true });
      } else {
        await Wishlist.updateOne(
          { user: req.session.user_id },
          { $push: { products: { productId: proId } } }
        );
        res.json({ success: true });
      }
    } else {
      const wishlist = new Wishlist({
        user: req.session.user_id,
        userName: user.username,
        products: [
          {
            productId: productData._id,
          },
        ],
      });

      const wish = await wishlist.save();
      if (wish) {
        res.json({ success: true });
      }
    }
  } catch (error) {
    console.log(error.message);
  }
};

const loadWishlist = async (req, res) => {
  try {
    const wishlistData = await Wishlist.findOne({
      user: req.session.user_id,
    }).populate("products.productId");
    if (wishlistData) {
      const wish = wishlistData.products;
      if (req.session.user_id) {
        const customer = true;
        res.render("wishlist", { customer, wish, count: "" });
      } else {
        res.redirect("/");
      }
    } else {
      res.render("wishlist", { customer: true, wish: false, count: "" });
    }
  } catch (error) {
    console.log(error);
  }
};

const removewishProduct = async (req, res) => {
  try {
    const user = req.session.user_id;
    const id = req.query.id;
    await Wishlist.updateOne(
      { user: user },
      { $pull: { products: { productId: id } } }
    );
    res.redirect("/loadWishlist");
  } catch (error) {
    console.log(error.message);
  }
};

module.exports = {
  addToWishlist,
  loadWishlist,
  removewishProduct,
};
