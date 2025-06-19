const express = require('express');
const router = express.Router();
const verifyToken = require('../middlewares/auth.middleware');
const { getOwnBronlar, getMyToyxona, updateMyToyxona, deleteOwnerBron, getMyToyxonalar} = require('../controllers/owner.controller');

router.get('/bronlar', verifyToken, getOwnBronlar);
router.get('/my-toyxona', verifyToken, getMyToyxona);  // To’yxona ma’lumotlarini olish
router.put('/my-updatetoyxona', verifyToken, updateMyToyxona);  // To’yxona ma’lumotlarini yangilash
router.delete('/bronlar/:id', verifyToken, deleteOwnerBron);  // Bronni o’chirish
router.get('/my-toyxonalar', verifyToken, getMyToyxonalar);

module.exports = router;
