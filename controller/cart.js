const { promiseConnection, connection } = require("../lib/connection")
const { codes } = require("../lib/statusCodes")
const {
  createQuery,
  updateQuery,
  deleteQuery,
  getByFieldQuery,
  getQuery,
} = require("../lib/query")

const addToCart = async (req, res) => {
  const { quantity } = req.body
  const { productId } = req.params
  const token = req.userToken

  try {
    const query = getByFieldQuery("cart", "userId =? AND productId =?")

    connection.query(query, [token, productId], async (err, rows) => {
      if (err) {
        return res.status(codes.BadRequest).json({ err })
      }

      const createCartQuery =
        rows.length > 0
          ? updateQuery(
              "cart",
              "quantity=? WHERE userId=? AND productId=? AND quantity=?"
            )
          : createQuery("cart(userId, productId, quantity) VALUES(?, ?, ?)")

      const params =
        rows.length > 0
          ? [quantity, token, productId, rows[0].quantity]
          : [token, productId, quantity]

      connection.query(createCartQuery, params, (err, result) => {
        if (err) {
          return res
            .status(codes.BadRequest)
            .json({ message: "Product not added to cart", err })
        }
        return res.status(codes.OK).json({ message: "Product added to cart" })
      })
    })
  } catch (error) {
    return res.status(codes.ServerError).json({ error })
  }
}

const getCart = async (req, res) => {
  const token = req.userToken

  try {
    const query = getQuery(
      "cart CROSS JOIN product WHERE cart.productId = product.id AND cart.userId=?"
    )

    connection.query(query, [token], (err, rows) => {
      if (err) {
        return res
          .status(codes.BadRequest)
          .json({ message: "Cart data not found", err })
      }
      return res.status(codes.OK).json({ cartData: rows })
    })
  } catch (error) {
    return res.status(codes.ServerError).json({ error })
  }
}

const updateCart = async (req, res) => {
  const { id } = req.params
  const { quantity, productId } = req.body
  const token = req.userToken

  try {
    const query =
      quantity === "0"
        ? deleteQuery("cart WHERE id=? AND userId=? AND productId=?")
        : updateQuery(
            "cart",
            "quantity=? WHERE userId=? AND productId=? AND id=?"
          )
    const params =
      quantity === "0"
        ? [id, token, productId]
        : [quantity, token, productId, id]

    connection.query(query, params, (err, result) => {
      if (err) {
        return res
          .status(codes.BadRequest)
          .json({ message: "Can't update Product in cart", err })
      }
      return res.status(codes.OK).json({ message: "Cart Updated" })
    })
  } catch (error) {
    return res.status(codes.ServerError).json({ error })
  }
}

const deleteFromCart = async (req, res) => {
  const { productId } = req.params
  const token = req.userToken

  try {
    const query = deleteQuery("cart WHERE userId=? AND productId=?")

    await promiseConnection.query("START TRANSACTION")
    const result = await promiseConnection.query(query, [token, productId])

    if (result[0].affectedRows > 0) {
      await promiseConnection.query("COMMIT")
      return res.status(codes.OK).json({ message: "Product deleted from cart" })
    } else {
      await promiseConnection.query("ROLLBACK")
      return res
        .status(codes.NotFound)
        .json({ message: "Product not found in cart" })
    }
  } catch (error) {
    return res.status(codes.ServerError).json({ error })
  }
}

module.exports = {
  addToCart,
  getCart,
  updateCart,
  deleteFromCart,
}
