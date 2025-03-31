require('dotenv').config();
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function setupDatabase() {
    try {
        // Read and execute schema.sql
        const schemaPath = path.join(__dirname, '..', 'schema.sql');
        const schema = fs.readFileSync(schemaPath, 'utf8');
        await pool.query(schema);
        console.log('Database schema created successfully');

        // Run database initialization
        require('./init-db');
        console.log('Database initialized successfully');
    } catch (error) {
        console.error('Error setting up database:', error);
    } finally {
        await pool.end();
    }
}

setupDatabase(); 