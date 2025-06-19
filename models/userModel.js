const db = require('../config/config/db');

// YANGI USER YARATISH (admin yoki egasi uchun)
const createUser = async (firstname, lastname, username, password, role) => {
  const query = `
    INSERT INTO users (firstname, lastname, username, password, role)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *;
  `;
  const values = [firstname, lastname, username, password, role];
  const result = await db.query(query, values);
  return result.rows[0];
};
// USERNAME orqali USER topish
const findUserByUsername = async (username) => {
  const result = await db.query('SELECT * FROM users WHERE username = $1', [username]);
  return result.rows[0];
};


const deleteUserById = async (id) => {
  const result = await db.query('DELETE FROM users WHERE id = $1 RETURNING *', [id]);
  return result.rowCount > 0;
};


 


// ✅ Barcha foydalanuvchilarni ko‘rish (admin uchun)
const getAllUsers = async () => {
  const result = await db.query('SELECT id, firstname, lastname, username, role FROM users ORDER BY id ASC');
  return result.rows;
};
// ✅ Faqat "egasi" roldagi foydalanuvchilarni ko‘rish
const getAllOwners = async () => {
  const result = await db.query(`
    SELECT id, firstname, lastname, username
    FROM users
    WHERE role = 'egasi'
    ORDER BY id ASC
  `);
  return result.rows;
};


module.exports = {
  createUser,
  findUserByUsername,
  getAllUsers,    // optional
  getAllOwners,    // optional (faqat egalar)
  deleteUserById
};
