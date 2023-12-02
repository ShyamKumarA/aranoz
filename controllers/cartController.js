const User = require("../models/userModel");
const Product = require("../models/productModel");
const Cart = require("../models/cartModel");

const loadCart = async (req, res) => {
  try {
    const userData = await User.findOne({ _id: req.session.user_id });
    const cartData = await Cart.findOne({
      userId: req.session.user_id,
    }).populate("products.productId");
    //const data=await Cart.findOne({userId:req.session.user_id}).populate("products")

    if (req.session.user_id) {
      if (cartData) {
        if (cartData.products.length > 0) {
          const products = cartData.products;
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
          const userId = userData._id;

          let customer = true;
          res.render("cart", {
            customer,
            count: "",
            userData,
            products,
            Total,
            userId,
          });
        } else {
          let customer = true;
          res.render("cartEmpty", {
            customer,
            userData,
            message: "No Products added to cart",
            count: "",
          });
        }
      } else {
        let customer = true;
        res.render("cartEmpty", {
          customer,
          userData,
          message: "No products added to cart",
          count: "",
        });
      }
    } else {
      res.redirect("login");
    }
  } catch (error) {
    console.log(error);
  }
};

const postCart = async (req, res) => {
  try {
    const productId = req.body.query;
    const userData = await User.findOne({ _id: req.session.user_id });
    const productData = await Product.findOne({ _id: productId });

    if (req.session.user_id) {
      const userId = req.session.user_id;
      const cartData = await Cart.findOne({ userId: userId });
      if (cartData) {
        const productExist = await cartData.products.findIndex(
          (product) => product.productId == productId
        );
        if (productExist != -1) {
          await Cart.updateOne(
            { userId: userId, "products.productId": productId },
            { $inc: { "products.$.count": 1 } }
          );
          const productCount=await (cartData.products).length;
          console.log(productCount);
          res.json({ success: true });
        } else {
          await Cart.findOneAndUpdate(
            { userId: req.session.user_id },
            {
              $push: {
                products: {
                  productId: productId,
                  productPrice: productData.price,
                  totalPrice: productData.price,
                },
              },
            }
          );
          const productCount=await (cartData.products).length;
          console.log(productCount);
          res.json({ success: true,count:productCount });
        }
      } else {
        const cart = new Cart({
          userId: userData._id,
          userName: userData.username,
          products: [
            {
              productId: productId,
              productPrice: productData.price,
              totalPrice: productData.price,
            },
          ],
        });
        const cartData = await cart.save();
        if (cartData) {
        } else {
          res.redirect("/home");
        }
      }
    } else {
      res.json({ success: false });
    }
  } catch (error) {
    console.log(error);
  }
};

const incrementQty = async (req, res, next) => {
  try {
    const user = req.session.user_id;

    const { id, proId, price, i, qty } = req.body;
    const productId = req.query.id;
    if (i === 1) {
      if (req.session.user_id) {
        const userId = req.session.user_id;
        const cartData = await Cart.findOne({ userId: userId });
        const productData = await Product.findOne({ _id: productId });
        const priceOfOne = productData.price;
        if (productData.stock > 0) {
          if (productData.status) {
            if (cartData) {
              const exist = cartData.products.filter(
                (value) => value.productId.toString() == productId
              );
              if (exist.length !== 0) {
                if (exist[0].count < productData.stock) {
                  let resl = await Cart.findOneAndUpdate(
                    { userId: userId, "products.productId": productId },
                    {
                      $inc: {
                        "products.$.count": 1,
                        "products.$.totalPrice": productData.price,
                      },
                      $set: { updatedOn: Date.now() },
                    }
                  );
                  res.status(200).json({
                    success: true,
                    message: "Product added to cart",
                    priceOfOne,
                  });
                } else {
                  res
                    .status(200)
                    .json({ success: false, message: "Reached the limit" });
                }
              }
            }
          } else {
            res.redirect("/");
          }
        } else {
          res
            .status(200)
            .json({ success: false, message: "Product Not available" });
        }
      }
    } else if (i === -1) {
      if (req.session.user_id) {
        const userId = req.session.user_id;
        const cartData = await Cart.findOne({ userId: userId });
        const productData = await Product.findOne({ _id: productId });
        const priceOfOne = productData.price;
        if (productData.stock > 0) {
          if (productData.status) {
            if (cartData) {
              const exist = cartData.products.filter(
                (value) => value.productId.toString() == productId
              );
              if (exist[0].count > 1) {
                let resl = await Cart.findOneAndUpdate(
                  { userId: userId, "products.productId": productId },
                  {
                    $inc: {
                      "products.$.count": -1,
                      "products.$.totalPrice": -priceOfOne,
                    },
                    $set: { updatedOn: Date.now() },
                  }
                );
                res.status(200).json({
                  success: true,
                  message: "Product reduced to cart",
                  priceOfOne,
                });
              } else {
                res
                  .status(200)
                  .json({ success: false, message: "min 1 product" });
              }
            }
          } else {
            res.redirect("/");
          }
        } else if (productData.stock == 0) {
          await Cart.updateOne(
            { userId: userId, "products._id": productId },
            { $pull: { products: { _id: productId } } }
          ).then((data) => {
            res.redirect("/cart");
          });
          // res.status(200).json({ success: false, message: 'Product Not available' });
        }
      }
    }
  } catch (error) {
    console.log(error);
  }
};

// const changeProductCount = async (req, res) => {
//   try {
//     const userId = req.body.user_id;
//     const proId = req.body.product;
//     let count = req.body.count;
//     count = parseInt(count);
//     const cartData = await Cart.findOne({ userId: userId });

//     // Find the index of the product in the cart
//     const productIndex = cartData.products.findIndex(
//       (product) => product.productId.toString() === proId
//     );

//     if (productIndex === -1) {
//       // Product not found in cart, handle this case as needed
//       return res.json({ error: 'Product not found in cart' });
//     }

//     const productData = await Product.findOne({ _id: proId });

//     if (productData.stock < count) {
//       res.json({ check: true });
//     } else {
//       res.json({ success: true });
//       let changeTotal = productData.price * count;

//       // Update the specific product in the cart
//       cartData.products[productIndex].count = count;
//       cartData.products[productIndex].totalPrice = changeTotal;

//       await cartData.save();
//     }
//   } catch (error) {
//     console.log(error.message);
//   }
// };

const removeProduct = async (req, res) => {
  try {
    const user = req.session.user_id;
    const id = req.query.id;
    await Cart.updateOne(
      { userId: user },
      { $pull: { products: { productId: id } } }
    );
    res.redirect("/cart");
  } catch (error) {
    console.log(error.message);
  }
};

module.exports = {
  loadCart,
  postCart,
  removeProduct,
  incrementQty,
};
