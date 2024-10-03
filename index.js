const express = require("express")
const dotenv = require("dotenv")
const routes = require("./routes/")
const { tokenAuth } = require("./middleware/authToken")

dotenv.config()

const envFileName = `./env/.env.${process.env.NODE_ENV || "development"}`
dotenv.config({ path: envFileName })

const app = express()

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use("/assets/productImages", express.static("public/assets/productImages"))

app.get("/", tokenAuth, (req, res) => {
  res.json({ message: "Welcome" })
})

app.use("/api/v1/", routes)

app.listen(3000, () => {
  console.log("Server running on PORT:3000")
})
