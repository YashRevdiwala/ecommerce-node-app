const mysql = require("mysql2")
const dotenv = require("dotenv")

dotenv.config()

const envFileName = `./env/.env.${process.env.NODE_ENV || "development"}`
dotenv.config({ path: envFileName })

const connection = mysql.createPool(process.env.DB_URI)
const promiseConnection = connection.promise()

module.exports = { connection, promiseConnection }
