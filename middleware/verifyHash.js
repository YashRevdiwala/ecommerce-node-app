const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const { codes } = require("../lib/statusCodes")

const verifyHash = async (req, res, next) => {
  const token = req.headers.authorization.split(" ")[1]
  const hashedToken = req.headers.htuid

  if (!token || !hashedToken) {
    return res.status(codes.BadRequest).json({ error: "Missing token" })
  }

  try {
    const verifyHashToken = await bcrypt.compare(token, hashedToken)

    if (verifyHashToken) {
      const decodedUserToken = await jwt.verify(
        token,
        process.env.JWT_SECRET_KEY
      )
      req.userToken = decodedUserToken.userToken
      next()
    } else {
      return res.status(codes.Unauthorised).json({ error: "Unauthorised" })
    }
  } catch (error) {
    return res.status(codes.ServerError).json({ error: error })
  }
}

exports.verifyHash = verifyHash
