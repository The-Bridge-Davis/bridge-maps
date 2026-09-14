import { API } from "./config.js";

export async function loadProfiles() {
  const url = new URL(API.url);
  url.searchParams.set("table", API.table);

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`The profile service returned HTTP ${response.status}.`);
  }

  const payload = await response.json();
  if (!payload.ok) {
    throw new Error(payload.error || "The profile service returned an error.");
  }
  if (!Array.isArray(payload.data)) {
    throw new Error("The profile service returned an invalid response.");
  }

  return payload.data.map(normalizeProfile);
}

function normalizeProfile(row, index) {
  const profileNumber = index + 1;
  const id = normalizeText(row.id);
  const name = normalizeText(row.name);
  const location = normalizeText(row.location);
  const prayerWriteUp = normalizeText(row.prayer_write_up);
  const lat = Number(row.lat);
  const lng = Number(row.lng);

  const missing = [
    ["id", id],
    ["name", name],
    ["location", location],
    ["prayer_write_up", prayerWriteUp],
  ].find(([, value]) => !value);

  if (missing) {
    throw new Error(`Profile ${profileNumber} is missing ${missing[0]}.`);
  }
  if (!Number.isFinite(lat) || lat < -90 || lat > 90) {
    throw new Error(`Profile ${profileNumber} has an invalid latitude.`);
  }
  if (!Number.isFinite(lng) || lng < -180 || lng > 180) {
    throw new Error(`Profile ${profileNumber} has an invalid longitude.`);
  }

  return {
    id,
    name,
    location,
    lat,
    lng,
    image: normalizeText(row.photo_url),
    prayerWriteUp,
  };
}

function normalizeText(value) {
  if (value === null || typeof value === "undefined") return null;
  const text = String(value).trim();
  return text || null;
}
