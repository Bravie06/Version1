export const SITES_DATA = [
  { site_name: 'DLA_001_AKWA', site_code: 'DLA001', vendor: 'NOKIA', region: 'Littoral', town: 'Douala', typology: 'Macro', status: 'Normal' },
  { site_name: 'DLA_002_BONANJO', site_code: 'DLA002', vendor: 'NOKIA', region: 'Littoral', town: 'Douala', typology: 'Macro', status: 'Degraded' },
  { site_name: 'YAO_001_BASTOS', site_code: 'YAO001', vendor: 'HUAWEI', region: 'Centre', town: 'Yaounde', typology: 'Macro', status: 'Normal' },
  { site_name: 'YAO_002_NGOA', site_code: 'YAO002', vendor: 'HUAWEI', region: 'Centre', town: 'Yaounde', typology: 'Micro', status: 'Down' },
  { site_name: 'GUA_001_CENTRE', site_code: 'GUA001', vendor: 'ZTE', region: 'North', town: 'Garoua', typology: 'Macro', status: 'Normal' },
  { site_name: 'BAF_001_MARCHE', site_code: 'BAF001', vendor: 'NOKIA', region: 'West', town: 'Bafoussam', typology: 'Macro', status: 'Normal' },
  // Add more as needed
];

export const REGIONS = [
  'Littoral', 'Centre', 'North', 'West', 'South', 'East', 'Adamawa', 'Far North', 'North West', 'South West'
];

export const generateKPIData = (kpiType) => {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  return days.map(day => ({
    name: day,
    value: kpiType === 'TRAFFIC' ? Math.floor(Math.random() * 500) : (90 + Math.random() * 10).toFixed(2),
    data: Math.floor(Math.random() * 1000),
    voice: Math.floor(Math.random() * 200),
  }));
};
