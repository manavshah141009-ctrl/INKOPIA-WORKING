const fs = require('fs');
const path = require('path');
const db = require('../db');

const DATA_DIR = path.join(__dirname, '..', 'data');
try {
  if (!fs.existsSync(DATA_DIR) && !process.env.VERCEL) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
} catch (err) {
  console.warn('⚠️ Could not create data directory:', err.message);
}

class Storage {
  constructor() {
    this.isMongoConnected = false;
    this.isMysqlConnected = false;
    this.init();
  }

  async init() {
    // Check MySQL
    setTimeout(async () => {
      try {
        await db.query('SELECT 1');
        this.isMysqlConnected = true;
        console.log('✅ Storage: MySQL (MilesWeb) mode active.');
      } catch(e) {
        console.warn('⚠️ Storage: MySQL not available.');
      }
    }, 2000);
  }

  async find(modelName, query = {}) {
    if (this.isMysqlConnected) {
      try {
        const table = await this.mapModelToTable(modelName, query);
        if (table) {
          let sql = `SELECT * FROM ${table}`;
          let params = [];
          
          // Basic filtering for schemaId
          if (query.schemaId && table === 'site_data_generic') {
            sql += ' WHERE schema_id = ?';
            params.push(query.schemaId);
          }
          
          const results = await db.query(sql, params);
          return results.map(r => this.mapSqlToResponse(r, modelName));
        }
      } catch (err) {
        console.error(`❌ MySQL find error for ${modelName}:`, err.message);
      }
    }
    
    return this.getLocalData(modelName, query);
  }

  async save(modelName, data, id = null) {
    if (this.isMysqlConnected) {
      try {
        const table = await this.mapModelToTable(modelName, data);
        if (table) {
          // Prepare data for SQL (flatten if it's SiteData)
          let sqlData = { ...data };
          if (modelName === 'SiteData' && data.data) {
            // Mapping logic for relational tables
            if (table === 'orders') {
              sqlData = {
                client_name: data.data.clientName,
                client_phone: data.data.clientPhone,
                location: data.data.location,
                service: data.data.service,
                instrument: data.data.instrument,
                payment_method: data.data.paymentMethod,
                booking_time: data.data.bookingTime,
                appointment_date: data.data.date,
                amount: data.data.amount,
                status: (data.data.status || 'pending').toLowerCase(),
                commission_details: JSON.stringify(data.data)
              };
            } else if (table === 'inks') {
              sqlData = { name: data.data.name, hex: data.data.hex };
            } else if (table === 'agents') {
              sqlData = { name: data.data.name, role: data.data.role, type: data.data.type || 'ai' };
            } else {
              // Generic SiteData storage
              sqlData = {
                schema_id: data.schemaId,
                data: JSON.stringify(data.data)
              };
            }
          } else if (modelName === 'DynamicSchema') {
             sqlData = {
               title: data.displayName,
               slug: data.collectionName,
               content: JSON.stringify(data.fields)
             };
          }

          if (id) {
            const fields = Object.keys(sqlData).map(k => `\`${k}\` = ?`).join(', ');
            await db.query(`UPDATE ${table} SET ${fields} WHERE id = ?`, [...Object.values(sqlData), id]);
            return { _id: id, ...data };
          } else {
            const keys = Object.keys(sqlData).map(k => `\`${k}\``).join(', ');
            const placeholders = Object.keys(sqlData).map(() => '?').join(', ');
            const result = await db.query(`INSERT INTO ${table} (${keys}) VALUES (${placeholders})`, Object.values(sqlData));
            return { _id: result.insertId, ...data };
          }
        }
      } catch (err) {
        console.error(`❌ MySQL save error for ${modelName}:`, err.message);
      }
    }

    // Local Fallback
    const localItems = this.getLocalData(modelName);
    if (id) {
      const index = localItems.findIndex(item => item._id === id);
      if (index !== -1) {
        localItems[index] = { ...localItems[index], ...data, updatedAt: new Date() };
        this.saveLocalData(modelName, localItems);
        return localItems[index];
      }
    } else {
      const newItem = { ...data, _id: Math.random().toString(36).substr(2, 9), createdAt: new Date() };
      localItems.push(newItem);
      this.saveLocalData(modelName, localItems);
      return newItem;
    }
  }

  async delete(modelName, id) {
    if (this.isMysqlConnected) {
      try {
        const table = await this.mapModelToTable(modelName, { id });
        if (table) {
          await db.query(`DELETE FROM ${table} WHERE id = ?`, [id]);
          return;
        }
      } catch (err) {
        console.error(`❌ MySQL delete error:`, err.message);
      }
    }

    const localItems = this.getLocalData(modelName);
    const filtered = localItems.filter(item => item._id !== id);
    this.saveLocalData(modelName, filtered);
  }

  async mapModelToTable(modelName, context = {}) {
    if (modelName === 'DynamicSchema') return 'dynamic_pages';
    if (modelName === 'SiteData') {
      // Intelligently route based on schemaId or collection hints
      if (context.schemaId) {
        const schemas = await this.find('DynamicSchema');
        const schema = schemas.find(s => s._id == context.schemaId || s.id == context.schemaId);
        if (schema) {
          if (schema.slug === 'orders' || schema.collectionName === 'orders') return 'orders';
          if (schema.slug === 'inks' || schema.collectionName === 'inks') return 'inks';
          if (schema.slug === 'agents' || schema.collectionName === 'agents') return 'agents';
          if (schema.slug === 'users' || schema.collectionName === 'users') return 'users';
        }
      }
      return 'site_data_generic';
    }
    return null;
  }

  mapSqlToResponse(row, modelName) {
    const response = { _id: row.id, ...row };
    
    if (modelName === 'DynamicSchema') {
      response.collectionName = row.slug;
      response.displayName = row.title;
      try { response.fields = JSON.parse(row.content); } catch(e) { response.fields = []; }
    }
    
    if (modelName === 'SiteData') {
      // Reconstruct the { schemaId, data: { ... } } structure
      try {
        if (row.commission_details) {
          response.data = JSON.parse(row.commission_details);
        } else if (row.config_data) {
          response.data = JSON.parse(row.config_data);
        } else if (row.data) {
          response.data = JSON.parse(row.data);
        } else {
          // Flattened relational row
          response.data = { ...row };
        }
      } catch(e) {
        response.data = row;
      }
    }
    
    return response;
  }

  getLocalData(modelName, query = {}) {
    const filePath = path.join(DATA_DIR, `${modelName.toLowerCase()}.json`);
    if (!fs.existsSync(filePath)) return [];
    try {
      const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      return data.filter(item => {
        return Object.keys(query).every(key => item[key] === query[key]);
      });
    } catch (err) {
      return [];
    }
  }

  saveLocalData(modelName, data) {
    const filePath = path.join(DATA_DIR, `${modelName.toLowerCase()}.json`);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  }
}

module.exports = new Storage();
