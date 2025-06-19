const db = require('../config/config/db');
const bronModel = require('../models/bronModel');

const createBron = async (req, res) => {
  const { toyxona_id, count_people, date } = req.body;
  const user_id = req.user.id;

  try {
    // Sanani tekshirish: shu toyxona uchun sana bandmi?
    const check = await db.query(
      `SELECT 1 FROM bronlar WHERE toyxona_id = $1 AND date = $2`,
      [toyxona_id, date]
    );

    if (check.rows.length > 0) {
      return res.status(400).json({ msg: "Bu sana allaqachon band qilingan" });
    }

    const status = 'endi bo`ladigan';
    const result = await db.query(`
      INSERT INTO bronlar (toyxona_id, user_id, count_people, date, status)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *;
    `, [toyxona_id, user_id, count_people, date, status]);

    res.status(201).json({ msg: "Bron qilindi", bron: result.rows[0] });
  } catch (err) {
    res.status(500).json({ msg: "Xatolik", error: err.message });
  }
};
const deleteBron = async (req, res) => {
  const bronId = req.params.id;
  const user = req.user;

  try {
    // Avval bron mavjudligini tekshiramiz
    const bron = await db.query('SELECT * FROM bronlar WHERE id = $1', [bronId]);
    if (bron.rows.length === 0) {
      return res.status(404).json({ msg: "Bron topilmadi" });
    }

    // Faqat admin yoki bron egasi o‘chira oladi
    if (user.role !== 'admin' && bron.rows[0].user_id !== user.id) {
      return res.status(403).json({ msg: "Sizda bu bronni o‘chirishga ruxsat yo‘q" });
    }

    // O‘chirish
    await db.query('DELETE FROM bronlar WHERE id = $1', [bronId]);
    res.json({ msg: "Bron bekor qilindi" });

  } catch (err) {
    res.status(500).json({ msg: "Xatolik yuz berdi", error: err.message });
  }
};
const getMyBronlar = async (req, res) => {
  const userId = req.user.id;

  try {
    const result = await db.query(`
      SELECT b.id, t.name AS toyxona_nomi, b.date, b.count_people, b.status
      FROM bronlar b
      JOIN toyxonalar t ON b.toyxona_id = t.id
      WHERE b.user_id = $1
      ORDER BY b.date DESC;
    `, [userId]);

    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ msg: "Xatolik", error: err.message });
  }
};
const getAllBronlar = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ msg: "Faqat admin ko‘ra oladi" });
    }

    const filters = {
      rayon: req.query.rayon,
      toyxona_id: req.query.toyxona_id
    };

    const bronlar = await bronModel.getAllBronlar(filters);
    res.json(bronlar);
  } catch (err) {
    res.status(500).json({ msg: "Xatolik", error: err.message });
  }
};
const getBookedDates = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query(`
      SELECT b.date, u.username 
      FROM bronlar b
      JOIN users u ON b.user_id = u.id
      WHERE b.toyxona_id = $1 AND b.status = 'tasdiqlangan'
    `, [id]);

    const dates = result.rows.map(row => ({
      date: row.date.toISOString().split('T')[0],
      fullname: row.username
    }));

    res.json(dates);
  } catch (err) {
    console.error("❌ Band kunlarni olishda xatolik:", err.message);
    res.status(500).json({ msg: "Xatolik", error: err.message });
  }
};




module.exports = {
  createBron,
  deleteBron,
  getMyBronlar,
  getAllBronlar,
  getBookedDates,
};
