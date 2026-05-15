START CODEX-PROMPT ETAPP 1

Du ska bygga Etapp 1 av ett Google Apps Script-baserat analyslager för Skolinspektionsbeslut.

Detta är INTE en uppgift att bygga hela analysmotorn ännu. Etapp 1 ska bara skapa den robusta grundstrukturen: filer, flikar, rubriker, inställningar, kodböcker, loggar, adminmeny, setup-funktioner, valideringsfunktioner och testfunktioner.

Projektet ska byggas för Google Apps Script, Google Sheets och Google Drive. Koden ska vara Apps Script V8-kompatibel JavaScript och ska kunna kopieras in i Apps Script som flera .gs-filer.

VIKTIGT:
- Bygg inte full AI-analys i denna etapp.
- Bygg inte full textutvinning/OCR i denna etapp.
- Bygg inte full dashboard i denna etapp.
- Ändra inte befintlig PDF-bevakare.
- Använd inga betalda tjänster.
- Hårdkoda inga API-nycklar.
- Spara inte fullständig PDF-text.
- Radera aldrig original-PDF:er eller rådata.
- Bygg robust, idempotent kod som kan köras flera gånger utan att skapa dubbletter.

Bakgrund:
Vi har redan en fungerande PDF-bevakare som varje dag hämtar nya PDF:er från Skolinspektionens webbplats, sparar dem i Google Drive och loggar dem i ett Google Sheet. Den delen ska inte ändras nu.

Nu ska vi skapa ett separat analyslager som senare ska kunna:
- synka nya PDF:er från nedladdningsloggen,
- registrera dokument,
- koppla dokument till ärenden via diarienummer,
- textutvinna PDF:er,
- analysera dokument,
- lagra strukturerad data,
- skapa DashboardData,
- visa dashboard.

Etapp 1 ska bara skapa grunden.

==================================================
1. TEKNISK MÅLMILJÖ
==================================================

Bygg för:
- Google Apps Script
- Google Sheets
- Google Drive
- Apps Script V8 runtime

Använd inte:
- Node.js-specifika API:er
- externa npm-paket
- betalda API:er
- externa AI-anrop
- hemliga nycklar
- permanent fulltextlagring

Koden ska vara uppdelad i tydliga .gs-filer.

Föreslagen filstruktur:

src/Constants.gs
src/SheetUtils.gs
src/Config.gs
src/IdUtils.gs
src/LogService.gs
src/Setup.gs
src/Menu.gs
src/TestFunctions.gs
src/Main.gs

Skapa även dokumentationsfiler:

README.md
AGENTS.md
CHANGELOG.md

Om repositoryt redan har filer, inspektera först och ändra endast det som behövs för Etapp 1. Om befintlig PDF-bevakningskod finns, ändra den inte.

==================================================
2. ÖVERGRIPANDE LEVERANS
==================================================

Implementera följande funktioner i Etapp 1:

setupAnalysisWorkbook()
- Skapar alla flikar som behövs för analysdatabasen.
- Lägger in rubriker.
- Lägger in grundinställningar i Inställningar_Analys.
- Lägger in startvärden i grundläggande kodböcker.
- Skapar inte dubbletter om funktionen körs flera gånger.
- Raderar inte befintlig data.
- Skriver loggrad i Analyslogg.

validateAnalysisWorkbook()
- Kontrollerar att alla obligatoriska flikar finns.
- Kontrollerar att alla obligatoriska rubriker finns.
- Kontrollerar att centrala inställningar finns.
- Kontrollerar att grundkodböcker har startvärden.
- Skriver tydliga fel i Fellogg om något saknas.
- Returnerar ett tydligt resultatobjekt.
- Visar gärna enkel sammanfattning för användaren.

onOpen()
- Skapar en Google Sheets-meny.

createAnalysisMenu()
- Skapar meny med tydliga svenska menyval.

getSettings()
- Läser Inställningar_Analys.
- Returnerar inställningar som objekt.
- Använder säkra standardvärden om icke-kritiska inställningar saknas.
- Loggar fel om obligatorisk inställning saknas.

appendAnalysisLog()
- Skriver till Analyslogg.

appendErrorLog()
- Skriver till Fellogg.

generateId()
- Skapar stabila ID:n med prefix och år.
- Exempel: RUN-2026-000001, ERR-2026-000001, DOC-2026-000001.
- Ska undvika dubbletter genom att läsa befintliga ID:n.

testSetupAnalysisWorkbook()
testValidateAnalysisWorkbook()
testWriteAnalysisLog()
testWriteErrorLog()
testCreateManualReviewItem()

Dessa testfunktioner ska kunna köras manuellt från Apps Script-menyn.

==================================================
3. VIKTIGA DESIGNREGLER
==================================================

3.1 Rubrikbaserad kolumnhantering

Koden får inte förlita sig på fasta kolumnnummer för viktiga fält.

Skapa hjälpfunktioner som:
- getHeaderMap(sheet)
- requireHeaders(sheet, requiredHeaders)
- appendRowByHeaders(sheet, rowObject)
- appendRowsByHeaders(sheet, rowObjects)
- updateRowByHeaders(sheet, rowIndex, rowObject)

Om en obligatorisk kolumn saknas ska systemet logga COLUMN_MISSING och inte skriva data till fel kolumn.

3.2 Idempotens

Alla setup-funktioner ska kunna köras flera gånger.

Om flik redan finns:
- behåll den,
- lägg till saknade rubriker längst till höger,
- radera inte data,
- skriv inte över befintlig data i onödan.

Om inställningsnyckel redan finns:
- skriv inte över användarens värde,
- men fyll eventuell saknad beskrivning/standard om det är säkert.

Om kodboksvärde redan finns:
- skapa inte dubblett.

3.3 Inga rådata får raderas

Koden får inte radera:
- original-PDF:er,
- råtabeller,
- Dokument,
- Ärenden,
- Huvudmän,
- Skolenheter,
- DokumentBrist,
- DokumentLagrum,
- Åtgärder,
- Analyslogg,
- Fellogg,
- Manuell_granskning.

DashboardData får raderas i senare etapper vid rebuild, men Etapp 1 behöver inte implementera full rebuild.

3.4 Ingen kostnad

Skapa standardinställningar:

ALLOW_PAID_SERVICES = NEJ
MAX_MONTHLY_COST = 0
AI_ALLOW_PAID_USAGE = NEJ
AI_COST_LIMIT = 0
ALLOW_EXTERNAL_AI = NEJ

Bygg ingen kod som automatiskt använder betalda tjänster.

3.5 Ingen permanent fulltext

Skapa standardinställningar:

STORE_FULL_TEXT = NEJ
ALLOW_FULL_TEXT_STORAGE = NEJ
DELETE_TEMP_TEXT_FILES = JA
LOG_FULL_TEXT = NEJ
LOG_PROMPTS = NEJ

Etapp 1 ska inte implementera fulltextlagring.

3.6 Svenska tecken

Koden och rubriker ska hantera svenska tecken:
å, ä, ö, Å, Ä, Ö.

Fliknamn ska vara exakt enligt listan nedan.

==================================================
4. FLIKAR SOM SKA SKAPAS
==================================================

setupAnalysisWorkbook() ska skapa följande flikar:

