# Maps for Möbius

Maps turns location-based answers into saved, interactive maps. Each map keeps
its places, source conversation, and the context that made the recommendations
useful.

The app includes a Möbius skill for researching and geocoding places, writing a
validated map record, and linking the saved map back into chat as a visual
preview.

## What it does

- Keeps generated maps in a newest-first visual library.
- Renders OpenStreetMap tiles with place markers and required attribution.
- Shows available venue websites, phone numbers, opening hours, ratings, review
  counts, and Google Maps links without inventing missing details.
- Supports smooth drag, pinch, trackpad, double-tap, one-finger, button, and
  keyboard map navigation.
- Publishes stable, read-only interactive map links from an in-app sharing sheet
  with Copy, Open, Update, and Stop sharing controls.
- Opens the source conversation from each saved map.
- Ships stdlib-only helpers for geocoding and conflict-safe storage updates.

## Development

```bash
npm test
npm run smoke
```

Map records and published-map state live in app-scoped Möbius storage and are
never committed to this repository.
