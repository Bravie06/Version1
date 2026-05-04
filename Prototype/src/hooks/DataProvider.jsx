import { useState } from 'react';
import { DataContext } from './DataContext';

export const DataProvider = ({ children }) => {
  const [siteData, setSiteData] = useState([]);
  const [kpiData, setKpiData] = useState({
    cssr: { '2G': [], '3G': [], '4G': [] },
    dcr: { '2G': [], '3G': [], '4G': [] },
    traffic: []
  });

  const value = {
    siteData,
    setSiteData,
    kpiData,
    setKpiData
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};
