/**
 * Grundstruktur för Skolinspektionens analysdatabas.
 *
 * Första Codex-etappen skapar arbetsbokens flikar, rubriker, inställningar,
 * kodböcker, loggar och en adminmeny. Koden hanterar endast analysdelen och
 * ändrar inte PDF-bevakaren.
 */

const ANALYSIS_SYSTEM = Object.freeze({
  version: 'v0.8.0',
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
  DASHBOARD_VERSION: 'v0.1.0',
  ANALYSIS_SOURCE_FOLDER_IDS: '',
  QUEUE_DEFAULT_ACTION: 'ANALYSERA_NY',
  QUEUE_DEFAULT_PRIORITY: 'NORMAL',
  TEXT_EXTRACTION_BATCH_SIZE: '5',
  TEXT_EXTRACTION_OCR_LANGUAGE: 'sv',
  DECISION_SIGNAL_BATCH_SIZE: '5',
  PIPELINE_TRIGGER_EVERY_HOURS: '6',
  PIPELINE_AUTO_RUN_ENABLED: 'NEJ'
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
  'Dashboard_Översikt': [
    'sektion', 'nyckel', 'värde', 'kommentar', 'senast_uppdaterad'
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
  DASHBOARD_VERSION: 'Aktuell dashboardversion.',
  ANALYSIS_SOURCE_FOLDER_IDS: 'Kommaseparerade Google Drive-mapp-ID:n som ska synkas till analyskö. Lämnas tomt tills du aktivt väljer källmappar.',
  QUEUE_DEFAULT_ACTION: 'Standardåtgärd när nya PDF:er läggs i analyskö.',
  QUEUE_DEFAULT_PRIORITY: 'Standardprioritet när nya PDF:er läggs i analyskö.',
  TEXT_EXTRACTION_BATCH_SIZE: 'Batchstorlek för tillfällig PDF-textutvinning. Hålls lägre än analysköbatch eftersom PDF-konvertering är långsammare.',
  TEXT_EXTRACTION_OCR_LANGUAGE: 'OCR-språk vid tillfällig Google Docs-konvertering av PDF.',
  DECISION_SIGNAL_BATCH_SIZE: 'Batchstorlek för regelbaserad extraktion av brister, lagrum och åtgärder från tillfällig PDF-text.',
  PIPELINE_TRIGGER_EVERY_HOURS: 'Intervall i timmar för tidsstyrd pipeline-trigger när automatisk körning aktiveras.',
  PIPELINE_AUTO_RUN_ENABLED: 'Säkerhetsspärr för automatisk pipeline. Standard är NEJ.'
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
    .addItem('Synka analyskö från Drive-mappar', 'syncAnalysisQueueFromDriveFolders')
    .addItem('Bearbeta analyskö (metadata)', 'processAnalysisQueueBatch')
    .addItem('Komplettera metadata från PDF-text', 'enrichMetadataFromPdfTextBatch')
    .addItem('Stäm av manuell granskning', 'reconcileManualReviewItems')
    .addItem('Extrahera beslutssignaler från PDF-text', 'extractDecisionSignalsFromPdfTextBatch')
    .addItem('Lägg till en PDF via fil-ID/URL', 'showAddDriveFileToAnalysisQueuePrompt')
    .addItem('Uppdatera DashboardData', 'updateDashboardData')
    .addItem('Bygg dashboardöversikt', 'buildDashboardOverview')
    .addSeparator()
    .addItem('Kör analysflöde en batch', 'runAnalysisPipelineOnce')
    .addItem('Installera tidsstyrd analyskörning', 'installAnalysisPipelineTrigger')
    .addItem('Ta bort tidsstyrd analyskörning', 'removeAnalysisPipelineTriggers')
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


/**
 * Synkar PDF-filer från Drive-mappar som anges i Inställningar_Analys/ANALYSIS_SOURCE_FOLDER_IDS.
 * Funktionen registrerar dokumentmetadata och lägger dokument i Analyskö utan att ändra PDF-bevakaren.
 */
function syncAnalysisQueueFromDriveFolders() {
  const spreadsheet = getActiveAnalysisSpreadsheet_();
  const settings = readSettings_(spreadsheet.getSheetByName('Inställningar_Analys'));
  const folderIds = parseCommaSeparatedSetting_(settings.ANALYSIS_SOURCE_FOLDER_IDS);
  const batchSize = getPositiveIntegerSetting_(settings.DEFAULT_BATCH_SIZE, 10);
  const summary = { folders: folderIds.length, scanned: 0, registered: 0, queued: 0, alreadyRegistered: 0, skipped: 0, errors: 0 };

  if (folderIds.length === 0) {
    logAnalysis_('WARNING', 'syncAnalysisQueueFromDriveFolders', 'Ingen Drive-mapp är angiven i ANALYSIS_SOURCE_FOLDER_IDS.', summary);
    return summary;
  }

  folderIds.forEach(function(folderId) {
    try {
      const folder = DriveApp.getFolderById(folderId);
      const files = folder.getFilesByType(MimeType.PDF);
      while (files.hasNext() && summary.registered < batchSize) {
        const file = files.next();
        summary.scanned += 1;
        if (isDocumentRegistered_(spreadsheet, file.getId())) {
          summary.alreadyRegistered += 1;
          summary.skipped += 1;
          continue;
        }
        const result = registerDriveFileForAnalysis_(spreadsheet, file, 'DRIVE_FOLDER_SYNC', {
          action: settings.QUEUE_DEFAULT_ACTION || 'ANALYSERA_NY',
          priority: settings.QUEUE_DEFAULT_PRIORITY || 'NORMAL'
        });
        summary.registered += result.documentRegistered ? 1 : 0;
        summary.queued += result.queueCreated ? 1 : 0;
        summary.skipped += result.skipped ? 1 : 0;
      }
    } catch (error) {
      summary.errors += 1;
      logError_('syncAnalysisQueueFromDriveFolders', error, 'DriveFolder', folderId);
    }
  });

  logAnalysis_('INFO', 'syncAnalysisQueueFromDriveFolders', 'Synk av analyskö slutförd.', summary);
  return summary;
}

/** Visar en enkel dialog så att en novis kan lägga till en PDF via Drive-fil-ID eller URL. */
function showAddDriveFileToAnalysisQueuePrompt() {
  const ui = SpreadsheetApp.getUi();
  const response = ui.prompt('Lägg till PDF', 'Klistra in Google Drive-fil-ID eller fil-URL för PDF:en.', ui.ButtonSet.OK_CANCEL);
  if (response.getSelectedButton() !== ui.Button.OK) {
    return;
  }
  const result = addDriveFileToAnalysisQueue(response.getResponseText());
  ui.alert('Klar', 'Dokument registrerat: ' + result.documentRegistered + '\nKöpost skapad: ' + result.queueCreated, ui.ButtonSet.OK);
}

/** Registrerar en enskild Drive-PDF och lägger den i Analyskö. */
function addDriveFileToAnalysisQueue(fileIdOrUrl) {
  const spreadsheet = getActiveAnalysisSpreadsheet_();
  const fileId = extractDriveFileId_(fileIdOrUrl);
  const file = DriveApp.getFileById(fileId);
  const settings = readSettings_(spreadsheet.getSheetByName('Inställningar_Analys'));
  const result = registerDriveFileForAnalysis_(spreadsheet, file, 'MANUAL_FILE_ADD', {
    action: settings.QUEUE_DEFAULT_ACTION || 'ANALYSERA_NY',
    priority: settings.QUEUE_DEFAULT_PRIORITY || 'NORMAL'
  });
  logAnalysis_('INFO', 'addDriveFileToAnalysisQueue', 'En Drive-fil har registrerats för analys.', result);
  return result;
}

/** Bearbetar köade dokument med regelbaserad metadataextraktion utan AI och utan fulltextlagring. */
function processAnalysisQueueBatch() {
  const spreadsheet = getActiveAnalysisSpreadsheet_();
  const settings = readSettings_(spreadsheet.getSheetByName('Inställningar_Analys'));
  const batchSize = getPositiveIntegerSetting_(settings.DEFAULT_BATCH_SIZE, 10);
  const queueSheet = spreadsheet.getSheetByName('Analyskö');
  const queueHeaderMap = getHeaderMap_(queueSheet);
  const queueRows = getQueuedRows_(queueSheet, queueHeaderMap, batchSize);
  const summary = { selected: queueRows.length, processed: 0, errors: 0, manualReview: 0 };

  queueRows.forEach(function(queueItem) {
    try {
      setRowValues_(queueSheet, queueItem.rowNumber, queueHeaderMap, {
        'status': 'BEARBETAS',
        'försök': Number(queueItem.values['försök'] || 0) + 1,
        'uppdaterad_tid': new Date()
      });
      const result = processQueuedDocument_(spreadsheet, queueItem.values);
      setRowValues_(queueSheet, queueItem.rowNumber, queueHeaderMap, {
        'case_id': result.caseId || queueItem.values.case_id || '',
        'status': 'KLAR',
        'senaste_fel': '',
        'uppdaterad_tid': new Date(),
        'klar_tid': new Date()
      });
      summary.processed += 1;
      summary.manualReview += result.manualReviewCount || 0;
    } catch (error) {
      summary.errors += 1;
      setRowValues_(queueSheet, queueItem.rowNumber, queueHeaderMap, {
        'status': 'FEL',
        'senaste_fel': error.message || String(error),
        'uppdaterad_tid': new Date()
      });
      logError_('processAnalysisQueueBatch', error, 'Analyskö', queueItem.values.queue_id || queueItem.values.drive_file_id || '');
    }
  });

  logAnalysis_('INFO', 'processAnalysisQueueBatch', 'Bearbetning av analyskö slutförd.', summary);
  return summary;
}

function getQueuedRows_(sheet, headerMap, limit) {
  const rows = [];
  if (sheet.getLastRow() < 2) {
    return rows;
  }
  const values = sheet.getRange(2, 1, sheet.getLastRow() - 1, sheet.getLastColumn()).getValues();
  for (let index = 0; index < values.length && rows.length < limit; index += 1) {
    const rowNumber = index + 2;
    const rowObject = rowToObject_(values[index], headerMap);
    const status = normalizeSettingValue_(rowObject.status || '');
    if (status === 'KÖAD') {
      rows.push({ rowNumber: rowNumber, values: rowObject });
    }
  }
  return rows;
}

function processQueuedDocument_(spreadsheet, queueValues) {
  const driveFileId = queueValues.drive_file_id;
  if (!driveFileId) {
    throw new Error('Köpost saknar drive_file_id.');
  }

  const documentSheet = spreadsheet.getSheetByName('Dokument');
  const documentHeaderMap = getHeaderMap_(documentSheet);
  const documentRow = findRowByKey_(documentSheet, 'drive_file_id', driveFileId);
  if (!documentRow) {
    throw new Error('Dokument saknas för drive_file_id: ' + driveFileId);
  }

  const documentValues = rowToObject_(documentSheet.getRange(documentRow, 1, 1, documentSheet.getLastColumn()).getValues()[0], documentHeaderMap);
  const metadata = extractDocumentMetadataFromFileName_(documentValues.filnamn || '');
  const caseId = metadata.dnrNormaliserad ? buildCaseIdFromDnr_(metadata.dnrNormaliserad) : buildTemporaryCaseId_(driveFileId);
  const confidence = metadata.dnrNormaliserad ? 'MEDEL' : 'LÅG';
  const manualReviewNeeded = !metadata.dnrNormaliserad || !metadata.beslutsdatum;
  let manualReviewCount = 0;

  if (!isRowManuallyLocked_(documentSheet, documentRow, documentHeaderMap)) {
    setRowValues_(documentSheet, documentRow, documentHeaderMap, {
      'dnr_raw': metadata.dnrRaw || documentValues.dnr_raw || '',
      'dnr_normaliserad': metadata.dnrNormaliserad || documentValues.dnr_normaliserad || '',
      'case_id': caseId,
      'beslutsdatum': metadata.beslutsdatum || documentValues.beslutsdatum || '',
      'dokumenttyp': metadata.dokumenttyp,
      'analysis_status': 'METADATA_REGISTRERAD',
      'confidence': confidence,
      'manuell_granskning': manualReviewNeeded ? 'JA' : 'NEJ',
      'uppdaterad_tid': new Date()
    });
  }

  upsertCaseFromDocumentMetadata_(spreadsheet, caseId, metadata, confidence, manualReviewNeeded);
  upsertCaseDocumentLink_(spreadsheet, caseId, driveFileId, metadata, confidence, manualReviewNeeded);

  if (!metadata.dnrNormaliserad) {
    addManualReviewItem_(spreadsheet, 'Dokument', driveFileId, 'dnr_normaliserad', '', 'SAKNAT_DIARIENUMMER', 'Diarienummer kunde inte identifieras regelbaserat från filnamnet.', 'LÅG');
    manualReviewCount += 1;
  }
  if (!metadata.beslutsdatum) {
    addManualReviewItem_(spreadsheet, 'Dokument', driveFileId, 'beslutsdatum', '', 'SAKNAT_BESLUTSDATUM', 'Beslutsdatum kunde inte identifieras regelbaserat från filnamnet.', 'LÅG');
    manualReviewCount += 1;
  }

  return { caseId: caseId, manualReviewCount: manualReviewCount };
}

function extractDocumentMetadataFromFileName_(fileName) {
  const normalizedName = String(fileName || '').replace(/\.pdf$/i, '');
  const dnrMatch = normalizedName.match(/(?:dnr|diarienr|diarienummer)\s*[:.]?\s*([0-9]{4}[:_\/-][0-9]{1,6}|[0-9]{1,6}[:_\/-][0-9]{4})/i) ||
    normalizedName.match(/\b([0-9]{4}[:\/][0-9]{1,6}|[0-9]{1,6}[:\/][0-9]{4})\b/);
  const dateMatch = normalizedName.match(/(20[0-9]{2})[-_. ]?([01][0-9])[-_. ]?([0-3][0-9])/);
  return {
    dnrRaw: dnrMatch ? dnrMatch[1] : '',
    dnrNormaliserad: dnrMatch ? normalizeDnr_(dnrMatch[1]) : '',
    beslutsdatum: dateMatch ? dateMatch[1] + '-' + dateMatch[2] + '-' + dateMatch[3] : '',
    dokumenttyp: inferDocumentType_(normalizedName)
  };
}

function normalizeDnr_(dnrRaw) {
  return String(dnrRaw || '')
    .trim()
    .replace(/\s+/g, '')
    .replace(/[\/_-]/g, ':');
}

function inferDocumentType_(fileName) {
  const upperName = String(fileName || '').toUpperCase();
  if (upperName.indexOf('UPPFÖLJ') !== -1) {
    return 'UPPFÖLJNINGSBESLUT';
  }
  if (upperName.indexOf('AVSLUT') !== -1) {
    return 'AVSLUTANDE_BESLUT';
  }
  if (upperName.indexOf('BESLUT') !== -1) {
    return 'GRUNDBESLUT';
  }
  return 'OKÄND';
}

function buildCaseIdFromDnr_(dnrNormaliserad) {
  return 'DNR_' + String(dnrNormaliserad || '').replace(/[^A-Za-z0-9]/g, '_');
}

function buildTemporaryCaseId_(driveFileId) {
  return 'TEMP_' + String(driveFileId || '').replace(/[^A-Za-z0-9]/g, '_');
}

function isTemporaryCaseId_(caseId) {
  return String(caseId || '').indexOf('TEMP_') === 0;
}

function upsertCaseFromDocumentMetadata_(spreadsheet, caseId, metadata, confidence, manualReviewNeeded) {
  const sheet = spreadsheet.getSheetByName('Ärenden');
  const headerMap = getHeaderMap_(sheet);
  const existingRow = findRowByKey_(sheet, 'case_id', caseId);
  const values = {
    'case_id': caseId,
    'dnr_raw': metadata.dnrRaw || '',
    'dnr_normaliserad': metadata.dnrNormaliserad || '',
    'ärendetyp': metadata.dokumenttyp || 'OKÄND',
    'beslutsdatum_första': metadata.beslutsdatum || '',
    'beslutsdatum_senaste': metadata.beslutsdatum || '',
    'confidence': confidence,
    'manuell_granskning': manualReviewNeeded ? 'JA' : 'NEJ',
    'manuellt_låst': 'NEJ',
    'uppdaterad_tid': new Date()
  };

  if (!existingRow) {
    values['skapad_tid'] = new Date();
    appendRows_(sheet, [buildRow_(headerMap, values)]);
    return;
  }

  if (!isRowManuallyLocked_(sheet, existingRow, headerMap)) {
    setRowValues_(sheet, existingRow, headerMap, values);
  }
}

function upsertCaseDocumentLink_(spreadsheet, caseId, driveFileId, metadata, confidence, manualReviewNeeded) {
  const sheet = spreadsheet.getSheetByName('ÄrendeDokument');
  const headerMap = getHeaderMap_(sheet);
  const existingRow = findCaseDocumentRow_(sheet, caseId, driveFileId);
  const values = {
    'case_id': caseId,
    'drive_file_id': driveFileId,
    'dokumentroll': metadata.dokumenttyp || 'OKÄND',
    'dnr_normaliserad': metadata.dnrNormaliserad || '',
    'beslutsdatum': metadata.beslutsdatum || '',
    'confidence': confidence,
    'manuell_granskning': manualReviewNeeded ? 'JA' : 'NEJ',
    'manuellt_låst': 'NEJ',
    'uppdaterad_tid': new Date()
  };

  if (!existingRow) {
    values['skapad_tid'] = new Date();
    appendRows_(sheet, [buildRow_(headerMap, values)]);
    return;
  }

  if (!isRowManuallyLocked_(sheet, existingRow, headerMap)) {
    setRowValues_(sheet, existingRow, headerMap, values);
  }
}

function findCaseDocumentRow_(sheet, caseId, driveFileId) {
  const headerMap = getHeaderMap_(sheet);
  if (!headerMap.case_id || !headerMap.drive_file_id || sheet.getLastRow() < 2) {
    return 0;
  }
  const values = sheet.getRange(2, 1, sheet.getLastRow() - 1, sheet.getLastColumn()).getValues();
  for (let index = 0; index < values.length; index += 1) {
    if (String(values[index][headerMap.case_id - 1] || '') === String(caseId) &&
        String(values[index][headerMap.drive_file_id - 1] || '') === String(driveFileId)) {
      return index + 2;
    }
  }
  return 0;
}

function addManualReviewItem_(spreadsheet, sourceTable, sourceKey, fieldName, suggestedValue, problemType, description, confidence) {
  const sheet = spreadsheet.getSheetByName('Manuell_granskning');
  const headerMap = getHeaderMap_(sheet);
  const existingRow = findManualReviewRow_(sheet, sourceTable, sourceKey, fieldName, problemType);
  const values = {
    'review_id': existingRow ? getCellValueByHeader_(sheet, existingRow, headerMap, 'review_id') : Utilities.getUuid(),
    'källa_tabell': sourceTable,
    'källa_nyckel': sourceKey,
    'fält': fieldName,
    'föreslaget_värde': suggestedValue,
    'problemtyp': problemType,
    'beskrivning': description,
    'confidence': confidence,
    'status': 'ÖPPEN',
    'uppdaterad_tid': new Date()
  };

  if (!existingRow) {
    values['skapad_tid'] = new Date();
    appendRows_(sheet, [buildRow_(headerMap, values)]);
    return;
  }

  setRowValues_(sheet, existingRow, headerMap, values);
}

function findManualReviewRow_(sheet, sourceTable, sourceKey, fieldName, problemType) {
  const headerMap = getHeaderMap_(sheet);
  if (!headerMap['källa_tabell'] || !headerMap['källa_nyckel'] || !headerMap['fält'] || !headerMap.problemtyp || sheet.getLastRow() < 2) {
    return 0;
  }
  const values = sheet.getRange(2, 1, sheet.getLastRow() - 1, sheet.getLastColumn()).getValues();
  for (let index = 0; index < values.length; index += 1) {
    const row = values[index];
    if (String(row[headerMap['källa_tabell'] - 1] || '') === String(sourceTable) &&
        String(row[headerMap['källa_nyckel'] - 1] || '') === String(sourceKey) &&
        String(row[headerMap['fält'] - 1] || '') === String(fieldName) &&
        String(row[headerMap.problemtyp - 1] || '') === String(problemType)) {
      return index + 2;
    }
  }
  return 0;
}

function closeManualReviewItem_(spreadsheet, sourceTable, sourceKey, fieldName, problemType) {
  const sheet = spreadsheet.getSheetByName('Manuell_granskning');
  const headerMap = getHeaderMap_(sheet);
  const existingRow = findManualReviewRow_(sheet, sourceTable, sourceKey, fieldName, problemType);
  if (!existingRow) {
    return;
  }
  setRowValues_(sheet, existingRow, headerMap, {
    'status': 'ÅTGÄRDAD',
    'uppdaterad_tid': new Date()
  });
}

/** Stänger manuella granskningsposter där underliggande dokumentrad nu visar att problemet är löst. */
function reconcileManualReviewItems() {
  const spreadsheet = getActiveAnalysisSpreadsheet_();
  const reviewSheet = spreadsheet.getSheetByName('Manuell_granskning');
  const reviewHeaderMap = getHeaderMap_(reviewSheet);
  const documentSheet = spreadsheet.getSheetByName('Dokument');
  const documentHeaderMap = getHeaderMap_(documentSheet);
  const summary = { checked: 0, closed: 0, skipped: 0 };

  if (reviewSheet.getLastRow() < 2) {
    logAnalysis_('INFO', 'reconcileManualReviewItems', 'Inga manuella granskningsposter att stämma av.', summary);
    return summary;
  }

  const reviewRows = reviewSheet.getRange(2, 1, reviewSheet.getLastRow() - 1, reviewSheet.getLastColumn()).getValues();
  reviewRows.forEach(function(row, index) {
    const rowNumber = index + 2;
    const review = rowToObject_(row, reviewHeaderMap);
    if (normalizeSettingValue_(review.status || '') === 'ÅTGÄRDAD') {
      summary.skipped += 1;
      return;
    }
    summary.checked += 1;
    if (isManualReviewResolved_(documentSheet, documentHeaderMap, review)) {
      setRowValues_(reviewSheet, rowNumber, reviewHeaderMap, {
        'status': 'ÅTGÄRDAD',
        'uppdaterad_tid': new Date()
      });
      summary.closed += 1;
    }
  });

  logAnalysis_('INFO', 'reconcileManualReviewItems', 'Manuell granskning avstämd mot aktuella dokumentrader.', summary);
  return summary;
}

function isManualReviewResolved_(documentSheet, documentHeaderMap, review) {
  if (String(review['källa_tabell'] || '') !== 'Dokument') {
    return false;
  }
  const driveFileId = String(review['källa_nyckel'] || '').trim();
  if (!driveFileId) {
    return false;
  }
  const documentRow = findRowByKey_(documentSheet, 'drive_file_id', driveFileId);
  if (!documentRow) {
    return false;
  }
  const document = rowToObject_(documentSheet.getRange(documentRow, 1, 1, documentSheet.getLastColumn()).getValues()[0], documentHeaderMap);
  const problemType = String(review.problemtyp || '');

  if (problemType === 'SAKNAT_DIARIENUMMER') {
    return String(document.dnr_normaliserad || '').trim() !== '';
  }
  if (problemType === 'SAKNAT_BESLUTSDATUM') {
    return String(document.beslutsdatum || '').trim() !== '';
  }
  if (problemType === 'TEXTUTVINNING_FEL') {
    return normalizeSettingValue_(document.text_extraction_status || '') === 'TEMP_EXTRACTED_DELETED';
  }
  if (problemType === 'BESLUTSSIGNALER_OKLARA' || problemType === 'BESLUTSSIGNALER_FEL') {
    return normalizeSettingValue_(document.analysis_status || '') === 'BESLUTSSIGNALER_REGISTRERADE';
  }
  return false;
}

/**
 * Kompletterar dokumentmetadata via tillfällig PDF-till-Google-Docs-konvertering.
 * Fulltext sparas inte i kalkylarket och den tillfälliga Google Docs-filen slängs efter extraktion.
 */
function enrichMetadataFromPdfTextBatch() {
  assertDriveAdvancedServiceEnabled_();
  const spreadsheet = getActiveAnalysisSpreadsheet_();
  const settings = readSettings_(spreadsheet.getSheetByName('Inställningar_Analys'));
  const batchSize = getPositiveIntegerSetting_(settings.TEXT_EXTRACTION_BATCH_SIZE, 5);
  const ocrLanguage = String(settings.TEXT_EXTRACTION_OCR_LANGUAGE || 'sv');
  const documentSheet = spreadsheet.getSheetByName('Dokument');
  const documentHeaderMap = getHeaderMap_(documentSheet);
  const candidateRows = getDocumentsNeedingTextMetadata_(documentSheet, documentHeaderMap, batchSize);
  const summary = { selected: candidateRows.length, processed: 0, updated: 0, manualReview: 0, errors: 0 };

  candidateRows.forEach(function(candidate) {
    try {
      const result = enrichDocumentMetadataFromPdfText_(spreadsheet, candidate.rowNumber, candidate.values, ocrLanguage);
      summary.processed += 1;
      summary.updated += result.updated ? 1 : 0;
      summary.manualReview += result.manualReviewCount || 0;
    } catch (error) {
      summary.errors += 1;
      logError_('enrichMetadataFromPdfTextBatch', error, 'Dokument', candidate.values.drive_file_id || '');
      addManualReviewItem_(spreadsheet, 'Dokument', candidate.values.drive_file_id || '', 'text_extraction_status', 'FEL', 'TEXTUTVINNING_FEL', error.message || String(error), 'LÅG');
    }
  });

  logAnalysis_('INFO', 'enrichMetadataFromPdfTextBatch', 'Komplettering från PDF-text slutförd.', summary);
  return summary;
}

function getDocumentsNeedingTextMetadata_(sheet, headerMap, limit) {
  const rows = [];
  if (sheet.getLastRow() < 2) {
    return rows;
  }
  const values = sheet.getRange(2, 1, sheet.getLastRow() - 1, sheet.getLastColumn()).getValues();
  for (let index = 0; index < values.length && rows.length < limit; index += 1) {
    const rowNumber = index + 2;
    const rowObject = rowToObject_(values[index], headerMap);
    const hasDriveFileId = String(rowObject.drive_file_id || '').trim() !== '';
    const missingCentralMetadata = String(rowObject.dnr_normaliserad || '').trim() === '' || String(rowObject.beslutsdatum || '').trim() === '';
    const notAlreadyExtracted = normalizeSettingValue_(rowObject.text_extraction_status || '') !== 'TEMP_EXTRACTED_DELETED';
    if (hasDriveFileId && missingCentralMetadata && notAlreadyExtracted) {
      rows.push({ rowNumber: rowNumber, values: rowObject });
    }
  }
  return rows;
}

function enrichDocumentMetadataFromPdfText_(spreadsheet, documentRow, documentValues, ocrLanguage) {
  const documentSheet = spreadsheet.getSheetByName('Dokument');
  const documentHeaderMap = getHeaderMap_(documentSheet);
  const driveFileId = documentValues.drive_file_id;
  const extracted = extractTemporaryTextFromPdf_(driveFileId, ocrLanguage);
  const textMetadata = extractDocumentMetadataFromText_(extracted.text, documentValues.filnamn || '');
  const fileNameMetadata = extractDocumentMetadataFromFileName_(documentValues.filnamn || '');
  const metadata = mergeMetadata_(textMetadata, fileNameMetadata, documentValues);
  const previousCaseId = String(documentValues.case_id || '');
  const caseId = metadata.dnrNormaliserad ? buildCaseIdFromDnr_(metadata.dnrNormaliserad) : (previousCaseId || buildTemporaryCaseId_(driveFileId));
  const confidence = metadata.dnrNormaliserad && metadata.beslutsdatum ? 'HÖG' : 'MEDEL';
  const manualReviewNeeded = !metadata.dnrNormaliserad || !metadata.beslutsdatum;
  let manualReviewCount = 0;

  if (previousCaseId && previousCaseId !== caseId && previousCaseId.indexOf('TEMP_') === 0) {
    migrateTemporaryCaseId_(spreadsheet, previousCaseId, caseId);
  }

  if (!isRowManuallyLocked_(documentSheet, documentRow, documentHeaderMap)) {
    setRowValues_(documentSheet, documentRow, documentHeaderMap, {
      'dnr_raw': metadata.dnrRaw || documentValues.dnr_raw || '',
      'dnr_normaliserad': metadata.dnrNormaliserad || documentValues.dnr_normaliserad || '',
      'case_id': caseId,
      'beslutsdatum': metadata.beslutsdatum || documentValues.beslutsdatum || '',
      'dokumenttyp': metadata.dokumenttyp || documentValues.dokumenttyp || 'OKÄND',
      'text_extraction_method': extracted.method,
      'text_extraction_status': 'TEMP_EXTRACTED_DELETED',
      'text_length': extracted.textLength,
      'analysis_status': 'TEXT_METADATA_REGISTRERAD',
      'confidence': confidence,
      'manuell_granskning': manualReviewNeeded ? 'JA' : 'NEJ',
      'uppdaterad_tid': new Date()
    });
  }

  upsertCaseFromDocumentMetadata_(spreadsheet, caseId, metadata, confidence, manualReviewNeeded);
  upsertCaseDocumentLink_(spreadsheet, caseId, driveFileId, metadata, confidence, manualReviewNeeded);

  closeManualReviewItem_(spreadsheet, 'Dokument', driveFileId, 'text_extraction_status', 'TEXTUTVINNING_FEL');

  if (metadata.dnrNormaliserad) {
    closeManualReviewItem_(spreadsheet, 'Dokument', driveFileId, 'dnr_normaliserad', 'SAKNAT_DIARIENUMMER');
  } else {
    addManualReviewItem_(spreadsheet, 'Dokument', driveFileId, 'dnr_normaliserad', '', 'SAKNAT_DIARIENUMMER', 'Diarienummer kunde inte identifieras efter tillfällig PDF-textutvinning.', 'LÅG');
    manualReviewCount += 1;
  }

  if (metadata.beslutsdatum) {
    closeManualReviewItem_(spreadsheet, 'Dokument', driveFileId, 'beslutsdatum', 'SAKNAT_BESLUTSDATUM');
  } else {
    addManualReviewItem_(spreadsheet, 'Dokument', driveFileId, 'beslutsdatum', '', 'SAKNAT_BESLUTSDATUM', 'Beslutsdatum kunde inte identifieras efter tillfällig PDF-textutvinning.', 'LÅG');
    manualReviewCount += 1;
  }

  return { updated: true, caseId: caseId, manualReviewCount: manualReviewCount };
}

function extractTemporaryTextFromPdf_(driveFileId, ocrLanguage) {
  const sourceFile = DriveApp.getFileById(driveFileId);
  const tempName = 'TEMP_TEXT_' + driveFileId + '_' + new Date().getTime();
  let tempFileId = '';
  try {
    const created = createTemporaryGoogleDocFromPdf_(sourceFile, tempName, ocrLanguage || 'sv');
    tempFileId = created.id;
    const text = DocumentApp.openById(tempFileId).getBody().getText() || '';
    return { method: 'GOOGLE_DOCS_OCR_TEMP', status: 'TEMP_EXTRACTED_DELETED', text: text, textLength: text.length };
  } finally {
    if (tempFileId) {
      DriveApp.getFileById(tempFileId).setTrashed(true);
    }
  }
}

function createTemporaryGoogleDocFromPdf_(sourceFile, tempName, ocrLanguage) {
  const blob = sourceFile.getBlob();
  if (Drive.Files.create) {
    return Drive.Files.create(
      { name: tempName, mimeType: MimeType.GOOGLE_DOCS },
      blob,
      { ocrLanguage: ocrLanguage, supportsAllDrives: true }
    );
  }
  return Drive.Files.insert(
    { title: tempName, mimeType: MimeType.GOOGLE_DOCS },
    blob,
    { convert: true, ocr: true, ocrLanguage: ocrLanguage }
  );
}

function extractDocumentMetadataFromText_(text, fallbackFileName) {
  const safeText = String(text || '');
  const dnrMatch = safeText.match(/(?:Dnr|Diarienr|Diarienummer)\s*[:.]?\s*([0-9]{4}[:\/][0-9]{1,6}|[0-9]{1,6}[:\/][0-9]{4})/i) ||
    safeText.match(/\b([0-9]{4}[:\/][0-9]{1,6}|[0-9]{1,6}[:\/][0-9]{4})\b/);
  const isoDateMatch = safeText.match(/\b(20[0-9]{2})[-.\/ ]([01]?[0-9])[-.\/ ]([0-3]?[0-9])\b/);
  const swedishDateMatch = safeText.match(/\b([0-3]?[0-9])\s+(januari|februari|mars|april|maj|juni|juli|augusti|september|oktober|november|december)\s+(20[0-9]{2})\b/i);
  return {
    dnrRaw: dnrMatch ? dnrMatch[1] : '',
    dnrNormaliserad: dnrMatch ? normalizeDnr_(dnrMatch[1]) : '',
    beslutsdatum: normalizeDateMatch_(isoDateMatch, swedishDateMatch),
    dokumenttyp: inferDocumentType_(safeText.substring(0, 2000) + ' ' + String(fallbackFileName || ''))
  };
}

function normalizeDateMatch_(isoDateMatch, swedishDateMatch) {
  if (isoDateMatch) {
    return isoDateMatch[1] + '-' + padTwo_(isoDateMatch[2]) + '-' + padTwo_(isoDateMatch[3]);
  }
  if (swedishDateMatch) {
    const months = {
      januari: '01', februari: '02', mars: '03', april: '04', maj: '05', juni: '06',
      juli: '07', augusti: '08', september: '09', oktober: '10', november: '11', december: '12'
    };
    return swedishDateMatch[3] + '-' + months[String(swedishDateMatch[2]).toLowerCase()] + '-' + padTwo_(swedishDateMatch[1]);
  }
  return '';
}

function padTwo_(value) {
  return String(value || '').padStart(2, '0');
}

function mergeMetadata_(primary, secondary, existing) {
  return {
    dnrRaw: primary.dnrRaw || secondary.dnrRaw || existing.dnr_raw || '',
    dnrNormaliserad: primary.dnrNormaliserad || secondary.dnrNormaliserad || existing.dnr_normaliserad || '',
    beslutsdatum: primary.beslutsdatum || secondary.beslutsdatum || existing.beslutsdatum || '',
    dokumenttyp: primary.dokumenttyp !== 'OKÄND' ? primary.dokumenttyp : (secondary.dokumenttyp || existing.dokumenttyp || 'OKÄND')
  };
}

function assertDriveAdvancedServiceEnabled_() {
  if (typeof Drive === 'undefined' || !Drive.Files || (!Drive.Files.create && !Drive.Files.insert)) {
    throw new Error('Aktivera avancerade Google-tjänsten Drive API i Apps Script innan PDF-textutvinning körs.');
  }
}

function migrateTemporaryCaseId_(spreadsheet, oldCaseId, newCaseId) {
  [
    'Dokument',
    'Ärenden',
    'ÄrendeDokument',
    'DokumentBrist',
    'Lagrum',
    'Åtgärder',
    'Uppföljningar',
    'DokumentPerson'
  ].forEach(function(sheetName) {
    updateCaseIdInSheet_(spreadsheet.getSheetByName(sheetName), oldCaseId, newCaseId);
  });
}

function updateCaseIdInSheet_(sheet, oldCaseId, newCaseId) {
  if (!sheet) {
    return;
  }
  const headerMap = getHeaderMap_(sheet);
  if (!headerMap.case_id || sheet.getLastRow() < 2) {
    return;
  }
  const values = sheet.getRange(2, headerMap.case_id, sheet.getLastRow() - 1, 1).getValues();
  values.forEach(function(row, index) {
    if (String(row[0] || '') === String(oldCaseId)) {
      sheet.getRange(index + 2, headerMap.case_id).setValue(newCaseId);
    }
  });
}

/**
 * Extraherar första regelbaserade beslutssignaler från PDF-text utan extern AI och utan permanent fulltextlagring.
 * Signalerna är avsedda som dashboard- och granskningsunderlag, inte som slutlig juridisk klassificering.
 */
function extractDecisionSignalsFromPdfTextBatch() {
  assertDriveAdvancedServiceEnabled_();
  const spreadsheet = getActiveAnalysisSpreadsheet_();
  const settings = readSettings_(spreadsheet.getSheetByName('Inställningar_Analys'));
  const batchSize = getPositiveIntegerSetting_(settings.DECISION_SIGNAL_BATCH_SIZE, 5);
  const ocrLanguage = String(settings.TEXT_EXTRACTION_OCR_LANGUAGE || 'sv');
  const documentSheet = spreadsheet.getSheetByName('Dokument');
  const documentHeaderMap = getHeaderMap_(documentSheet);
  const candidateRows = getDocumentsNeedingDecisionSignals_(documentSheet, documentHeaderMap, batchSize);
  const summary = { selected: candidateRows.length, processed: 0, updated: 0, brister: 0, lagrum: 0, actions: 0, manualReview: 0, errors: 0 };

  candidateRows.forEach(function(candidate) {
    try {
      const result = extractDecisionSignalsForDocument_(spreadsheet, candidate.rowNumber, candidate.values, ocrLanguage);
      summary.processed += 1;
      summary.updated += result.updated ? 1 : 0;
      summary.brister += result.brister || 0;
      summary.lagrum += result.lagrum || 0;
      summary.actions += result.actions || 0;
      summary.manualReview += result.manualReviewCount || 0;
    } catch (error) {
      summary.errors += 1;
      logError_('extractDecisionSignalsFromPdfTextBatch', error, 'Dokument', candidate.values.drive_file_id || '');
      addManualReviewItem_(spreadsheet, 'Dokument', candidate.values.drive_file_id || '', 'analysis_status', 'FEL', 'BESLUTSSIGNALER_FEL', error.message || String(error), 'LÅG');
    }
  });

  logAnalysis_('INFO', 'extractDecisionSignalsFromPdfTextBatch', 'Regelbaserad extraktion av beslutssignaler slutförd.', summary);
  return summary;
}

function getDocumentsNeedingDecisionSignals_(sheet, headerMap, limit) {
  const rows = [];
  if (sheet.getLastRow() < 2) {
    return rows;
  }
  const values = sheet.getRange(2, 1, sheet.getLastRow() - 1, sheet.getLastColumn()).getValues();
  for (let index = 0; index < values.length && rows.length < limit; index += 1) {
    const rowNumber = index + 2;
    const rowObject = rowToObject_(values[index], headerMap);
    const hasDriveFileId = String(rowObject.drive_file_id || '').trim() !== '';
    const caseId = String(rowObject.case_id || '').trim();
    const hasStableCaseId = caseId !== '' && !isTemporaryCaseId_(caseId);
    const alreadyDone = normalizeSettingValue_(rowObject.analysis_status || '') === 'BESLUTSSIGNALER_REGISTRERADE';
    if (hasDriveFileId && hasStableCaseId && !alreadyDone) {
      rows.push({ rowNumber: rowNumber, values: rowObject });
    }
  }
  return rows;
}

function extractDecisionSignalsForDocument_(spreadsheet, documentRow, documentValues, ocrLanguage) {
  const driveFileId = documentValues.drive_file_id;
  const caseId = documentValues.case_id || buildTemporaryCaseId_(driveFileId);
  const extracted = extractTemporaryTextFromPdf_(driveFileId, ocrLanguage);
  const signals = extractDecisionSignalsFromText_(extracted.text || '');
  const confidence = decisionSignalConfidence_(signals);
  const manualReviewNeeded = signals.bristområden.length === 0 && signals.åtgärder.length === 0 && signals.lagrum.length === 0;
  let manualReviewCount = 0;

  signals.bristområden.forEach(function(brist) {
    upsertDocumentBrist_(spreadsheet, caseId, driveFileId, brist, signals, confidence, manualReviewNeeded);
  });
  signals.lagrum.forEach(function(lagrum) {
    upsertLagrum_(spreadsheet, caseId, driveFileId, lagrum, confidence, manualReviewNeeded);
  });
  signals.åtgärder.forEach(function(action) {
    upsertAction_(spreadsheet, caseId, driveFileId, action, signals, confidence, manualReviewNeeded);
  });
  updateCaseDecisionSignals_(spreadsheet, caseId, signals, confidence, manualReviewNeeded);

  const documentSheet = spreadsheet.getSheetByName('Dokument');
  const documentHeaderMap = getHeaderMap_(documentSheet);
  if (!isRowManuallyLocked_(documentSheet, documentRow, documentHeaderMap)) {
    setRowValues_(documentSheet, documentRow, documentHeaderMap, {
      'text_extraction_method': extracted.method,
      'text_extraction_status': 'TEMP_EXTRACTED_DELETED',
      'text_length': extracted.textLength,
      'analysis_status': 'BESLUTSSIGNALER_REGISTRERADE',
      'confidence': confidence,
      'manuell_granskning': manualReviewNeeded ? 'JA' : String(documentValues.manuell_granskning || 'NEJ'),
      'uppdaterad_tid': new Date()
    });
  }

  if (manualReviewNeeded) {
    addManualReviewItem_(spreadsheet, 'Dokument', driveFileId, 'analysis_status', '', 'BESLUTSSIGNALER_OKLARA', 'Inga tydliga brister, lagrum eller åtgärder kunde identifieras regelbaserat från PDF-texten.', 'LÅG');
    manualReviewCount += 1;
  } else {
    closeManualReviewItem_(spreadsheet, 'Dokument', driveFileId, 'analysis_status', 'BESLUTSSIGNALER_OKLARA');
    closeManualReviewItem_(spreadsheet, 'Dokument', driveFileId, 'analysis_status', 'BESLUTSSIGNALER_FEL');
  }

  return {
    updated: true,
    brister: signals.bristområden.length,
    lagrum: signals.lagrum.length,
    actions: signals.åtgärder.length,
    manualReviewCount: manualReviewCount
  };
}

function extractDecisionSignalsFromText_(text) {
  const safeText = String(text || '');
  const lowerText = safeText.toLowerCase();
  const bristområden = detectBristområden_(lowerText);
  const åtgärder = detectActions_(lowerText);
  const lagrum = detectLagrum_(safeText);
  const vite = /\b(vite|vitesföreläggande|föreläggande vid vite)\b/i.test(safeText);
  const vitesbelopp = extractVitesbelopp_(safeText);
  const dokumentationskrav = /\b(redovis(a|ning)|dokumentera|dokumentation|återrapportera)\b/i.test(safeText);
  const uppföljningsutfall = inferFollowUpOutcome_(lowerText);
  const allvarsindex = calculateSeverityIndex_(bristområden, åtgärder, vite, uppföljningsutfall);
  return {
    bristområden: bristområden,
    lagrum: lagrum,
    åtgärder: åtgärder,
    föreläggande: åtgärder.some(function(action) { return action.kod.indexOf('FÖRELÄGGANDE') === 0; }) ? 'JA' : 'NEJ',
    vite: vite ? 'JA' : 'NEJ',
    vitesbelopp: vitesbelopp,
    valuta: vitesbelopp ? 'SEK' : '',
    dokumentationskrav: dokumentationskrav ? 'JA' : 'NEJ',
    uppföljningsutfall: uppföljningsutfall,
    allvarsindex: allvarsindex
  };
}

function detectBristområden_(lowerText) {
  const rules = [
    { kod: 'TRYGGHET_STUDIERO', patterns: ['trygghet', 'studiero', 'ordningsregler'] },
    { kod: 'SÄRSKILT_STÖD', patterns: ['särskilt stöd', 'utreda elevens behov av stöd', 'åtgärdsprogram'] },
    { kod: 'EXTRA_ANPASSNINGAR', patterns: ['extra anpassning'] },
    { kod: 'ELEVHÄLSA', patterns: ['elevhälsa', 'elevhälsan', 'skolläkare', 'skolsköterska'] },
    { kod: 'KRÄNKANDE_BEHANDLING', patterns: ['kränkande behandling', 'trakasserier', 'diskriminering'] },
    { kod: 'SYSTEMATISKT_KVALITETSARBETE', patterns: ['systematiskt kvalitetsarbete', 'kvalitetsarbete', 'följa upp resultaten'] },
    { kod: 'BETYG_BEDÖMNING', patterns: ['betyg', 'bedömning', 'nationella prov'] },
    { kod: 'SKOLPLIKT_FRÅNVARO', patterns: ['skolplikt', 'frånvaro', 'problematisk frånvaro'] }
  ];
  return rules.filter(function(rule) {
    return rule.patterns.some(function(pattern) { return lowerText.indexOf(pattern) !== -1; });
  }).map(function(rule) {
    return { kod: rule.kod, status: lowerText.indexOf('brist') !== -1 ? 'KONSTATERAD_BRIST' : 'RISK_ELLER_INDIKATION' };
  });
}

function detectActions_(lowerText) {
  const actions = [];
  if (lowerText.indexOf('föreläggande vid vite') !== -1 || lowerText.indexOf('vitesföreläggande') !== -1) {
    actions.push({ kod: 'FÖRELÄGGANDE_MED_VITE' });
  } else if (lowerText.indexOf('förelägg') !== -1) {
    actions.push({ kod: 'FÖRELÄGGANDE' });
  }
  if (/redovis(a|ning)|återrapportera/.test(lowerText)) {
    actions.push({ kod: 'REDOVISNINGSKRAV' });
  }
  if (lowerText.indexOf('dokumentera') !== -1 || lowerText.indexOf('dokumentation') !== -1) {
    actions.push({ kod: 'DOKUMENTATIONSKRAV' });
  }
  if (lowerText.indexOf('ärendet avslutas') !== -1 || lowerText.indexOf('avslutar ärendet') !== -1) {
    actions.push({ kod: 'ÄRENDET_AVSLUTAS' });
  }
  if (actions.length === 0 && lowerText.indexOf('brist') === -1) {
    actions.push({ kod: 'INGEN_ÅTGÄRD' });
  }
  return uniqueObjectsByKey_(actions, 'kod');
}

function detectLagrum_(text) {
  const lagrum = [];
  const lawPattern = /(\d+)\s*kap\.\s*(\d+)\s*§\s*skollagen/gi;
  let match = lawPattern.exec(text);
  while (match) {
    lagrum.push({ raw: match[0], normaliserad: 'SKOLLAGEN_' + match[1] + '_' + match[2], roll: 'RÄTTSLIG_REGLERING' });
    match = lawPattern.exec(text);
  }
  return uniqueObjectsByKey_(lagrum, 'normaliserad');
}

function extractVitesbelopp_(text) {
  const match = String(text || '').match(/(?:vite|vitesbelopp)(?:\s+om|\s+på)?\s+([0-9][0-9\s.]*)\s*(?:kronor|kr)/i);
  if (!match) {
    return '';
  }
  return String(match[1] || '').replace(/[^0-9]/g, '');
}

function inferFollowUpOutcome_(lowerText) {
  if (lowerText.indexOf('bristen kvarstår') !== -1 || lowerText.indexOf('brister kvarstår') !== -1) {
    return 'BRISTER_KVARSTÅR';
  }
  if (lowerText.indexOf('delvis avhjälpt') !== -1) {
    return 'BRISTER_DELVIS_AVHJÄLPTA';
  }
  if (lowerText.indexOf('bristen är avhjälpt') !== -1 || lowerText.indexOf('brister är avhjälpta') !== -1) {
    return 'BRISTER_AVHJÄLPTA';
  }
  if (lowerText.indexOf('ärendet avslutas') !== -1 || lowerText.indexOf('avslutar ärendet') !== -1) {
    return 'ÄRENDET_AVSLUTAS';
  }
  return '';
}

function calculateSeverityIndex_(bristområden, actions, vite, uppföljningsutfall) {
  if (vite) {
    return 5;
  }
  if (uppföljningsutfall === 'BRISTER_KVARSTÅR') {
    return 4;
  }
  if (actions.some(function(action) { return action.kod === 'FÖRELÄGGANDE'; }) && bristområden.length > 1) {
    return 4;
  }
  if (actions.some(function(action) { return action.kod.indexOf('FÖRELÄGGANDE') === 0; })) {
    return 3;
  }
  if (bristområden.length > 0) {
    return 2;
  }
  return 0;
}

function decisionSignalConfidence_(signals) {
  const signalCount = signals.bristområden.length + signals.åtgärder.length + signals.lagrum.length;
  if (signalCount >= 3) {
    return 'MEDEL';
  }
  if (signalCount > 0) {
    return 'LÅG';
  }
  return 'OKÄND';
}

function upsertDocumentBrist_(spreadsheet, caseId, driveFileId, brist, signals, confidence, manualReviewNeeded) {
  const sheet = spreadsheet.getSheetByName('DokumentBrist');
  const headerMap = getHeaderMap_(sheet);
  const bristId = buildStableId_('BRIST', caseId, driveFileId, brist.kod);
  const values = {
    'brist_id': bristId,
    'case_id': caseId,
    'drive_file_id': driveFileId,
    'bristområde_kod': brist.kod,
    'briststatus': brist.status,
    'åtgärdstyp': firstActionCode_(signals),
    'allvarsindex': signals.allvarsindex,
    'confidence': confidence,
    'manuell_granskning': manualReviewNeeded ? 'JA' : 'NEJ',
    'manuellt_låst': 'NEJ',
    'uppdaterad_tid': new Date()
  };
  upsertRowByKey_(sheet, headerMap, 'brist_id', bristId, values);
}

function upsertLagrum_(spreadsheet, caseId, driveFileId, lagrum, confidence, manualReviewNeeded) {
  const sheet = spreadsheet.getSheetByName('Lagrum');
  const headerMap = getHeaderMap_(sheet);
  const lagrumId = buildStableId_('LAGRUM', caseId, driveFileId, lagrum.normaliserad);
  const values = {
    'lagrum_id': lagrumId,
    'case_id': caseId,
    'drive_file_id': driveFileId,
    'lagrum_raw': lagrum.raw,
    'lagrum_normaliserad': lagrum.normaliserad,
    'lagrum_roll': lagrum.roll,
    'confidence': confidence,
    'manuell_granskning': manualReviewNeeded ? 'JA' : 'NEJ',
    'manuellt_låst': 'NEJ',
    'uppdaterad_tid': new Date()
  };
  upsertRowByKey_(sheet, headerMap, 'lagrum_id', lagrumId, values);
}

function upsertAction_(spreadsheet, caseId, driveFileId, action, signals, confidence, manualReviewNeeded) {
  const sheet = spreadsheet.getSheetByName('Åtgärder');
  const headerMap = getHeaderMap_(sheet);
  const actionId = buildStableId_('ATGARD', caseId, driveFileId, action.kod);
  const values = {
    'åtgärd_id': actionId,
    'case_id': caseId,
    'drive_file_id': driveFileId,
    'åtgärdstyp': action.kod,
    'föreläggande': signals.föreläggande,
    'vite': signals.vite,
    'vitesbelopp': signals.vitesbelopp,
    'valuta': signals.valuta,
    'dokumentationskrav': signals.dokumentationskrav,
    'allvarsindex': signals.allvarsindex,
    'confidence': confidence,
    'manuell_granskning': manualReviewNeeded ? 'JA' : 'NEJ',
    'manuellt_låst': 'NEJ',
    'uppdaterad_tid': new Date()
  };
  upsertRowByKey_(sheet, headerMap, 'åtgärd_id', actionId, values);
}

function updateCaseDecisionSignals_(spreadsheet, caseId, signals, confidence, manualReviewNeeded) {
  const sheet = spreadsheet.getSheetByName('Ärenden');
  const headerMap = getHeaderMap_(sheet);
  const existingRow = findRowByKey_(sheet, 'case_id', caseId);
  if (!existingRow || isRowManuallyLocked_(sheet, existingRow, headerMap)) {
    return;
  }
  const existingValues = rowToObject_(sheet.getRange(existingRow, 1, 1, sheet.getLastColumn()).getValues()[0], headerMap);
  setRowValues_(sheet, existingRow, headerMap, {
    'föreläggande': signals.föreläggande,
    'vite': signals.vite,
    'vitesbelopp': signals.vitesbelopp,
    'valuta': signals.valuta,
    'dokumentationskrav': signals.dokumentationskrav,
    'allvarsindex': signals.allvarsindex,
    'uppföljningsutfall': signals.uppföljningsutfall,
    'confidence': confidence,
    'manuell_granskning': manualReviewNeeded ? 'JA' : String(existingValues.manuell_granskning || 'NEJ'),
    'uppdaterad_tid': new Date()
  });
}

function firstActionCode_(signals) {
  return signals.åtgärder.length ? signals.åtgärder[0].kod : '';
}

function uniqueObjectsByKey_(items, keyName) {
  const seen = {};
  return items.filter(function(item) {
    const key = String(item[keyName] || '');
    if (!key || seen[key]) {
      return false;
    }
    seen[key] = true;
    return true;
  });
}

function buildStableId_(prefix, caseId, driveFileId, suffix) {
  return [prefix, caseId, driveFileId, suffix].join('_').replace(/[^A-Za-z0-9_]/g, '_').substring(0, 180);
}

function upsertRowByKey_(sheet, headerMap, keyHeader, keyValue, values) {
  const existingRow = findRowByKey_(sheet, keyHeader, keyValue);
  const rowValues = Object.assign({}, values);
  if (!existingRow) {
    rowValues['skapad_tid'] = new Date();
    appendRows_(sheet, [buildRow_(headerMap, rowValues)]);
    return;
  }
  if (!isRowManuallyLocked_(sheet, existingRow, headerMap)) {
    setRowValues_(sheet, existingRow, headerMap, rowValues);
  }
}



/** Kör hela analysflödet en kontrollerad batch och bygger om dashboardunderlaget. */
function runAnalysisPipelineOnce() {
  const startedAt = new Date();
  const summary = {
    sync: null,
    queue: null,
    textMetadata: null,
    manualReview: null,
    decisionSignals: null,
    dashboardData: null,
    dashboardOverview: null,
    errors: 0
  };

  try {
    summary.sync = syncAnalysisQueueFromDriveFolders();
    summary.queue = processAnalysisQueueBatch();
    summary.textMetadata = enrichMetadataFromPdfTextBatch();
    summary.manualReview = reconcileManualReviewItems();
    summary.decisionSignals = extractDecisionSignalsFromPdfTextBatch();
    summary.dashboardData = updateDashboardData();
    summary.dashboardOverview = buildDashboardOverview();
    summary.durationMs = new Date().getTime() - startedAt.getTime();
    logAnalysis_('INFO', 'runAnalysisPipelineOnce', 'Analysflöde kördes en batch.', summary);
    return summary;
  } catch (error) {
    summary.errors += 1;
    summary.durationMs = new Date().getTime() - startedAt.getTime();
    logError_('runAnalysisPipelineOnce', error, 'Pipeline', 'runAnalysisPipelineOnce');
    logAnalysis_('ERROR', 'runAnalysisPipelineOnce', 'Analysflöde avbröts med fel.', summary);
    throw error;
  }
}

/** Installerar en tidsstyrd trigger för analysflödet efter uttrycklig aktivering i inställningarna. */
function installAnalysisPipelineTrigger() {
  const spreadsheet = getActiveAnalysisSpreadsheet_();
  const settings = readSettings_(spreadsheet.getSheetByName('Inställningar_Analys'));
  if (normalizeSettingValue_(settings.PIPELINE_AUTO_RUN_ENABLED) !== 'JA') {
    throw new Error('Sätt PIPELINE_AUTO_RUN_ENABLED till JA i Inställningar_Analys innan tidsstyrd analyskörning installeras. Standard är NEJ av säkerhetsskäl.');
  }
  const hours = getPositiveIntegerSetting_(settings.PIPELINE_TRIGGER_EVERY_HOURS, 6);
  removeAnalysisPipelineTriggers();
  ScriptApp.newTrigger('runAnalysisPipelineOnce').timeBased().everyHours(hours).create();
  const summary = { everyHours: hours, functionName: 'runAnalysisPipelineOnce' };
  logAnalysis_('INFO', 'installAnalysisPipelineTrigger', 'Tidsstyrd analyskörning installerad.', summary);
  return summary;
}

/** Tar bort tidsstyrda triggers som kör analysflödet. */
function removeAnalysisPipelineTriggers() {
  const triggers = ScriptApp.getProjectTriggers();
  let removed = 0;
  triggers.forEach(function(trigger) {
    if (trigger.getHandlerFunction && trigger.getHandlerFunction() === 'runAnalysisPipelineOnce') {
      ScriptApp.deleteTrigger(trigger);
      removed += 1;
    }
  });
  const summary = { removed: removed };
  logAnalysis_('INFO', 'removeAnalysisPipelineTriggers', 'Tidsstyrda analyskörningar borttagna.', summary);
  return summary;
}

/** Bygger om DashboardData och Dashboard_Datakvalitet från sparade råtabeller. */
function updateDashboardData() {
  const spreadsheet = getActiveAnalysisSpreadsheet_();
  const now = new Date();
  const documents = readSheetObjects_(spreadsheet.getSheetByName('Dokument'));
  const cases = readSheetObjects_(spreadsheet.getSheetByName('Ärenden'));
  const queue = readSheetObjects_(spreadsheet.getSheetByName('Analyskö'));
  const manualReview = readSheetObjects_(spreadsheet.getSheetByName('Manuell_granskning'));
  const documentBrister = readSheetObjects_(spreadsheet.getSheetByName('DokumentBrist'));
  const lagrum = readSheetObjects_(spreadsheet.getSheetByName('Lagrum'));
  const actions = readSheetObjects_(spreadsheet.getSheetByName('Åtgärder'));
  const dashboardRows = [];
  const qualityRows = [];

  dashboardRows.push(dashboardRow_('översikt', 'mått', 'antal_dokument', documents.length, '', '', 'Alla dokument', now));
  dashboardRows.push(dashboardRow_('översikt', 'mått', 'antal_ärenden', cases.length, '', '', 'Alla ärenden/case_id', now));
  dashboardRows.push(dashboardRow_('översikt', 'mått', 'antal_köade', countWhere_(queue, function(row) { return normalizeSettingValue_(row.status) === 'KÖAD'; }), '', '', 'Köposter med status KÖAD', now));
  dashboardRows.push(dashboardRow_('översikt', 'mått', 'antal_köfel', countWhere_(queue, function(row) { return normalizeSettingValue_(row.status) === 'FEL'; }), '', '', 'Köposter med status FEL', now));
  dashboardRows.push(dashboardRow_('översikt', 'mått', 'manuell_granskning_öppen', countWhere_(manualReview, function(row) { return normalizeSettingValue_(row.status) !== 'ÅTGÄRDAD'; }), '', '', 'Manuella granskningsposter som inte är åtgärdade', now));
  dashboardRows.push(dashboardRow_('översikt', 'mått', 'saknar_dnr', countWhere_(documents, function(row) { return String(row.dnr_normaliserad || '').trim() === ''; }), '', '', 'Dokument utan normaliserat diarienummer', now));
  dashboardRows.push(dashboardRow_('översikt', 'mått', 'saknar_beslutsdatum', countWhere_(documents, function(row) { return String(row.beslutsdatum || '').trim() === ''; }), '', '', 'Dokument utan beslutsdatum', now));
  dashboardRows.push(dashboardRow_('översikt', 'mått', 'antal_bristkopplingar', documentBrister.length, '', '', 'Rader i DokumentBrist', now));
  dashboardRows.push(dashboardRow_('översikt', 'mått', 'antal_lagrum', lagrum.length, '', '', 'Rader i Lagrum', now));
  dashboardRows.push(dashboardRow_('översikt', 'mått', 'antal_åtgärder', actions.length, '', '', 'Rader i Åtgärder', now));
  dashboardRows.push(dashboardRow_('översikt', 'mått', 'senast_uppdaterad', now, '', '', 'DashboardData byggd från råtabeller', now));

  appendGroupedDashboardRows_(dashboardRows, documents, 'dokument_status', 'analysis_status', now);
  appendGroupedDashboardRows_(dashboardRows, documents, 'dokumenttyp', 'dokumenttyp', now);
  appendGroupedDashboardRows_(dashboardRows, documents, 'confidence', 'confidence', now);
  appendGroupedDashboardRows_(dashboardRows, cases, 'ärendetyp', 'ärendetyp', now);
  appendGroupedDashboardRows_(dashboardRows, cases, 'ärende_confidence', 'confidence', now);
  appendGroupedDashboardRows_(dashboardRows, documentBrister, 'bristområden', 'bristområde_kod', now);
  appendGroupedDashboardRows_(dashboardRows, documentBrister, 'briststatus', 'briststatus', now);
  appendGroupedDashboardRows_(dashboardRows, lagrum, 'lagrum', 'lagrum_normaliserad', now);
  appendGroupedDashboardRows_(dashboardRows, actions, 'åtgärder', 'åtgärdstyp', now);
  appendGroupedDashboardRows_(dashboardRows, cases, 'allvarsindex', 'allvarsindex', now);

  addQualityWarningIf_(qualityRows, 'KÖ_FEL', 'HÖG', 'Det finns köposter med status FEL.', 'Analyskö', '', countWhere_(queue, function(row) { return normalizeSettingValue_(row.status) === 'FEL'; }), now);
  addQualityWarningIf_(qualityRows, 'MANUELL_GRANSKNING', 'MEDEL', 'Det finns öppna manuella granskningsposter.', 'Manuell_granskning', '', countWhere_(manualReview, function(row) { return normalizeSettingValue_(row.status) !== 'ÅTGÄRDAD'; }), now);
  addQualityWarningIf_(qualityRows, 'SAKNAR_DNR', 'MEDEL', 'Dokument saknar normaliserat diarienummer.', 'Dokument', 'dnr_normaliserad', countWhere_(documents, function(row) { return String(row.dnr_normaliserad || '').trim() === ''; }), now);
  addQualityWarningIf_(qualityRows, 'SAKNAR_BESLUTSDATUM', 'MEDEL', 'Dokument saknar beslutsdatum.', 'Dokument', 'beslutsdatum', countWhere_(documents, function(row) { return String(row.beslutsdatum || '').trim() === ''; }), now);
  addQualityWarningIf_(qualityRows, 'TEMP_CASE_ID', 'HÖG', 'Dokument har tillfälliga case_id och bör kompletteras med diarienummer innan beslutssignaler extraheras.', 'Dokument', 'case_id', countWhere_(documents, function(row) { return isTemporaryCaseId_(row.case_id); }), now);
  addQualityWarningIf_(qualityRows, 'RISK_DUBBELRÄKNING', 'LÅG', 'Det finns fler dokument än ärenden; dashboardens standardvy bör använda ärendenivå.', 'Dokument', 'case_id', documents.length > cases.length ? documents.length - cases.length : 0, now);
  addQualityWarningIf_(qualityRows, 'SAKNAR_BESLUTSSIGNALER', 'LÅG', 'Dokument har stabilt case_id men saknar registrerade beslutssignaler.', 'Dokument', 'analysis_status', countWhere_(documents, function(row) { return String(row.case_id || '').trim() !== '' && !isTemporaryCaseId_(row.case_id) && normalizeSettingValue_(row.analysis_status || '') !== 'BESLUTSSIGNALER_REGISTRERADE'; }), now);

  replaceSheetData_(spreadsheet.getSheetByName('DashboardData'), dashboardRows);
  replaceSheetData_(spreadsheet.getSheetByName('Dashboard_Datakvalitet'), qualityRows);

  const summary = { dashboardRows: dashboardRows.length, qualityWarnings: qualityRows.length, documents: documents.length, cases: cases.length, brister: documentBrister.length, lagrum: lagrum.length, actions: actions.length };
  logAnalysis_('INFO', 'updateDashboardData', 'DashboardData uppdaterad.', summary);
  return summary;
}


/** Bygger en läsbar dashboardöversikt från DashboardData och Dashboard_Datakvalitet. */
function buildDashboardOverview() {
  const spreadsheet = getActiveAnalysisSpreadsheet_();
  const now = new Date();
  const dashboardData = readSheetObjects_(spreadsheet.getSheetByName('DashboardData'));
  const qualityWarnings = readSheetObjects_(spreadsheet.getSheetByName('Dashboard_Datakvalitet'));
  const rows = [];

  addOverviewRow_(rows, 'Status', 'Datakvalitet', qualityWarnings.length === 0 ? 'OK' : qualityWarnings.length + ' varningar', qualityWarnings.length === 0 ? 'Dashboard_Datakvalitet är tom.' : 'Se Dashboard_Datakvalitet för detaljer.', now);
  addOverviewMetricRows_(rows, dashboardData, [
    ['antal_dokument', 'Antal dokument'],
    ['antal_ärenden', 'Antal ärenden'],
    ['antal_bristkopplingar', 'Antal bristkopplingar'],
    ['antal_lagrum', 'Antal lagrum'],
    ['antal_åtgärder', 'Antal åtgärder'],
    ['manuell_granskning_öppen', 'Öppen manuell granskning'],
    ['antal_köade', 'Köade poster'],
    ['antal_köfel', 'Köfel']
  ], now);

  appendOverviewRowsFromDataset_(rows, dashboardData, 'bristområden', 'Bristområden', 'Antal dokument-bristkopplingar per bristområde.', now, 10);
  appendOverviewRowsFromDataset_(rows, dashboardData, 'åtgärder', 'Åtgärder', 'Antal registrerade åtgärdsrader per åtgärdstyp.', now, 10);
  appendOverviewRowsFromDataset_(rows, dashboardData, 'allvarsindex', 'Allvarsindex', 'Antal ärenden per allvarsindex.', now, 10);
  appendOverviewRowsFromDataset_(rows, dashboardData, 'dokumenttyp', 'Dokumenttyper', 'Antal dokument per dokumenttyp.', now, 10);
  appendOverviewRowsFromDataset_(rows, dashboardData, 'ärendetyp', 'Ärendetyper', 'Antal ärenden per ärendetyp.', now, 10);

  if (qualityWarnings.length > 0) {
    qualityWarnings.forEach(function(warning) {
      addOverviewRow_(rows, 'Datakvalitet', warning.varningstyp || 'OKÄND', warning.antal_poster || 0, warning.beskrivning || '', now);
    });
  }

  const sheet = ensureSheet_(spreadsheet, 'Dashboard_Översikt');
  ensureHeaders_(sheet, ANALYSIS_TABLES['Dashboard_Översikt']);
  replaceSheetData_(sheet, rows);
  formatDashboardOverview_(sheet);
  const summary = { rows: rows.length, qualityWarnings: qualityWarnings.length };
  logAnalysis_('INFO', 'buildDashboardOverview', 'Dashboardöversikt uppdaterad.', summary);
  return summary;
}

function addOverviewMetricRows_(rows, dashboardData, metricDefinitions, updatedAt) {
  metricDefinitions.forEach(function(definition) {
    const key = definition[0];
    const label = definition[1];
    addOverviewRow_(rows, 'Översikt', label, dashboardValue_(dashboardData, 'översikt', 'mått', key), key, updatedAt);
  });
}

function appendOverviewRowsFromDataset_(rows, dashboardData, dataset, section, comment, updatedAt, limit) {
  const values = dashboardData
    .filter(function(row) { return String(row.dataset || '') === dataset; })
    .sort(function(a, b) { return Number(b['värde'] || 0) - Number(a['värde'] || 0); })
    .slice(0, limit || 10);
  if (values.length === 0) {
    addOverviewRow_(rows, section, 'Inga data', 0, comment, updatedAt);
    return;
  }
  values.forEach(function(row) {
    addOverviewRow_(rows, section, row['nyckel'] || 'OKÄND', row['värde'] || 0, comment, updatedAt);
  });
}

function dashboardValue_(dashboardData, dataset, dimension, key) {
  const match = dashboardData.find(function(row) {
    return String(row.dataset || '') === dataset && String(row.dimension || '') === dimension && String(row['nyckel'] || '') === key;
  });
  return match ? match['värde'] : 0;
}

function addOverviewRow_(rows, section, key, value, comment, updatedAt) {
  rows.push([section, key, value, comment || '', updatedAt]);
}

function formatDashboardOverview_(sheet) {
  sheet.setFrozenRows(1);
  sheet.getRange(1, 1, 1, Math.max(sheet.getLastColumn(), 1)).setFontWeight('bold').setWrap(true);
  sheet.autoResizeColumns(1, Math.max(sheet.getLastColumn(), 1));
}

function dashboardRow_(dataset, dimension, key, value, periodStart, periodEnd, filterDescription, updatedAt) {
  return [dataset, dimension, key, value, periodStart || '', periodEnd || '', filterDescription || '', updatedAt, ANALYSIS_SETTINGS_DEFAULTS.DASHBOARD_VERSION];
}

function appendGroupedDashboardRows_(rows, records, dataset, fieldName, updatedAt) {
  const counts = groupCounts_(records, fieldName);
  Object.keys(counts).sort().forEach(function(key) {
    rows.push(dashboardRow_(dataset, fieldName, key, counts[key], '', '', 'Grupp från ' + fieldName, updatedAt));
  });
}

function groupCounts_(records, fieldName) {
  return records.reduce(function(counts, row) {
    const rawValue = row[fieldName];
    const key = rawValue === null || typeof rawValue === 'undefined' || String(rawValue).trim() === '' ? 'OKÄND' : String(rawValue).trim();
    counts[key] = (counts[key] || 0) + 1;
    return counts;
  }, {});
}

function countWhere_(records, predicate) {
  return records.reduce(function(count, row) {
    return predicate(row) ? count + 1 : count;
  }, 0);
}

function addQualityWarningIf_(rows, warningType, level, description, tableName, key, count, createdAt) {
  if (count <= 0) {
    return;
  }
  rows.push([Utilities.getUuid(), warningType, level, description, tableName, key || '', count, createdAt, 'NEJ']);
}

function readSheetObjects_(sheet) {
  if (!sheet || sheet.getLastRow() < 2) {
    return [];
  }
  const headerMap = getHeaderMap_(sheet);
  return sheet.getRange(2, 1, sheet.getLastRow() - 1, sheet.getLastColumn()).getValues()
    .map(function(row) { return rowToObject_(row, headerMap); })
    .filter(function(row) {
      return Object.keys(row).some(function(key) { return String(row[key] || '').trim() !== ''; });
    });
}

function replaceSheetData_(sheet, rows) {
  if (sheet.getLastRow() > 1) {
    sheet.getRange(2, 1, sheet.getLastRow() - 1, sheet.getLastColumn()).clearContent();
  }
  appendRows_(sheet, rows);
}


function isDocumentRegistered_(spreadsheet, driveFileId) {
  const sheet = spreadsheet.getSheetByName('Dokument');
  return Boolean(sheet && findRowByKey_(sheet, 'drive_file_id', driveFileId));
}

function registerDriveFileForAnalysis_(spreadsheet, file, source, options) {
  const queueOptions = options || {};
  const action = String(queueOptions.action || 'ANALYSERA_NY');
  const priority = String(queueOptions.priority || 'NORMAL');
  if (file.getMimeType() !== MimeType.PDF) {
    logAnalysis_('WARNING', 'registerDriveFileForAnalysis_', 'Filen är inte en PDF och hoppades över.', {
      driveFileId: file.getId(),
      mimeType: file.getMimeType(),
      source: source
    });
    return { driveFileId: file.getId(), documentRegistered: false, queueCreated: false, skipped: true };
  }

  const documentResult = upsertDocumentFromDriveFile_(spreadsheet, file, source);
  const queueResult = enqueueDocumentForAnalysis_(spreadsheet, file.getId(), documentResult.caseId || '', action, priority);
  return {
    driveFileId: file.getId(),
    documentRegistered: documentResult.created || documentResult.updated,
    queueCreated: queueResult.created,
    skipped: documentResult.skipped || queueResult.skipped,
    caseId: documentResult.caseId || '',
    source: source
  };
}

function upsertDocumentFromDriveFile_(spreadsheet, file, source) {
  const sheet = spreadsheet.getSheetByName('Dokument');
  const headerMap = getHeaderMap_(sheet);
  const driveFileId = file.getId();
  const existingRow = findRowByKey_(sheet, 'drive_file_id', driveFileId);
  const now = new Date();
  const values = {
    'drive_file_id': driveFileId,
    'filnamn': file.getName(),
    'drive_url': file.getUrl(),
    'analysis_status': 'KÖAD',
    'analysis_model_version': ANALYSIS_SETTINGS_DEFAULTS.ANALYSIS_MODEL_VERSION,
    'codebook_version': ANALYSIS_SETTINGS_DEFAULTS.CODEBOOK_VERSION,
    'confidence': 'OKÄND',
    'manuell_granskning': 'NEJ',
    'uppdaterad_tid': now
  };

  if (!existingRow) {
    values['text_extraction_status'] = 'EJ_STARTAD';
    values['text_length'] = 0;
    values['manuellt_låst'] = 'NEJ';
    values['skapad_tid'] = now;
    appendRows_(sheet, [buildRow_(headerMap, values)]);
    return { created: true, updated: false, skipped: false, caseId: '' };
  }

  if (isRowManuallyLocked_(sheet, existingRow, headerMap)) {
    logAnalysis_('INFO', 'upsertDocumentFromDriveFile_', 'Dokumentraden är manuellt låst och uppdaterades inte.', {
      driveFileId: driveFileId,
      row: existingRow,
      source: source
    });
    return { created: false, updated: false, skipped: true, caseId: getCellValueByHeader_(sheet, existingRow, headerMap, 'case_id') };
  }

  setRowValues_(sheet, existingRow, headerMap, values);
  return { created: false, updated: true, skipped: false, caseId: getCellValueByHeader_(sheet, existingRow, headerMap, 'case_id') };
}

function enqueueDocumentForAnalysis_(spreadsheet, driveFileId, caseId, action, priority) {
  const sheet = spreadsheet.getSheetByName('Analyskö');
  const headerMap = getHeaderMap_(sheet);
  const existingRow = findOpenQueueRow_(sheet, driveFileId, action);
  const now = new Date();

  if (existingRow) {
    setRowValues_(sheet, existingRow, headerMap, { 'uppdaterad_tid': now });
    return { created: false, skipped: true, row: existingRow };
  }

  appendRows_(sheet, [buildRow_(headerMap, {
    'queue_id': Utilities.getUuid(),
    'drive_file_id': driveFileId,
    'case_id': caseId || '',
    'åtgärd': action,
    'prioritet': priority,
    'status': 'KÖAD',
    'försök': 0,
    'senaste_fel': '',
    'skapad_tid': now,
    'uppdaterad_tid': now,
    'klar_tid': ''
  })]);
  return { created: true, skipped: false, row: sheet.getLastRow() };
}

function rowToObject_(row, headerMap) {
  return Object.keys(headerMap).reduce(function(object, header) {
    object[header] = row[headerMap[header] - 1];
    return object;
  }, {});
}

function findOpenQueueRow_(sheet, driveFileId, action) {
  const headerMap = getHeaderMap_(sheet);
  if (!headerMap.drive_file_id || !headerMap['åtgärd'] || !headerMap.status || sheet.getLastRow() < 2) {
    return 0;
  }
  const values = sheet.getRange(2, 1, sheet.getLastRow() - 1, sheet.getLastColumn()).getValues();
  for (let index = 0; index < values.length; index += 1) {
    const row = values[index];
    const sameFile = String(row[headerMap.drive_file_id - 1] || '') === driveFileId;
    const sameAction = String(row[headerMap['åtgärd'] - 1] || '') === action;
    const status = String(row[headerMap.status - 1] || '').toUpperCase();
    if (sameFile && sameAction && status !== 'KLAR' && status !== 'AVBRUTEN') {
      return index + 2;
    }
  }
  return 0;
}

function findRowByKey_(sheet, headerName, key) {
  const headerMap = getHeaderMap_(sheet);
  const keyColumn = headerMap[headerName];
  if (!keyColumn || sheet.getLastRow() < 2) {
    return 0;
  }
  const values = sheet.getRange(2, keyColumn, sheet.getLastRow() - 1, 1).getValues();
  for (let index = 0; index < values.length; index += 1) {
    if (String(values[index][0] || '') === String(key)) {
      return index + 2;
    }
  }
  return 0;
}

function setRowValues_(sheet, rowNumber, headerMap, valuesByHeader) {
  const rowRange = sheet.getRange(rowNumber, 1, 1, sheet.getLastColumn());
  const row = rowRange.getValues()[0];
  Object.keys(valuesByHeader).forEach(function(header) {
    if (headerMap[header]) {
      row[headerMap[header] - 1] = valuesByHeader[header];
    }
  });
  rowRange.setValues([row]);
}

function getCellValueByHeader_(sheet, rowNumber, headerMap, headerName) {
  if (!headerMap[headerName]) {
    return '';
  }
  return sheet.getRange(rowNumber, headerMap[headerName]).getValue();
}

function isRowManuallyLocked_(sheet, rowNumber, headerMap) {
  return normalizeSettingValue_(getCellValueByHeader_(sheet, rowNumber, headerMap, ANALYSIS_SYSTEM.manualLockHeader)) === 'JA';
}

function extractDriveFileId_(fileIdOrUrl) {
  const raw = String(fileIdOrUrl || '').trim();
  if (!raw) {
    throw new Error('Drive-fil-ID eller URL saknas.');
  }
  const directFileMatch = raw.match(/\/d\/([a-zA-Z0-9_-]+)/);
  if (directFileMatch) {
    return directFileMatch[1];
  }
  const queryIdMatch = raw.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (queryIdMatch) {
    return queryIdMatch[1];
  }
  const folderStyleMatch = raw.match(/\/folders\/([a-zA-Z0-9_-]+)/);
  if (folderStyleMatch) {
    return folderStyleMatch[1];
  }
  return raw;
}

function parseCommaSeparatedSetting_(value) {
  return String(value || '')
    .split(',')
    .map(function(item) { return item.trim(); })
    .filter(function(item) { return item !== ''; });
}

function getPositiveIntegerSetting_(value, fallback) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 1) {
    return fallback;
  }
  return Math.floor(parsed);
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
