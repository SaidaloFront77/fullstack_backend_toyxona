const { Pool } = require('pg');
require('dotenv').config();


const pool = new Pool({
    connectionString: `postgresql://saidalo:BZ8FbIZ330jzumjF5HTwFOJ63HAsUcdF@dpg-d1a3r0qli9vc73aokr6g-a.oregon-postgres.render.com/toyxona_7bba`,
    ssl: {
        rejectUnauthorized: false,
    },
});

module.exports = pool;