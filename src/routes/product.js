const express = require("express")
const { tokenAuth } = require("../middleware/authToken")
const { verifyHash } = require("../middleware/verifyHash")
const upload = require("../middleware/fileUpload")
const {
  getProducts,
  getProductById,
  getProductsByCat,
  createProduct,
  updateProduct,
  deleteProduct,
  createCategories,
  createSubCategories,
  getCatAndSubCat,
} = require("../controller/product")

const router = express.Router()

router.get("/all-products", getProducts)
router.get("/get-product/:id", getProductById)
router.get("/products/:cat/:subcat?", getProductsByCat)
router.post(
  "/new-product",
  verifyHash,
  tokenAuth,
  upload.single("img"),
  createProduct
)
router.put(
  "/update-product/:id",
  verifyHash,
  tokenAuth,
  upload.any("img"),
  updateProduct
)
router.delete("/delete-product/:id", verifyHash, tokenAuth, deleteProduct)
router.post("/new-category", verifyHash, tokenAuth, createCategories)
router.post("/new-subcategory", verifyHash, tokenAuth, createSubCategories)
router.get("/all-catergories-subcategories", getCatAndSubCat)

module.exports = router
