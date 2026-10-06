# Hobby Agenda

Een persoonlijke hobbyagenda: activiteiten plannen, bekijken en beheren per hobby. Gebouwd met Next.js, TypeScript en PayloadCMS. Het visuele design is bewust minimaal gehouden en volgt later door de gebruiker.

## Starten

Benodigd: Node.js 22.13+ of 24 LTS.

```bash
npm ci
npm run setup
npm run dev
```

Open http://127.0.0.1:3000. Payload gebruikt SQLite (`agenda.db`); het schema wordt bij ontwikkeling automatisch aangemaakt. Kopieer bij problemen `.env.example` naar `.env`.

Controle en productiebuild:

```bash
npm run check
npm run build
```

## Keuzes

- **PayloadCMS + SQLite als eigen backend**: fullstack-aanpak uit de opdracht (activities- en hobbies-collecties, Next.js API- en admin-routes). Data blijft lokaal, geen externe API nodig.
- **localStorage als browserkopie**: bij een verbindingsfout toont de app de laatst bewaarde kopie met een melding. Zo blijft de agenda leesbaar als de server even weg is.
- **FullCalendar voor de kalenderweergave**: een kalendercomponent zelf bouwen kost veel tijd; een bestaande library houdt uren over voor agenda, formulieren en detailweergave.
- **TypeScript + Next.js + Tailwind**: verplicht uit de opdracht; Tailwind alleen voor structuur, geen uitgewerkt design.
- **ICS-export als bonus**: agenda downloaden als `.ics`-bestand, omdat dit direct nuttig is naast de verplichte onderdelen.

## Prioriteit en weglatingen

Eerst agendaweergave en activiteit toevoegen (solide basis), daarna kalender, detailweergave (modal) en filteren op hobby. Bewust weggelaten: uitgewerkt design, AI-functies, terugkerende activiteiten, herinneringen, animaties, dark mode, statistieken en tests. De app doet de vier verplichte onderdelen en één bonus (ICS-export).

## Werkwijze

Werk op `Feature` met één commit per feature en merge afgeronde onderdelen naar `Development`.
