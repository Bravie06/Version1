import Dexie from 'dexie';

export const db = new Dexie('BravQosDB');

db.version(1).stores({
  sites: 'site_code, site_name, vendor, region, town, typology',
  kpis: '++id, site_code, vendor, tech, date, [site_code+tech+date], [vendor+tech+date]'
});

export const clearDatabase = async () => {
  await db.sites.clear();
  await db.kpis.clear();
};

export const saveSites = async (sites) => {
  return await db.sites.bulkPut(sites);
};

export const saveKPIs = async (kpis) => {
  return await db.kpis.bulkPut(kpis);
};