Inställningar_Analys
Analyskö
Dokument
Ärenden
ÄrendeDokument
Huvudmän
Skolenheter
DokumentSkolform
DokumentÅrskurs
DokumentElevgrupp
Bristområden
DokumentBrist
Lagrum
DokumentLagrum
Åtgärder
Personer
DokumentPerson
Referens_Riket
Referens_Kommun
Referens_Huvudman
Referens_Skolenhet
Referens_Källa
Manuell_granskning
Analyslogg
Fellogg
DashboardData
Kodbok_Skolform
Kodbok_Elevgrupper
Kodbok_Beslutstyper
Kodbok_Allvarsindex
Kodbok_Lagrum
Kodbok_Statusar
Kodbok_Källtyper

Alla flikar ska få rubriker på rad 1.

Frys gärna rad 1 och gör rubrikerna feta. Färgkodning är okej men inte nödvändigt.

==================================================
5. EXAKTA RUBRIKER PER FLIK
==================================================

Använd dessa rubriker exakt. Ordningen får gärna vara enligt listan. Om en befintlig flik har rubriker ska saknade rubriker läggas till längst till höger.

Inställningar_Analys:
Nyckel
Värde
Beskrivning
Standardvärde
Obligatorisk
Senast ändrad
Kommentar

Analyskö:
queue_id
document_id
drive_file_id
drive_link
pdf_url
filnamn
länktext
nedladdningskategori
publiceringsdatum
queue_status
next_step
priority
text_extraction_attempts
analysis_attempts
validation_attempts
last_attempt_at
next_retry_at
error_type
error_message
reanalyze_requested
reanalyze_reason
target_analysis_version
current_analysis_version
manual_review_required
manual_review_reason
manually_locked
created_at
updated_at
completed_at
notes

Dokument:
document_id
queue_id
drive_file_id
drive_link
pdf_url
filnamn
länktext
nedladdningskategori
publiceringsdatum
publiceringsdatum_source
beslutsdatum
beslutsdatum_source
beslutsdatum_confidence
beslutsdatum_osäkert
dnr_raw
dnr_normaliserad
dnr_confidence
case_id
extraherad_dokumenttyp
slutlig_dokumenttyp
dokumentroll
är_uppföljning
är_skolbeslut
är_huvudmannabeslut
är_granskningsbeslut
huvudman_id
huvudman_namn_raw
huvudman_namn_normaliserat
organisationsnummer
huvudmannatyp_grov
huvudmannatyp_fin
skolenhet_id
skolenhet_namn_raw
skolenhet_namn_normaliserat
skolenhetskod
lägeskommun
län
beslutsfattare_raw
beslutsfattare_person_id
föredragande_raw
föredragande_person_id
text_extraction_method
text_extraction_status
text_length
page_count
file_size
analysis_status
analysis_started_at
analysis_completed_at
analysis_model_version
reanalyze_requested
reanalyze_reason
confidence_overall
requires_manual_review
review_reason
manuellt_låst
created_at
updated_at
notes

Ärenden:
case_id
dnr_normaliserad
dnr_raw_variants
case_key_source
första_beslutsdatum
senaste_beslutsdatum
primärt_beslutsdatum
primärt_beslutsdatum_source
antal_dokument
huvudman_id
huvudman_namn_normaliserat
huvudmannatyp_grov
huvudmannatyp_fin
skolenhet_id
skolenhet_namn_normaliserat
lägeskommun
län
ärendenivå
ärendetyp
har_grundbeslut
har_uppföljningsbeslut
har_avslutande_beslut
senaste_dokument_id
grundbeslut_document_id
senaste_uppföljning_document_id
slutligt_utfall
brister_konstaterade
föreläggande
vite
vitesbelopp
återrapportering_krävs
brister_avhjälpta
brister_kvarstår
antal_bristområden
antal_lagrum
antal_åtgärder
dokumentationskrav
allvarsindex
allvarsindex_confidence
case_status
analysis_model_version
confidence_overall
requires_manual_review
review_reason
manuellt_låst
created_at
updated_at
notes

ÄrendeDokument:
case_document_id
case_id
document_id
drive_file_id
dnr_normaliserad
document_role
document_role_confidence
document_sequence
beslutsdatum
publiceringsdatum
är_primärt_dokument
är_senaste_dokument
är_grundbeslut
är_uppföljningsbeslut
är_avslutande_beslut
är_skolbeslut
är_huvudmannabeslut
kopplingsmetod
kopplings_confidence
requires_manual_review
review_reason
manuellt_låst
created_at
updated_at
notes

Huvudmän:
huvudman_id
huvudman_namn_raw
huvudman_namn_normaliserat
huvudman_namn_display
organisationsnummer
organisationsnummer_source
organisationsnummer_confidence
huvudmannatyp_grov
huvudmannatyp_fin
huvudmannatyp_source
huvudmannatyp_confidence
kommunal_huvudman_kommun
kommunal_huvudman_kommunkod
huvudman_län
koncern
koncern_source
koncern_confidence
huvudman_storleksklass
antal_skolenheter
antal_elever
referensdata_läsår
aktiv
första_förekomst_datum
senaste_förekomst_datum
antal_ärenden
antal_dokument
matchningsnyckel
matchningsmetod
matchnings_confidence
requires_manual_review
review_reason
manuellt_låst
created_at
updated_at
notes

Skolenheter:
skolenhet_id
skolenhet_namn_raw
skolenhet_namn_normaliserat
skolenhet_namn_display
skolenhetskod
skolenhetskod_source
skolenhetskod_confidence
huvudman_id
huvudman_namn_normaliserat
huvudmannatyp_grov
huvudmannatyp_fin
organisationsnummer
lägeskommun
lägeskommun_kod
län
länskod
skolformer_kända
primär_skolform
årskurser_kända
elevantal
elevantal_läsår
skolenhet_storleksklass
aktiv
aktiv_från
aktiv_till
referensdata_source
referensdata_läsår
första_förekomst_datum
senaste_förekomst_datum
antal_ärenden
antal_dokument
matchningsnyckel
matchningsmetod
matchnings_confidence
requires_manual_review
review_reason
manuellt_låst
created_at
updated_at
notes

DokumentSkolform:
document_schoolform_id
document_id
case_id
skolenhet_id
huvudman_id
skolform_id
skolform_namn
skolform_raw
skolform_source
skolform_confidence
skolform_role
gäller_hela_dokumentet
gäller_brist
gäller_åtgärd
identifierad_från_titel
identifierad_från_pdf
identifierad_från_referensdata
source_page
requires_manual_review
review_reason
manuellt_låst
created_at
updated_at
notes

DokumentÅrskurs:
document_grade_id
document_id
case_id
skolenhet_id
huvudman_id
skolform_id
skolform_namn
årskurs
årskurs_raw
årskursintervall_raw
årskurs_source
årskurs_confidence
årskurs_role
gäller_hela_dokumentet
gäller_brist
gäller_åtgärd
identifierad_från_titel
identifierad_från_pdf
identifierad_från_referensdata
source_page
requires_manual_review
review_reason
manuellt_låst
created_at
updated_at
notes

DokumentElevgrupp:
document_studentgroup_id
document_id
case_id
skolenhet_id
huvudman_id
skolform_id
årskurs
elevgrupp_id
elevgrupp_namn
elevgrupp_raw
elevgrupp_source
elevgrupp_confidence
elevgrupp_role
gäller_hela_dokumentet
gäller_brist
gäller_åtgärd
identifierad_från_titel
identifierad_från_pdf
identifierad_från_referensdata
source_page
requires_manual_review
review_reason
manuellt_låst
created_at
updated_at
notes

