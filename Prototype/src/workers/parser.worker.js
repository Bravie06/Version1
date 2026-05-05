import * as XLSX from 'xlsx';
import { db } from '../db/db';
import sitesMacro from '../data/sites_macro.json';

// Create a mapping for quick lookup
const siteCodeMap = new Map();
sitesMacro.forEach(site => {
    if (site['Site code']) {
        siteCodeMap.set(site['Site code'].toUpperCase(), site);
    }
});

const extractSiteCode = (siteName = "") => {
    if (!siteName) return "UNKNOWN";
    const regex = /^(EXN|NRD|ADM|SUO|NRO|CTR|LIT|EST|OST|SUD)_\d{3,4}/i;
    const match = siteName.match(regex);
    return match ? match[0].toUpperCase() : "UNKNOWN";
};

const getRegionInfo = (siteCode) => {
    const siteInfo = siteCodeMap.get(siteCode);
    if (siteInfo) {
        return {
            region: siteInfo.Region || 'UNKNOWN',
            town: siteInfo.Town || 'UNKNOWN',
            typology: siteInfo.Typology || 'UNKNOWN'
        };
    }
    return { region: 'UNKNOWN', town: 'UNKNOWN', typology: 'UNKNOWN' };
};

const parseExcelDate = (excelDate) => {
    if (!excelDate) return new Date();
    // if string
    if (typeof excelDate === 'string') {
        const parsed = new Date(excelDate);
        if (!isNaN(parsed.getTime())) return parsed;
    }
    // if excel serial date
    if (typeof excelDate === 'number') {
        return new Date((excelDate - (25567 + 2)) * 86400 * 1000); // Quick conversion for Windows Excel
    }
    return new Date();
};

