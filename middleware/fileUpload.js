const multer = require("multer")

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/assets/productImages")
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname)
  },
})

const upload = multer({
  storage,
  limits: { fileSize: 2000000 },
  fileFilter: (req, file, cb) => {
    const allowedFileTypes = ["image/jpeg", "image/jpg", "image/png"]

    if (allowedFileTypes.includes(file.mimetype)) {
      cb(null, true)
      return
    } else {
      cb(`${file.mimetype} is not supported`, false)
      return
    }
  },
})

module.exports = upload