Bristområden:
bristkod
bristområde_bred
bristområde_fin
parent_bristkod
dashboardgrupp
kortnamn
definition
inkludera_om
exkludera_om
typiska_ord_och_fraser
typiska_lagrum
typiska_åtgärder
typiska_elevgrupper
typiska_skolformer
dokumentationskrav_relevant
elevrättighet_direkt
allvarsindex_bas
allvarsindex_kommentar
ai_instruction
ai_common_mistakes
confidence_rule
requires_manual_review_if
aktiv
giltig_från
giltig_till
created_at
updated_at
notes

DokumentBrist:
document_brist_id
document_id
case_id
drive_file_id
dnr_normaliserad
bristkod
bristområde_bred
bristområde_fin
briststatus
bristroll
bedömningsperspektiv
är_konstaterad_brist
är_avhjälpt_brist
är_kvarstående_brist
är_ny_brist_i_detta_dokument
är_uppföljningsrelaterad
gäller_hela_ärendet
gäller_hela_dokumentet
gäller_skolenhet
gäller_huvudman
huvudman_id
skolenhet_id
skolform_id
skolform_namn
årskurs
elevgrupp_id
beslutsdatum
ärendetyp
dokumentroll
föreläggande_kopplat
vite_kopplat
åtgärd_kopplad
action_id
dokumentationskrav
dokumentationskrav_typ
elevrättighet_direkt
brist_omfattning
allvarsindex
allvarsindex_bas
allvarsindex_justering
allvarsindex_motivering_kod
allvarsindex_confidence
classification_method
classification_confidence
source_type
source_page
source_section
räknas_i_dashboard
räknas_som_brist_i_ärende
requires_manual_review
review_reason
manuellt_låst
created_at
updated_at
notes

Lagrum:
lagrum_id
normaliserad_kod
författning
författning_kortnamn
författningsnummer
kapitel
paragraf
stycke
punkt
bilaga
annan_indelning
lagrum_display
lagrum_kort_display
råtext_exempel
normaliseringsmönster
typiska_bristområden
typiska_skolformer
typisk_lagrum_roll
aktiv
giltig_från
giltig_till
ersätter_lagrum_id
ersatt_av_lagrum_id
confidence_rule
requires_manual_review_if
created_at
updated_at
notes

DokumentLagrum:
document_law_id
document_id
case_id
drive_file_id
dnr_normaliserad
lagrum_id
normaliserad_kod
lagrum_display
lagrum_raw
författning_kortnamn
författning
författningsnummer
kapitel
paragraf
stycke
punkt
lagrum_roll
lagrum_roll_confidence
bristkod
bristområde_bred
bristområde_fin
action_id
föreläggande_kopplat
vite_kopplat
dokumentationskrav_kopplat
huvudman_id
skolenhet_id
skolform_id
skolform_namn
årskurs
elevgrupp_id
beslutsdatum
ärendetyp
dokumentroll
source_type
source_section
source_page
source_pages
occurrence_count
normalization_method
normalization_confidence
classification_method
classification_confidence
räknas_i_dashboard
räknas_som_beslutsgrund
räknas_som_rättslig_reglering
räknas_som_föreläggandepunkt
requires_manual_review
review_reason
manuellt_låst
created_at
updated_at
notes

Åtgärder:
action_id
document_id
case_id
drive_file_id
dnr_normaliserad
beslutsdatum
ärendetyp
dokumentroll
åtgärdstyp
åtgärdskategori
åtgärdsstatus
utfall
bristkod
bristområde_bred
bristområde_fin
lagrum_id
normaliserad_kod
föreläggande
vite
vitesbelopp
vitesbelopp_valuta
redovisningskrav
redovisningsdatum
dokumentationskrav
dokumentationskrav_typ
uppföljning_krävs
är_uppföljningsutfall
brist_avhjälpt
brist_kvarstår
ärendet_avslutas
huvudman_id
skolenhet_id
skolform_id
skolform_namn
årskurs
elevgrupp_id
beslutsfattare_person_id
föredragande_person_id
allvarsindex_påverkan
source_type
source_section
source_page
classification_method
classification_confidence
räknas_i_dashboard
requires_manual_review
review_reason
manuellt_låst
created_at
updated_at
notes

Personer:
person_id
person_namn_raw
person_namn_normaliserat
person_namn_display
dashboard_label
primär_roll
roller_kända
organisation
enhet
första_förekomst_datum
senaste_förekomst_datum
antal_dokument
antal_ärenden
antal_som_beslutsfattare
antal_som_föredragande
antal_som_annan_roll
minsta_dashboard_urval
får_visas_i_dashboard
aktiv
matchningsnyckel
matchningsmetod
matchnings_confidence
requires_manual_review
review_reason
manuellt_låst
created_at
updated_at
notes

DokumentPerson:
document_person_id
document_id
case_id
drive_file_id
dnr_normaliserad
person_id
person_namn_raw
person_namn_normaliserat
dashboard_label
roll_i_dokument
roll_confidence
beslutsdatum
ärendetyp
dokumentroll
huvudman_id
skolenhet_id
skolform_id
source_type
source_section
source_page
extraction_method
classification_method
classification_confidence
räknas_i_dashboard
requires_manual_review
review_reason
manuellt_låst
created_at
updated_at
notes

Referens_Riket:
reference_national_id
läsår
kalenderår
nivå
skolform_id
skolform_namn
huvudmannatyp_grov
huvudmannatyp_fin
årskurs
elevgrupp_id
antal_elever
antal_skolenheter
antal_huvudmän
antal_kommuner
mått_typ
mått_värde
källa_id
källa_namn
källa_url
importdatum
data_confidence
requires_manual_review
review_reason
created_at
updated_at
notes

Referens_Kommun:
reference_municipality_id
läsår
kalenderår
kommunkod
kommun
länskod
län
skolform_id
skolform_namn
huvudmannatyp_grov
huvudmannatyp_fin
årskurs
antal_elever
antal_skolenheter
antal_huvudmän
andel_elever
mått_typ
mått_värde
källa_id
källa_namn
källa_url
importdatum
data_confidence
requires_manual_review
review_reason
created_at
updated_at
notes

Referens_Huvudman:
reference_principal_id
läsår
kalenderår
huvudman_id
huvudman_namn
huvudman_namn_normaliserat
organisationsnummer
huvudmannatyp_grov
huvudmannatyp_fin
kommunal_huvudman_kommun
kommunkod
län
koncern
skolform_id
skolform_namn
antal_skolenheter
antal_elever
antal_kommuner_med_verksamhet
huvudman_storleksklass
aktiv
mått_typ
mått_värde
matchad_mot_huvudmän
matchningsmetod
matchnings_confidence
källa_id
källa_namn
källa_url
importdatum
data_confidence
requires_manual_review
review_reason
created_at
updated_at
notes

