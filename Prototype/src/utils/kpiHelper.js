/**
 * KPI Aggregation Logic
 */

export const aggregateKPIs = (data) => {
  const grouped = data.reduce((acc, row) => {
    const date = row.date;
    if (!acc[date]) {
      acc[date] = {
        date,
        totalCSSRWeighted: 0,
        totalTraffic: 0,
        totalDCR: 0,
        count: 0,
        trafficVoice: 0,
        trafficData: 0
      };
    }

    const traffic = row.trafficVoice + row.trafficData || 1; // Avoid div by zero
    acc[date].totalCSSRWeighted += row.cssr * traffic;
    acc[date].totalTraffic += traffic;
    acc[date].totalDCR += row.dcr;
    acc[date].trafficVoice += row.trafficVoice;
    acc[date].trafficData += row.trafficData;
    acc[date].count += 1;

    return acc;
  }, {});

  return Object.values(grouped).map(group => ({
    date: group.date,
    cssr: group.totalTraffic > 0 ? (group.totalCSSRWeighted / group.totalTraffic).toFixed(2) : 0,
    dcr: group.count > 0 ? (group.totalDCR / group.count).toFixed(2) : 0,
    trafficVoice: group.trafficVoice.toFixed(2),
    trafficData: group.trafficData.toFixed(2),
  })).sort((a, b) => new Date(a.date) - new Date(b.date));
};

export const filterByTimeRange = (data, range) => {
  if (!data || data.length === 0) return [];
  const latestDate = new Date(Math.max(...data.map(d => new Date(d.date))));
  let days = 7;
  if (range === '1D') days = 1;
  if (range === '14D') days = 14;
  if (range === '1M') days = 30;

  const cutoff = new Date(latestDate);
  cutoff.setDate(cutoff.getDate() - days);

  return data.filter(d => new Date(d.date) >= cutoff);
};
