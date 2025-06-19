const express = require('express');
const router = express.Router();
const verifyToken = require('../middlewares/auth.middleware');
const { createBron, getBookedDates } = require('../controllers/bron.controller');
const { deleteBron } = require('../controllers/bron.controller');
const { getMyBronlar} = require('../controllers/bron.controller');
const { getAllBronlar } = require('../controllers/bron.controller');


// Foydalanuvchi bron qiladi
router.post('/', verifyToken, createBron);
router.get('/:id/booked-dates', getBookedDates);
router.delete('/:id', verifyToken, deleteBron);
router.get('/my', verifyToken, getMyBronlar);
router.delete('/:id', verifyToken, deleteBron);
router.delete('/bron/:id', verifyToken, deleteBron);
router.get('/admin/bronlar', verifyToken, getAllBronlar);
router.get('/', verifyToken, getAllBronlar);




module.exports = router;
