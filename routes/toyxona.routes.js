const express = require("express");
const router = express.Router();
const path = require("path");
const multer = require("multer");
const verifyToken = require("../middlewares/auth.middleware");

const {
  uploadImages,
  getFilteredToyxonalar,
  getOneToyxona,
} = require("../controllers/toyxona.controller");

const { getBookedDates } = require("../controllers/bron.controller"); // ✅ To‘g‘ri import

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    const uniqueName = Date.now() + "-" + file.originalname;
    cb(null, uniqueName);
  }
});
const upload = multer({ storage });

// ROUTES
router.get('/:id/booked-dates', getBookedDates);
router.get('/:id', getOneToyxona);
router.get('/', getFilteredToyxonalar);
router.post('/upload-images', verifyToken, upload.array('images', 5), uploadImages);




module.exports = router;
