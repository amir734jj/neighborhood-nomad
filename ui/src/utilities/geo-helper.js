import _ from "lodash";

const centeredPoint = {
  lat: 0,
  lng: 0,
};

/**
 * Calculates the geographic center point from an array of locations
 * @param {Array} locations - Array of location objects with position{lat,lng}
 * @returns {Object|null} Centered position {lat, lng} or null if no valid locations
 */
export function calculateGeographicCenter(locations) {
  // Validate input
  if (!_.isArray(locations)) {
    return centeredPoint;
  }

  // Filter out invalid locations
  const validLocations = locations.filter((loc) => {
    return (
      loc &&
      loc.position &&
      _.isNumber(loc.position.lat) &&
      _.isNumber(loc.position.lng)
    );
  });

  // Handle cases with no valid locations
  if (validLocations.length === 0) {
    return centeredPoint;
  }

  // If only one location, return it directly
  if (validLocations.length === 1) {
    return {
      lat: validLocations[0].position.lat,
      lng: validLocations[0].position.lng
    };
  }

  // Convert all points to cartesian coordinates
  const cartesianPoints = validLocations.map((loc) => {
    const latRad = loc.position.lat * (Math.PI / 180);
    const lngRad = loc.position.lng * (Math.PI / 180);
    return {
      x: Math.cos(latRad) * Math.cos(lngRad),
      y: Math.cos(latRad) * Math.sin(lngRad),
      z: Math.sin(latRad)
    };
  });

  // Calculate mean of all cartesian coordinates
  const meanX = _.meanBy(cartesianPoints, 'x');
  const meanY = _.meanBy(cartesianPoints, 'y');
  const meanZ = _.meanBy(cartesianPoints, 'z');

  // Convert mean point back to lat/lng
  const meanLngRad = Math.atan2(meanY, meanX);
  const meanHyp = Math.sqrt(meanX * meanX + meanY * meanY);
  const meanLatRad = Math.atan2(meanZ, meanHyp);

  return {
    lat: meanLatRad * (180 / Math.PI),
    lng: meanLngRad * (180 / Math.PI)
  };
}