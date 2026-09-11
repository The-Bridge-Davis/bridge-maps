import * as L from "leaflet";
import { ChipCircleBorder2, Icon as ExtraIcon } from "leaflet-extra-markers";

import { MAP, MARKER, PALETTE } from "./config.js";
import { MARKERS } from "./data.js";

const panel = document.getElementById("panel");
const panelHeadline = document.getElementById("panel-headline");
const panelPhoto = document.getElementById("panel-photo");
const panelDescription = document.getElementById("panel-description");
const closeButton = document.getElementById("panel-close");
const worldButton = document.getElementById("world-view-btn");
const welcome = document.getElementById("welcome");
const welcomeClose = document.getElementById("welcome-close");

const WORLD_BOUNDS = L.latLngBounds(MAP.worldBounds);

/* ------------------------------------------------------------------- map --- */

const map = L.map("map", {
  minZoom: MAP.minZoom,
  maxZoom: MAP.maxZoom,
  attributionControl: false,
});

map.fitBounds(WORLD_BOUNDS);

L.control
  .attribution({ prefix: false })
  .addAttribution(
    'Coastlines <a href="https://www.naturalearthdata.com/">Natural Earth</a>',
  )
  .addTo(map);

// There is no tile layer. The sea is the map's background colour and the land
// is drawn on top as flat polygons, which is the only way to get an exact sea.
fetch(MAP.land)
  .then((response) => response.json())
  .then((land) => {
    L.geoJSON(land, {
      interactive: false,
      filter: (feature) => feature.properties.name !== "Antarctica",
      // Leaflet draws the land onto a surface sized to the window plus this
      // padding, and only redraws it once the map settles. Drawing far past
      // the edges up front means a long animated zoom-out never runs off it.
      renderer: L.svg({ padding: MAP.renderPadding }),
      style: {
        fillColor: PALETTE.land,
        fillOpacity: 1,
        color: PALETTE.landBorder,
        weight: 0.75,
      },
    }).addTo(map);
  })
  .catch((error) => console.error("Could not load the land layer", error));

/* --------------------------------------------------------------- markers --- */

const iconOptions = {
  svg: ChipCircleBorder2,
  color: MARKER.color,
  accentColor: MARKER.accentColor,
  contentColor: MARKER.accentColor,
  scale: MARKER.scale,
  shadow: MARKER.shadow,
};

const pinIcon = new ExtraIcon(iconOptions);

const labelOptions = {
  permanent: true, // the name floats above the pin in every view
  direction: "top",
  offset: [0, -6],
  className: "marker-label",
};

// Pins are redrawn after every zoom. Below focusZoom, markers whose pins would
// overlap collapse into one pin carrying a headcount; from focusZoom upwards
// every marker stands on its own so you can pan between them.
const pins = L.layerGroup().addTo(map);

function groupMarkers(zoom) {
  if (zoom >= MAP.focusZoom) return MARKERS.map((entry) => [entry]);

  const groups = [];
  for (const entry of MARKERS) {
    const point = map.project([entry.lat, entry.lng], zoom);
    const near = groups.find(
      (group) => group.point.distanceTo(point) < MAP.clusterRadius,
    );
    if (near) near.members.push(entry);
    else groups.push({ point, members: [entry] });
  }
  return groups.map((group) => group.members);
}

// Only touched when the grouping actually changes, so ordinary zooms do not
// tear down and rebuild pins that would come back identical.
let drawnGroups = "";

function drawPins() {
  const groups = groupMarkers(map.getZoom());
  const signature = groups
    .map((members) => members.map((entry) => entry.id).join("+"))
    .join("|");
  if (signature === drawnGroups) return;
  drawnGroups = signature;

  pins.clearLayers();
  for (const members of groups) {
    if (members.length === 1) addPin(members[0]);
    else addCluster(members);
  }
}

function addPin(entry) {
  const marker = L.marker([entry.lat, entry.lng], {
    icon: pinIcon,
    riseOnHover: true,
  })
    .bindTooltip(escapeHtml(entry.name), labelOptions)
    .on("click", () => showPrayer(entry))
    .addTo(pins);

  // The icon is a <div>, so Leaflet's `alt` option has nothing to attach to.
  marker
    .getElement()
    ?.setAttribute("aria-label", `Prayer request from ${entry.name}`);
}

