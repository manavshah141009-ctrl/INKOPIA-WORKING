const db = require('./db');

// Exact list of input postal zones from the amazingmaharashtra.com image
// mmapped strictly against:
// - Western: Andheri, Bandra, Khar, Santacruz, Juhu, Goregaon, Malad, Borivali, Dahisar, J.B. Nagar, Versova, Chakala, SEEPZ, Kandivali, Jogeshwari, Mandpeshwar, Motilal Nagar, Bangur Nagar
// - Central: Chembur, Ghatkopar, Kurla, Sion, Nehru Nagar, Saki Naka, Powai, Pant Nagar, Vikhroli, Tagore Nagar, Barve Nagar
// - Town: Mumbai GPO, Kalbadevi, Mandvi, Girgaon, Colaba, Malabar Hill, Grant Road, Mumbai Central, Chinch Bunder, Mazgaon, Jacob Circle, Parel, Delisle Road, Dadar (C.R.), Sewree, Mahim, Dharavi, Worli, Matunga, Marine Lines, Nariman Point, Fort, Prabhadevi, Cumballa Hill, Jijamata Udyan, B.S. RD. Dadar, Wadala, Mantralaya, Tank Road, Tulsiwadi, Rajbhavan, A.K. Marg, Antop Hill, Ballard Pier, Council Hall
const rawData = [
  // COLUMN 1
  { name: "Mumbai GPO", pincode: "400001", zone: "Town" },
  { name: "Kalbadevi", pincode: "400002", zone: "Town" },
  { name: "Mandvi", pincode: "400003", zone: "Town" },
  { name: "Girgaon", pincode: "400004", zone: "Town" },
  { name: "Colaba", pincode: "400005", zone: "Town" },
  { name: "Malabar Hill", pincode: "400006", zone: "Town" },
  { name: "Grant Road", pincode: "400007", zone: "Town" },
  { name: "Mumbai Central", pincode: "400008", zone: "Town" },
  { name: "Chinch Bunder", pincode: "400009", zone: "Town" },
  { name: "Mazgaon", pincode: "400010", zone: "Town" },
  { name: "Jacob Circle", pincode: "400011", zone: "Town" },
  { name: "Parel", pincode: "400012", zone: "Town" },
  { name: "Delisle Road", pincode: "400013", zone: "Town" },
  { name: "Dadar (C.R.)", pincode: "400014", zone: "Town" },
  { name: "Sewree", pincode: "400015", zone: "Town" },
  { name: "Mahim", pincode: "400016", zone: "Town" },
  { name: "Dharavi", pincode: "400017", zone: "Town" },
  { name: "Worli", pincode: "400018", zone: "Town" },
  { name: "Matunga", pincode: "400019", zone: "Central" }, // Matunga East / Central line region
  { name: "Marine Lines", pincode: "400020", zone: "Town" },
  { name: "Nariman Point", pincode: "400021", zone: "Town" },
  { name: "Sion", pincode: "400022", zone: "Central" },
  { name: "Fort", pincode: "400023", zone: "Town" },
  { name: "Nehru Nagar", pincode: "400024", zone: "Central" },
  { name: "Prabhadevi", pincode: "400025", zone: "Town" },
  { name: "Cumballa Hill", pincode: "400026", zone: "Town" },
  { name: "Jijamata Udyan", pincode: "400027", zone: "Town" },
  { name: "B.S. RD. Dadar", pincode: "400028", zone: "Town" },
  { name: "Airport", pincode: "400029", zone: "Western" }, // Santacruz P&T area
  { name: "Wadala", pincode: "400031", zone: "Town" },
  { name: "Mantralaya", pincode: "400032", zone: "Town" },
  { name: "Tank Road", pincode: "400033", zone: "Town" },

  // COLUMN 2
  { name: "Tulsiwadi", pincode: "400034", zone: "Town" },
  { name: "Rajbhavan", pincode: "400035", zone: "Town" },
  { name: "A.K. Marg", pincode: "400036", zone: "Town" },
  { name: "Antop Hill", pincode: "400037", zone: "Town" },
  { name: "Ballard Pier", pincode: "400038", zone: "Town" },
  { name: "Council Hall", pincode: "400039", zone: "Town" },
  // Bhandup E (400042) is above Ghatkopar - BLOCKED
  // Shivaji Nagar (400043) is Govandi/Mankhurd - Central Line - SEEDED
  { name: "Shivaji Nagar", pincode: "400043", zone: "Central" },
  { name: "Govandi", pincode: "400046", zone: "Central" },
  { name: "Juhu", pincode: "400049", zone: "Western" },
  { name: "Bandra (W)", pincode: "400050", zone: "Western" },
  { name: "Bandra (E)", pincode: "400051", zone: "Western" },
  { name: "Khar", pincode: "400052", zone: "Western" },
  { name: "Azad Nagar", pincode: "400053", zone: "Western" },
  { name: "Santacruz (W)", pincode: "400054", zone: "Western" },
  { name: "Santacruz (E)", pincode: "400055", zone: "Western" },
  { name: "Vile Parle (W)", pincode: "400056", zone: "Western" },
  { name: "Vile Parle (E)", pincode: "400057", zone: "Western" },
  { name: "Andheri (W)", pincode: "400058", zone: "Western" },
  { name: "J.B. Nagar", pincode: "400059", zone: "Western" },
  { name: "Jogeshwari", pincode: "400060", zone: "Western" },
  { name: "Versova", pincode: "400061", zone: "Western" },
  { name: "Goregaon (W)", pincode: "400062", zone: "Western" },
  { name: "Goregaon (E)", pincode: "400063", zone: "Western" },
  { name: "Malad (W)", pincode: "400064", zone: "Western" },
  { name: "Aarey Colony", pincode: "400065", zone: "Western" },
  { name: "Borivali (E)", pincode: "400066", zone: "Western" },
  { name: "Kandivali (W)", pincode: "400067", zone: "Western" },
  { name: "Dahisar", pincode: "400068", zone: "Western" },
  { name: "Andheri (E)", pincode: "400069", zone: "Western" },
  { name: "Kurla", pincode: "400070", zone: "Central" },
  { name: "Chembur", pincode: "400071", zone: "Central" },

  // COLUMN 3
  { name: "Saki Naka", pincode: "400072", zone: "Central" },
  { name: "RCF Chembur", pincode: "400074", zone: "Central" },
  { name: "Pant Nagar", pincode: "400075", zone: "Central" },
  { name: "IIT Powai", pincode: "400076", zone: "Central" },
  { name: "Ghatkopar (E)", pincode: "400077", zone: "Central" },
  // Bhandup W (400078) is above Ghatkopar - BLOCKED
  // Vikhroli (400079) is Central - up to Ghatkopar? No, Vikhroli/Bhandup are North of Ghatkopar.
  // Mulund, Tagore Nagar, BARC, Ghatkopar W (400086) - Ghatkopar W is SEEDED
  { name: "Ghatkopar (W)", pincode: "400086", zone: "Central" },
  { name: "Barve Nagar", pincode: "400084", zone: "Central" }, // Barve Nagar is in Ghatkopar
  { name: "BARC", pincode: "400085", zone: "Central" }, // Chembur/Trombay region
  { name: "Tilak Nagar", pincode: "400089", zone: "Central" }, // Chembur region
  { name: "Bangur Nagar", pincode: "400090", zone: "Western" },
  { name: "Borivali (W)", pincode: "400092", zone: "Western" },
  { name: "Chakala", pincode: "400093", zone: "Western" },
  { name: "Khardi", pincode: "400095", zone: "Western" },
  { name: "SEEPZ", pincode: "400096", zone: "Western" },
  { name: "Malad (E)", pincode: "400097", zone: "Western" },
  { name: "Vidyanagari", pincode: "400098", zone: "Western" },
  { name: "Sahar", pincode: "400099", zone: "Western" },
  { name: "Kandivali", pincode: "400101", zone: "Western" },
  { name: "Jogeshwari (W)", pincode: "400102", zone: "Western" },
  { name: "Mandpeshwar", pincode: "400103", zone: "Western" },
  { name: "Motilal Nagar", pincode: "400104", zone: "Western" }
];

async function run() {
  console.log('🔄 Re-seeding Mumbai postal database zones based strictly on Amazing Maharashtra chart...');
  await db.initDB();
  
  // Clear existing configurations
  await db.query('DELETE FROM serviceable_pincodes');
  console.log('🗑️  Cleared old configurations.');

  let added = 0;
  const processed = new Set(); // Prevent duplicates

  for (const item of rawData) {
    if (processed.has(item.pincode)) continue;
    processed.add(item.pincode);
    
    try {
      await db.query(
        'INSERT INTO serviceable_pincodes (pincode, region) VALUES (?, ?)',
        [item.pincode, item.zone]
      );
      added++;
      console.log(`📍 Seeded ${item.pincode} -> [${item.zone}] Zone (${item.name})`);
    } catch (e) {
      console.error(`❌ Failed to seed ${item.pincode}: ${e.message}`);
    }
  }

  console.log(`\n🎉 Completed! Successfully seeded exactly ${added} Mumbai serviceable pincodes based on the provided chart.`);
  process.exit(0);
}

run();
