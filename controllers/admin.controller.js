const pool = require('../config/config/db');
const db = require('../config/config/db');

const toyxonaModel = require('../models/toyxonaModel');
const bcrypt = require('bcrypt');
const userModel = require('../models/userModel');
const bronModel = require('../models/bronModel');

const addToyxona = async (req, res) => {
  try {
    const {
      name, rayon, address, orindiq_soni, orindiq_narxi, phone
    } = req.body;
    const owner_id = req.user.id; // token orqali kelgan user id

    const result = await pool.query(
      `INSERT INTO toyxonalar (name, rayon, address, orindiq_soni, orindiq_narxi, phone, owner_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
      [name, rayon, address, orindiq_soni, orindiq_narxi, phone, owner_id]
    );

    const toyxona_id = result.rows[0].id;

    // Rasm fayllarini saqlash
    if (req.files && req.files.length > 0) {
      for (let file of req.files) {
        await pool.query(
          `INSERT INTO toyxona_images (toyxona_id, image) VALUES ($1, $2)`,
          [toyxona_id, file.filename]
        );
      }
    }

    res.status(201).json({ msg: 'To’yxona qo‘shildi' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server xatosi' });
  }
};
const updateToyxona = async (req, res) => {
  const { id } = req.params;

  // faqat admin yoki o‘zining to‘yxonasi bo‘lsa egasi tahrir qila oladi
  if (req.user.role !== 'admin' && req.user.role !== 'egasi') {
    return res.status(403).json({ msg: "Ruxsat yo‘q" });
  }

  try {
    const updated = await toyxonaModel.updateToyxona(id, req.body);
    if (!updated) return res.status(404).json({ msg: "To‘yxona topilmadi" });

    res.json({ msg: "To‘yxona yangilandi", toyxona: updated });
  } catch (err) {
    res.status(500).json({ msg: "Xatolik", error: err.message });
  }
};
const addOwner = async (req, res) => {
  const { firstname, lastname, username, password } = req.body;

  if (req.user.role !== 'admin') {
    return res.status(403).json({ msg: "Faqat admin egani qo‘sha oladi" });
  }

  try {
    const existing = await userModel.findUserByUsername(username);
    if (existing) return res.status(400).json({ msg: "Username band" });

    const hashed = await bcrypt.hash(password, 10);
    const newUser = await userModel.createUser(firstname, lastname, username, hashed, 'egasi');

    res.status(201).json({ msg: "To‘yxona egasi yaratildi", user: newUser });
  } catch (err) {
    res.status(500).json({ msg: "Xatolik", error: err.message });
  }
};
const confirmToyxona = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (req.user.role !== 'admin') {
    return res.status(403).json({ msg: "Faqat admin tasdiqlay oladi" });
  }

  if (!['tasdiqlangan', 'tasdiqlanmagan'].includes(status)) {
    return res.status(400).json({ msg: "Status noto‘g‘ri" });
  }

  try {
    const updated = await toyxonaModel.updateToyxonaStatus(id, status);
    if (!updated) return res.status(404).json({ msg: "To‘yxona topilmadi" });

    res.json({ msg: "Status yangilandi", toyxona: updated });
  } catch (err) {
    res.status(500).json({ msg: "Xatolik", error: err.message });
  }
};
const deleteToyxona = async (req, res) => {
  const { id } = req.params;

  if (req.user.role !== 'admin') {
    return res.status(403).json({ msg: "Faqat admin o‘chira oladi" });
  }

  try {
    const deleted = await toyxonaModel.deleteToyxona(id);
    if (!deleted) return res.status(404).json({ msg: "To‘yxona topilmadi" });

    res.json({ msg: "To‘yxona o‘chirildi", toyxona: deleted });
  } catch (err) {
    res.status(500).json({ msg: "Xatolik", error: err.message });
  }
};
const getAllOwners = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ msg: "Faqat admin ko‘ra oladi" });
    }

    const owners = await userModel.getAllOwners();
    res.json(owners);
  } catch (err) {
    res.status(500).json({ msg: "Xatolik", error: err.message });
  }
};
const deleteOwner = async (req, res) => {
  const { id } = req.params;

  try {
    const deleted = await userModel.deleteUserById(id); // yoki shunga o‘xshash
    if (!deleted) return res.status(404).json({ msg: 'User not found' });

    res.json({ msg: 'Owner deleted successfully' });
  } catch (err) {
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};


const getAllBronlar = async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ msg: "Faqat admin kirishi mumkin" });
  }

  try {
    const bronlar = await bronModel.getAllBronlar();
    res.json(bronlar);
  } catch (err) {
    res.status(500).json({ msg: "Xatolik", error: err.message });
  }
};
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
const getSingleToyxonaWithBronlar = async (req, res) => {
  try {
    const id = req.params.id;

    // Toyxona topish
    const toyxonaResult = await db.query('SELECT * FROM toyxonalar WHERE id = $1', [id]);
    if (toyxonaResult.rows.length === 0) {
      return res.status(404).json({ msg: "To’yxona topilmadi" });
    }

    const toyxona = toyxonaResult.rows[0];

    // Bronlar (faqat sana kerak)
    const bronResult = await db.query('SELECT date FROM bronlar WHERE toyxona_id = $1', [id]);
    const bronDates = bronResult.rows.map(b => b.date);

    res.json({
      toyxona,
      bronDates
    });
  } catch (err) {
    console.error("Admin bitta toyxona olishda xatolik:", err);
    res.status(500).json({ msg: "Server xatosi", error: err.message });
  }
};
const getAdminFilteredToyxonalar = async (req, res) => {
  try {
    const {
      rayon,
      search,
      sort_by = 'id', // Default: id bo‘yicha
      order = 'asc'   // Default: o‘sish tartibida
    } = req.query;

    console.log("✅ sort_by:", sort_by, "order:", order);

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

    if (where.length) {
      baseQuery += ` WHERE ${where.join(' AND ')}`;
    }

    // Faqat ruxsat etilgan ustunlarga saralash uchun xavfsiz tekshiruv
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
};
