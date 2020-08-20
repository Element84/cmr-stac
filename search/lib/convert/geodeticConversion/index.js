import { Coordinate } from './coordinate';
import { Arc } from './arc';

/**
 * Circular max
 * @param lng0 - the first longitude
 * @param lng1 - the second longitude
 * @returns max - the right most longitude of the shortest arc joining the given longitudes
 */
function circularMax (lng0, lng1) {
  const [left, right] = Array.from(lng0 < lng1 ? [lng0, lng1] : [lng1, lng0]);
  if ((right - left) < 180) {
    return right;
  }
  return left;
}

/**
 * Circular min
 * @param lng0 - the first longitude
 * @param lng1  - the second longitude
 * @returns min - the left most longitude of the shortest arc joining the given longitudes
 */
function circularMin (lng0, lng1) {
  if (circularMax(lng0, lng1) === lng1) {
    return lng0;
  }
  return lng1;
}

/**
 * Finds simple bounding box with inflection to account for geodesic mapping
 * @param points - an array of [lon, lat] coordinate pairs
 * @returns a bounding box in the form
 */
function inflectBox (points) {
  let minLat = 91;
  let maxLat = -91;
  let minLng = 181;
  let maxLng = -181;

  const coords = (points.map((point) => Coordinate.fromLngLat(point)));

  const len = coords.length;
  const latLngsWithInflections = [];
  coords.forEach((coord, i) => {
    latLngsWithInflections.push(coord.toLatLng());
    const next = coords[(i + 1) % len];
    const inflection = new Arc(coord, next).inflection();
    if (inflection) {
      const latLng = inflection.toLatLng();
      if (Math.abs(latLng.lat) !== 90) {
        // Has an inflection point, and it's not at the pole (which is handled
        // separately for MBRs)
        latLngsWithInflections.push(latLng);
      }
    }
  });

  const first = latLngsWithInflections[0];
  maxLat = first.lat;
  minLat = maxLat;
  maxLng = first.lng;
  minLng = maxLng;

  latLngsWithInflections.slice(1).forEach(({ lat, lng }) => {
    minLat = Math.min(minLat, lat);
    maxLat = Math.max(maxLat, lat);
    if (Math.abs(lat) !== 90) {
      minLng = circularMin(minLng, lng);
      maxLng = circularMax(maxLng, lng);
    } else {
      minLng = Math.min(minLng, lng);
      maxLng = Math.max(maxLng, lng);
    }
  });

  return [minLat, minLng, maxLat, maxLng];
}

module.exports = {
  inflectBox
};