const pool = require('../config/config/db');
const db = require('../config/config/db');

const getAllToyxonalar = async (req, res) => {
  try {
    // Faqat admin ko'ra olishi kerak
    if (req.user.role !== 'admin') {
      return res.status(403).json({ msg: "Faqat admin kirishi mumkin" });
    }

    // Barcha toyxonalarni olish
    const result = await db.query('SELECT * FROM toyxonalar ORDER BY id DESC');
    res.json(result.rows);
  } catch (err) {
    console.error("Toyxonalarni olishda xatolik:", err);
    res.status(500).json({ msg: "Server xatosi", error: err.message });
  }
};
const getUserFilteredToyxonalar = async (req, res) => {
  try {
    const {
      rayon,
      search,
      sort_by = 'id',     // 🟢 Default: 'id'
      order = 'asc'       // 🟢 Default: 'asc'
    } = req.query;

    console.log("User Filter:", { rayon, search, sort_by, order });

    let baseQuery = `
      SELECT t.*, (
        SELECT image FROM toyxona_images WHERE toyxona_id = t.id LIMIT 1
      ) as image
      FROM toyxonalar t
    `;

    const values = [];
    const where = [];
    let count = 1;

    if (rayon) {
      where.push(`LOWER(t.rayon) = LOWER($${count++})`);
      values.push(rayon);
    }

    if (search) {
      where.push(`LOWER(t.name) LIKE LOWER($${count++})`);
      values.push(`%${search}%`);
    }

    if (where.length > 0) {
      baseQuery += ` WHERE ${where.join(' AND ')}`;
    }

    // 🛡 Xavfsiz ustun va tartib tekshiruvi
    const allowedSort = ['orindiq_narxi', 'orindiq_soni', 'id'];
    const sortCol = allowedSort.includes(sort_by) ? sort_by : 'id';
    const sortOrder = order === 'desc' ? 'DESC' : 'ASC';

    baseQuery += ` ORDER BY ${sortCol} ${sortOrder}`;

    const result = await db.query(baseQuery, values);
    res.json(result.rows);

  } catch (err) {
    console.error("❌ Filter qidirishda xatolik:", err);
    res.status(500).json({ msg: "Serverda xatolik yuz berdi" });
  }
};

module.exports = {
  getAllToyxonalar,
  getUserFilteredToyxonalar,
};
