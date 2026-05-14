const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

const path = require('path');
dotenv.config({ path: path.join(__dirname, '.env') });

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'inkopia_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

let pool;

const initDB = async () => {
  try {
    // Create connection without database first to ensure DB exists
    const connection = await mysql.createConnection({
      host: dbConfig.host,
      port: dbConfig.port,
      user: dbConfig.user,
      password: dbConfig.password
    });

    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbConfig.database}\`;`);
    await connection.end();

    // Create pool with database
    pool = mysql.createPool(dbConfig);
    console.log('✅ MySQL Pool Created');

    // Initialize Tables
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
          id INT AUTO_INCREMENT PRIMARY KEY,
          email VARCHAR(255) UNIQUE NOT NULL,
          role ENUM('user', 'admin') DEFAULT 'user',
          is_verified BOOLEAN DEFAULT FALSE,
          firebase_uid VARCHAR(255) UNIQUE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS site_configs (
          id INT AUTO_INCREMENT PRIMARY KEY,
          config_key VARCHAR(50) UNIQUE NOT NULL,
          config_data JSON NOT NULL,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS site_data_generic (
          id INT AUTO_INCREMENT PRIMARY KEY,
          schema_id VARCHAR(255) NOT NULL,
          data JSON NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS verification_codes (
          id INT AUTO_INCREMENT PRIMARY KEY,
          user_id INT NOT NULL,
          code VARCHAR(6) NOT NULL,
          expires_at TIMESTAMP NOT NULL,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS orders (
          id INT AUTO_INCREMENT PRIMARY KEY,
          user_id INT,
          client_name VARCHAR(255),
          client_phone VARCHAR(50),
          location TEXT,
          service VARCHAR(255),
          instrument VARCHAR(255),
          payment_method VARCHAR(50),
          booking_time VARCHAR(50),
          appointment_date DATE,
          amount DECIMAL(10, 2),
          status ENUM('pending', 'processing', 'completed', 'cancelled') DEFAULT 'pending',
          commission_details JSON,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id)
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS inks (
          id INT AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          hex VARCHAR(7) NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS agents (
          id INT AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          role VARCHAR(255) NOT NULL,
          type ENUM('ai', 'human') DEFAULT 'ai',
          status ENUM('active', 'inactive') DEFAULT 'active',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS dynamic_pages (
          id INT AUTO_INCREMENT PRIMARY KEY,
          title VARCHAR(255) NOT NULL,
          slug VARCHAR(255) UNIQUE NOT NULL,
          content LONGTEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log('✅ MySQL Tables Initialized');
  } catch (err) {
    console.error('❌ MySQL Initialization Error:', err.message);
    if (err.code === 'ECONNREFUSED') {
      console.warn('⚠️ MySQL server not reachable. Skipping MySQL initialization.');
    }
  }
};

const query = async (sql, params) => {
  if (!pool) return null;
  const [results] = await pool.execute(sql, params);
  return results;
};

module.exports = { initDB, query };
