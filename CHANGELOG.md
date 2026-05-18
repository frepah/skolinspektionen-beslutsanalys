# Changelog

## Version 0.11 Etapp 11

- Versionsnumret är satt till `v0.11.0` för att inte blandas ihop med tidigare fungerande version 10.
- Lade till försiktig extraktion av huvudmän och skolenheter från tillfällig PDF-text.
- Fyller `Huvudmän`, `Skolenheter` och huvudmanna-/skolenhetsfält i `Ärenden` idempotent.
- Utökade dashboardunderlaget med huvudmän, skolenheter, huvudmannatyper, kommuner och skolformer.

## Version 0.8 Restaurerad arbetslinje

- Återställt den fungerande monolitiska `src/AnalysisWorkbook.gs` i stället för att ersätta den med en ren Etapp 1-omskrivning.
- Dokumenterat beslutet att behålla monoliten tills en separat refaktor efterfrågas.
- Dokumenterat rekommenderat nästa steg: fylla Huvudmän, Skolenheter, Uppföljningar, Personer och DokumentPerson stegvis.

## Version 0.1 Etapp 1

- Skapad grundstruktur för analysdatabas.
- Skapad setup-funktion.
- Skapad valideringsfunktion.
- Skapade kodböcker.
- Skapade loggfunktioner.
- Skapade adminmeny.
- Skapade testfunktioner.