Referens_Skolenhet:
reference_schoolunit_id
läsår
kalenderår
skolenhet_id
skolenhetskod
skolenhet_namn
skolenhet_namn_normaliserat
huvudman_id
huvudman_namn
huvudman_namn_normaliserat
organisationsnummer
huvudmannatyp_grov
huvudmannatyp_fin
lägeskommun
lägeskommun_kod
län
länskod
skolform_id
skolform_namn
årskurser
årskurs
antal_elever
skolenhet_storleksklass
aktiv
aktiv_från
aktiv_till
mått_typ
mått_värde
matchad_mot_skolenheter
matchningsmetod
matchnings_confidence
källa_id
källa_namn
källa_url
importdatum
data_confidence
requires_manual_review
review_reason
created_at
updated_at
notes

Referens_Källa:
källa_id
källa_namn
källa_typ
källa_url
ansvarig_myndighet
statistiktyp
läsår
kalenderår
importdatum
importmetod
data_status
data_confidence
senast_kontrollerad
requires_manual_review
review_reason
notes

Manuell_granskning:
review_id
review_status
priority
created_at
updated_at
resolved_at
document_id
case_id
drive_file_id
drive_link
pdf_url
dnr_normaliserad
filnamn
beslutsdatum
review_object_type
review_object_id
table_name
field_name
current_value
suggested_value
manual_value
review_reason
error_or_uncertainty_type
confidence
source_type
source_page
source_section
assigned_to
reviewed_by
manual_decision
apply_to_similar
create_reanalysis_request
update_codebook_needed
codebook_note
manuellt_låst
notes

Analyslogg:
run_id
run_type
started_at
ended_at
duration_seconds
run_status
trigger_type
triggered_by
analysis_model_version
codebook_version
batch_size_requested
batch_size_processed
documents_found
documents_processed
documents_success
documents_failed
documents_manual_review
cases_created
cases_updated
text_extraction_success
text_extraction_failed
analysis_success
analysis_failed
validation_success
validation_failed
dashboard_updated
reference_data_updated
errors_count
warnings_count
manual_review_count
queue_items_created
queue_items_updated
start_queue_status
end_queue_status
message
technical_details

Fellogg:
error_id
run_id
created_at
error_status
severity
error_type
error_category
message
technical_message
document_id
case_id
drive_file_id
drive_link
pdf_url
dnr_normaliserad
table_name
field_name
object_id
queue_id
review_id
retry_count
max_retries
next_retry_at
resolved_at
resolved_by
resolution_note
requires_manual_review
manual_review_created
notes

DashboardData:
dashboard_row_id
dashboard_dataset_version
generated_at
source_run_id
row_type
aggregation_level
case_id
document_id
drive_file_id
drive_link
dnr_normaliserad
beslutsdatum
beslutsår
beslutsmånad
läsår
period_start
period_end
ärendetyp
dokumenttyp
dokumentroll
huvudman_id
huvudman_namn_display
huvudmannatyp_grov
huvudmannatyp_fin
huvudman_storleksklass
koncern
skolenhet_id
skolenhet_namn_display
lägeskommun
lägeskommun_kod
län
länskod
skolform_id
skolform_namn
årskurs
årskursgrupp
elevgrupp_id
elevgrupp_namn
bristkod
bristområde_bred
bristområde_fin
briststatus
lagrum_id
normaliserad_kod
lagrum_display
lagrum_roll
action_id
åtgärdstyp
åtgärdskategori
utfall
föreläggande
vite
vitesbelopp
redovisningskrav
dokumentationskrav
dokumentationskrav_typ
uppföljning_krävs
brist_avhjälpt
brist_kvarstår
ärendet_avslutas
beslutsfattare_person_id
beslutsfattare_dashboard_label
föredragande_person_id
föredragande_dashboard_label
allvarsindex
allvarsindex_confidence
confidence_overall
contains_low_confidence
contains_manual_review
manual_review_count
count_cases
count_documents
count_brist
count_lagrum
count_actions
count_forelaggande
count_vite
count_dokumentationskrav
sum_vitesbelopp
avg_allvarsindex
max_allvarsindex
reference_level
reference_läsår
reference_source
reference_count_elever
reference_count_skolenheter
reference_count_huvudmän
ärenden_per_1000_elever
förelägganden_per_1000_elever
ärenden_per_100_skolenheter
förelägganden_per_100_skolenheter
vite_per_100_skolenheter
granskad_andel_skolenheter
granskad_andel_huvudmän
relative_metric_available
relative_metric_warning
small_sample_warning
quality_warning
dashboard_warning_text
räknas_i_standarddashboard
created_at
updated_at
notes

Kodbok_Skolform:
kod
namn
kortnamn
definition
inkludera_om
exkludera_om
synonymer
normaliseringsregler
dashboardgrupp
sorteringsordning
aktiv
giltig_från
giltig_till
juridisk_status
ingår_i_obligatorisk_skola
kan_ha_årskurser
årskurskodlista
ai_instruction
ai_common_mistakes
confidence_rule
requires_manual_review_if
created_at
updated_at
notes

Kodbok_Elevgrupper:
kod
namn
kortnamn
definition
inkludera_om
exkludera_om
synonymer
normaliseringsregler
dashboardgrupp
sorteringsordning
aktiv
giltig_från
giltig_till
ai_instruction
ai_common_mistakes
confidence_rule
requires_manual_review_if
created_at
updated_at
notes

Kodbok_Beslutstyper:
kod
namn
kortnamn
definition
inkludera_om
exkludera_om
synonymer
normaliseringsregler
dashboardgrupp
sorteringsordning
aktiv
giltig_från
giltig_till
ai_instruction
ai_common_mistakes
confidence_rule
requires_manual_review_if
created_at
updated_at
notes

Kodbok_Allvarsindex:
kod
namn
kortnamn
definition
nivå
inkludera_om
exkludera_om
höjer_index
sänker_index
bekräftar_index
dashboardgrupp
sorteringsordning
aktiv
giltig_från
giltig_till
ai_instruction
ai_common_mistakes
confidence_rule
requires_manual_review_if
created_at
updated_at
notes

Kodbok_Lagrum:
kod
namn
kortnamn
definition
författning
författning_kortnamn
normaliserad_kod
normaliseringsregler
regexmönster
råtext_exempel
lagrum_roll
dashboardgrupp
sorteringsordning
aktiv
giltig_från
giltig_till
ai_instruction
ai_common_mistakes
confidence_rule
requires_manual_review_if
created_at
updated_at
notes

Kodbok_Statusar:
kod
namn
kortnamn
statusgrupp
definition
dashboardgrupp
sorteringsordning
aktiv
giltig_från
giltig_till
created_at
updated_at
notes

Kodbok_Källtyper:
kod
namn
kortnamn
definition
kategori
dashboardgrupp
sorteringsordning
aktiv
giltig_från
giltig_till
created_at
updated_at
notes

==================================================
6. STANDARDINSTÄLLNINGAR SOM SKA SKAPAS
==================================================

setupAnalysisWorkbook() ska fylla Inställningar_Analys med dessa nycklar om de saknas.

Använd kolumner:
Nyckel, Värde, Beskrivning, Standardvärde, Obligatorisk, Senast ändrad, Kommentar

Skapa minst dessa rader:

ANALYSIS_SHEET_ID
Värde: tomt eller aktivt spreadsheet-ID om möjligt
Standardvärde: aktivt spreadsheet-ID om möjligt
Obligatorisk: JA

DOWNLOAD_LOG_SHEET_ID
Värde: tomt
Standardvärde: tomt
Obligatorisk: JA

DOWNLOAD_LOG_TAB_NAME
Värde: Logg
Standardvärde: Logg
Obligatorisk: JA

