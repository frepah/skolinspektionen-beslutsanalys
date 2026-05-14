/**
 * Grundstruktur för Skolinspektionens analysdatabas.
 *
 * Första Codex-etappen skapar arbetsbokens flikar, rubriker, inställningar,
 * kodböcker, loggar och en adminmeny. Koden hanterar endast analysdelen och
 * ändrar inte PDF-bevakaren.
 */

const ANALYSIS_SYSTEM = Object.freeze({
  version: '0.1.0',
  workbookName: 'Skolinspektionen analysdatabas',
  logActor: 'analysis-workbook',
  manualLockHeader: 'manuellt_låst',
  status: Object.freeze({
    ok: 'OK',
    warning: 'VARNING',
    error: 'FEL'
  })
});

const ANALYSIS_SETTINGS_DEFAULTS = Object.freeze({
  STORE_FULL_TEXT: 'NEJ',
  ALLOW_FULL_TEXT_STORAGE: 'NEJ',
  DELETE_TEMP_TEXT_FILES: 'JA',
  LOG_FULL_TEXT: 'NEJ',
  LOG_PROMPTS: 'NEJ',
  AI_COST_LIMIT: '0',
  AI_ALLOW_PAID_USAGE: 'NEJ',
  ALLOW_PAID_SERVICES: 'NEJ',
  MAX_MONTHLY_COST: '0',
  ALLOW_EXTERNAL_AI: 'NEJ',
  SEND_ERROR_EMAILS: 'NEJ',
  SEND_DAILY_SUMMARY: 'NEJ',
  DEFAULT_DASHBOARD_LEVEL: 'ÄRENDE',
  DEFAULT_BATCH_SIZE: '10',
  PERSON_ANALYSIS_MIN_CASES: '10',
  DASHBOARD_STALE_HOURS_WARNING: '24',
  ANALYSIS_MODEL_VERSION: '0.1.0',
  CODEBOOK_VERSION: '0.1.0',
  DASHBOARD_VERSION: '0.1.0'
});

