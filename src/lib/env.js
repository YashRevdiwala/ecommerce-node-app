const dotenv = require("dotenv")

dotenv.config()

const initEnv = async () => {
  const envFileName = `./src/env/.env.${process.env.NODE_ENV || "development"}`
  dotenv.config({ path: envFileName })
}

module.exports = { initEnv }
