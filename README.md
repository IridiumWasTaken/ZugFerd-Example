# ZUGFeRD / Factur-X Test-Rechnungs-Generator

Dieser Browser-basierte Generator hilft dabei, einfache Beispiel- und Test-E-Rechnungen im Format ZUGFeRD / Factur-X zu erstellen. Die Eingaben bleiben lokal im Browser und werden nicht an einen Server übertragen. Das Projekt ist für Integrations- und Validierungstests gedacht, nicht für den produktiven Einsatz im Rechnungswesen.

## Überblick

Die Anwendung ermöglicht es, unter anderem:

- ein Profil für ZUGFeRD / Factur-X oder XRechnung auszuwählen,
- Absender- und Empfängerangaben zu erfassen,
- Zahlungsinformationen und Bankdaten zu hinterlegen,
- Positionen mit Mengen, Preisen und Mehrwertsteuersätzen einzutragen,
- die Rechnung in einer lokalen PDF mit eingebetteter XML-Struktur zu exportieren,
- den aktuellen Entwurf im Browser automatisch zu speichern.

## Ziele des Projekts

- einfache Erstellung technischer Test-Rechnungen,
- browserseitige Verarbeitung ohne Server-Backend,
- transparente Auswahl eines unterstützten Profils,
- Nutzung als Grundlage für Integrations- und Systemtests.

## Voraussetzungen

Für die lokale Nutzung genügt ein moderner Webbrowser. Das Projekt verwendet keine Backend-Abhängigkeiten oder externe Laufzeitumgebung.

## Ausführen

1. In das Projektverzeichnis wechseln.
2. Einen kleinen lokalen Webserver starten:

```bash
python3 -m http.server 8000
```

3. Im Browser die Seite öffnen:

```text
http://localhost:8000
```

## Projektstruktur

```text
.
├── app.js                 # Logik für Formular, Validierung und PDF-/XML-Erzeugung
├── index.html             # UI-Struktur der Rechnungserfassung
├── styles.css             # Layout und Styling der Oberfläche
├── DESIGN.md              # Gestaltungsrichtlinien und visuelle Vorgaben
├── PRODUCT.md             # Produktbeschreibung und Anwendungsrahmen
├── docs/
│   └── document.pdf       # Beispiel-/Referenzdokument
└── README.md              # Projektübersicht
```

## Funktionalitäten

Die Anwendung deckt die wichtigsten Aspekte eines generischen Test-Workflows ab:

- Auswahl von Profilen wie Factur-X BASIC, BASIC WL, EN 16931 / ZUGFeRD und XRechnung
- Erfassung von allgemeinen Rechnungsdaten
- Adressdaten für Verkäufer und Käufer
- Zahlungsarten mit passenden Pflichtfeldern
- Rechnungspositionen mit optionaler Artikelnummer sowie Berechnung von Netto,
  Mehrwertsteuer und Bruttobetrag; BASIC WL exportiert keine Positionen ins XML
- Validierung wichtiger Pflichtangaben vor dem Download
- lokales Speichern des aktuellen Entwurfs im Browser

## Wichtiger Hinweis

Dieses Projekt dient ausschließlich der Erstellung von Test- und Beispieldaten. Es ist weder als rechtssichere Produktivlösung noch als Steuerberatung gedacht. Die Unterstützung der gewählten Standardprofile und die technische Konformität sollten vor produktivem Einsatz mit dem jeweiligen Spezifikationsstand geprüft werden.

## Vertraulichkeit und Datenschutz

Die eingegebenen Daten verbleiben im Browser des Benutzers. Es werden keine Rechnungsdaten an einen Server übertragen.

## Lizenz

Dieses Projekt ist unter der MIT-Lizenz veröffentlicht. Weitere Informationen finden Sie in der Datei [LICENSE](./LICENSE).

## Weiterentwicklung

Für zukünftige Erweiterungen sind denkbar:

- zusätzliche Profile oder Standardversionen,
- erweiterte Validierungsfehler mit konkreten Hinweisen,
- erweiterte Import-/Exportfunktionen,
- verbesserte Testfixtures für verschiedene Integrationsszenarien.
