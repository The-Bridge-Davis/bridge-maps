# bridge-maps

World Map of Prayer Requests. Plain HTML, CSS and JavaScript on top of
[Leaflet](https://leafletjs.com/).

## Running it

The page uses ES modules, which browsers refuse to load over `file://`, so serve
the folder over HTTP:

```bash
python -m http.server 8000
```

Then open <http://localhost:8000>. Any static server works -- `npx serve .` is
the same thing. In production just upload the folder to any static host.

## Layout

| Path | What it is |
| --- | --- |
| `index.html` | Markup, plus the import map pointing Leaflet at unpkg |
| `css/styles.css` | All styling; palette and fonts in `:root` |
| `js/config.js` | API endpoint, colours, zoom levels, which land file to draw |
| `js/data.js` | Loads and validates profiles from the spreadsheet API |
| `js/app.js` | Map, markers, focus view, side panel |
| `data/world-*.geojson` | Land polygons |
| `fonts/` | Futura Book, plus the sanitised web build |
| `images/` | Local copies of the panel photos (optional; rows point at Drive) |

## How it works

**No tile layer.** The sea is the map container's background colour, which is
the only way to get an exact `#D2E4DD`, and the land is drawn on top as flat
GeoJSON polygons.

Two land files are committed, both cut down from
[Natural Earth](https://www.naturalearthdata.com/) admin-0 countries with the
attributes stripped and the coordinates rounded:

- `world-50m.geojson` (1.6 MB) -- the default; smooth coastlines at any zoom.
- `world-110m.geojson` (190 KB) -- a tenth of the size, visibly blocky up close.

Switch between them with `MAP.land` in `js/config.js`.

**The world view** fits `MAP.worldBounds` rather than the whole globe -- top of
Greenland down to below Cape Horn -- so the inhabited world fills the window.
Antarctica is filtered out of the land layer to match.

**A welcome card** sits top-centre on load -- the `#welcome` block in
`index.html`. Its close button hides it, and so does the first marker click,
since by then the intro has done its job. It comes back on every page load;
if you want it to stay dismissed, that is a `localStorage` flag around
`welcome.hidden` in `js/app.js`.

**Clicking a marker** calls `map.flyToBounds()` on a metre-wide box around the
marker with `maxZoom: MAP.focusZoom` and `paddingBottomRight: [panelWidth, 0]`.
The tiny box fits at any zoom so it lands on `maxZoom`, and the padding is
Leaflet's own way of reserving screen space -- the marker settles in the middle
of what the panel leaves free, with no manual pixel maths. Panning and the `+` /
`-` control work at all times except mid-flight: `fly()` switches dragging off
until `moveend` so a grab cannot pull an animation off course. The world button, the panel's arrow and Escape
all call `map.flyToBounds(WORLD_BOUNDS)` and close the panel. Both flights
take explicit `duration` / `easeLinearity` from `MAP.flyIn` and `MAP.flyOut`;
the zoom-out is the longer one so the big land surface is rescaled over more
frames.

**Keeping the land painted while zooming out.** Vector layers are drawn onto a
surface sized to the window plus a padding margin, and it is only rebuilt once
the map stops moving -- so a zoom that animates across several levels slides the
land off the edge of it and leaves blank sea around it. The fix is to draw far
past the edges up front: `L.svg({ padding: MAP.renderPadding })` with a padding
of `4` makes the surface 9x the window, which survives 3.17 levels of zoom-out.
The flight back from `focusZoom` is 3 levels, so nothing is redrawn mid-flight
and the animation runs uninterrupted. Redrawing on settle costs ~60 ms with the
50m file. If you zoom in past `focusZoom` by hand and then fly out, the last
part of that longer flight can show edges -- raise the padding if that matters.

## Markers

[Leaflet.ExtraMarkers](https://coryasilva.github.io/Leaflet.ExtraMarkers/) v2,
`ChipCircleBorder2`, accent `#D2E4DD`, scale `1.2`, ellipse shadow. It is
ESM-only, which is why `index.html` carries an import map. Single pins share
one `Icon` instance; clusters get their own with the headcount as `contentHtml`.

Each pin carries a permanent tooltip -- the person's name, or "N people" for a
cluster -- so it floats above the pin in every view.

## Clustering

Pins closer together on screen than `MAP.clusterRadius` (48px) collapse into
one pin with a headcount. It is a few lines in `js/app.js` rather than a plugin:
`groupMarkers()` projects every marker to pixels at the current zoom and
greedily groups anything within the radius of a group's first member.
`drawPins()` runs on `zoomend` and rebuilds the pin layer, but only when the
grouping actually changed, so ordinary zooms do not flicker the labels.

From `MAP.focusZoom` upwards clustering is off and every marker stands alone.
Clicking a cluster flies to fit its members (capped by `MAP.maxZoom`, 10), and
clicking a pin from there keeps the current zoom rather than dropping back to
`focusZoom`.

One thing to know: two pins that are very close -- Paris and Étiolles are 25km
apart -- are un-clustered at zoom 5 but still visually overlap there; they only
separate around zoom 9. The cluster click handles that, since it lands wherever
the members come apart.

## Fonts

Futura Book, with the serif kept for the panel's "Pray for" heading and the
placeholder initials.

The `.ttf` as supplied does not pass Chrome's OpenType Sanitizer -- it declares
an illegal `maxp.maxZones` and has a broken cmap subtable -- so the browser
rejects it and silently falls back. `Futura-Book-web.woff2` is the repaired
build, produced by round-tripping the original through fontTools, and that is
what `@font-face` points at.

It is a single 400-weight face, so no rule asks for bold and `font-synthesis` is
off; hierarchy comes from size, letter-spacing and colour.

## Data

Profiles load from the Apps Script endpoint configured in `js/config.js`. The
Google Sheet's `Profiles` tab uses this header row:

```text
id,name,location,lat,lng,photo_url,about,prayer_requests
```

`id`, `name`, `location`, `lat`, `lng`, `about`, and `prayer_requests`
are required.
Use a unique ID and city-level coordinates for each profile; there is no
geocoding step in the browser.

`photo_url` is optional and accepts a Google Drive share link or another
HTTP(S) image URL. Drive files must be shared as "anyone with the link". The
backend converts common Drive links to thumbnail URLs, and the frontend shows
the image as a centred square crop.

`about` contains the profile description. Put one request per line in
`prayer_requests`, optionally prefixed with `-`:

```text
- First request
- Second request
```

The panel displays Prayer requests first as a bullet list, followed by About.
