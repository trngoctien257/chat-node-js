var types = [
    // geometries
    'Point',
    'Polygon',
    'LineString',
    'MultiPoint',
    'MultiPolygon',
    'MultiLineString',
    'GeometryCollection',
    'Feature',
    'FeatureCollection']
    .reduce(function(memo, t) {
        memo[t] = true;
        return memo;
    }, {});

module.exports = function(obj) {
  if (!obj || typeof obj !== 'object') return false;
  if (!obj.type) return false;
  if (!types[obj.type]) return false;
  return true;
};