const ANALYSIS_TABLES = Object.freeze({
  'Inställningar_Analys': [
    'nyckel', 'värde', 'beskrivning', 'kategori', 'obligatorisk', 'manuellt_låst', 'senast_uppdaterad'
  ],
  'Dokument': [
    'drive_file_id', 'filnamn', 'drive_url', 'publiceringsdatum', 'beslutsdatum', 'dokumenttyp',
    'dnr_raw', 'dnr_normaliserad', 'case_id', 'text_extraction_method', 'text_extraction_status',
    'text_length', 'page_count', 'text_quality_score', 'analysis_status', 'analysis_model_version',
    'codebook_version', 'confidence', 'manuell_granskning', 'manuellt_låst', 'skapad_tid', 'uppdaterad_tid'
  ],
  'Ärenden': [
    'case_id', 'dnr_raw', 'dnr_normaliserad', 'ärendetyp', 'beslutsdatum_första', 'beslutsdatum_senaste',
    'huvudman_id', 'huvudman_namn', 'huvudmannatyp_grov', 'huvudmannatyp_fin', 'lägeskommun', 'län',
    'skolform', 'föreläggande', 'vite', 'vitesbelopp', 'valuta', 'dokumentationskrav', 'allvarsindex',
    'uppföljningsutfall', 'confidence', 'manuell_granskning', 'manuellt_låst', 'skapad_tid', 'uppdaterad_tid'
  ],
  'ÄrendeDokument': [
    'case_id', 'drive_file_id', 'dokumentroll', 'dnr_normaliserad', 'beslutsdatum', 'confidence',
    'manuell_granskning', 'manuellt_låst', 'skapad_tid', 'uppdaterad_tid'
  ],
  'Huvudmän': [
    'huvudman_id', 'organisationsnummer', 'huvudman_namn', 'huvudmannatyp_grov', 'huvudmannatyp_fin',
    'kommun', 'län', 'confidence', 'manuell_granskning', 'manuellt_låst', 'skapad_tid', 'uppdaterad_tid'
  ],
  'Skolenheter': [
    'skolenhet_id', 'skolenhetskod', 'skolenhetsnamn', 'huvudman_id', 'huvudman_namn', 'lägeskommun',
    'län', 'skolform', 'årskurser', 'elevantal', 'confidence', 'manuell_granskning', 'manuellt_låst',
    'skapad_tid', 'uppdaterad_tid'
  ],
  'Bristområden': [
    'kod', 'namn', 'bred_kategori', 'fin_kategori', 'aktiv', 'beskrivning', 'sortering'
  ],
  'DokumentBrist': [
    'brist_id', 'case_id', 'drive_file_id', 'bristområde_kod', 'briststatus', 'elevgrupp', 'skolform',
    'årskurs', 'lagrum_kod', 'åtgärdstyp', 'allvarsindex', 'confidence', 'manuell_granskning',
    'manuellt_låst', 'skapad_tid', 'uppdaterad_tid'
  ],
  'Lagrum': [
    'lagrum_id', 'case_id', 'drive_file_id', 'lagrum_raw', 'lagrum_normaliserad', 'lagrum_roll',
    'bristområde_kod', 'confidence', 'manuell_granskning', 'manuellt_låst', 'skapad_tid', 'uppdaterad_tid'
  ],
  'Åtgärder': [
    'åtgärd_id', 'case_id', 'drive_file_id', 'åtgärdstyp', 'föreläggande', 'vite', 'vitesbelopp',
    'valuta', 'dokumentationskrav', 'bristområde_kod', 'lagrum_kod', 'allvarsindex', 'confidence',
    'manuell_granskning', 'manuellt_låst', 'skapad_tid', 'uppdaterad_tid'
  ],
  'Uppföljningar': [
    'uppföljning_id', 'case_id', 'grundbeslut_drive_file_id', 'uppföljningsbeslut_drive_file_id',
    'uppföljningsutfall', 'nytt_föreläggande', 'ärendet_avslutas', 'confidence', 'manuell_granskning',
    'manuellt_låst', 'skapad_tid', 'uppdaterad_tid'
  ],
  'Personer': [
    'person_id', 'personnamn', 'pseudonym_etikett', 'rollstandard', 'ärendeantal', 'confidence',
    'manuell_granskning', 'manuellt_låst', 'skapad_tid', 'uppdaterad_tid'
  ],
  'DokumentPerson': [
    'drive_file_id', 'case_id', 'person_id', 'personnamn', 'roll', 'pseudonym_etikett', 'confidence',
    'manuell_granskning', 'manuellt_låst', 'skapad_tid', 'uppdaterad_tid'
  ],
  'Referens_Huvudmän': [
    'referensår', 'huvudman_id', 'organisationsnummer', 'huvudman_namn', 'huvudmannatyp_grov',
    'huvudmannatyp_fin', 'kommun', 'län', 'antal_skolenheter', 'antal_elever', 'källa', 'uppdaterad_tid'
  ],
  'Referens_Skolenheter': [
    'referensår', 'skolenhet_id', 'skolenhetskod', 'skolenhetsnamn', 'huvudman_id', 'lägeskommun',
    'län', 'skolform', 'årskurser', 'elevantal', 'källa', 'uppdaterad_tid'
  ],
  'DashboardData': [
    'dataset', 'dimension', 'nyckel', 'värde', 'period_start', 'period_slut', 'filterbeskrivning',
    'senast_uppdaterad', 'dashboard_version'
  ],
  'Dashboard_Datakvalitet': [
    'varning_id', 'varningstyp', 'nivå', 'beskrivning', 'berörd_tabell', 'berörd_nyckel',
    'antal_poster', 'skapad_tid', 'åtgärdad'
  ],
  'Analyskö': [
    'queue_id', 'drive_file_id', 'case_id', 'åtgärd', 'prioritet', 'status', 'försök', 'senaste_fel',
    'skapad_tid', 'uppdaterad_tid', 'klar_tid'
  ],
  'Manuell_granskning': [
    'review_id', 'källa_tabell', 'källa_nyckel', 'fält', 'föreslaget_värde', 'problemtyp', 'beskrivning',
    'confidence', 'status', 'ansvarig', 'skapad_tid', 'uppdaterad_tid'
  ],
  'Analyslogg': [
    'timestamp', 'nivå', 'funktion', 'meddelande', 'detaljer', 'actor', 'version'
  ],
  'Fellogg': [
    'timestamp', 'funktion', 'feltyp', 'meddelande', 'stack', 'berörd_tabell', 'berörd_nyckel', 'actor', 'version'
  ],
  'Testresultat': [
    'timestamp', 'testnamn', 'status', 'meddelande', 'detaljer'
  ],
  'Kodbok_Skolform': ['kod', 'namn', 'aktiv', 'beskrivning', 'sortering'],
  'Kodbok_Elevgrupper': ['kod', 'namn', 'aktiv', 'beskrivning', 'sortering'],
  'Kodbok_Beslutstyper': ['kod', 'namn', 'aktiv', 'beskrivning', 'sortering'],
  'Kodbok_Allvarsindex': ['kod', 'namn', 'aktiv', 'beskrivning', 'sortering'],
  'Kodbok_Lagrum': ['kod', 'namn', 'aktiv', 'beskrivning', 'sortering'],
  'Kodbok_Statusar': ['kod', 'namn', 'aktiv', 'beskrivning', 'sortering'],
  'Kodbok_Källtyper': ['kod', 'namn', 'aktiv', 'beskrivning', 'sortering'],
  'Kodbok_Huvudmannatyp': ['kod', 'namn', 'nivå', 'aktiv', 'beskrivning', 'sortering'],
  'Kodbok_Åtgärdstyper': ['kod', 'namn', 'aktiv', 'beskrivning', 'sortering'],
  'Kodbok_LagrumRoll': ['kod', 'namn', 'aktiv', 'beskrivning', 'sortering'],
  'Kodbok_Uppföljningsutfall': ['kod', 'namn', 'aktiv', 'beskrivning', 'sortering'],
  'Kodbok_Årskurser': ['kod', 'namn', 'aktiv', 'beskrivning', 'sortering']
});

