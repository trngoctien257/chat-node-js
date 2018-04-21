var test = require('tape'),
    isGeoJSON = require('./');

test('is-geojson', function(t) {
    t.equal(isGeoJSON(0), false);
    t.equal(isGeoJSON({}), false);
    t.equal(isGeoJSON({'type':'no'}), false);
    t.equal(isGeoJSON({type:'Point',coordinates:[0,0]}), true);
    t.end();
});
