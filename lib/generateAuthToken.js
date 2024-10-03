const jwt = require("jsonwebtoken")
const dotenv = require("dotenv")
const bcrypt = require("bcryptjs")
const crypto = require("crypto")
const { codes } = require("../lib/statusCodes")

dotenv.config()

const envFileName = `./env/.env.${process.env.NODE_ENV || "development"}`
dotenv.config({ path: envFileName })

const generateAuthToken = async (req, res) => {
  const id = crypto.randomUUID()
  const token = jwt.sign(id, process.env.JWT_SECRET_KEY)
  const hashedToken = await bcrypt.hash(token, 7)
  res.set("authorization", "Bearer " + token)
  res.set("htuid", hashedToken)
  res.status(codes.OK).json({ message: "Token generated successfully" })
}

exports.generateAuthToken = generateAuthToken
