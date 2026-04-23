# Projekt-Regeln für diese Web-App

Diese Datei muss immer zuerst gelesen werden, bevor am Projekt gearbeitet wird.

## Ziel
Ich bin kein Programmierer. Darum soll der Code immer einfach, sauber, verständlich und gut strukturiert aufgebaut sein.

Die Web-App wird mit folgenden Technologien erstellt:

- HTML
- CSS
- JavaScript
- Supabase als Backend

## Grundregeln

1. Der Code soll immer sauber, logisch und wartbar aufgebaut sein.
2. HTML, CSS und JavaScript müssen immer getrennt sein.
3. Keine unnötig komplizierten Lösungen.
4. Der Code soll so geschrieben sein, dass auch ein Anfänger die Struktur versteht.
5. Dateien und Ordner sollen klar benannt werden.
6. Kommentare sollen dort eingefügt werden, wo sie helfen, die Logik zu verstehen.
7. Funktionen sollen möglichst klein und übersichtlich bleiben.
8. Wiederverwendbare Logik soll nicht mehrfach geschrieben werden.

## Projektstruktur

Die Projektstruktur soll grundsätzlich so aufgebaut sein:

```text
projekt/
│
├── index.html
├── css/
│   └── style.css
├── js/
│   ├── app.js
│   ├── api.js
│   ├── ui.js
│   └── config.js
├── config/
│   └── supabase.json
└── assets/
    ├── images/
    └── icons/
