export function mapCatalogMedia(value, media) {
  if (typeof value === "string") return media[value] || value
  if (Array.isArray(value)) return value.map(item => mapCatalogMedia(item, media))
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, mapCatalogMedia(item, media)]))
  }
  return value
}
