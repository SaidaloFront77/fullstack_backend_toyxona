const db = require('../config/config/db');

const getBronDatesForToyxona = async (toyxona_id) => {
  const result = await db.query(`
    SELECT date FROM bronlar
    WHERE toyxona_id = $1
  `, [toyxona_id]);

  const today = new Date();

  return result.rows.map((row) => {
    const bronDate = new Date(row.date);
    let status = '';

    if (bronDate.toDateString() === today.toDateString()) {
      status = 'bron qilingan';
    } else if (bronDate < today) {
      status = 'o‘tib ketgan';
    } else {
      status = 'bron qilingan';
    }

    return {
      date: row.date,
      status
    };
  });
};
const getAllBronlar = async (filters = {}) => {
  let query = `
    SELECT 
      b.id,
      t.name AS toyxona_name,
      t.rayon,
      b.date,
      b.count_people,
      u.firstname,
      u.lastname,
      u.username,
      u.phone,
      u.id AS user_id
    FROM bronlar b
    JOIN toyxonalar t ON b.toyxona_id = t.id
    JOIN users u ON b.user_id = u.id
  `;

  const values = [];
  const conditions = [];

  if (filters.rayon) {
    values.push(filters.rayon);
    conditions.push(`t.rayon = $${values.length}`);
  }
  if (filters.toyxona_id) {
    values.push(filters.toyxona_id);
    conditions.push(`t.id = $${values.length}`);
  }

  if (conditions.length) {
    query += ` WHERE ` + conditions.join(' AND ');
  }

  query += ` ORDER BY b.date ASC`;

  const result = await db.query(query, values);
  const today = new Date();

  return result.rows.map((row) => {
    const bronDate = new Date(row.date);
    const status = bronDate < today ? 'bo‘lib o‘tgan' : 'endi bo‘ladigan';

    return {
      id: row.id,
      toyxona: row.toyxona_name,
      rayon: row.rayon,
      sana: row.date,
      count_people: row.count_people,
      foydalanuvchi: {
        id: row.user_id,
        firstname: row.firstname,
        lastname: row.lastname,
        username: row.username,
        phone: row.phone
      },
      status
    };
  });
};

const deleteBronById = async (id, userId, role) => {
  let query = '';
  let values = [];

  if (role === 'admin') {
    query = `DELETE FROM bronlar WHERE id = $1 RETURNING *`;
    values = [id];
  } else {
    query = `DELETE FROM bronlar WHERE id = $1 AND user_id = $2 RETURNING *`;
    values = [id, userId];
  }

  const result = await db.query(query, values);
  return result.rows[0];
};
const getBronlarForToyxona = async (toyxona_id) => {
  const result = await db.query(
    `SELECT * FROM bronlar WHERE toyxona_id = $1 ORDER BY date DESC`,
    [toyxona_id]
  );
  return result.rows;
};

module.exports = {
  getBronDatesForToyxona,
  getAllBronlar,
  deleteBronById,
  getBronlarForToyxona,
};