const ANALYSIS_CODEBOOK_ROWS = Object.freeze({
  'Kodbok_Skolform': [
    ['FÖRSKOLA', 'Förskola', 'JA', '', 10], ['FÖRSKOLEKLASS', 'Förskoleklass', 'JA', '', 20],
    ['GRUNDSKOLA', 'Grundskola', 'JA', '', 30], ['ANPASSAD_GRUNDSKOLA', 'Anpassad grundskola', 'JA', '', 40],
    ['SPECIALSKOLA', 'Specialskola', 'JA', '', 50], ['SAMESKOLA', 'Sameskola', 'JA', '', 60],
    ['FRITIDSHEM', 'Fritidshem', 'JA', '', 70], ['GYMNASIESKOLA', 'Gymnasieskola', 'JA', '', 80],
    ['ANPASSAD_GYMNASIESKOLA', 'Anpassad gymnasieskola', 'JA', '', 90],
    ['KOMVUX', 'Kommunal vuxenutbildning', 'JA', '', 100], ['SFI', 'Svenska för invandrare', 'JA', '', 110],
    ['ANNAN_VUXENUTBILDNING', 'Annan vuxenutbildning', 'JA', '', 120], ['OKÄND', 'Okänd', 'JA', '', 999]
  ],
  'Kodbok_Elevgrupper': [
    ['SÄRSKILT_STÖD', 'Elever i behov av särskilt stöd', 'JA', '', 10], ['EXTRA_ANPASSNINGAR', 'Elever med extra anpassningar', 'JA', '', 20],
    ['ÅTGÄRDSPROGRAM', 'Elever med åtgärdsprogram', 'JA', '', 30], ['NYANLÄNDA', 'Nyanlända elever', 'JA', '', 40],
    ['STUDIEHANDLEDNING_MODERSMÅL', 'Elever med studiehandledning på modersmål', 'JA', '', 50], ['MODERSMÅLSUNDERVISNING', 'Elever med modersmålsundervisning', 'JA', '', 60],
    ['SVENSKA_SOM_ANDRASPRÅK', 'Elever med svenska som andraspråk', 'JA', '', 70], ['HÖG_FRÅNVARO', 'Elever med hög frånvaro', 'JA', '', 80],
    ['PROBLEMATISK_SKOLFRÅNVARO', 'Elever med problematisk skolfrånvaro', 'JA', '', 90], ['KRÄNKANDE_BEHANDLING', 'Elever utsatta för kränkande behandling', 'JA', '', 100],
    ['ELEVHÄLSA', 'Elever i behov av elevhälsa', 'JA', '', 110], ['FUNKTIONSNEDSÄTTNING', 'Elever med funktionsnedsättning', 'JA', '', 120],
    ['ANPASSAD_GRUNDSKOLA', 'Elever i anpassad grundskola', 'JA', '', 130], ['ANPASSAD_GYMNASIESKOLA', 'Elever i anpassad gymnasieskola', 'JA', '', 140],
    ['INTRODUKTIONSPROGRAM', 'Elever på introduktionsprogram', 'JA', '', 150], ['LÅNGT_I_KUNSKAPSUTVECKLING', 'Elever som kommit långt i sin kunskapsutveckling', 'JA', '', 160],
    ['FRITIDSHEM', 'Elever i fritidshem', 'JA', '', 170], ['BARN_I_FÖRSKOLA', 'Barn i förskola', 'JA', '', 180],
    ['SKOLPLIKTSPROBLEMATIK', 'Elever med skolpliktsproblematik', 'JA', '', 190], ['OKÄND', 'Okänd', 'JA', '', 999]
  ],
  'Kodbok_Beslutstyper': [
    ['GRUNDBESLUT', 'Grundbeslut', 'JA', '', 10], ['UPPFÖLJNINGSBESLUT', 'Uppföljningsbeslut', 'JA', '', 20],
    ['AVSLUTANDE_BESLUT', 'Avslutande beslut', 'JA', '', 30], ['OKÄND', 'Okänd', 'JA', '', 999]
  ],
  'Kodbok_Allvarsindex': [
    ['0', 'Ingen brist, bakgrundsuppgift eller ej bedömt', 'JA', '', 0], ['1', 'Utvecklingsområde eller mindre kvalitetsanmärkning', 'JA', '', 1],
    ['2', 'Konstaterad brist utan tydligt föreläggande eller med begränsad påverkan', 'JA', '', 2], ['3', 'Föreläggande eller tydlig rättslig brist', 'JA', '', 3],
    ['4', 'Föreläggande med flera bristområden, elevrättslig påverkan, systematisk eller kvarstående brist', 'JA', '', 4], ['5', 'Föreläggande med vite, återkommande/kvarstående brister eller särskilt allvarlig elevrättslig påverkan', 'JA', '', 5]
  ],
  'Kodbok_Lagrum': [
    ['SKOLLAGEN_3_7', 'Skollagen 3:7', 'JA', 'Exempel på normaliserat lagrum.', 10], ['OKÄND', 'Okänd', 'JA', '', 999]
  ],
  'Kodbok_Statusar': [
    ['KONSTATERAD_BRIST', 'Konstaterad brist', 'JA', '', 10], ['INGEN_BRIST', 'Ingen brist', 'JA', '', 20],
    ['UTVECKLINGSOMRÅDE', 'Utvecklingsområde', 'JA', '', 30], ['BRIST_AVHJÄLPT', 'Brist avhjälpt', 'JA', '', 40],
    ['BRIST_DELVIS_AVHJÄLPT', 'Brist delvis avhjälpt', 'JA', '', 50], ['BRIST_KVARSTÅR', 'Brist kvarstår', 'JA', '', 60],
    ['RISK_ELLER_INDIKATION', 'Risk eller indikation', 'JA', '', 70], ['BAKGRUNDSUPPGIFT', 'Bakgrundsuppgift', 'JA', '', 80],
    ['EJ_BEDÖMT', 'Ej bedömt', 'JA', '', 90], ['OKÄNT', 'Okänt', 'JA', '', 999]
  ],
  'Kodbok_Källtyper': [
    ['PDF', 'Original-PDF', 'JA', '', 10], ['GOOGLE_DOCS_TEXT', 'Google Docs-konverterad text', 'JA', '', 20],
    ['OCR', 'OCR-text', 'JA', '', 30], ['REGEL', 'Regelbaserad extraktion', 'JA', '', 40], ['AI', 'AI-analys', 'JA', '', 50]
  ],
  'Kodbok_Huvudmannatyp': [
    ['KOMMUNAL', 'Kommunal', 'GROV', 'JA', '', 10], ['ENSKILD', 'Enskild', 'GROV', 'JA', '', 20], ['STATLIG', 'Statlig', 'GROV', 'JA', '', 30],
    ['REGION', 'Region', 'GROV', 'JA', '', 40], ['OKÄND', 'Okänd', 'GROV', 'JA', '', 999], ['KOMMUN', 'Kommun', 'FIN', 'JA', '', 1010],
    ['AKTIEBOLAG', 'Aktiebolag', 'FIN', 'JA', '', 1020], ['EKONOMISK_FÖRENING', 'Ekonomisk förening', 'FIN', 'JA', '', 1030],
    ['IDEELL_FÖRENING', 'Ideell förening', 'FIN', 'JA', '', 1040], ['STIFTELSE', 'Stiftelse', 'FIN', 'JA', '', 1050],
    ['TROSSAMFUND', 'Trossamfund', 'FIN', 'JA', '', 1060], ['KOMMUNALFÖRBUND', 'Kommunalförbund', 'FIN', 'JA', '', 1090]
  ],
  'Kodbok_Åtgärdstyper': [
    ['FÖRELÄGGANDE', 'Föreläggande', 'JA', '', 10], ['FÖRELÄGGANDE_MED_VITE', 'Föreläggande med vite', 'JA', '', 20],
    ['REDOVISNINGSKRAV', 'Redovisningskrav', 'JA', '', 30], ['DOKUMENTATIONSKRAV', 'Dokumentationskrav', 'JA', '', 40],
    ['RUTINKRAV', 'Rutinkrav', 'JA', '', 50], ['UTREDNINGSKRAV', 'Utredningskrav', 'JA', '', 60],
    ['ÅTGÄRDSPROGRAMSKRAV', 'Åtgärdsprogramskrav', 'JA', '', 70], ['KVALITETSARBETE_KRAV', 'Kvalitetsarbete krav', 'JA', '', 80],
    ['UPPFÖLJNING', 'Uppföljning', 'JA', '', 90], ['BRIST_AVHJÄLPT', 'Brist avhjälpt', 'JA', '', 100],
    ['BRIST_DELVIS_AVHJÄLPT', 'Brist delvis avhjälpt', 'JA', '', 110], ['BRIST_KVARSTÅR', 'Brist kvarstår', 'JA', '', 120],
    ['ÄRENDET_AVSLUTAS', 'Ärendet avslutas', 'JA', '', 130], ['INGEN_ÅTGÄRD', 'Ingen åtgärd', 'JA', '', 140],
    ['ANNAN_ÅTGÄRD', 'Annan åtgärd', 'JA', '', 150], ['OKÄND', 'Okänd', 'JA', '', 999]
  ],
  'Kodbok_LagrumRoll': [
    ['BESLUTSGRUND', 'Beslutsgrund', 'JA', '', 10], ['FÖRELÄGGANDEPUNKT', 'Föreläggandepunkt', 'JA', '', 20],
    ['RÄTTSLIG_REGLERING', 'Rättslig reglering', 'JA', '', 30], ['BEDÖMNINGSGRUND', 'Bedömningsgrund', 'JA', '', 40],
    ['BAKGRUND', 'Bakgrund', 'JA', '', 50], ['FORMALIA', 'Formalia', 'JA', '', 60], ['ÖVERKLAGANDE', 'Överklagande', 'JA', '', 70],
    ['VITE', 'Vite', 'JA', '', 80], ['UPPFÖLJNING', 'Uppföljning', 'JA', '', 90], ['OKÄND', 'Okänd', 'JA', '', 999]
  ],
  'Kodbok_Uppföljningsutfall': [
    ['BRISTER_AVHJÄLPTA', 'Brister avhjälpta', 'JA', '', 10], ['BRISTER_DELVIS_AVHJÄLPTA', 'Brister delvis avhjälpta', 'JA', '', 20],
    ['BRISTER_KVARSTÅR', 'Brister kvarstår', 'JA', '', 30], ['ÄRENDET_AVSLUTAS', 'Ärendet avslutas', 'JA', '', 40],
    ['UPPFÖLJNING_KRÄVS', 'Uppföljning krävs', 'JA', '', 50], ['NYTT_FÖRELÄGGANDE', 'Nytt föreläggande', 'JA', '', 60], ['OKÄNT', 'Okänt', 'JA', '', 999]
  ],
  'Kodbok_Årskurser': [
    ['F', 'Förskoleklass', 'JA', '', 0], ['1', 'Årskurs 1', 'JA', '', 1], ['2', 'Årskurs 2', 'JA', '', 2], ['3', 'Årskurs 3', 'JA', '', 3],
    ['4', 'Årskurs 4', 'JA', '', 4], ['5', 'Årskurs 5', 'JA', '', 5], ['6', 'Årskurs 6', 'JA', '', 6], ['7', 'Årskurs 7', 'JA', '', 7],
    ['8', 'Årskurs 8', 'JA', '', 8], ['9', 'Årskurs 9', 'JA', '', 9], ['10', 'Årskurs 10', 'JA', '', 10],
    ['GY1', 'Gymnasiet år 1', 'JA', '', 101], ['GY2', 'Gymnasiet år 2', 'JA', '', 102], ['GY3', 'Gymnasiet år 3', 'JA', '', 103],
    ['GY_OKÄND', 'Gymnasiet okänd årskurs', 'JA', '', 199], ['VUX', 'Vuxenutbildning', 'JA', '', 200], ['OKÄND', 'Okänd', 'JA', '', 999]
  ],
  'Bristområden': [
    ['TRYGGHET_STUDIERO', 'Trygghet och studiero', 'Trygghet och studiero', '', 'JA', '', 10],
    ['SÄRSKILT_STÖD', 'Särskilt stöd', 'Stödinsatser', '', 'JA', '', 20],
    ['EXTRA_ANPASSNINGAR', 'Extra anpassningar', 'Stödinsatser', '', 'JA', '', 30],
    ['ELEVHÄLSA', 'Elevhälsa', 'Elevhälsa', '', 'JA', '', 40],
    ['KRÄNKANDE_BEHANDLING', 'Kränkande behandling', 'Trygghet och studiero', '', 'JA', '', 50],
    ['SYSTEMATISKT_KVALITETSARBETE', 'Systematiskt kvalitetsarbete', 'Styrning och kvalitet', '', 'JA', '', 60],
    ['BETYG_BEDÖMNING', 'Betyg och bedömning', 'Kunskapsresultat', '', 'JA', '', 70],
    ['SKOLPLIKT_FRÅNVARO', 'Skolplikt och frånvaro', 'Närvaro', '', 'JA', '', 80],
    ['OKÄNT', 'Okänt', 'Okänt', '', 'JA', '', 999]
  ]
});

