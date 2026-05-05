import Dexie from 'dexie';

export const db = new Dexie('brav_qos_db');

db.version(1).stores({
  kpi_data: '++id, date, timestamp, vendor, technology, site_name, site_code, region, controller, cssr, dcr, traffic_voice, traffic_data'
});

export const clearDatabase = async () => {
    await db.kpi_data.clear();
};
