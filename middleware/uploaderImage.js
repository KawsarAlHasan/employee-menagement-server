const fs = require("fs");
const path = require("path");
const multer = require("multer");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = path.join(__dirname, "public/images");

    // Check if the directory exists, if not create it
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    cb(null, dir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const fileName = file.originalname.replace(/\s+/g, "-").toLowerCase();
    cb(null, uniqueSuffix + "_" + fileName);
  },
});

const uploadImage = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    const supportedImage = /png|jpg|jpeg/;
    const extension = path.extname(file.originalname).toLowerCase();

    if (supportedImage.test(extension)) {
      cb(null, true);
    } else {
      cb(new Error("Must be png/jpg/jpeg image"));
    }
  },
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB limit
});

module.exports = uploadImage;