const SETTING_DESCRIPTIONS = Object.freeze({
  STORE_FULL_TEXT: 'Standard: spara inte fullständig extraherad text permanent.',
  ALLOW_FULL_TEXT_STORAGE: 'Fulltextlagring är avstängd om inte kravspecifikationen ändras.',
  DELETE_TEMP_TEXT_FILES: 'Tillfälliga textfiler ska raderas efter lyckad analys.',
  LOG_FULL_TEXT: 'Fulltext får inte skrivas till loggar.',
  LOG_PROMPTS: 'Prompter får inte skrivas till loggar i standardläge.',
  AI_COST_LIMIT: 'AI-kostnadsgräns. 0 innebär ingen automatisk kostnad.',
  AI_ALLOW_PAID_USAGE: 'Betald AI-användning är avstängd i standardläge.',
  ALLOW_PAID_SERVICES: 'Betalda tjänster är avstängda i standardläge.',
  MAX_MONTHLY_COST: 'Maximal månadskostnad. 0 innebär ingen automatisk kostnad.',
  ALLOW_EXTERNAL_AI: 'Extern AI är avstängd i standardläge.',
  SEND_ERROR_EMAILS: 'Första versionen ska inte vara beroende av e-post.',
  SEND_DAILY_SUMMARY: 'Första versionen ska inte vara beroende av e-post.',
  DEFAULT_DASHBOARD_LEVEL: 'Dashboardens standardräkning ska vara ärendenivå.',
  DEFAULT_BATCH_SIZE: 'Batchstorlek för robust Apps Script-körning.',
  PERSON_ANALYSIS_MIN_CASES: 'Minsta antal ärenden innan personmönster visas som stabila.',
  DASHBOARD_STALE_HOURS_WARNING: 'Antal timmar innan DashboardData betraktas som gammalt.',
  ANALYSIS_MODEL_VERSION: 'Aktuell analysmodellversion.',
  CODEBOOK_VERSION: 'Aktuell kodboksversion.',
  DASHBOARD_VERSION: 'Aktuell dashboardversion.'
});

