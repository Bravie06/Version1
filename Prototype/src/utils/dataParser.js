const SITE_CODE_REGEX = /^(EXN|NRD|ADM|SUO|NRO|CTR|LIT|EST|OST|SUD)_\d{3,4}/;

export const extractSiteCode = (siteName = "") => {
  if (!siteName) return "UNKNOWN";
  const match = siteName.toString().match(SITE_CODE_REGEX);
  return match ? match[0] : "UNKNOWN";
};

const formatDate = (dateStr) => {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? dateStr : d.toISOString().split('T')[0];
};

const parseKPIValue = (val) => {
  if (val === undefined || val === null || val === '') return 0;
  const num = parseFloat(val);
  return isNaN(num) ? 0 : num;
};

const VENDOR_CONFIG = {
  HUAWEI_4G: {
    date: "Date",
    siteName: "eNodeB Name",
    cssr: "4G_Grp_4G/LTE CALL SETUP SUCCESS RATE (WITHOUT VOLTE)(%)",
    dcr: "4G_Grp_4G/LTE DROP CALL RATE (WITHOUT VOLTE)(%)",
    trafficData: " 4G_Grp_4G/LTE TRAFFIC VOLUME(GB)",
    tech: "4G",
    vendor: "HUAWEI"
  },
  HUAWEI_3G: {
    date: "Date",
    siteName: "NODEBNAME",
    cssr: "GRP_3G Call Setup Success Rate (CS)(%)",
    dcr: "Grp_3G Drop Call Rate (CS)%_Update",
    controller: "RNC",
    trafficVoice: "Grp_ 3G TRAFFIC – SPEECH(Erl)",
    trafficData: "Grp_3G&3G+ TOTAL DATA TRAFFIC VOLUME DL&UL(GB)",
    tech: "3G",
    vendor: "HUAWEI"
  },
  HUAWEI_2G: {
    date: "Date",
    siteName: "Site Name",
    cssr: "FT_Call Setup Success Rate-Speech",
    dcr: "FT_Drop Call Rate-Speech",
    controller: "GBSC",
    trafficVoice: "K3014:Traffic Volume on TCH(Erl)",
    trafficData: "2G PS Traffic(MB)",
    tech: "2G",
    vendor: "HUAWEI"
  },
  ZTE_4G: {
    date: "Begin Time",
    siteName: "ENBFunction Name",
    cssr: "ORA_4G_CALL_SETUP_SUCCESS_RATE_New(%)",
    dcr: "ORA_4G_LTE_Drop_Call_Rate_WO_VoLTE_New(%)",
    trafficData: "ORA_4G_Total TRAFFIC(DL+UL)(GB)",
    tech: "4G",
    vendor: "ZTE"
  },
  ZTE_3G: {
    date: "Begin Time",
    siteName: "NodeB Name",
    cssr: "ORA_3G_CSSR CS with Cell PCH/URA PCH (%)",
    dcr: "ORA_3G_Drop Call Rate CS(%)",
    controller: "RNC Managed NE",
    trafficVoice: "ORA_3G_CS Voice Traffic (Erl)",
    trafficData: "ORA_3G_Traffic Total Data_MAC (GB)",
    tech: "3G",
    vendor: "ZTE"
  },
  ZTE_2G: {
    date: "Begin Time",
    siteName: "SITE Name",
    cssr: "ORA_2G_CSSR_CS_New(%)",
    dcr: "ORA_2G_Call_Drop_CS_New(%)",
    controller: "Managed Element",
    trafficVoice: "ORA_2G_CS_TRAFFIC",
    trafficData: "ORA_2G_Traffic_Data_GB",
    tech: "2G",
    vendor: "ZTE"
  },
  NOKIA_4G: {
    date: "Period start time",
    siteName: "LNBTS name",
    cssr: "LTE_CALL_SETUP_SUCCESS_RATE_NEW_PERC",
    dcr: "DRC SRAN",
    trafficData: "Grp_4G_Traffic_New_Gbytes",
    tech: "4G",
    vendor: "NOKIA"
  },
  NOKIA_3G: {
    date: "Period start time",
    siteName: "WBTS name",
    cssr: "ORA_CSSR_CS_CellPCH_URAPCHnew",
    dcr: "grp_3G_Drop_Call_CS",
    controller: "RNC name",
    trafficVoice: "grp_traffic_speech_erlangs",
    trafficData: "ORA_3G_Traffic_Data_Total",
    tech: "3G",
    vendor: "NOKIA"
  },
  NOKIA_2G: {
    date: "Period start time",
    siteName: "BCF name",
    cssr: "ORA_2G_CSSR_CS_new",
    dcr: "ORA_2G_Call_Drop_CS_new",
    controller: "BSC name",
    trafficVoice: "Erlang_Traffic_Carried_2G",
    tech: "2G",
    vendor: "NOKIA"
  }
};

export const parseVendorData = (data, configKey) => {
  const config = VENDOR_CONFIG[configKey];
  if (!config) return [];

  return data.map(row => {
    const siteName = row[config.siteName] || "";
    return {
      site_code: extractSiteCode(siteName),
      site_name: siteName,
      vendor: config.vendor,
      tech: config.tech,
      date: formatDate(row[config.date]),
      cssr: parseKPIValue(row[config.cssr]),
      dcr: parseKPIValue(row[config.dcr]),
      trafficVoice: parseKPIValue(row[config.trafficVoice]),
      trafficData: parseKPIValue(row[config.trafficData]),
      controller: config.controller ? row[config.controller] : null
    };
  });
};
