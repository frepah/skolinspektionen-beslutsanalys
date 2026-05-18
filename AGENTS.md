# Instruktioner för framtida Codex-arbete

- Följ kravspecifikationen för aktuell etapp.
- Ändra inte befintlig PDF-bevakare utan uttrycklig instruktion.
- Använd inga betalda tjänster.
- Hårdkoda inga API-nycklar eller hemligheter.
- Radera inte original-PDF:er, råtabeller eller loggar.
- Spara inte fulltext permanent som standard.
- Använd rubrikbaserad kolumnhantering; lita inte på fasta kolumnnummer för viktiga fält.
- Logga körningar i `Analyslogg`.
- Logga fel i `Fellogg` med begripliga felmeddelanden.
- Respektera `manuellt_låst` i senare etapper som skriver verksamhetsdata.
- Bygg i etapper och låt framtida funktioner vara säkra placeholders tills de implementeras.
- Behåll den fungerande monolitiska `src/AnalysisWorkbook.gs` tills användaren uttryckligen ber om uppdelning eller en separat refaktor planeras.
- Prioritera robusthet, idempotens och dataminimering före snabbhet.
- Skapa och uppdatera testfunktioner när ny funktionalitet läggs till.
- Dokumentera ändringar i README och CHANGELOG.
