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
let initPromise = null;

const initDB = async () => {
  if (initPromise) return initPromise;

  initPromise = (async () => {
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
            name VARCHAR(255),
            phone VARCHAR(50),
            company VARCHAR(255),
            designation VARCHAR(255),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);

      // Alter users table for existing databases
      try {
        await pool.query(`ALTER TABLE users ADD COLUMN name VARCHAR(255);`);
      } catch(e) {}
      try {
        await pool.query(`ALTER TABLE users ADD COLUMN phone VARCHAR(50);`);
      } catch(e) {}
      try {
        await pool.query(`ALTER TABLE users ADD COLUMN company VARCHAR(255);`);
      } catch(e) {}
      try {
        await pool.query(`ALTER TABLE users ADD COLUMN designation VARCHAR(255);`);
      } catch(e) {}

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
            order_id VARCHAR(50) UNIQUE NOT NULL,
            user_id INT,
            customer_name VARCHAR(255),
            customer_email VARCHAR(255),
            customer_phone VARCHAR(50),
            services TEXT,
            pickup_address TEXT,
            notes TEXT,
            status ENUM('pending', 'confirmed', 'concierge_assigned', 'in_progress', 'completed') DEFAULT 'pending',
            concierge_name VARCHAR(255),
            concierge_phone VARCHAR(50),
            base_amount DECIMAL(10,2) DEFAULT 2500.00,
            discount_percent INT DEFAULT 0,
            discount_amount DECIMAL(10,2) DEFAULT 0.00,
            gst_amount DECIMAL(10,2) DEFAULT 0.00,
            total_amount DECIMAL(10,2) DEFAULT 2950.00,
            voucher_code VARCHAR(50) DEFAULT NULL,
            appointment_date VARCHAR(255) DEFAULT NULL,
            booking_time VARCHAR(255) DEFAULT NULL,
            payment_method VARCHAR(255) DEFAULT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id)
        );
      `);

      // Alter orders table for existing databases (using generic drop/add for simplicity, or just try/catch add columns)
      try {
        await pool.query(`ALTER TABLE orders ADD COLUMN order_id VARCHAR(50) UNIQUE;`);
      } catch(e) {}
      try {
        await pool.query(`ALTER TABLE orders ADD COLUMN customer_name VARCHAR(255);`);
      } catch(e) {}
      try {
        await pool.query(`ALTER TABLE orders ADD COLUMN customer_email VARCHAR(255);`);
      } catch(e) {}
      try {
        await pool.query(`ALTER TABLE orders ADD COLUMN customer_phone VARCHAR(50);`);
      } catch(e) {}
      try {
        await pool.query(`ALTER TABLE orders ADD COLUMN services TEXT;`);
      } catch(e) {}
      try {
        await pool.query(`ALTER TABLE orders ADD COLUMN pickup_address TEXT;`);
      } catch(e) {}
      try {
        await pool.query(`ALTER TABLE orders ADD COLUMN notes TEXT;`);
      } catch(e) {}
      try {
        await pool.query(`ALTER TABLE orders ADD COLUMN concierge_name VARCHAR(255);`);
      } catch(e) {}
      try {
        await pool.query(`ALTER TABLE orders ADD COLUMN concierge_phone VARCHAR(50);`);
      } catch(e) {}
      try {
        await pool.query(`ALTER TABLE orders ADD COLUMN base_amount DECIMAL(10,2) DEFAULT 2500.00;`);
      } catch(e) {}
      try {
        await pool.query(`ALTER TABLE orders ADD COLUMN discount_percent INT DEFAULT 0;`);
      } catch(e) {}
      try {
        await pool.query(`ALTER TABLE orders ADD COLUMN discount_amount DECIMAL(10,2) DEFAULT 0.00;`);
      } catch(e) {}
      try {
        await pool.query(`ALTER TABLE orders ADD COLUMN gst_amount DECIMAL(10,2) DEFAULT 0.00;`);
      } catch(e) {}
      try {
        await pool.query(`ALTER TABLE orders ADD COLUMN total_amount DECIMAL(10,2) DEFAULT 2950.00;`);
      } catch(e) {}
      try {
        await pool.query(`ALTER TABLE orders ADD COLUMN voucher_code VARCHAR(50) DEFAULT NULL;`);
      } catch(e) {}
      try {
        await pool.query(`ALTER TABLE orders ADD COLUMN appointment_date VARCHAR(255) DEFAULT NULL;`);
      } catch(e) {}
      try {
        await pool.query(`ALTER TABLE orders ADD COLUMN booking_time VARCHAR(255) DEFAULT NULL;`);
      } catch(e) {}
      try {
        await pool.query(`ALTER TABLE orders ADD COLUMN payment_method VARCHAR(255) DEFAULT NULL;`);
      } catch(e) {}
      try {
        await pool.query(`ALTER TABLE orders MODIFY COLUMN status ENUM('pending', 'confirmed', 'concierge_assigned', 'in_progress', 'completed') DEFAULT 'pending';`);
      } catch(e) {}

      // Create voucher_redemptions table
      await pool.query(`
        CREATE TABLE IF NOT EXISTS voucher_redemptions (
            id INT AUTO_INCREMENT PRIMARY KEY,
            voucher_code VARCHAR(50) NOT NULL,
            customer_email VARCHAR(255) NOT NULL,
            order_id VARCHAR(50) NOT NULL,
            redeemed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE KEY unique_redemption (voucher_code, customer_email)
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
      // Ensure fallback pool is created if not already present
      if (!pool) {
        try {
          pool = mysql.createPool(dbConfig);
        } catch (e) {
          console.error('❌ Fallback MySQL Pool creation failed:', e.message);
        }
      }
    }
  })();

  return initPromise;
};

const query = async (sql, params) => {
  if (!pool) {
    await initDB();
  }
  if (!pool) return null;
  const [results] = await pool.execute(sql, params);
  return results;
};

module.exports = { initDB, query };
