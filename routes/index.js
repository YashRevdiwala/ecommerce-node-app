const express = require("express")
const { generateAuthToken } = require("../lib/generateAuthToken")
const productRoutes = require("./product")
const userRoutes = require("./user")
const cartRoutes = require("./cart")
const orderRoutes = require("./order")

const router = express.Router()

router.use("/product", productRoutes)
router.use("/user", userRoutes)
router.use("/cart", cartRoutes)
router.use("/order", orderRoutes)
router.post(
  "/protected-auth-generation/generate-secret-token",
  generateAuthToken
)

module.exports = router
