const mysql = require("mysql2")
const { initEnv } = require("./env")

initEnv()

const connection = mysql.createPool(process.env.DB_URI)
const promiseConnection = connection.promise()

module.exports = { connection, promiseConnection }