DRIVE_PDF_ROOT_FOLDER_ID
Värde: tomt
Standardvärde: tomt
Obligatorisk: JA

TEMP_TEXT_FOLDER_ID
Värde: tomt
Standardvärde: tomt
Obligatorisk: NEJ

DELETE_TEMP_TEXT_FILES
Värde: JA
Standardvärde: JA
Obligatorisk: JA

ANALYSIS_MODEL_VERSION
Värde: 0.1
Standardvärde: 0.1
Obligatorisk: JA

CODEBOOK_VERSION
Värde: 0.1
Standardvärde: 0.1
Obligatorisk: JA

SYSTEM_TIMEZONE
Värde: Europe/Stockholm
Standardvärde: Europe/Stockholm
Obligatorisk: JA

BATCH_SIZE_SYNC_QUEUE
Värde: 50
Standardvärde: 50
Obligatorisk: JA

BATCH_SIZE_REGISTER_DOCUMENTS
Värde: 50
Standardvärde: 50
Obligatorisk: JA

BATCH_SIZE_TEXT_EXTRACTION
Värde: 5
Standardvärde: 5
Obligatorisk: JA

BATCH_SIZE_ANALYSIS
Värde: 3
Standardvärde: 3
Obligatorisk: JA

BATCH_SIZE_VALIDATION
Värde: 10
Standardvärde: 10
Obligatorisk: JA

BATCH_SIZE_DASHBOARD_UPDATE
Värde: 100
Standardvärde: 100
Obligatorisk: JA

MAX_TEXT_EXTRACTION_ATTEMPTS
Värde: 3
Standardvärde: 3
Obligatorisk: JA

MAX_ANALYSIS_ATTEMPTS
Värde: 3
Standardvärde: 3
Obligatorisk: JA

MAX_VALIDATION_ATTEMPTS
Värde: 3
Standardvärde: 3
Obligatorisk: JA

RETRY_DELAY_MINUTES
Värde: 60
Standardvärde: 60
Obligatorisk: JA

ENABLE_TEXT_EXTRACTION
Värde: JA
Standardvärde: JA
Obligatorisk: JA

ENABLE_OCR_FALLBACK
Värde: JA
Standardvärde: JA
Obligatorisk: JA

MIN_TEXT_LENGTH_FOR_VALID_EXTRACTION
Värde: 1000
Standardvärde: 1000
Obligatorisk: JA

CREATE_TEMP_GOOGLE_DOC
Värde: JA
Standardvärde: JA
Obligatorisk: JA

STORE_FULL_TEXT
Värde: NEJ
Standardvärde: NEJ
Obligatorisk: JA

STORE_TEXT_METADATA
Värde: JA
Standardvärde: JA
Obligatorisk: JA

ENABLE_AI_ANALYSIS
Värde: NEJ
Standardvärde: NEJ
Obligatorisk: JA

AI_PROVIDER
Värde: NONE
Standardvärde: NONE
Obligatorisk: JA

AI_MODEL_NAME
Värde: tomt
Standardvärde: tomt
Obligatorisk: NEJ

AI_COST_LIMIT
Värde: 0
Standardvärde: 0
Obligatorisk: JA

AI_ALLOW_PAID_USAGE
Värde: NEJ
Standardvärde: NEJ
Obligatorisk: JA

AI_REQUIRE_JSON_OUTPUT
Värde: JA
Standardvärde: JA
Obligatorisk: JA

AI_MAX_RETRIES
Värde: 3
Standardvärde: 3
Obligatorisk: JA

AI_LOW_CONFIDENCE_TO_MANUAL_REVIEW
Värde: JA
Standardvärde: JA
Obligatorisk: JA

ENABLE_RULE_BASED_EXTRACTION
Värde: JA
Standardvärde: JA
Obligatorisk: JA

ENABLE_DNR_EXTRACTION
Värde: JA
Standardvärde: JA
Obligatorisk: JA

ENABLE_DATE_EXTRACTION
Värde: JA
Standardvärde: JA
Obligatorisk: JA

ENABLE_LAWRUM_EXTRACTION
Värde: JA
Standardvärde: JA
Obligatorisk: JA

ENABLE_PERSON_EXTRACTION
Värde: JA
Standardvärde: JA
Obligatorisk: JA

ENABLE_ACTION_EXTRACTION
Värde: JA
Standardvärde: JA
Obligatorisk: JA

ENABLE_REFERENCE_MATCHING
Värde: JA
Standardvärde: JA
Obligatorisk: JA

ENABLE_VALIDATION
Värde: JA
Standardvärde: JA
Obligatorisk: JA

VALIDATE_AGAINST_CODEBOOKS
Värde: JA
Standardvärde: JA
Obligatorisk: JA

VALIDATE_REQUIRED_FIELDS
Värde: JA
Standardvärde: JA
Obligatorisk: JA

VALIDATE_DNR
Värde: JA
Standardvärde: JA
Obligatorisk: JA

VALIDATE_DATES
Värde: JA
Standardvärde: JA
Obligatorisk: JA

VALIDATE_LAWRUM
Värde: JA
Standardvärde: JA
Obligatorisk: JA

VALIDATE_SCHOOLFORM
Värde: JA
Standardvärde: JA
Obligatorisk: JA

VALIDATE_BRISTKOD
Värde: JA
Standardvärde: JA
Obligatorisk: JA

ENABLE_MANUAL_REVIEW_QUEUE
Värde: JA
Standardvärde: JA
Obligatorisk: JA

LOW_CONFIDENCE_TO_MANUAL_REVIEW
Värde: JA
Standardvärde: JA
Obligatorisk: JA

MISSING_REQUIRED_FIELD_TO_MANUAL_REVIEW
Värde: JA
Standardvärde: JA
Obligatorisk: JA

CONFLICTING_SOURCES_TO_MANUAL_REVIEW
Värde: JA
Standardvärde: JA
Obligatorisk: JA

UNKNOWN_CODE_TO_MANUAL_REVIEW
Värde: JA
Standardvärde: JA
Obligatorisk: JA

ENABLE_DASHBOARD_DATA_UPDATE
Värde: JA
Standardvärde: JA
Obligatorisk: JA

UPDATE_DASHBOARD_AFTER_ANALYSIS
Värde: JA
Standardvärde: JA
Obligatorisk: JA

REBUILD_DASHBOARD_FULL
Värde: NEJ
Standardvärde: NEJ
Obligatorisk: JA

DASHBOARD_INCLUDE_LOW_CONFIDENCE_DEFAULT
Värde: NEJ
Standardvärde: NEJ
Obligatorisk: JA

DASHBOARD_INCLUDE_MANUAL_REVIEW_DEFAULT
Värde: JA
Standardvärde: JA
Obligatorisk: JA

DASHBOARD_MIN_PERSON_CASES
Värde: 10
Standardvärde: 10
Obligatorisk: JA

DASHBOARD_MIN_GROUP_CASES
Värde: 5
Standardvärde: 5
Obligatorisk: JA

ENABLE_REFERENCE_DATA
Värde: JA
Standardvärde: JA
Obligatorisk: JA

REFERENCE_DEFAULT_LEVEL
Värde: RIKET
Standardvärde: RIKET
Obligatorisk: JA

REFERENCE_USE_NEAREST_SCHOOL_YEAR
Värde: JA
Standardvärde: JA
Obligatorisk: JA

