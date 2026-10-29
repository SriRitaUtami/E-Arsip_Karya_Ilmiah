// src/lib/db.js
import mysql from 'mysql2/promise';

const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
});

async function checkConnection() {
  try {
    const connection = await db.getConnection();
    console.log('Koneksi database berhasil!');
    connection.release();
  } catch (err) {
    console.error('Koneksi database gagal:', err);
  }
}

checkConnection();

export default db;