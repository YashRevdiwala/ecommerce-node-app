const { promiseConnection, connection } = require("../lib/connection")
const { codes } = require("../lib/statusCodes")
const {
  getQuery,
  createQuery,
  updateQuery,
  deleteQuery,
  getByFieldQuery,
} = require("../lib/query")

const getProducts = async (req, res) => {
  try {
    const query = getQuery(
      "product CROSS JOIN product_details WHERE product.id = product_details.productId"
    )

    connection.query(query, (err, rows) => {
      if (err) {
        return res
          .status(codes.BadRequest)
          .json({ message: "No Products available", error: err })
      }
      return res.status(codes.OK).json({ products: rows })
    })
  } catch (error) {
    return res.status(500).json({ error: error.message })
  }
}

const getProductById = async (req, res) => {
  const { id } = req.params

  try {
    const query = getQuery(
      "product CROSS JOIN product_details WHERE product.id = product_details.productId AND product.id=?"
    )

    connection.query(query, [id], (err, rows) => {
      if (err) {
        return res
          .status(codes.ServerError)
          .json({ message: "Product not found", error: err })
      }
      return res.status(codes.OK).json({ product: rows[0] })
    })
  } catch (error) {
    return res.status(codes.ServerError).json({ error: error.message })
  }
}

const getProductsByCat = async (req, res) => {
  const { cat, subcat } = req.params

  try {
    const query =
      subcat === undefined
        ? getQuery(
            "product CROSS JOIN product_details WHERE product.id = product_details.productId AND product.catSlug=?"
          )
        : getQuery(
            "product CROSS JOIN product_details WHERE product.id = product_details.productId AND product.catSlug=? AND product.subCatSlug=?"
          )

    const params = subcat === undefined ? [cat] : [cat, subcat]

    connection.query(query, params, (err, rows) => {
      if (err) {
        return res
          .status(codes.BadRequest)
          .json({ message: "Product Data not found", error: err })
      }
      return res.status(codes.OK).json({ products: rows })
    })
  } catch (error) {
    return res.status(codes.ServerError).json({ error: error.message })
  }
}

const createProduct = async (req, res) => {
  const { title, description, brand, catSlug, subCatSlug, size, color } =
    req.body
  const filePath = req.file.path

  try {
    const query = createQuery(
      "product (img, title, description, brand, catSlug, subCatSlug) VALUES (?,?,?,?,?,?)"
    )

    await promiseConnection.query("START TRANSACTION")
    const [result] = await promiseConnection.query(query, [
      filePath,
      title,
      description,
      brand,
      catSlug,
      subCatSlug,
    ])
    if (result.affectedRows > 0) {
      const productId = result.insertId
      const query = createQuery(
        "product_details (productId, size, color) VALUES (?,?,?)"
      )

      const [productDetails] = await promiseConnection.query(query, [
        productId,
        size,
        color,
      ])

      if (productDetails.affectedRows > 0) {
        await promiseConnection.query("COMMIT")
        return res
          .status(codes.OK)
          .json({ message: "Product created successfully" })
      } else {
        await promiseConnection.query("ROLLBACK")
        return res
          .status(codes.BadRequest)
          .json({ error: "Failed to create product" })
      }
    }
    return res
      .status(codes.BadRequest)
      .json({ error: "Failed to create product" })
  } catch (error) {
    return res.status(500).json({ error: error.message })
  }
}

const updateProduct = async (req, res) => {
  const { id } = req.params
  const { title, description, brand, catSlug, subCatSlug, size, color } =
    req.body

  try {
    const query = updateQuery(
      "product",
      "title=?, description=?, brand=?, catSlug=?, subCatSlug=? WHERE id=?"
    )

    await promiseConnection.query("START TRANSACTION")
    const [result] = await promiseConnection.query(query, [
      title,
      description,
      brand,
      catSlug,
      subCatSlug,
      id,
    ])

    if (result.affectedRows === 0) {
      await promiseConnection.query("ROLLBACK")
      return res
        .status(codes.BadRequest)
        .json({ error: "Failed to update product" })
    } else {
      const query = updateQuery(
        "product_details",
        "size=?, color=? WHERE productId=?"
      )
      const [details] = await promiseConnection.query(query, [size, color, id])

      if (details.affectedRows === 0) {
        await promiseConnection.query("ROLLBACK")
        return res
          .status(codes.BadRequest)
          .json({ error: "Failed to update product" })
      } else {
        await promiseConnection.query("COMMIT")
        return res.json({ message: "Product updated successfully" })
      }
    }
  } catch (error) {
    return res.status(500).json({ error: error.message })
  }
}

