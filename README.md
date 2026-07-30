# Maps

Maps is the home for maps created in Möbius conversations.

Each map is stored as an independent record, includes an interactive set of
places, and retains the originating chat so the reasoning and recommendations
remain one tap away. The app ships an agent skill and helper scripts for
geocoding places and adding future maps safely.

A saved map can be shared from its detail header. Sharing publishes a
read-only, interactive snapshot with the same pins and place details. Its
in-app sharing sheet keeps a stable public link and offers Copy, Open, Update,
and Stop sharing without depending on a device share sheet.

Every publication also includes a map-specific 1200×630 PNG and complete Open
Graph/X metadata. The same generated card is shown before sharing, so the owner
can see what a pasted link will look like. Current Möbius releases add the
absolute link metadata while making the public snapshot, so creating and
updating a link both require one publication. Maps retains a small fallback
for older self-hosted releases that do not yet provide that platform service.

## One renderer

The in-app detail view and published page both instantiate the same
`<mobius-map-viewer>` Web Component from `map-viewer-0.2.0.js`. The
private view supplies authenticated tile loading and private navigation
actions; the public view supplies direct public tiles and omits those private
actions. Layout, markers, place details, responsive behavior, and map
interaction otherwise come from the same implementation.

Leaflet 1.9.4 is vendored under `vendor/` so a published map has no
runtime JavaScript or stylesheet dependency beyond its map tiles. See
`LEAFLET-LICENSE.txt` for its BSD 2-Clause license.
