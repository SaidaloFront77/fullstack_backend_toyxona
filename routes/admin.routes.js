  const express = require('express');
  const router = express.Router();
  const verifyToken = require('../middlewares/auth.middleware');
  const upload = require('../middlewares/upload'); // multer config

  const {
    addToyxona,
    addOwner,
    confirmToyxona,
    deleteToyxona,
    updateToyxona,
    getAllOwners,
    getAllBronlar,
    getSingleToyxonaWithBronlar,
    getAllToyxonalar,
    getAdminFilteredToyxonalar,
    deleteOwner,
  } = require('../controllers/admin.controller');

  // ✅ Admin to‘yxona qo‘shadi (rasm bilan)
  router.post('/toyxona', verifyToken, upload.array('images'), addToyxona);
  router.patch('/toyxona/:id/status', verifyToken, confirmToyxona);
  router.delete('/toyxona/:id', verifyToken, deleteToyxona);
  router.put('/toyxona/:id', verifyToken, upload.array('images'), updateToyxona);
  router.get('/toyxona/:id', verifyToken, getSingleToyxonaWithBronlar);
  router.get('/owners', verifyToken, getAllOwners);
  router.get('/bronlar', verifyToken, getAllBronlar);
  router.get('/toyxona', verifyToken, getAllToyxonalar);
  router.get('/toyxonalar/filter', verifyToken, getAdminFilteredToyxonalar);

  // ✅ To‘yxona egasini qo‘shish
  router.post('/owner', verifyToken, addOwner);
  router.delete('/owners/:id',  deleteOwner); 



  module.exports = router;