/** Skapar saknade flikar, rubriker, grundinställningar och kodböcker utan att radera befintlig data. */
function setupAnalysisWorkbook() {
  const spreadsheet = getActiveAnalysisSpreadsheet_();
  const startedAt = new Date();
  try {
    Object.keys(ANALYSIS_TABLES).forEach(function(sheetName) {
      const sheet = ensureSheet_(spreadsheet, sheetName);
      ensureHeaders_(sheet, ANALYSIS_TABLES[sheetName]);
      applyStandardFormatting_(sheet);
    });

    seedSettings_(spreadsheet.getSheetByName('Inställningar_Analys'));
    seedCodebooks_(spreadsheet);
    logAnalysis_('INFO', 'setupAnalysisWorkbook', 'Analysarbetsboken är förberedd.', {
      workbookName: spreadsheet.getName(),
      durationMs: new Date().getTime() - startedAt.getTime()
    });
    return validateAnalysisWorkbook();
  } catch (error) {
    logError_('setupAnalysisWorkbook', error, '', '');
    throw error;
  }
}

/** Kontrollerar att obligatoriska flikar, rubriker och grundinställningar finns. */
function validateAnalysisWorkbook() {
  const spreadsheet = getActiveAnalysisSpreadsheet_();
  const results = [];

  Object.keys(ANALYSIS_TABLES).forEach(function(sheetName) {
    const sheet = spreadsheet.getSheetByName(sheetName);
    if (!sheet) {
      results.push(validationResult_(ANALYSIS_SYSTEM.status.error, sheetName, 'Flik saknas.', ''));
      return;
    }

    const headerMap = getHeaderMap_(sheet);
    ANALYSIS_TABLES[sheetName].forEach(function(requiredHeader) {
      if (!headerMap[requiredHeader]) {
        results.push(validationResult_(ANALYSIS_SYSTEM.status.error, sheetName, 'Obligatorisk rubrik saknas.', requiredHeader));
      }
    });
  });

  const settingsSheet = spreadsheet.getSheetByName('Inställningar_Analys');
  if (settingsSheet) {
    const settings = readSettings_(settingsSheet);
    Object.keys(ANALYSIS_SETTINGS_DEFAULTS).forEach(function(key) {
      if (!Object.prototype.hasOwnProperty.call(settings, key)) {
        results.push(validationResult_(ANALYSIS_SYSTEM.status.error, 'Inställningar_Analys', 'Obligatorisk inställning saknas.', key));
      }
    });
    validateCostAndPrivacySettings_(settings, results);
  }

  if (results.length === 0) {
    results.push(validationResult_(ANALYSIS_SYSTEM.status.ok, 'Arbetsbok', 'Valideringen hittade inga fel.', ''));
  }

  writeTestResults_(spreadsheet, 'validateAnalysisWorkbook', results);
  logAnalysis_('INFO', 'validateAnalysisWorkbook', 'Validering slutförd.', { status: summarizeValidation_(results), checks: results.length });
  return results;
}