const processRows = (rows, fileId) => {
    const records = [];

    rows.forEach(row => {
        let site_name = "";
        let date = "";
        let cssr = 0;
        let dcr = 0;
        let traffic_voice = 0;
        let traffic_data = 0;
        let controller = "UNKNOWN";
        let vendor = "";
        let technology = "";

        // Common default extractions mapping based on prompts
        if (fileId === 'huawei_2g') {
            vendor = 'HUAWEI'; technology = '2G';
            site_name = row['Site Name'] || "";
            date = row['Date'];
            cssr = row['FT_Call Setup Success Rate-Speech'];
            dcr = row['FT_Drop Call Rate-Speech'];
            controller = row['GBSC'] || "UNKNOWN";
            traffic_voice = row['K3014:Traffic Volume on TCH(Erl)'];
            traffic_data = row['2G PS Traffic(MB)'];
        } else if (fileId === 'huawei_3g') {
            vendor = 'HUAWEI'; technology = '3G';
            site_name = row['NODEBNAME'] || "";
            date = row['Date'];
            cssr = row['GRP_3G Call Setup Success Rate (CS)(%)'];
            dcr = row['Grp_3G Drop Call Rate (CS)%_Update'];
            controller = row['RNC'] || "UNKNOWN";
            traffic_voice = row['Grp_ 3G TRAFFIC – SPEECH(Erl)'];
            traffic_data = row['Grp_3G&3G+ TOTAL DATA TRAFFIC VOLUME DL&UL(GB)'];
        } else if (fileId === 'huawei_4g') {
            vendor = 'HUAWEI'; technology = '4G';
            site_name = row['eNodeB Name'] || "";
            date = row['Date'];
            cssr = row['4G_Grp_4G/LTE CALL SETUP SUCCESS RATE (WITHOUT VOLTE)(%)'];
            dcr = row['4G_Grp_4G/LTE DROP CALL RATE (WITHOUT VOLTE)(%)'];
            traffic_data = row['4G_Grp_4G/LTE TRAFFIC VOLUME(GB)'];
            // 4G has no controller
        } else if (fileId === 'zte_2g') {
            vendor = 'ZTE'; technology = '2G';
            site_name = row['SITE Name'] || "";
            date = row['Begin Time'];
            cssr = row['ORA_2G_CSSR_CS_New(%)'];
            dcr = row['ORA_2G_Call_Drop_CS_New(%)'];
            controller = row['Managed Element'] || "UNKNOWN";
            traffic_voice = row['ORA_2G_CS_TRAFFIC'];
            traffic_data = row['ORA_2G_Traffic_Data_GB'];
        } else if (fileId === 'zte_3g') {
            vendor = 'ZTE'; technology = '3G';
            site_name = row['NodeB Name'] || "";
            date = row['Begin Time'];
            cssr = row['ORA_3G_CSSR CS with Cell PCH/URA PCH (%)'];
            dcr = row['ORA_3G_Drop Call Rate CS(%)'];
            controller = row['RNC Managed NE'] || "UNKNOWN";
            traffic_voice = row['ORA_3G_CS Voice Traffic (Erl)'];
            traffic_data = row['ORA_3G_Traffic Total Data_MAC (GB)'];
        } else if (fileId === 'zte_4g') {
            vendor = 'ZTE'; technology = '4G';
            site_name = row['ENBFunction Name'] || "";
            date = row['Begin Time'];
            cssr = row['ORA_4G_CALL_SETUP_SUCCESS_RATE_New(%)'];
            dcr = row['ORA_4G_LTE_Drop_Call_Rate_WO_VoLTE_New(%)'];
            traffic_data = row['ORA_4G_Total TRAFFIC(DL+UL)(GB)'];
        } else if (fileId === 'nokia_2g') {
            vendor = 'NOKIA'; technology = '2G';
            site_name = row['BCF name'] || "";
            date = row['Period start time'];
            cssr = row['ORA_2G_CSSR_CS_new'];
            dcr = row['ORA_2G_Call_Drop_CS_new'];
            controller = row['BSC name'] || "UNKNOWN";
            traffic_voice = row['Erlang_Traffic_Carried_2G'];
        } else if (fileId === 'nokia_3g') {
            vendor = 'NOKIA'; technology = '3G';
            site_name = row['WBTS name'] || "";
            date = row['Period start time'];
            cssr = row['ORA_CSSR_CS_CellPCH_URAPCHnew'];
            dcr = row['grp_3G_Drop_Call_CS'];
            controller = row['RNC name'] || "UNKNOWN";
            traffic_voice = row['grp_traffic_speech_erlangs'];
            traffic_data = row['ORA_3G_Traffic_Data_Total'];
        } else if (fileId === 'nokia_4g') {
            vendor = 'NOKIA'; technology = '4G';
            site_name = row['LNBTS name'] || "";
            date = row['Period start time'];
            cssr = row['LTE_CALL_SETUP_SUCCESS_RATE_NEW_PERC'];
            dcr = row['DRC SRAN'];
            traffic_data = row['Grp_4G_Traffic_New_Gbytes'];
        }

        const site_code = extractSiteCode(site_name);
        const { region, town, typology } = getRegionInfo(site_code);

        const parsedDate = parseExcelDate(date);

        // Clean values
        const parseValue = (val) => {
            if (val === undefined || val === null || val === "" || isNaN(val)) return 0;
            return parseFloat(val);
        };

        if (site_name) {
             records.push({
                date: parsedDate.toISOString(),
                timestamp: parsedDate.getTime(),
                vendor,
                technology,
                site_name,
                site_code,
                region,
                town,
                typology,
                controller,
                cssr: parseValue(cssr),
                dcr: parseValue(dcr),
                traffic_voice: parseValue(traffic_voice),
                traffic_data: parseValue(traffic_data)
             });
        }
    });

    return records;
};

// Web Worker entry point
self.onmessage = async (e) => {
    const { fileBuffer, fileId } = e.data;
    try {
        const wb = XLSX.read(fileBuffer, { type: 'array' });

        let allRecords = [];

        if (fileId === 'nokia') {
            // Nokia file contains multiple sheets (2G, 3G, 4G)
            const sheetsMap = {
                '2G': 'nokia_2g',
                '3G': 'nokia_3g',
                '4G KPI Report Acceptance': 'nokia_4g',
                '4G': 'nokia_4g' // fallback
            };

            for (const [sheetName, id] of Object.entries(sheetsMap)) {
                let ws = wb.Sheets[sheetName];
                // Try finding by generic substring if exact name fails
                if (!ws) {
                    const foundName = wb.SheetNames.find(n => n.includes(sheetName) || sheetName.includes(n));
                    if (foundName) ws = wb.Sheets[foundName];
                }
                if (ws) {
                    const rows = XLSX.utils.sheet_to_json(ws);
                    allRecords = allRecords.concat(processRows(rows, id));
                }
            }
        } else {
             const wsname = wb.SheetNames[0];
             const ws = wb.Sheets[wsname];
             const rows = XLSX.utils.sheet_to_json(ws);
             allRecords = processRows(rows, fileId);
        }

        // Bulk add to Dexie
        await db.kpi_data.bulkAdd(allRecords);

        self.postMessage({ success: true, fileId, recordCount: allRecords.length });

    } catch (err) {
        console.error(err);
        self.postMessage({ success: false, fileId, error: err.message });
    }
};