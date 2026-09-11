// Colours, zoom levels and the land file. Everything tunable lives here.

export const PALETTE = {
  sea: "#D2E4DD",
  land: "#F4F1EA",
  landBorder: "#DCD6C9",
  markerColor: "#2E4347", // the marker body; the accent sits on top of it
  markerAccent: "#D2E4DD",
};

export const MAP = {
  // The world view frames these bounds rather than the whole globe: top of
  // Greenland down to below Cape Horn, so the inhabited world fills the window.
  // Antarctica is filtered out of the land layer to match.
  worldBounds: [
    [-58, -180],
    [83, 180],
  ],
  minZoom: 2,
  maxZoom: 10,
  focusZoom: 5, // where a marker click lands
  // Pins closer together than this, in screen pixels, collapse into one pin
  // with a headcount. Clustering is off from focusZoom upwards.
  clusterRadius: 48,
  // Flight timing, in seconds. Leaflet would otherwise pick a duration from
  // the distance, so the two directions would not feel matched. The zoom-out
  // gets longer so the big land surface is rescaled over more frames.
  // easeLinearity: lower is a softer start and stop, 1 is linear.
  flyIn: { duration: 1.4, easeLinearity: 0.2 },
  flyOut: { duration: 2.2, easeLinearity: 0.2 },
  // Swap to data/world-110m.geojson for a file a tenth the size with blockier
  // coastlines up close.
  land: "data/world-50m.geojson",
  // Width Drive is asked to resize panel images to. The panel is 400px wide,
  // so 800 covers a 2x display.
  imageWidth: 800,
  // How far past the window the land is drawn, in windows per side. The drawn
  // area survives log2(1 + 2 * padding) zoom levels of zoom-out before its
  // edges show, and the flight back to the world view is about three levels.
  renderPadding: 4,
};

export const MARKER = {
  color: PALETTE.markerColor,
  accentColor: PALETTE.markerAccent,
  scale: 1.2,
  shadow: "ellipse",
};
