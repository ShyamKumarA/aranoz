const mongoose = require("mongoose");

const categorySchema = mongoose.Schema({
  categoryName: {
    type: String,
    required: true,
  },
  is_blocked: {
    type: Boolean,
    required: true,
    default: false,
  },
  product_count: {
    type: Number,
    default: 0,
  },
  discount: {
    type: Number,
    default: 0,
  },
});

module.exports = mongoose.model("category", categorySchema);
