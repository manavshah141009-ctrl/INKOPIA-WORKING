const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

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
    this.localData = {};
    this.init();
  }

  async init() {
    mongoose.connection.on('connected', () => {
      console.log('✅ Storage: MongoDB connected. Switching to cloud mode.');
      this.isMongoConnected = true;
    });

    mongoose.connection.on('disconnected', () => {
      console.log('⚠️ Storage: MongoDB disconnected. Switching to local mode.');
      this.isMongoConnected = false;
    });
  }

  async find(modelName, query = {}) {
    if (this.isMongoConnected) {
      try {
        const Model = mongoose.model(modelName);
        return await Model.find(query).maxTimeMS(5000);
      } catch (err) {
        console.error(`📡 [STORAGE] MongoDB find error for ${modelName}:`, err.message);
        // Do not throw, fall back to local
      }
    }
    
    try {
      return this.getLocalData(modelName, query);
    } catch (err) {
      console.error(`📂 [STORAGE] Local fallback error:`, err.message);
      return [];
    }
  }

  async findById(modelName, id) {
    if (this.isMongoConnected) {
      try {
        const Model = mongoose.model(modelName);
        return await Model.findById(id);
      } catch (err) {
        console.error(`MongoDB findById error for ${modelName}:`, err.message);
      }
    }
    return this.getLocalData(modelName).find(item => item._id === id);
  }

  async save(modelName, data, id = null) {
    if (this.isMongoConnected) {
      try {
        const Model = mongoose.model(modelName);
        if (id) {
          return await Model.findByIdAndUpdate(id, data, { new: true });
        } else {
          const instance = new Model(data);
          const saved = await instance.save();
          console.log(`✅ [STORAGE] Saved ${modelName} to MongoDB`);
          return saved;
        }
      } catch (err) {
        console.error(`❌ [STORAGE] MongoDB save error for ${modelName}:`, err.message);
        throw err; // Re-throw to be caught by route and sent to client
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
      const newItem = { 
        ...data, 
        _id: Math.random().toString(36).substr(2, 9), 
        createdAt: new Date(), 
        updatedAt: new Date() 
      };
      localItems.push(newItem);
      this.saveLocalData(modelName, localItems);
      return newItem;
    }
  }

  async delete(modelName, id) {
    if (this.isMongoConnected) {
      try {
        const Model = mongoose.model(modelName);
        await Model.findByIdAndDelete(id);
        return;
      } catch (err) {
        console.error(`MongoDB delete error for ${modelName}:`, err.message);
      }
    }

    const localItems = this.getLocalData(modelName);
    const filtered = localItems.filter(item => item._id !== id);
    this.saveLocalData(modelName, filtered);
  }

  getLocalData(modelName, query = {}) {
    const filePath = path.join(DATA_DIR, `${modelName.toLowerCase()}.json`);
    if (!fs.existsSync(filePath)) {
      // Return default schemas if they don't exist locally
      if (modelName === 'DynamicSchema') {
        return [];
      }
      return [];
    }
    try {
      const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      // Basic filtering
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
