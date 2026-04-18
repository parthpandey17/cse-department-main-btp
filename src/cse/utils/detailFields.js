const SKIP_VALUE = [undefined, null, "", false];

function toLabel(key) {
  return key
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export function firstNonEmpty(...values) {
  return values.find((value) => !SKIP_VALUE.includes(value));
}

export function getPrimitiveDetails(item, skipKeys = []) {
  if (!item) return [];

  return Object.entries(item)
    .filter(([key, value]) => !skipKeys.includes(key) && typeof value !== "object" && !SKIP_VALUE.includes(value))
    .map(([key, value]) => ({
      label: toLabel(key),
      value: String(value),
    }));
}
