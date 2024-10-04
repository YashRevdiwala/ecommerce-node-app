const express = require("express")
const routes = require("./routes/")
const { initEnv } = require("./lib/env")
const { tokenAuth } = require("./middleware/authToken")

initEnv()

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