const deleteProduct = async (req, res) => {
  const { id } = req.params

  try {
    const query = deleteQuery("product WHERE id=?")

    await promiseConnection.query("START TRANSACTION")
    const [result] = await promiseConnection.query(query, [id])

    if (result.affectedRows === 0) {
      await promiseConnection.query("ROLLBACK")
      return res.status(400).json({ error: "Failed to delete product" })
    } else {
      await promiseConnection.query("COMMIT")
      return res.json({ message: "Product deleted successfully" })
    }
  } catch (error) {
    return res.status(500).json({ error: error.message })
  }
}

const createCategories = async (req, res) => {
  const { name, slug } = req.body
  try {
    const query = getByFieldQuery("categories", "name=? AND slug=?")
    connection.query(query, [name, slug], (err, rows) => {
      if (err) {
        return res.status(codes.ServerError).json({ error: err.message })
      }
      if (rows.length > 0) {
        return res
          .status(codes.BadRequest)
          .json({ error: "Category already exists" })
      } else {
        const query = createQuery("categories (name, slug) VALUES (?,?)")
        connection.query(query, [name, slug], (err, result) => {
          if (err) {
            return res.status(codes.ServerError).json({ error: err.message })
          }
          if (result.affectedRows > 0) {
            return res
              .status(codes.OK)
              .json({ message: "Category created successfully" })
          }
        })
      }
    })
  } catch (error) {
    return res.status(codes.ServerError).json({ error: error.message })
  }
}

const createSubCategories = async (req, res) => {
  const { name, slug, catSlug } = req.body

  try {
    const query = getByFieldQuery("categories", "slug=?")
    const [rows] = await promiseConnection.query(query, [catSlug])
    if (rows.length === 0) {
      return res.status(codes.NotFound).json({ error: "Category not found" })
    } else {
      const query = getByFieldQuery("sub_categories", "name=? AND slug=?")
      const [subCat] = await promiseConnection.query(query, [name, slug])

      if (subCat.length > 0) {
        return res
          .status(codes.BadRequest)
          .json({ error: "Sub-Category already exists" })
      } else {
        const query = createQuery(
          "sub_categories (name, slug, catSlug) VALUES (?,?,?)"
        )

        await promiseConnection.query("START TRANSACTION")
        const [result] = await promiseConnection.query(query, [
          name,
          slug,
          rows[0].slug,
        ])

        if (result.affectedRows > 0) {
          await promiseConnection.query("COMMIT")
          return res
            .status(codes.OK)
            .json({ message: "Sub-Category created successfully" })
        } else {
          await promiseConnection.query("ROLLBACK")
          return res
            .status(codes.BadRequest)
            .json({ error: "Failed to create sub-category" })
        }
      }
    }
  } catch (error) {
    return res.status(codes.ServerError).json({ error: error.message })
  }
}

const getCatAndSubCat = async (req, res) => {
  try {
    const catQuery = getQuery("categories")
    const subCatQuery = getQuery("sub_categories")

    const [catRows] = await promiseConnection.query(catQuery)
    const [subCatRows] = await promiseConnection.query(subCatQuery)

    if (catRows.length === 0 && subCatRows.length === 0) {
      return res.status(codes.BadRequest).json({ message: "No data found" })
    }
    if (catRows.length === 0 && subCatRows.length !== 0) {
      return res.status(codes.OK).json({ subCat: subCatRows })
    }
    if (catRows.length !== 0 && subCatRows.length === 0) {
      return res.status(codes.OK).json({ cat: catRows })
    }

    return res.status(codes.OK).json({ cat: catRows, subCat: subCatRows })
  } catch (error) {
    return res.status(codes.ServerError).json({ error: error.message })
  }
}

module.exports = {
  getProducts,
  getProductById,
  getProductsByCat,
  createProduct,
  updateProduct,
  deleteProduct,
  createCategories,
  createSubCategories,
  getCatAndSubCat,
}
