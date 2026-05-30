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

      await pool.query(`
        CREATE TABLE IF NOT EXISTS serviceable_pincodes (
            id INT AUTO_INCREMENT PRIMARY KEY,
            pincode VARCHAR(10) UNIQUE NOT NULL,
            region VARCHAR(100) NOT NULL
        );
      `);

      await pool.query(`
        CREATE TABLE IF NOT EXISTS InkBrandPricing (
            id VARCHAR(191) PRIMARY KEY,
            brand VARCHAR(191) UNIQUE NOT NULL,
            price DECIMAL(10,2) NOT NULL,
            createdAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
            updatedAt DATETIME(3) NOT NULL
        );
      `);

      await pool.query(`
        CREATE TABLE IF NOT EXISTS blog_posts (
            id INT AUTO_INCREMENT PRIMARY KEY,
            title VARCHAR(255) NOT NULL,
            slug VARCHAR(255) UNIQUE NOT NULL,
            metaDescription TEXT,
            publishedDate VARCHAR(255),
            readingTime INT DEFAULT 5,
            author VARCHAR(255) NOT NULL,
            authorRole VARCHAR(255) NOT NULL,
            authorImage VARCHAR(255),
            category VARCHAR(100) NOT NULL,
            imageUrl VARCHAR(255) NOT NULL,
            content LONGTEXT NOT NULL,
            relatedPosts VARCHAR(255),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);

      // Seed blog posts if empty
      const [existingPosts] = await pool.query('SELECT id FROM blog_posts LIMIT 1');
      if (existingPosts.length === 0) {
        const starterPosts = [
          {
            slug: "how-to-clean-a-fountain-pen-properly",
            title: "How to Clean a Fountain Pen Properly: The Essential Guide",
            metaDescription: "Learn how to clean your luxury fountain pen step-by-step. Discover safe flushing methods and why professional maintenance is vital for ink flow.",
            publishedDate: "May 25, 2026",
            readingTime: 5,
            author: "Manav Shah",
            authorRole: "Lead Fountain Pen Specialist",
            authorImage: null,
            category: "Maintenance",
            imageUrl: "https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?auto=format&fit=crop&w=1200&q=80",
            content: JSON.stringify([
              {
                heading: "The Importance of Regular Cleaning",
                paragraphs: [
                  "A luxury fountain pen is more than a simple writing instrument—it is an engineering masterpiece. Inside its feed and nib is a delicate capillary system that relies on micro-channels to deliver ink perfectly to paper. Over time, microscopic ink particles can settle, dry, and gradually clog these channels. This leads to scratchy writing, skipped strokes, or complete ink starvation.",
                  "Regular cleaning ensures that old ink residue is entirely flushed away, protecting the precious metals of your nib and guaranteeing a velvety-smooth writing experience every time you put pen to paper."
                ]
              },
              {
                heading: "Step-by-Step Flushing Guide at Home",
                paragraphs: [
                  "Step 1: Carefully disassemble your pen by unscrewing the section (where you hold the pen) from the barrel. Remove the converter or empty cartridge.",
                  "Step 2: Flush the section by passing room-temperature, distilled water through it. You can use a specialized bulb syringe to gently push water through the nib assembly until the water runs completely clear. Avoid hot water, as it can warp vintage materials like ebonite.",
                  "Step 3: If you are using a piston-filler pen, draw distilled water into the chamber and expel it repeatedly until there is no trace of residual colour.",
                  "Step 4: Dry the nib naturally. Wrap the section gently in a lint-free microfiber cloth and let it stand nib-down in a small glass overnight. Capillary action will pull any remaining moisture out of the feed safely."
                ]
              },
              {
                heading: "When to Seek Professional Concierge Care",
                paragraphs: [
                  "While home flushing is excellent for routine colour changes, certain situations require expert hands. Stubborn clogs from pigmented or iron-gall inks, vintage feeds with delicate fins, or micro-adjustments to the nib should never be forced at home.",
                  "At InKoPia, our Masterpiece Concierge Ritual offers a dedicated on-site specialist who will meticulously inspect, flush, and hand-restore perfect capillary flow for your prized writing instrument, using strictly zero ultrasonic machines that can crack fragile vintage resins."
                ]
              }
            ]),
            relatedPosts: "common-pen-care-mistakes-to-avoid, why-professional-pen-cleaning-extends-pen-life"
          },
          {
            slug: "when-to-refill-your-pen-ink",
            title: "When to Refill Your Fountain Pen Ink: Avoiding Dry Feeds",
            metaDescription: "Do you know when to refill your fountain pen? Read our expert guide on ink capacity, flow indicators, and keeping your feed healthy.",
            publishedDate: "May 27, 2026",
            readingTime: 4,
            author: "Manav Shah",
            authorRole: "Lead Fountain Pen Specialist",
            authorImage: null,
            category: "Refilling",
            imageUrl: "https://images.unsplash.com/photo-1569003339405-ea396a5a8a90?auto=format&fit=crop&w=1200&q=80",
            content: JSON.stringify([
              {
                heading: "Recognizing the Early Warning Signs",
                paragraphs: [
                  "Waiting until your pen runs completely dry is one of the most common oversights in fountain pen ownership. A dry feed is not just inconvenient; it can cause ink to cake inside the micro-grooves, leading to hard starts next time. The first signs of low ink include a sudden thinning of the line width, a lighter shade of colour than usual, or a scratchy feel when writing.",
                  "If your pen begins to feel dry, it is highly recommended to refill it immediately to maintain continuous capillary pressure within the ink chamber."
                ]
              },
              {
                heading: "The Danger of Clogged Channels",
                paragraphs: [
                  "When a pen sits empty or very low on ink, air enters the chamber. This exposure to air accelerates the evaporation of the water solvent in the ink, leaving behind pure dye and resin pigments. These concentrated solids settle in the feed fins, clogging the channels.",
                  "Keeping your fountain pen consistently refilled acts as a barrier, keeping the ink in its fluid state and preventing crystallization in the delicate feed system."
                ]
              },
              {
                heading: "The Sommelier Ink Selection Experience",
                paragraphs: [
                  "Refilling is also an opportunity to elevate your writing ritual. Rather than buying bulky bottles that sit on a shelf, InKoPia offers a private Sommelier ink service. Our mobile specialists arrive directly at your residence or executive office with a library of premium curated inks, refilling your instrument on the spot with exquisite shades tailored to your personal aesthetic."
                ]
              }
            ]),
            relatedPosts: "how-to-clean-a-fountain-pen-properly, why-professional-pen-cleaning-extends-pen-life"
          },
          {
            slug: "common-pen-care-mistakes-to-avoid",
            title: "4 Common Fountain Pen Care Mistakes You Must Avoid",
            metaDescription: "Avoid costly damages to your luxury writing instruments. Discover the top fountain pen mistakes, from wrong cleaning fluids to dangerous pressure.",
            publishedDate: "May 29, 2026",
            readingTime: 6,
            author: "Manav Shah",
            authorRole: "Lead Fountain Pen Specialist",
            authorImage: null,
            category: "Preservation",
            imageUrl: "https://images.unsplash.com/photo-1511108690759-009324a90311?auto=format&fit=crop&w=1200&q=80",
            content: JSON.stringify([
              {
                heading: "1. Cleaning with Tap Water and Harsh Solvents",
                paragraphs: [
                  "Tap water contains minerals, calcium, and chlorine that can deposit scale inside the micro-channels of your pen's feed. Over time, these mineral buildups are incredibly difficult to remove and permanently choke the ink flow. Even worse is using rubbing alcohol, acetone, or domestic soaps, which will instantly dissolve vintage resins and crack modern acrylic barrels."
                ]
              },
              {
                heading: "2. Letting Ink Dry Out Completely Inside the Pen",
                paragraphs: [
                  "A fountain pen is meant to be written with. If you leave a pen inked up and unused in a drawer for weeks, the moisture evaporates, leaving behind a hard shell of pigment that blocks the feed completely. If you do not plan to use a pen for more than two weeks, always flush it clean first."
                ]
              },
              {
                heading: "3. Applying Too Much Writing Pressure",
                paragraphs: [
                  "Unlike ballpoint pens which require downward force to roll a steel ball, fountain pens operate purely on capillary action. The nib should glide across the paper under its own weight. Pressing down hard bends the tines out of alignment, causing ink leakage or permanent nib splay."
                ]
              },
              {
                heading: "4. Relying on Ultrasonic Cleaning Machines",
                paragraphs: [
                  "Many amateur guides suggest dropping sections into ultrasonic jewelry cleaners. For vintage pens, gold-plated accents, or hand-painted Urushi lacquers, the high-frequency micro-vibrations can cause gold plating to flake off and trigger microscopic fractures in delicate resins. Hand-flushing is always the safest, most luxurious choice."
                ]
              }
            ]),
            relatedPosts: "how-to-clean-a-fountain-pen-properly, why-professional-pen-cleaning-extends-pen-life"
          },
          {
            slug: "why-professional-pen-cleaning-extends-pen-life",
            title: "Why Professional Pen Cleaning Extends Pen Life Permanently",
            metaDescription: "Discover why expert care, distilled hand-flushing, and professional concierge detailing can extend the lifetime of your luxury fountain pens.",
            publishedDate: "May 30, 2026",
            readingTime: 5,
            author: "Manav Shah",
            authorRole: "Lead Fountain Pen Specialist",
            authorImage: null,
            category: "Preservation",
            imageUrl: "https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&w=1200&q=80",
            content: JSON.stringify([
              {
                heading: "The Architecture of Luxury Instruments",
                paragraphs: [
                  "Luxury fountain pens from legendary houses like Montblanc, Visconti, Namiki, and Pelikan are crafted to last generations. However, their longevity depends directly on how their internal systems are preserved. A gold nib can write forever, but a clogged, scaling feed or dried inner chamber can ruin the feed capillary pressure, leading to ink leakage and damaged threads."
                ]
              },
              {
                heading: "Beyond Simple Rinsing: The Specialist's Touch",
                paragraphs: [
                  "A simple rinse under water only clears loose ink. A professional deep clean involves careful, non-destructive flushing using pure pH-balanced solutions that gently break down stubborn dye particles without reacting with the barrel’s celluloid or ebonite materials.",
                  "Our specialists also carefully inspect alignment under loupes and ensure that internal converters and pistons are lubricated with premium, pure silicone grease to keep mechanisms operating with buttery smoothness."
                ]
              },
              {
                heading: "The InKoPia Standard of Care",
                paragraphs: [
                  "With our on-site Concierge Ritual, your pen collection is treated with museum-grade care. We set up a private, pristine cleaning space at your office or home and restore your instruments to absolute peak condition, refilling them with fresh sommelier-curated ink so you can immediately return to the joy of signing and sketching."
                ]
              }
            ]),
            relatedPosts: "how-to-clean-a-fountain-pen-properly, common-pen-care-mistakes-to-avoid"
          }
        ];

        for (const post of starterPosts) {
          await pool.query(`
            INSERT INTO blog_posts (title, slug, metaDescription, publishedDate, readingTime, author, authorRole, authorImage, category, imageUrl, content, relatedPosts)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `, [
            post.title,
            post.slug,
            post.metaDescription,
            post.publishedDate,
            post.readingTime,
            post.author,
            post.authorRole,
            post.authorImage,
            post.category,
            post.imageUrl,
            post.content,
            post.relatedPosts
          ]);
        }
        console.log('🌱 Seeded 4 premium starter blog posts successfully');
      }

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
