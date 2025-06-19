const express = require('express');
const router = express.Router();
const { getUserFilteredToyxonalar } = require('../controllers/user.controller');

// 🔥 TEST route
router.get('/', (req, res) => {
  res.send('User route ishlayapti!');
});

// 🔓 Ochiq (token talab qilmaydi) — foydalanuvchilar uchun
router.get('/public/toyxonalar', getUserFilteredToyxonalar);

module.exports = router;
