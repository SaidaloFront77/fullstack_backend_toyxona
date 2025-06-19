const toyxonaModel = require('../models/toyxonaModel');
const bronModel = require('../models/bronModel');
const path = require('path');
const db = require('../config/config/db');

const getFilteredToyxonalar = async (req, res) => {
  try {
    const { rayon, search, sort_by, order } = req.query;

    let baseQuery = `
      SELECT t.*, ti.image 
      FROM toyxonalar t
      LEFT JOIN (
        SELECT DISTINCT ON (toyxona_id) toyxona_id, image 
        FROM toyxona_images
        ORDER BY toyxona_id, id ASC
      ) ti ON t.id = ti.toyxona_id
    `;

    const values = [];
    let count = 1;
    const where = [];

    where.push(`t.status = 'tasdiqlangan'`);

    if (rayon) {
      where.push(`LOWER(t.rayon) = LOWER($${count++})`);
      values.push(rayon);
    }

    if (search) {
      where.push(`LOWER(t.name) LIKE LOWER($${count++})`);
      values.push(`%${search}%`);
    }

    if (where.length > 0) {
      baseQuery += ' WHERE ' + where.join(' AND ');
    }

    let sortColumn = null;
    if (sort_by) {
      const lowerSort = sort_by.toLowerCase();
      if (lowerSort === 'orindiq_narxi') sortColumn = 'orindiq_narxi';
      else if (lowerSort === 'orindiq_soni') sortColumn = 'orindiq_soni';
    }

    // Agar noto'g'ri qiymat bo'lsa default sort qilamiz
    if (sortColumn) {
      const ord = order && order.toLowerCase() === 'desc' ? 'DESC' : 'ASC';
      baseQuery += ` ORDER BY t.${sortColumn} ${ord}`;
    } else {
      baseQuery += ` ORDER BY t.id DESC`;
    }

    const result = await db.query(baseQuery, values);
    res.json(result.rows);
  } catch (err) {
    console.error('Toyxonalar olishda xatolik:', err);
    res.status(500).json({ msg: 'Serverda xatolik yuz berdi' });
  }
};

const getOneToyxona = async (req, res) => {
  const { id } = req.params;

  try {
    const toyxona = await toyxonaModel.getToyxonaById(id);
    if (!toyxona || toyxona.status !== 'tasdiqlangan') {
      return res.status(404).json({ msg: "To‘yxona topilmadi yoki tasdiqlanmagan" });
    }

    // Bron sanalarini olish
    const bronlar = await bronModel.getBronDatesForToyxona(id);

    // Rasmlarni olish
    const imagesResult = await db.query(
      'SELECT image FROM toyxona_images WHERE toyxona_id = $1 ORDER BY id ASC',
      [id]
    );
    const images = imagesResult.rows.map(row => row.image);

    res.json({ ...toyxona, bronlar, images });
  } catch (err) {
    res.status(500).json({ msg: "Xatolik", error: err.message });
  }
};

const uploadImages = async (req, res) => {
  try {
    const { toyxona_id } = req.body;

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ msg: "Hech qanday rasm yuklanmadi" });
    }

    // Fayl nomlarini bazaga yozish
    const values = req.files
      .map(file => `('${toyxona_id}', '${file.filename}')`)
      .join(", ");

    const query = `
      INSERT INTO toyxona_images (toyxona_id, image)
      VALUES ${values}
      RETURNING *;
    `;

    const result = await db.query(query);
    res.status(201).json({ msg: "✅ Rasmlar yuklandi", images: result.rows });
  } catch (err) {
    console.error("❌ Xatolik:", err);
    res.status(500).json({ msg: "Xatolik", error: err.message });
  }
};
module.exports = {
  getFilteredToyxonalar,
  getOneToyxona,
  uploadImages,
};
