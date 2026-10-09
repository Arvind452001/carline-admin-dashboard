// Placeholder for a maps provider (Google Maps / Mapbox). Centralising this
// makes it easy to swap providers without touching every page that shows a map.
export const mapService = {
  getDirections: async () => {
    throw new Error('mapService.getDirections is not implemented yet')
  },
  geocode: async () => {
    throw new Error('mapService.geocode is not implemented yet')
  },
}
