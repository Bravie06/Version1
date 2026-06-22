import Dexie from 'dexie';

export const db = new Dexie('BravQosDB');

// Define database schema
db.version(1).stores({
  sites: '++id, site_code, site_name, vendor, region, town',
  kpis: '++id, date, site_code, tech, vendor, [site_code+tech+date]' // Compound index for efficient queries
});

export default db;
