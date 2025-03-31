require('dotenv').config();
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function initializeDatabase() {
    try {
        // Create admin user
        const adminPassword = await bcrypt.hash('admin123', 10);
        await pool.query(`
            INSERT INTO users (email, password_hash, role)
            VALUES ($1, $2, $3)
            ON CONFLICT (email) DO NOTHING
        `, ['admin@cybershielduk.com', adminPassword, 'admin']);

        console.log('Database initialized successfully');
    } catch (error) {
        console.error('Error initializing database:', error);
    } finally {
        await pool.end();
    }
}

initializeDatabase(); 