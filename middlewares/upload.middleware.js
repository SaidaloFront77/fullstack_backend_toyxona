const multer = require('multer');
const path = require('path');

// Rasmlar uchun saqlash konfiguratsiyasi
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, '/uploads');
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + file.originalname;
    cb(null, uniqueName);
  }
});

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (ext === '.jpg' || ext === '.jpeg' || ext === '.png') {
    cb(null, true);
  } else {
    cb(new Error('Faqat .jpg, .jpeg, .png fayllar qabul qilinadi'), false);
  }
};

const upload = multer({
  storage,
  fileFilter
});

module.exports = upload;
