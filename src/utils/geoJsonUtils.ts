// utils/geoJsonUtils.ts

import type { ListVisit } from '../components/map/interface/Map';

export function convertToGeoJson(data: ListVisit[]): leaflet.GeoJsonObject {
  const features = data.map((item) => ({
    type: 'Feature',
    properties: {
      id: item.id,
      name: item.name,
      email: item.email
    },
    geometry: {
      type: 'Point',
      coordinates: [parseFloat(item.longitude), parseFloat(item.latitude)]
    }
  }));

  return {
    type: 'FeatureCollection',
    features
  };
}
