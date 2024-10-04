const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")

const encryt = async (data, salt = 10) => {
  const hashedData = await bcrypt.hash(await data, salt)
  return hashedData
}

const decrypt = async (data, hashedData) => {
  const match = await bcrypt.compare(data, hashedData)
  return match
}

const tokenGenerator = async (data) => {
  const token = jwt.sign(data, process.env.JWT_SECRET_KEY)
  return token
}

module.exports = { encryt, decrypt, tokenGenerator }
