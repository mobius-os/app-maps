---
name: maps-app
description: Create accurate location maps and save them into the Maps app with a link back to the source chat. Use when the partner asks to see recommendations, routes, venues, or other places on a map, or asks to save a generated map.
---

# Maps app skill

Use Maps when a location-based answer becomes easier to understand on a
map. It combines public OpenStreetMap geocoding with a persistent Möbius app.

## Workflow

1. Research time-sensitive venue facts normally and cite authoritative sources.
   Maps does not make stale prices or hours current.
2. Geocode every address with:

   ```bash
   python3 /data/apps/maps/scripts/maps_client.py search "<exact address>"
   ```

   Keep to Nominatim's one-request-per-second policy. Check that the returned
   display name and postcode match the intended place; search results can choose
   another business with a similar name.
3. Create one JSON document matching the schema below. Include `$CHAT_ID` in
   `source_chat.id` and a short human-readable `source_chat.label`.
4. Save it through the helper:

   ```bash
   python3 /data/apps/maps/scripts/add_map.py /path/to/map.json
   ```

   The helper discovers Maps' app id, writes one record per map, and updates
   the subscribed index with conflict-safe retries. Never write the index by
   hand.
5. The helper also surfaces Maps beside the source chat in the background, so
   the new map is easy to find without stealing focus. Its library subscribes
   to the index and refreshes immediately when already open.
6. End the reply with a deep link. The shell renders this as a Maps preview in
   chat and opens the saved map with ordinary back navigation:

   ```markdown
   [Open "Coffee around Borough Market" →](/shell/?app=maps&intent=map:short-stable-slug)
   ```

## Record schema

```json
{
  "id": "short-stable-slug",
  "title": "Coffee around Borough Market",
  "subtitle": "Five calm places for a weekday catch-up",
  "area": "Borough, London",
  "created_at": "2026-07-25T22:00:00Z",
  "zoom": 16,
  "center": {"lat": 51.5055, "lon": -0.0910},
  "origin": {"label": "Borough Market", "lat": 51.5055, "lon": -0.0910},
  "source_chat": {"id": "<CHAT_ID>", "label": "Coffee near Borough Market"},
  "places": [
    {
      "id": "place-slug",
      "name": "Full place name",
      "short_name": "Short label",
      "lat": 51.505,
      "lon": -0.09,
      "address": "Street address",
      "walk": "4 min walk",
      "price": "££",
      "best_for": "Quiet conversation",
      "note": "A concise explanation of why this place made the map.",
      "website": "https://example.com",
      "phone": "+44 20 7946 0123",
      "hours": "Mo-Fr 08:00-18:00",
      "google_maps_url": "https://www.google.com/maps/place/…",
      "rating": 4.6,
      "review_count": 238,
      "rating_source": "Google Maps",
      "rating_checked_at": "YYYY-MM-DD"
    }
  ]
}
```

Use a useful landmark or station as `origin`. Choose the center so all places
fit at the requested zoom; neighborhood maps normally use zoom 15–16. Preserve
explicit uncertainty instead of inventing a price, travel time, or opening
hour.

Website, phone, hours, `google_maps_url`, rating and review fields are optional.
Prefer the venue's own site and OpenStreetMap contact tags for contact details.
Ratings and review counts are volatile: include them only when a named source
and checked date are available, never infer or copy an unattributed number.
Maps preserves an exact Google Maps place URL when supplied. Otherwise it
searches Google Maps using the venue name and address, falling back to
coordinates only when the record has neither.

## Public services

The bundled `maps_client.py` uses OpenStreetMap/Nominatim, Overpass, OSRM and
TimeAPI.io. It requires no API key. Public routing profiles can sometimes
return implausible walking durations; verify them independently or omit them.
The Maps UI itself fetches OpenStreetMap tiles through Möbius's authenticated
proxy and always shows attribution.