function addCluster(members) {
  const bounds = L.latLngBounds(members.map((entry) => [entry.lat, entry.lng]));

  L.marker(bounds.getCenter(), {
    icon: new ExtraIcon({ ...iconOptions, contentHtml: String(members.length) }),
    riseOnHover: true,
  })
    .bindTooltip(`${members.length} people`, labelOptions)
    // Zoom in far enough for the group to come apart.
    .on("click", () => fly(bounds, { ...MAP.flyIn, padding: [80, 80] }))
    .addTo(pins);
}

map.on("zoomend", drawPins);
drawPins();

/* ----------------------------------------------------- focus / world view --- */

let focused = null;

function showPrayer(entry) {
  focused = entry;
  welcome.hidden = true; // they have found the pins; the intro has done its job
  document.body.classList.add("is-focused");
  openPanel(entry);
  // flyToBounds is fitBounds with a smooth animation. A metre-wide box around
  // the marker fits at any zoom, so maxZoom is where it lands, and the padding
  // reserves the panel's width so the marker settles in the space beside it.
  fly(L.latLng(entry.lat, entry.lng).toBounds(1), {
    ...MAP.flyIn,
    maxZoom: Math.max(MAP.focusZoom, map.getZoom()),
    paddingBottomRight: [panelWidth(), 0],
  });
}

function showWorldView() {
  focused = null;
  document.body.classList.remove("is-focused");
  closePanel();
  fly(WORLD_BOUNDS, MAP.flyOut);
}

// flyToBounds with dragging switched off until the flight lands, so a grab
// part way through cannot pull the map off course.
function fly(bounds, options) {
  map.dragging.disable();
  map.once("moveend", () => map.dragging.enable());
  map.flyToBounds(bounds, options);
}

// How much of the right edge the panel covers. Zero on narrow screens, where
// it slides up from the bottom instead.
function panelWidth() {
  return window.innerWidth <= 720 ? 0 : panel.getBoundingClientRect().width;
}

/* ----------------------------------------------------------------- panel --- */

function openPanel(entry) {
  const place = [entry.city, entry.country].filter(Boolean).join(", ");

  panelHeadline.innerHTML = `
    <span class="headline__lead">Pray for</span>
    <span class="headline__subject">${escapeHtml(entry.name)}<span class="headline__in"> in </span>${escapeHtml(place)}</span>
  `;
  panelPhoto.innerHTML = entry.image
    ? `<img src="${imageUrl(entry.image)}" alt="${escapeHtml(entry.name)}" referrerpolicy="no-referrer" />`
    : `<div class="photo-placeholder" aria-hidden="true"><span>${escapeHtml(initials(entry.name))}</span></div>`;
  panelDescription.textContent = entry.description ?? entry.prayer ?? "";

  panel.classList.add("is-open");
  panel.inert = false;
}

function closePanel() {
  panel.classList.remove("is-open");
  panel.inert = true;
}

/* ---------------------------------------------------------------- wiring --- */

closeButton.addEventListener("click", showWorldView);
worldButton.addEventListener("click", showWorldView);
welcomeClose.addEventListener("click", () => {
  welcome.hidden = true;
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && focused) showWorldView();
});

/* ----------------------------------------------------------------- utils --- */

// A Google Drive share link points at Drive's viewer page, not the file, so an
// <img> cannot show it. Drive's thumbnail endpoint serves the actual image and
// resizes it on the way; the file has to be shared as "anyone with the link".
// Anything that is not a Drive link is passed through untouched.
function imageUrl(url) {
  const id = url.match(/drive\.google\.com\/(?:file\/d\/|.*[?&]id=)([\w-]+)/)?.[1];
  return id
    ? `https://drive.google.com/thumbnail?id=${id}&sz=w${MAP.imageWidth}`
    : url;
}

function initials(name) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function escapeHtml(value) {
  return String(value).replace(
    /[&<>"']/g,
    (char) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char],
  );
}