/** Lägger till analysdelens adminmeny i Google Sheets. */
function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('Analys')
    .addItem('1. Kör setup', 'setupAnalysisWorkbook')
    .addItem('2. Validera arbetsbok', 'validateAnalysisWorkbook')
    .addSeparator()
    .addItem('Kör grundtest', 'runAnalysisWorkbookSmokeTest')
    .addItem('Synka analyskö (platshållare)', 'syncAnalysisQueuePlaceholder')
    .addItem('Uppdatera DashboardData (platshållare)', 'updateDashboardDataPlaceholder')
    .addToUi();
}

/** Enkel testfunktion som kan köras av en novis från menyn. */
function runAnalysisWorkbookSmokeTest() {
  const results = validateAnalysisWorkbook();
  const hasErrors = results.some(function(result) { return result.status === ANALYSIS_SYSTEM.status.error; });
  const message = hasErrors ? 'Grundtestet hittade fel. Se Testresultat och Fellogg.' : 'Grundtestet passerade.';
  logAnalysis_(hasErrors ? 'ERROR' : 'INFO', 'runAnalysisWorkbookSmokeTest', message, { results: results.length });
  return { status: hasErrors ? ANALYSIS_SYSTEM.status.error : ANALYSIS_SYSTEM.status.ok, message: message };
}

