const express = require("express")
const {
  createUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  deleteUser,
} = require("../controller/user")
const { verifyHash } = require("../middleware/verifyHash")

const router = express.Router()

router.post("/new-user", createUser)
router.post("/login-user", loginUser)
router.get("/user-profile", verifyHash, getUserProfile)
router.put("/update-user-profile/", verifyHash, updateUserProfile)
router.delete("/delete-user/", verifyHash, deleteUser)

module.exports = router
