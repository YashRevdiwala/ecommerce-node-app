const { connection, promiseConnection } = require("../lib/connection")
const { codes } = require("../lib/statusCodes")
const {
  createQuery,
  updateQuery,
  deleteQuery,
  getByFieldQuery,
} = require("../lib/query")

const createOrder = async (req, res) => {
  const token = req.userToken
  try {
    const query = getByFieldQuery("cart", "userId=?")

    await promiseConnection.query("START TRANSACTION")
    const [rows] = await promiseConnection.query(query, [token])

    if (rows.length > 0) {
      let query = createQuery(
        "orders(userId, productId, quantity, orderStatus) VALUES "
      )
      for (x = 0; x < rows.length; x++) {
        query += `(${token},${rows[x].productId},${rows[x].quantity},'confirmed'),`
      }
      await promiseConnection.query("START TRANSACTION")
      const [result] = await promiseConnection.query(query.slice(0, -1))

      if (result.affectedRows > 0) {
        const deleteCartQuery = deleteQuery("cart WHERE userId= ?")
        const [deleteCartResult] = await promiseConnection.query(
          deleteCartQuery,
          [token]
        )
        if (deleteCartResult.affectedRows > 0) {
          await promiseConnection.query("COMMIT")
          return res
            .status(codes.OK)
            .json({ message: "Order created successfully" })
        }
      }
    } else {
      await promiseConnection.query("ROLLBACK")
      return res
        .status(codes.BadRequest)
        .json({ message: "Can't create order" })
    }
  } catch (error) {
    return res.status(codes.ServerError).json({ error })
  }
}

const cancelOrder = async (req, res) => {
  try {
    const { orderId } = req.params
    const query = updateQuery("orders", "orderStatus=? WHERE id=?")

    connection.query(query, ["cancelled", orderId], (err, result) => {
      if (err) {
        return res
          .status(codes.BadRequest)
          .json({ message: "Failed to cancel order", err })
      } else {
        return res
          .status(codes.OK)
          .json({ message: "Order cancelled successfully" })
      }
    })
  } catch (error) {
    return res.status(codes.ServerError).json({ error })
  }
}

const trackOrder = async (req, res) => {
  const token = req.userToken
  const { orderId } = req.params

  try {
    const query =
      orderId === undefined
        ? getByFieldQuery("orders", "userId=?")
        : getByFieldQuery("orders", "userId=? AND id=?")
    const parameters = orderId === undefined ? [token] : [token, orderId]

    const [rows] = await promiseConnection.query(query, parameters)

    if (rows.length === 0) {
      return res.status(codes.NotFound).json({
        message: orderId === undefined ? "No orders found" : "Order not found",
      })
    } else {
      return res.status(codes.OK).json({ rows })
    }
  } catch (error) {
    return res.status(codes.ServerError).json({ error })
  }
}

const createOrderByProduct = async (req, res) => {
  const token = req.userToken
  const { productId, quantity } = req.params

  try {
    const query = getByFieldQuery("cart", "productId=? AND userId=?")

    await promiseConnection.query("START TRANSACTION")
    const [rows] = await promiseConnection.query(query, [productId, token])
    const createOrderQuery = createQuery(
      "orders(userId, productId, quantity, orderStatus) VALUES(?,?,?,?)"
    )
    const params =
      rows.length > 0
        ? [token, rows[0].productId, rows[0].quantity, "confirmed"]
        : [token, productId, quantity, "confirmed"]

    const result = await promiseConnection.query(createOrderQuery, params)
    if (result[0].affectedRows > 0) {
      if (rows.length > 0) {
        const deleteCartQuery = deleteQuery(
          "cart WHERE userId= ? AND productId=?"
        )
        const deleteCartResult = await promiseConnection.query(
          deleteCartQuery,
          [token, productId]
        )
        if (deleteCartResult[0].affectedRows > 0) {
          await promiseConnection.query("COMMIT")
          return res
            .status(codes.OK)
            .json({ message: "Order created successfully" })
        } else {
          await promiseConnection.query("ROLLBACK")
          return res
            .status(codes.BadRequest)
            .json({ message: "Failed to create order" })
        }
      } else {
        await promiseConnection.query("COMMIT")
        return res
          .status(codes.OK)
          .json({ message: "Order created successfully" })
      }
    }
  } catch (error) {
    return res.status(codes.ServerError).json({ error })
  }
}

module.exports = { createOrder, createOrderByProduct, cancelOrder, trackOrder }
