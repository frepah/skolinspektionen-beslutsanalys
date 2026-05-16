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

## Tredje etappen

Den tredje etappen bearbetar köade dokument med första regelbaserade metadataextraktion, fortfarande utan AI-kostnad och utan permanent fulltextlagring:

- `processAnalysisQueueBatch()` hämtar köposter med status `KÖAD` från `Analyskö`.
- Filnamn används för första försök att hitta diarienummer, beslutsdatum och dokumenttyp.
- `Dokument` uppdateras med `case_id`, `dnr_raw`, `dnr_normaliserad`, `beslutsdatum`, `dokumenttyp`, `analysis_status` och `confidence`.
- `Ärenden` och `ÄrendeDokument` skapas/uppdateras idempotent så att dokument kan räknas på ärendenivå.
- Saknat diarienummer eller beslutsdatum skapar poster i `Manuell_granskning` i stället för att gissa.

## Fjärde etappen

Den fjärde etappen kompletterar metadata från själva PDF-texten utan att spara fulltext permanent:

- `enrichMetadataFromPdfTextBatch()` väljer dokument som saknar diarienummer eller beslutsdatum.
- PDF:en konverteras tillfälligt till Google Docs via avancerade Drive API-tjänsten.
- Texten används bara i minnet för att hitta diarienummer, beslutsdatum och dokumenttyp.
- Tillfälliga Google Docs-filer slängs efter extraktionen.
- `Dokument`, `Ärenden` och `ÄrendeDokument` uppdateras när bättre metadata hittas.
- Relevanta poster i `Manuell_granskning` markeras som `ÅTGÄRDAD` när metadata hittats.


## Femte etappen

Den femte etappen bygger första versionen av dashboardunderlaget:

- `updateDashboardData()` bygger om fliken `DashboardData` från sparade råtabeller.
- `Dashboard_Datakvalitet` byggs om med varningar för köfel, manuell granskning, saknat diarienummer, saknat beslutsdatum och risk för dubbelräkning.
- Dashboardunderlaget räknar på lagrade tabeller, inte på PDF-filer.
- `DashboardData` får raderas och byggas om; råtabellerna raderas inte.

## Sjätte etappen

Den sjätte etappen lägger till första regelbaserade extraktionen av beslutssignaler från PDF-text:

- `extractDecisionSignalsFromPdfTextBatch()` läser dokument i små batchar via samma tillfälliga Google Docs-konvertering som metadataetappen.
- Fulltext används bara i minnet och sparas inte permanent i kalkylarket.
- Funktionen registrerar första versionen av `DokumentBrist`, `Lagrum` och `Åtgärder` med stabila ID:n så att upprepade körningar uppdaterar i stället för att skapa dubbletter.
- `Ärenden` uppdateras med sammanfattande signaler för föreläggande, vite, vitesbelopp, dokumentationskrav, allvarsindex och uppföljningsutfall.
- Oklara dokument läggs i `Manuell_granskning` med problemtypen `BESLUTSSIGNALER_OKLARA` i stället för att systemet gissar.
- Dokument med tillfälliga `case_id` (`TEMP_...`) hoppas över i beslutssignalsteget tills diarienummer har hittats, så att brister, lagrum och åtgärder inte kopplas till instabila ärende-ID:n.
- Dashboardunderlaget räknar nu även bristområden, briststatus, lagrum, åtgärder och allvarsindex samt varnar för tillfälliga case-ID:n.

## Beslutade standarder

Standardinställningarna följer kravspecifikationens prioritering: ingen kostnad, dataminimering, robusthet, dubblettskydd, manuell granskning och spårbarhet.

Fulltext och prompter loggas inte, fulltext lagras inte permanent och betalda AI-/externa tjänster är avstängda i standardläge.

## Kom igång med etapp 2–6

1. Uppdatera Apps Script-filen `AnalysisWorkbook.gs` med repo-versionen.
2. Uppdatera `appsscript.json` och aktivera avancerade Google-tjänsten Drive API v3 om du ska köra PDF-textkomplettering. Lägg inte till Drive API två gånger; finns Drive redan under Tjänster ska du inte klicka Lägg till igen.
3. Kör `setupAnalysisWorkbook()` igen så att nya inställningar läggs till utan att befintlig data raderas.
4. Fyll i `ANALYSIS_SOURCE_FOLDER_IDS` i fliken `Inställningar_Analys` med en eller flera Drive-mapp-ID:n, separerade med kommatecken.
5. Kör **Analys → Synka analyskö från Drive-mappar**.
6. Kontrollera flikarna `Dokument`, `Analyskö`, `Analyslogg` och `Fellogg`.
7. Kör samma menyval igen om mapparna innehåller fler PDF:er än `DEFAULT_BATCH_SIZE`; redan registrerade dokument hoppas över och nästa batch fylls på.
8. Kör **Analys → Bearbeta analyskö (metadata)** för att skapa första ärende- och dokumentkopplingarna.
9. Kör **Analys → Komplettera metadata från PDF-text** för att försöka lösa saknade diarienummer och beslutsdatum.
10. Kontrollera flikarna `Ärenden`, `ÄrendeDokument`, `Manuell_granskning`, `Analyslogg` och `Fellogg`.
11. Kontrollera `Dashboard_Datakvalitet`. Om varningen `TEMP_CASE_ID` finns ska du först försöka lösa metadata med **Analys → Komplettera metadata från PDF-text** och eventuell manuell granskning.
12. Kör **Analys → Extrahera beslutssignaler från PDF-text** för dokument som har stabila case-ID:n och fyll första versionen av `DokumentBrist`, `Lagrum` och `Åtgärder`.
13. Kontrollera flikarna `DokumentBrist`, `Lagrum`, `Åtgärder`, `Manuell_granskning`, `Analyslogg` och `Fellogg`.
14. Kör **Analys → Uppdatera DashboardData** för att bygga dashboardunderlaget.
15. Kontrollera flikarna `DashboardData` och `Dashboard_Datakvalitet`.
