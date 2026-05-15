# Skolinspektionen beslutsanalys

Google Apps Script-grund för en analysdatabas som strukturerar Skolinspektionens publicerade beslut och granskningsdokument.

## Första etappen

Den första etappen skapade en stabil grundstruktur för analysdelen, utan att ändra PDF-bevakaren:

- `setupAnalysisWorkbook()` skapar saknade flikar, rubriker, standardinställningar och kodböcker utan att radera befintlig data.
- `validateAnalysisWorkbook()` kontrollerar att obligatoriska flikar, rubriker och inställningar finns.
- `onOpen()` lägger till adminmenyn **Analys** i Google Sheets.
- Loggar och manuella granskningsflikar skapas för spårbarhet och robust felhantering.

## Andra etappen

Den andra etappen börjar använda grundstrukturen genom att lägga till kö- och dokumentregistrering:

- `syncAnalysisQueueFromDriveFolders()` läser PDF-filer från de Drive-mappar som anges i `Inställningar_Analys` under `ANALYSIS_SOURCE_FOLDER_IDS`.
- `addDriveFileToAnalysisQueue()` kan registrera en enskild PDF via Drive-fil-ID eller URL.
- Dokument registreras i `Dokument` med metadata som `drive_file_id`, filnamn, Drive-URL, analysstatus och versioner.
- Drive-mappsynken hoppar över redan registrerade dokument och fortsätter till nästa PDF, så upprepade körningar fyller på med nya dokument i batchar.
- Dokument läggs idempotent i `Analyskö`; befintliga öppna köposter återanvänds i stället för att skapa dubbletter.
- Manuellt låsta dokumentrader (`manuellt_låst = JA`) skrivs inte över automatiskt.

## Beslutade standarder

Standardinställningarna följer kravspecifikationens prioritering: ingen kostnad, dataminimering, robusthet, dubblettskydd, manuell granskning och spårbarhet.

Fulltext och prompter loggas inte, fulltext lagras inte permanent och betalda AI-/externa tjänster är avstängda i standardläge.

## Kom igång med etapp 2

1. Uppdatera Apps Script-filen `AnalysisWorkbook.gs` med repo-versionen.
2. Kör `setupAnalysisWorkbook()` igen så att nya inställningar läggs till utan att befintlig data raderas.
3. Fyll i `ANALYSIS_SOURCE_FOLDER_IDS` i fliken `Inställningar_Analys` med en eller flera Drive-mapp-ID:n, separerade med kommatecken.
4. Kör **Analys → Synka analyskö från Drive-mappar**.
5. Kontrollera flikarna `Dokument`, `Analyskö`, `Analyslogg` och `Fellogg`.
6. Kör samma menyval igen om mapparna innehåller fler PDF:er än `DEFAULT_BATCH_SIZE`; redan registrerade dokument hoppas över och nästa batch fylls på.