REFERENCE_WARN_IF_MISSING
Värde: JA
Standardvärde: JA
Obligatorisk: JA

ENABLE_ANALYSIS_LOG
Värde: JA
Standardvärde: JA
Obligatorisk: JA

ENABLE_ERROR_LOG
Värde: JA
Standardvärde: JA
Obligatorisk: JA

ENABLE_DEBUG_LOGGING
Värde: NEJ
Standardvärde: NEJ
Obligatorisk: JA

LOG_AI_TECHNICAL_DETAILS
Värde: JA
Standardvärde: JA
Obligatorisk: JA

LOG_FULL_TEXT
Värde: NEJ
Standardvärde: NEJ
Obligatorisk: JA

LOG_PROMPTS
Värde: NEJ
Standardvärde: NEJ
Obligatorisk: JA

ENABLE_AUTO_SYNC_QUEUE
Värde: JA
Standardvärde: JA
Obligatorisk: JA

ENABLE_AUTO_TEXT_EXTRACTION
Värde: JA
Standardvärde: JA
Obligatorisk: JA

ENABLE_AUTO_ANALYSIS
Värde: JA
Standardvärde: JA
Obligatorisk: JA

ENABLE_AUTO_VALIDATION
Värde: JA
Standardvärde: JA
Obligatorisk: JA

ENABLE_AUTO_DASHBOARD_UPDATE
Värde: JA
Standardvärde: JA
Obligatorisk: JA

ADMIN_EMAIL
Värde: tomt
Standardvärde: tomt
Obligatorisk: NEJ

SEND_ERROR_EMAILS
Värde: NEJ
Standardvärde: NEJ
Obligatorisk: JA

SEND_DAILY_SUMMARY
Värde: NEJ
Standardvärde: NEJ
Obligatorisk: JA

ENABLE_ADMIN_MENU
Värde: JA
Standardvärde: JA
Obligatorisk: JA

ENABLE_TEST_FUNCTIONS
Värde: JA
Standardvärde: JA
Obligatorisk: JA

ALLOW_PAID_SERVICES
Värde: NEJ
Standardvärde: NEJ
Obligatorisk: JA

MAX_MONTHLY_COST
Värde: 0
Standardvärde: 0
Obligatorisk: JA

ALLOW_EXTERNAL_AI
Värde: NEJ
Standardvärde: NEJ
Obligatorisk: JA

ALLOW_FULL_TEXT_STORAGE
Värde: NEJ
Standardvärde: NEJ
Obligatorisk: JA

DELETE_TEMP_FILES_ON_SUCCESS
Värde: JA
Standardvärde: JA
Obligatorisk: JA

==================================================
7. GRUNDVÄRDEN I KODBÖCKER
==================================================

setupAnalysisWorkbook() ska lägga in startvärden i kodböckerna om de saknas.

7.1 Kodbok_Skolform

Skapa minst dessa koder:

SKOLFORM_FORSKOLA | Förskola
SKOLFORM_FORSKOLEKLASS | Förskoleklass
SKOLFORM_GRUNDSKOLA | Grundskola
SKOLFORM_ANPASSAD_GRUNDSKOLA | Anpassad grundskola
SKOLFORM_SPECIALSKOLA | Specialskola
SKOLFORM_SAMESKOLA | Sameskola
SKOLFORM_FRITIDSHEM | Fritidshem
SKOLFORM_GYMNASIESKOLA | Gymnasieskola
SKOLFORM_ANPASSAD_GYMNASIESKOLA | Anpassad gymnasieskola
SKOLFORM_KOMVUX | Kommunal vuxenutbildning
SKOLFORM_SFI | Svenska för invandrare
SKOLFORM_ANNAN_VUX | Annan vuxenutbildning
SKOLFORM_OKAND | Okänd

7.2 Kodbok_Elevgrupper

Skapa minst:

ELEVGRUPP_SARSKILT_STOD | Elever i behov av särskilt stöd
ELEVGRUPP_EXTRA_ANPASSNINGAR | Elever med extra anpassningar
ELEVGRUPP_ATGARDSPROGRAM | Elever med åtgärdsprogram
ELEVGRUPP_NYANLANDA | Nyanlända elever
ELEVGRUPP_STUDIEHANDLEDNING_MODERSMAL | Elever med studiehandledning på modersmål
ELEVGRUPP_MODERSMAL | Elever med modersmålsundervisning
ELEVGRUPP_SVA | Elever med svenska som andraspråk
ELEVGRUPP_HOG_FRANVARO | Elever med hög frånvaro
ELEVGRUPP_PROBLEMATISK_FRANVARO | Elever med problematisk skolfrånvaro
ELEVGRUPP_KRANKANDE_BEHANDLING | Elever utsatta för kränkande behandling
ELEVGRUPP_ELEVHALSA | Elever i behov av elevhälsa
ELEVGRUPP_FUNKTIONSNEDSATTNING | Elever med funktionsnedsättning
ELEVGRUPP_ANPASSAD_GRUNDSKOLA | Elever i anpassad grundskola
ELEVGRUPP_ANPASSAD_GYMNASIESKOLA | Elever i anpassad gymnasieskola
ELEVGRUPP_INTRODUKTIONSPROGRAM | Elever på introduktionsprogram
ELEVGRUPP_LANGT_I_KUNSKAPSUTVECKLING | Elever som kommit långt i sin kunskapsutveckling
ELEVGRUPP_FRITIDSHEM | Elever i fritidshem
ELEVGRUPP_BARN_FORSKOLA | Barn i förskola
ELEVGRUPP_SKOLPLIKT | Elever med skolpliktsproblematik
ELEVGRUPP_OKAND | Okänd

7.3 Kodbok_Beslutstyper

Skapa minst:

RIKTAD_TILLSYN | Riktad tillsyn
PLANERAD_TILLSYN | Planerad tillsyn
TEMATISK_KVALITETSGRANSKNING | Tematisk kvalitetsgranskning
PLANERAD_KVALITETSGRANSKNING | Planerad kvalitetsgranskning
UPPFOLJNING | Uppföljning
GRUNDBESLUT | Grundbeslut
UPPFOLJNINGSBESLUT | Uppföljningsbeslut
AVSLUTANDE_BESLUT | Avslutande beslut
GRANSKNINGSBESLUT | Granskningsbeslut
SKOLBESLUT | Skolbeslut
HUVUDMANNABESLUT | Huvudmannabeslut
BADE_SKOLA_OCH_HUVUDMAN | Både skola och huvudman
OVRIGT | Övrigt
OKAND | Okänd
INGA_BRISTER | Inga brister
BRISTER_KONSTATERADE | Brister konstaterade
FORELAGGANDE | Föreläggande
FORELAGGANDE_MED_VITE | Föreläggande med vite
ARENDET_AVSLUTAS | Ärendet avslutas
BRISTER_AVHJALPTA | Brister avhjälpta
BRISTER_DELVIS_AVHJALPTA | Brister delvis avhjälpta
BRISTER_KVARSTAR | Brister kvarstår
UPPFOLJNING_KRAVS | Uppföljning krävs
INGET_INGRIPANDE | Inget ingripande

7.4 Kodbok_Allvarsindex

Skapa nivåerna:

