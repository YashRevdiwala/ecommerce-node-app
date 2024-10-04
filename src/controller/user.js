const { promiseConnection, connection } = require("../lib/connection")
const { codes } = require("../lib/statusCodes")
const { encryt, decrypt, tokenGenerator } = require("../lib/encrypt")
const {
  createQuery,
  updateQuery,
  deleteQuery,
  getByFieldQuery,
} = require("../lib/query")

const createUser = async (req, res) => {
  const { name, email, mobile, password } = req.body

  try {
    const query = createQuery(
      "users(name, email, mobile, password) VALUES(?, ?, ?, ?)"
    )
    const hashedPassword = encryt(password)

    connection.query(
      query,
      [name, email, mobile, hashedPassword],
      (err, rows) => {
        if (err) {
          return res.status(codes.BadRequest).json({ err })
        }
        return res
          .status(codes.OK)
          .json({ message: "User created successfully" })
      }
    )
  } catch (error) {
    return res.status(codes.ServerError).json({ error })
  }
}

const loginUser = async (req, res) => {
  const { email, password } = req.body

  try {
    const query = getByFieldQuery("users", "email = ?")

    connection.query(query, [email], async (err, rows) => {
      if (err) {
        return res.status(codes.BadRequest).json({ err })
      }
      const match = await decrypt(password, rows[0].password)
      if (match) {
        const userToken = tokenGenerator({ userToken: rows[0].id })
        const hashedToken = await encryt(userToken, 7)

        res.set("htuid", hashedToken)
        res.set("userToken", userToken)
        return res
          .status(codes.OK)
          .json({ message: "User authenticated successfully" })
      } else {
        return res
          .status(codes.Unauthorised)
          .json({ message: "Invalid password" })
      }
    })
  } catch (error) {
    return res.status(codes.ServerError).json({ error })
  }
}

const getUserProfile = async (req, res) => {
  const token = req.userToken

  try {
    const query = getByFieldQuery("users", "id =?")

    connection.query(query, [token], (err, rows) => {
      if (err) {
        return res.status(codes.BadRequest).json({ err })
      } else {
        return res.status(codes.OK).json(rows[0])
      }
    })
  } catch (error) {
    return res.status(codes.ServerError).json({ error })
  }
}

const updateUserProfile = async (req, res) => {
  const token = req.userToken

  try {
    const { name, email, mobile } = req.body

    const query = updateQuery("users", "name=?, email=?, mobile=? WHERE id=?")

    connection.query(query, [name, email, mobile, token], (err, result) => {
      if (err) {
        return res.status(codes.BadRequest).json({ err })
      }
      return res.status(codes.OK).json({ message: "User updated successfully" })
    })
  } catch (error) {
    return res.status(codes.ServerError).json({ error })
  }
}

const deleteUser = async (req, res) => {
  const token = req.userToken

  try {
    const query = deleteQuery("users WHERE id=?")

    const result = await promiseConnection.query(query, [token])
    if (result[0].affectedRows > 0) {
      return res.status(codes.OK).json({ message: "User deleted successfully" })
    } else {
      return res.status(codes.NotFound).json({ message: "User not found" })
    }
  } catch (error) {
    return res.status(codes.ServerError).json({ error })
  }
}

module.exports = {
  createUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  deleteUser,
}
