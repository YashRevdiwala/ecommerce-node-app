const express = require("express")
const { verifyHash } = require("../middleware/verifyHash")
const {
  createOrder,
  createOrderByProduct,
  cancelOrder,
  trackOrder,
} = require("../controller/order")

const router = express.Router()

router.post("/create-order", verifyHash, createOrder)
router.post(
  "/create-product-order/:productId/:quantity?",
  verifyHash,
  createOrderByProduct
)
router.put("/cancel-order/:orderId", verifyHash, cancelOrder)
router.get("/track-order/:orderId?", verifyHash, trackOrder)

module.exports = router
