const jwt = require("jsonwebtoken")
const dotenv = require("dotenv")

dotenv.config()

const envFileName = `./env/.env.${process.env.NODE_ENV || "development"}`
dotenv.config({ path: envFileName })

const tokenAuth = async (req, res, next) => {
  const token = req.headers.authorization
  if (!token) {
    return res.status(401).json({ message: "Access Denied" })
  }
  try {
    const token = req.headers.authorization.split(" ")[1]
    jwt.verify(token, process.env.JWT_SECRET_KEY)

    next()
  } catch (error) {
    return res.status(403).json({ message: "Invalid Token" })
  }
}

exports.tokenAuth = tokenAuth
