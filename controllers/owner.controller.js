// 📁 controllers/owner.controller.js
const db = require('../config/config/db');

const getOwnBronlar = async (req, res) => {
  try {
    if (req.user.role !== 'egasi') {
      return res.status(403).json({ msg: "Faqat to‘yxona egasi kirishi mumkin!" });
    }

    const query = `
      SELECT b.id, t.name as toyxona_nomi, b.date, b.count_people,
            u.firstname, u.lastname, u.username,
            CASE
              WHEN b.date < CURRENT_DATE THEN 'bo‘lib o‘tgan'
              ELSE 'endi bo‘ladigan'
            END AS status
      FROM bronlar b
      JOIN toyxonalar t ON t.id = b.toyxona_id
      JOIN users u ON b.user_id = u.id
      WHERE t.owner_id = $1
      ORDER BY b.date ASC
    `;

    const result = await db.query(query, [req.user.id]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ msg: "Xatolik", error: err.message });
  }
};

const getMyToyxona = async (req, res) => {
  const ownerId = req.user.id;

  try {
    const result = await db.query('SELECT * FROM toyxonalar WHERE owner_id = $1', [ownerId]);
    if (result.rows.length === 0) {
      return res.status(404).json({ msg: "Sizga tegishli to’yxona topilmadi" });
    }

    res.json({ toyxona: result.rows[0] });
  } catch (err) {
    console.error("❌ To’yxona olishda xatolik:", err);
    res.status(500).json({ msg: "Server xatosi" });
  }
};

const updateMyToyxona = async (req, res) => {
  const ownerId = req.user.id;
  const { name, rayon, address, orindiq_soni, orindiq_narxi, phone } = req.body;

  try {
    const result = await db.query('SELECT id FROM toyxonalar WHERE owner_id = $1', [ownerId]);
    if (result.rows.length === 0) {
      return res.status(404).json({ msg: "To’yxona topilmadi" });
    }

    const toyxonaId = result.rows[0].id;

    await db.query(`
      UPDATE toyxonalar SET
        name = $1,
        rayon = $2,
        address = $3,
        orindiq_soni = $4,
        orindiq_narxi = $5,
        phone = $6
      WHERE id = $7
    `, [name, rayon, address, orindiq_soni, orindiq_narxi, phone, toyxonaId]);

    res.json({ msg: "To’yxona ma’lumotlari yangilandi" });
  } catch (err) {
    console.error("❌ Yangilashda xatolik:", err);
    res.status(500).json({ msg: "Server xatosi" });
  }
};

const deleteOwnerBron = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const bron = await db.query(`SELECT * FROM bronlar WHERE id = $1`, [id]);
    if (bron.rows.length === 0) return res.status(404).json({ msg: 'Bron topilmadi' });

    const toyxona = await db.query(`SELECT * FROM toyxonalar WHERE id = $1`, [bron.rows[0].toyxona_id]);
    if (!toyxona.rows[0] || toyxona.rows[0].owner_id !== userId) {
      return res.status(403).json({ msg: 'Sizga bu bronni o‘chirishga ruxsat yo‘q' });
    }

    await db.query(`DELETE FROM bronlar WHERE id = $1`, [id]);
    res.json({ msg: 'Bron muvaffaqiyatli bekor qilindi' });
  } catch (err) {
    res.status(500).json({ msg: 'Server xatosi', error: err.message });
  }
};

const getMyToyxonalar = async (req, res) => {
  const ownerId = req.user.id;

  try {
    const result = await db.query('SELECT * FROM toyxonalar WHERE owner_id = $1', [ownerId]);
    res.json({ toyxonalar: result.rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server xatoligi' });
  }
};

module.exports = {
  getOwnBronlar,
  getMyToyxona,
  updateMyToyxona,
  deleteOwnerBron,
  getMyToyxonalar
};