function syncAnalysisQueuePlaceholder() {
  logAnalysis_('INFO', 'syncAnalysisQueuePlaceholder', 'Platshållare körd. Analyskö-synk implementeras i senare etapp.', {});
}

function updateDashboardDataPlaceholder() {
  logAnalysis_('INFO', 'updateDashboardDataPlaceholder', 'Platshållare körd. DashboardData-byggare implementeras i senare etapp.', {});
}

function getActiveAnalysisSpreadsheet_() {
  return SpreadsheetApp.getActiveSpreadsheet();
}

function ensureSheet_(spreadsheet, sheetName) {
  return spreadsheet.getSheetByName(sheetName) || spreadsheet.insertSheet(sheetName);
}

function ensureHeaders_(sheet, requiredHeaders) {
  const lastColumn = Math.max(sheet.getLastColumn(), requiredHeaders.length, 1);
  const existingHeaders = sheet.getRange(1, 1, 1, lastColumn).getValues()[0].map(function(value) {
    return String(value || '').trim();
  });
  const headersToWrite = existingHeaders.slice();

  requiredHeaders.forEach(function(header) {
    if (headersToWrite.indexOf(header) === -1) {
      const firstEmptyIndex = headersToWrite.findIndex(function(value) { return value === ''; });
      if (firstEmptyIndex === -1) {
        headersToWrite.push(header);
      } else {
        headersToWrite[firstEmptyIndex] = header;
      }
    }
  });

  sheet.getRange(1, 1, 1, headersToWrite.length).setValues([headersToWrite]);
}

function applyStandardFormatting_(sheet) {
  sheet.setFrozenRows(1);
  const headerRange = sheet.getRange(1, 1, 1, Math.max(sheet.getLastColumn(), 1));
  headerRange.setFontWeight('bold').setWrap(true);
  sheet.autoResizeColumns(1, Math.max(sheet.getLastColumn(), 1));
}

function seedSettings_(sheet) {
  const headerMap = getHeaderMap_(sheet);
  const existing = readSettings_(sheet);
  const rows = [];
  const now = new Date();

  Object.keys(ANALYSIS_SETTINGS_DEFAULTS).forEach(function(key) {
    if (!Object.prototype.hasOwnProperty.call(existing, key)) {
      rows.push(buildRow_(headerMap, {
        'nyckel': key,
        'värde': ANALYSIS_SETTINGS_DEFAULTS[key],
        'beskrivning': SETTING_DESCRIPTIONS[key] || '',
        'kategori': settingCategory_(key),
        'obligatorisk': 'JA',
        'manuellt_låst': 'NEJ',
        'senast_uppdaterad': now
      }));
    }
  });

  appendRows_(sheet, rows);
}

function seedCodebooks_(spreadsheet) {
  Object.keys(ANALYSIS_CODEBOOK_ROWS).forEach(function(sheetName) {
    const sheet = spreadsheet.getSheetByName(sheetName);
    if (!sheet) {
      return;
    }
    const headerMap = getHeaderMap_(sheet);
    const codeColumn = headerMap.kod;
    if (!codeColumn) {
      logError_('seedCodebooks_', new Error('Kodbok saknar kolumnen kod.'), sheetName, 'kod');
      return;
    }
    const existingCodes = readExistingKeys_(sheet, codeColumn);
    const rows = ANALYSIS_CODEBOOK_ROWS[sheetName]
      .filter(function(row) { return !existingCodes[String(row[0])]; })
      .map(function(row) { return alignArrayToHeaders_(row, ANALYSIS_TABLES[sheetName]); });
    appendRows_(sheet, rows);
  });
}

function validateCostAndPrivacySettings_(settings, results) {
  const expectedLockedSettings = {
    STORE_FULL_TEXT: 'NEJ',
    ALLOW_FULL_TEXT_STORAGE: 'NEJ',
    LOG_FULL_TEXT: 'NEJ',
    LOG_PROMPTS: 'NEJ',
    AI_COST_LIMIT: '0',
    AI_ALLOW_PAID_USAGE: 'NEJ',
    ALLOW_PAID_SERVICES: 'NEJ',
    MAX_MONTHLY_COST: '0',
    ALLOW_EXTERNAL_AI: 'NEJ'
  };
  Object.keys(expectedLockedSettings).forEach(function(key) {
    if (normalizeSettingValue_(settings[key]) !== expectedLockedSettings[key]) {
      results.push(validationResult_(ANALYSIS_SYSTEM.status.warning, 'Inställningar_Analys', 'Inställning avviker från beslutad kostnads- eller dataminimeringsstandard.', key));
    }
  });
}


function normalizeSettingValue_(value) {
  if (value === null || typeof value === 'undefined') {
    return '';
  }
  return String(value).trim().toUpperCase();
}

