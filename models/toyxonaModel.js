const db = require('../config/config/db');

const createToyxona = async (data) => {
  const {
    name, rayon, address,
    orindiq_soni, orindiq_narxi,
    phone, owner_id
  } = data;
  

  const query = `
    INSERT INTO toyxonalar
    (name, rayon, address, orindiq_soni, orindiq_narxi, phone, owner_id)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING *;
  `;
  const values = [name, rayon, address, orindiq_soni, orindiq_narxi, phone, owner_id];
  const result = await db.query(query, values);
  return result.rows[0];
};
const updateToyxonaStatus = async (id, status) => {
  const query = `
    UPDATE toyxonalar
    SET status = $1
    WHERE id = $2
    RETURNING *;
  `;
  const result = await db.query(query, [status, id]);
  return result.rows[0];
};
const updateToyxona = async (id, data) => {
  const {
    name,
    rayon,
    address,
    orindiq_soni,
    orindiq_narxi,
    phone
  } = data;

  const query = `
    UPDATE toyxonalar
    SET name = $1, rayon = $2, address = $3,
        orindiq_soni = $4, orindiq_narxi = $5, phone = $6
    WHERE id = $7
    RETURNING *;
  `;

  const values = [name, rayon, address, orindiq_soni, orindiq_narxi, phone, id];
  const result = await db.query(query, values);
  return result.rows[0];
};
const deleteToyxona = async (id) => {
  const result = await db.query(
    `DELETE FROM toyxonalar WHERE id = $1 RETURNING *;`,
    [id]
  );
  return result.rows[0]; // o‘chgan ma'lumotni qaytaradi (yoki null)
};
const getFilteredToyxonalar = async (query) => {
  const { sort_by, order, rayon, search, admin } = query;

  let baseQuery = `SELECT * FROM toyxonalar`;
  const values = [];
  let count = 1;
  const where = [];

  // Faqat admin bo‘lmasa status = 'tasdiqlangan' qo‘shiladi
  if (!admin || admin === 'false') {
    where.push(`status = 'tasdiqlangan'`);
  }

  if (rayon) {
    where.push(`LOWER(rayon) = LOWER($${count++})`);
    values.push(rayon);
  }

  if (search) {
    where.push(`LOWER(name) LIKE LOWER($${count++})`);
    values.push(`%${search}%`);
  }

  if (where.length > 0) {
    baseQuery += ' WHERE ' + where.join(' AND ');
  }

  if (sort_by && ['orindiq_narxi', 'orindiq_soni'].includes(sort_by)) {
    const ord = order === 'desc' ? 'DESC' : 'ASC';
    baseQuery += ` ORDER BY ${sort_by} ${ord}`;
  }

  const result = await db.query(baseQuery, values);
  return result.rows;
};
const getToyxonaById = async (id) => {
  const result = await db.query('SELECT * FROM toyxonalar WHERE id = $1', [id]);
  return result.rows[0];
};
const getToyxonaByOwner = async (owner_id) => {
  const result = await db.query(
    'SELECT * FROM toyxonalar WHERE owner_id = $1',
    [owner_id]
  );
  return result.rows[0];
};
const getToyxonaByOwnerId = async (owner_id) => {
  const result = await db.query(
    'SELECT * FROM toyxonalar WHERE owner_id = $1 LIMIT 1',
    [owner_id]
  );
  return result.rows[0];
};

module.exports = {
  createToyxona,
  updateToyxonaStatus,
  deleteToyxona,
  updateToyxona, 
  getFilteredToyxonalar,
  getToyxonaById,
  getToyxonaByOwner,
  getToyxonaByOwnerId,
};