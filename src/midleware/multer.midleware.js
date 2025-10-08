const multer = require("multer");

/**
 *title : image store
 *@desc : now it will take the image in storage
 */

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/temp");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

const upload = multer({
  storage: storage,
});
module.exports = { upload };