function readSettings_(sheet) {
  const headerMap = getHeaderMap_(sheet);
  const keyColumn = headerMap['nyckel'];
  const valueColumn = headerMap['värde'];
  const settings = {};
  if (!keyColumn || !valueColumn || sheet.getLastRow() < 2) {
    return settings;
  }
  const values = sheet.getRange(2, 1, sheet.getLastRow() - 1, sheet.getLastColumn()).getValues();
  values.forEach(function(row) {
    const key = String(row[keyColumn - 1] || '').trim();
    if (key) {
      settings[key] = row[valueColumn - 1];
    }
  });
  return settings;
}

function getHeaderMap_(sheet) {
  const lastColumn = Math.max(sheet.getLastColumn(), 1);
  const headers = sheet.getRange(1, 1, 1, lastColumn).getValues()[0];
  return headers.reduce(function(map, header, index) {
    const normalizedHeader = String(header || '').trim();
    if (normalizedHeader) {
      map[normalizedHeader] = index + 1;
    }
    return map;
  }, {});
}

function readExistingKeys_(sheet, keyColumn) {
  const keys = {};
  if (sheet.getLastRow() < 2) {
    return keys;
  }
  sheet.getRange(2, keyColumn, sheet.getLastRow() - 1, 1).getValues().forEach(function(row) {
    const key = String(row[0] || '').trim();
    if (key) {
      keys[key] = true;
    }
  });
  return keys;
}

function buildRow_(headerMap, valuesByHeader) {
  const width = Object.keys(headerMap).reduce(function(max, header) {
    return Math.max(max, headerMap[header]);
  }, 0);
  const row = new Array(width).fill('');
  Object.keys(valuesByHeader).forEach(function(header) {
    if (headerMap[header]) {
      row[headerMap[header] - 1] = valuesByHeader[header];
    }
  });
  return row;
}

function alignArrayToHeaders_(values, headers) {
  const row = new Array(headers.length).fill('');
  values.forEach(function(value, index) {
    row[index] = value;
  });
  return row;
}

function appendRows_(sheet, rows) {
  if (!rows.length) {
    return;
  }
  const width = rows.reduce(function(max, row) { return Math.max(max, row.length); }, sheet.getLastColumn());
  const normalizedRows = rows.map(function(row) {
    const copy = row.slice();
    while (copy.length < width) {
      copy.push('');
    }
    return copy;
  });
  sheet.getRange(sheet.getLastRow() + 1, 1, normalizedRows.length, width).setValues(normalizedRows);
}

function settingCategory_(key) {
  if (key.indexOf('AI_') === 0 || key.indexOf('COST') !== -1 || key.indexOf('PAID') !== -1 || key === 'MAX_MONTHLY_COST' || key === 'ALLOW_EXTERNAL_AI') {
    return 'Kostnad och AI';
  }
  if (key.indexOf('FULL_TEXT') !== -1 || key.indexOf('TEXT') !== -1 || key === 'DELETE_TEMP_TEXT_FILES') {
    return 'Dataminimering';
  }
  if (key.indexOf('EMAIL') !== -1 || key.indexOf('SUMMARY') !== -1) {
    return 'Driftmeddelanden';
  }
  return 'System';
}

function validationResult_(status, area, message, details) {
  return { status: status, area: area, message: message, details: details || '' };
}

function summarizeValidation_(results) {
  if (results.some(function(result) { return result.status === ANALYSIS_SYSTEM.status.error; })) {
    return ANALYSIS_SYSTEM.status.error;
  }
  if (results.some(function(result) { return result.status === ANALYSIS_SYSTEM.status.warning; })) {
    return ANALYSIS_SYSTEM.status.warning;
  }
  return ANALYSIS_SYSTEM.status.ok;
}

function writeTestResults_(spreadsheet, testName, results) {
  const sheet = spreadsheet.getSheetByName('Testresultat');
  if (!sheet) {
    return;
  }
  const now = new Date();
  const rows = results.map(function(result) {
    return [now, testName, result.status, result.message, result.area + (result.details ? ': ' + result.details : '')];
  });
  appendRows_(sheet, rows);
}

function logAnalysis_(level, functionName, message, details) {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = spreadsheet && spreadsheet.getSheetByName('Analyslogg');
  if (!sheet) {
    return;
  }
  appendRows_(sheet, [[new Date(), level, functionName, message, JSON.stringify(details || {}), ANALYSIS_SYSTEM.logActor, ANALYSIS_SYSTEM.version]]);
}

function logError_(functionName, error, affectedTable, affectedKey) {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = spreadsheet && spreadsheet.getSheetByName('Fellogg');
  if (!sheet) {
    return;
  }
  appendRows_(sheet, [[
    new Date(), functionName, error.name || 'Error', error.message || String(error), error.stack || '',
    affectedTable || '', affectedKey || '', ANALYSIS_SYSTEM.logActor, ANALYSIS_SYSTEM.version
  ]]);
}
