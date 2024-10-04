const express = require("express")
const {
  addToCart,
  getCart,
  updateCart,
  deleteFromCart,
} = require("../controller/cart")
const { verifyHash } = require("../middleware/verifyHash")

const router = express.Router()

router.post("/add-to-cart/:productId", verifyHash, addToCart)
router.get("/get-cart", verifyHash, getCart)
router.put("/update-cart-product/:id", verifyHash, updateCart)
router.delete("/delete-cart-product/:productId", verifyHash, deleteFromCart)

module.exports = router
