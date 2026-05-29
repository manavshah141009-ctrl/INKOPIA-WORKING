const db = require('./db');

async function main() {
  console.log('Seeding Pen Brand Pricing via raw pool...');
  await db.initDB();

  const tiers = [
    { brand: 'Standard / Any Other Brand', price: 1500.00 },
    { brand: 'Visconti', price: 2000.00 },
    { brand: 'Montblanc', price: 2500.00 },
  ];

  for (const tier of tiers) {
    try {
      await db.query(`
        INSERT INTO InkBrandPricing (id, brand, price, createdAt, updatedAt)
        VALUES (UUID(), ?, ?, NOW(), NOW())
        ON DUPLICATE KEY UPDATE price = ?
      `, [tier.brand, tier.price, tier.price]);
      console.log(`Upserted ${tier.brand} at ₹${tier.price}`);
    } catch (e) {
      console.error('Failed to seed tier:', tier.brand, e.message);
    }
  }

  // Remove the old ones if they exist
  await db.query(`DELETE FROM InkBrandPricing WHERE brand IN ('Standard/Default', 'Premium Brand', 'Luxury Brand')`);

  console.log('Seeding completed.');
  process.exit(0);
}

main();
