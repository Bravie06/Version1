import { useState, useCallback } from 'react';
import { DataContext } from './DataContext';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../data/db';

export const DataProvider = ({ children }) => {
  const [siteDataState, setSiteDataState] = useState([]);

  // Use live query for automatic updates when DB changes
  const sites = useLiveQuery(() => db.sites.toArray());

  const getKpiData = useCallback(async (filters) => {
    const { vendor, tech, site_code } = filters;
    let query = db.kpis;

    if (vendor && tech && site_code) {
        // Use compound index if possible, but for simplicity let's filter
        return await db.kpis
            .where('vendor').equals(vendor)
            .and(item => item.tech === tech && item.site_code === site_code)
            .toArray();
    } else if (vendor && tech) {
        return await db.kpis
            .where('vendor').equals(vendor)
            .and(item => item.tech === tech)
            .toArray();
    }

    return await db.kpis.toArray();
  }, []);

  const value = {
    siteData: sites || siteDataState,
    setSiteData: setSiteDataState,
    getKpiData,
    db
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};