ALLVAR_0 | 0 | Ingen brist, bakgrundsuppgift eller ej bedömt
ALLVAR_1 | 1 | Utvecklingsområde eller mindre kvalitetsanmärkning
ALLVAR_2 | 2 | Konstaterad brist utan tydligt föreläggande eller med begränsad påverkan
ALLVAR_3 | 3 | Föreläggande eller tydlig rättslig brist
ALLVAR_4 | 4 | Föreläggande med flera bristområden, tydlig elevrättslig påverkan, systematisk brist eller kvarstående brist
ALLVAR_5 | 5 | Föreläggande med vite, återkommande/kvarstående brister eller särskilt allvarlig elevrättslig påverkan

Skapa även motiveringskoder:

INGEN_BRIST
UTVECKLINGSOMRADE
KONSTATERAD_BRIST
FORELAGGANDE
VITE
KVARSTAENDE_BRIST
BRIST_AVHJALPT
ELEV_RATTIGHET_DIREKT
SYSTEMATISK_BRIST
HUVUDMANNANIVA
FLERA_BRISTOMRADEN
DOKUMENTATIONSKRAV
REDOVISNINGSKRAV
OKLAR_OMFATTNING
MANUELLT_SATT

7.5 Bristområden

Skapa minst breda bristområden:

BRIST_SARSKILT_STOD | Särskilt stöd
BRIST_EXTRA_ANPASSNINGAR | Extra anpassningar
BRIST_UTREDNING_STODBEHOV | Utredning av stödbehov
BRIST_ATGARDSPROGRAM | Åtgärdsprogram
BRIST_ELEVHALSA | Elevhälsa
BRIST_TRYGGHET_STUDIERO | Trygghet och studiero
BRIST_KRANKANDE_BEHANDLING | Kränkande behandling
BRIST_NARVARO_FRANVARO | Närvaro och frånvaro
BRIST_SKOLPLIKT_RATT_TILL_UTBILDNING | Skolplikt och rätt till utbildning
BRIST_STUDIEHANDLEDNING_MODERSMAL | Studiehandledning på modersmål
BRIST_MODERSMALSUNDERVISNING | Modersmålsundervisning
BRIST_SVA | Svenska som andraspråk
BRIST_NYANLANDA | Nyanlända elevers utbildning
BRIST_INDIVIDUELL_STUDIEPLAN_NYANLANDA | Individuell studieplan för nyanlända
BRIST_UNDERVISNINGENS_KVALITET | Undervisningens kvalitet
BRIST_STIMULANS_UTMANING | Stimulans och utmaning
BRIST_BEDOMNING_BETYG | Bedömning och betyg
BRIST_GARANTERAD_UNDERVISNINGSTID | Garanterad undervisningstid
BRIST_SKA_HUVUDMAN | Systematiskt kvalitetsarbete huvudman
BRIST_SKA_SKOLENHET | Systematiskt kvalitetsarbete skolenhet
BRIST_REKTORS_ANSVAR | Rektors ansvar
BRIST_HUVUDMANNENS_STYRNING | Huvudmannens styrning och stöd
BRIST_LARARBEHORIGHET | Lärarbehörighet och kompetens
BRIST_FRITIDSHEM | Fritidshem
BRIST_FORSKOLEKLASS | Förskoleklass
BRIST_FORSKOLA | Förskola
BRIST_ANPASSAD_GRUNDSKOLA | Anpassad grundskola
BRIST_ANPASSAD_GYMNASIESKOLA | Anpassad gymnasieskola
BRIST_GYMNASIESKOLA | Gymnasieskola
BRIST_INTRODUKTIONSPROGRAM | Introduktionsprogram
BRIST_DOKUMENTATION | Dokumentation
BRIST_INFORMATION_VARDNADSHAVARE | Information till vårdnadshavare
BRIST_LIKVARDIGHET | Likvärdighet
BRIST_RESURSFÖRDELNING | Resursfördelning
BRIST_ORDNINGSREGLER_DISCIPLIN | Ordningsregler och disciplinära åtgärder
BRIST_MOTTAGANDE_PLACERING | Mottagande och placering
BRIST_TILLGANG_TILL_UTBILDNING | Tillgång till utbildning
BRIST_RUTINER_ANSVAR | Rutiner och ansvarsfördelning
BRIST_OVRIGT | Övrigt
BRIST_OKANT | Okänt

7.6 Kodbok_Statusar

Skapa minst:

NYTT_DOKUMENT
VÄNTAR_TEXT
TEXT_KLAR
VÄNTAR_ANALYS
ANALYS_KLAR
VÄNTAR_VALIDERING
VALIDERING_KLAR
VÄNTAR_DASHBOARD
KLAR
OK_MED_OSÄKRA_FÄLT
BEHÖVER_MANUELL_GRANSKNING
FEL_TEXTUTVINNING
FEL_ANALYS
FEL_VALIDERING
PARKERAD
OK
OK_MED_VARNINGAR
OK_MED_FEL
FEL
TEST

7.7 Kodbok_Källtyper

Skapa minst:

PDF_TEXT
OCR
WEBB
AI
REGEL
AI_PLUS_REGEL
MANUELL
REFERENSREGISTER
OFFICIELL_STATISTIK
OKÄND

7.8 Kodbok_Lagrum

Skapa några startposter, men bygg inte full juridisk databas i Etapp 1.

Minst:
LAG_SKOLLAGEN_3_7 | Skollagen 3:7 | Skollagen 3 kap. 7 §
LAG_SKOLLAGEN_3_9 | Skollagen 3:9 | Skollagen 3 kap. 9 §
LAG_SKOLLAGEN_26_10 | Skollagen 26:10 | Skollagen 26 kap. 10 §
LAG_SKOLLAGEN_26_27 | Skollagen 26:27 | Skollagen 26 kap. 27 §
LAG_OKAND | OKÄND | Okänt lagrum

==================================================
8. LOGGNING
==================================================

Implementera appendAnalysisLog(logObject).

Den ska:
- säkerställa att Analyslogg finns,
- skapa run_id om saknas,
- fylla started_at om saknas,
- skriva raden via rubriker,
- inte krascha utan begripligt fel.

Implementera appendErrorLog(errorObject).

Den ska:
- säkerställa att Fellogg finns,
- skapa error_id om saknas,
- fylla created_at om saknas,
- fylla standardvärden:
  error_status = NY
  severity = MEDIUM om saknas
  error_type = UNKNOWN_ERROR om saknas
  error_category = DRIFT om saknas
- skriva raden via rubriker.

Om Fellogg saknas innan setup är körd, använd Logger.log som fallback.

==================================================
9. MANUELL GRANSKNING
==================================================

Implementera createManualReviewItem(reviewObject).

Den ska:
- skriva rad i Manuell_granskning,
- skapa review_id om saknas,
- sätta review_status = NY om saknas,
- sätta priority = NORMAL om saknas,
- sätta created_at om saknas,
- undvika uppenbar dubblett om samma document_id, case_id, table_name, field_name och review_reason redan finns aktiv.

Etapp 1 behöver bara stödja skapande av granskningspost, inte full arbetsflödeshantering.

==================================================
10. ADMINMENY
==================================================

Skapa onOpen() och createAnalysisMenu().

Menyn ska heta:

PDF-analys

Menyval:

Skapa/uppdatera analysstruktur
-> setupAnalysisWorkbook

Kontrollera analysstruktur
-> validateAnalysisWorkbook

Testa analyslogg
-> testWriteAnalysisLog

Testa fellogg
-> testWriteErrorLog

Testa manuell granskningspost
-> testCreateManualReviewItem

Visa enkel driftstatus
-> showAnalysisStatus

Etapp 1 ska inte ha menyval för full AI, OCR eller dashboardbyggande.

==================================================
11. SHOW STATUS
==================================================

Implementera showAnalysisStatus().

Den ska visa enkel sammanfattning, till exempel via SpreadsheetApp.getUi().alert:

- om obligatoriska flikar finns,
- antal rader i Analyskö,
- antal rader i Dokument,
- antal rader i Ärenden,
- antal aktiva fel i Fellogg,
- antal aktiva manuella granskningsposter,
- senaste rad i Analyslogg om möjligt.

Den behöver inte vara avancerad.

==================================================
12. VALIDERING
==================================================

validateAnalysisWorkbook() ska kontrollera:

1. Alla obligatoriska flikar finns.
2. Alla obligatoriska rubriker finns.
3. Inställningar_Analys innehåller centrala nycklar:
   ANALYSIS_SHEET_ID
   DRIVE_PDF_ROOT_FOLDER_ID
   ANALYSIS_MODEL_VERSION
   CODEBOOK_VERSION
   ENABLE_ANALYSIS_LOG
   ENABLE_ERROR_LOG
   ALLOW_PAID_SERVICES
   MAX_MONTHLY_COST
   STORE_FULL_TEXT
4. Kodböcker har minst en rad utöver rubrik.
5. Analyslogg finns.
6. Fellogg finns.

Om något saknas:
- logga i Fellogg,
- returnera ok: false,
- ge begripligt meddelande.

Om allt är OK:
- skriv Analyslogg med run_type = VALIDATE_WORKBOOK och run_status = OK,
- returnera ok: true.

==================================================
13. SETUP
==================================================

setupAnalysisWorkbook() ska:

1. ta lock om möjligt med LockService,
2. skapa saknade flikar,
3. säkerställa rubriker,
4. frysa rubrikrad,
5. skriva grundinställningar,
6. skriva grundkodböcker,
7. skapa Analyslogg-rad,
8. returnera sammanfattning,
9. visa gärna alert med sammanfattning,
10. släppa lock i finally.

Om fel uppstår:
- logga i Fellogg,
- visa begripligt fel,
- kasta inte onödigt om det går att avsluta kontrollerat.

==================================================
14. ID-GENERERING
==================================================

Implementera generateId(prefix, sheetName, idColumnName).

Exempel:
generateId("RUN", "Analyslogg", "run_id") -> RUN-2026-000001

Regler:
- använd aktuellt år,
- leta befintliga ID:n med samma prefix och år,
- hitta högsta löpnummer,
- returnera nästa.
- om flik eller kolumn saknas, skapa timestampbaserad fallback men logga varning.

Etapp 1 behöver inte vara perfekt för massiv parallellitet, men använd LockService där det är kritiskt.

==================================================
15. README.md
==================================================

Skapa README.md med:

1. kort beskrivning av projektet,
2. Etapp 1-scope,
3. vad som inte ingår i Etapp 1,
4. hur man skapar ett Google Sheet,
5. hur man lägger in Apps Script-kod,
6. hur man kör setupAnalysisWorkbook,
7. hur man kör validateAnalysisWorkbook,
8. hur man kontrollerar Analyslogg och Fellogg,
9. hur man använder adminmenyn,
10. vilka inställningar som måste fyllas manuellt efter setup:
    DOWNLOAD_LOG_SHEET_ID
    DRIVE_PDF_ROOT_FOLDER_ID
    eventuellt TEMP_TEXT_FOLDER_ID
11. kostnadskrav,
12. dataminimeringskrav,
13. felsökning.

Skriv README på svenska.

==================================================
16. AGENTS.md
==================================================

Skapa AGENTS.md med instruktioner till framtida Codex-arbete:

- Följ kravspecifikationen.
- Ändra inte PDF-bevakaren utan uttrycklig instruktion.
- Använd inga betalda tjänster.
- Hårdkoda inga API-nycklar.
- Radera inte rådata.
- Spara inte fulltext permanent som standard.
- Använd rubrikbaserad kolumnhantering.
- Logga fel i Fellogg.
- Logga körningar i Analyslogg.
- Respektera manuellt_låst.
- Bygg i etapper.
- Prioritera robusthet före snabbhet.
- Skapa testfunktioner.
- Skriv begripliga felmeddelanden.

Skriv AGENTS.md på svenska.

==================================================
17. CHANGELOG.md
==================================================

Skapa CHANGELOG.md.

Första post:
Version 0.1 Etapp 1
- Skapad grundstruktur för analysdatabas.
- Skapad setup-funktion.
- Skapad valideringsfunktion.
- Skapade kodböcker.
- Skapade loggfunktioner.
- Skapade adminmeny.
- Skapade testfunktioner.

==================================================
18. PLACEHOLDERS SOM FÅR FINNAS MEN INTE FULLT IMPLEMENTERAS
==================================================

Det är okej att skapa placeholder-funktioner för framtida etapper, men de ska vara säkra och tydliga.

Exempel:

syncDownloadLogToAnalysisQueue()
registerQueuedDocuments()
extractTextForQueuedDocuments()
analyzeQueuedDocuments()
validateAnalyzedDocuments()
updateDashboardData()
rebuildDashboardData()

I Etapp 1 ska dessa antingen:
- inte finnas, eller
- finnas som säkra placeholders som loggar:
  "Funktionen är inte implementerad i Etapp 1."

De får inte låtsas att analys är genomförd.

==================================================
19. ACCEPTANSKRITERIER
==================================================

Etapp 1 är godkänd när:

1. Koden är uppdelad i tydliga .gs-filer.
2. setupAnalysisWorkbook() kan köras utan att radera data.
3. Alla flikar i listan skapas.
4. Alla rubriker skapas.
5. Inställningar_Analys fylls med standardvärden.
6. Grundläggande kodböcker fylls med startvärden.
7. validateAnalysisWorkbook() kan köras.
8. validateAnalysisWorkbook() ger OK när strukturen är korrekt.
9. Analyslogg får loggrad.
10. Fellogg får testfel via testWriteErrorLog().
11. Manuell_granskning får testpost via testCreateManualReviewItem().
12. Adminmenyn PDF-analys finns.
13. showAnalysisStatus() fungerar.
14. setupAnalysisWorkbook() kan köras flera gånger utan att skapa dubbletter.
15. Inga betalda tjänster används.
16. Ingen fulltext sparas.
17. Inga original-PDF:er raderas.
18. README.md finns.
19. AGENTS.md finns.
20. CHANGELOG.md finns.
21. Kodens felmeddelanden är begripliga för en icke-kodare.

==================================================
20. LEVERANSFORMAT
==================================================

Leverera:
- kodfiler,
- README.md,
- AGENTS.md,
- CHANGELOG.md.

Sammanfatta efter implementationen:

1. vilka filer du skapade,
2. vilka funktioner som finns,
3. hur användaren testar,
4. vad som ingår i Etapp 1,
5. vad som uttryckligen inte ingår ännu,
6. eventuella risker eller begränsningar,
7. rekommenderat nästa steg.

SLUT CODEX-PROMPT ETAPP 1

Add AGENTS instructions
