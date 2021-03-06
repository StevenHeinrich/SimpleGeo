// Map object
var map = L.map('map',{
	scrollWheelZoom: false,
	zoomControl: false
}).setView([39.605046, -97.935209], 4);

// Basemap
L.tileLayer('https://{s}.tiles.mapbox.com/v3/{id}/{z}/{x}/{y}.png', {
	maxZoom: 18,
	attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
		'<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
		'Imagery © <a href="http://mapbox.com">Mapbox</a>',
	id: 'hoganmaps.ikkpodh4'
}).addTo(map);

// Get Data
$.ajax({
    method: "GET",
    url: "http://api.census.gov/data/2010/sf1?key=730e49d850365e415931ee4f3a309ffea517b92d&get=P0010001&for=state"
})
.done(function(censusData) {
    censusData = mapCensusResults(censusData);
    // console.log(censusData);
    $.getJSON('/data/us_states_simplified_high.geojson', function(censusGeometry) {
        geoJSON = joinJSON2GeoJSON(censusGeometry, censusData, 'GEOID');

        L.geoJson(geoJSON, {
            style: getStyle,
            onEachFeature: function(feature, layer) {
                layer.bindPopup(buildPopUpContent(feature.properties));
            }
        }).addTo(map);
    });
});

// Helper Functions
function getStyle(feature) {
    console.log(feature);
    if (feature.properties.P0010001 <1000000) {
        return {
            weight: 1,
            opacity: 1,
            color: 'white',
            dashArray: '3',
            fillOpacity: 0.8,
            fillColor: '#edf8fb'
        };
    } else  if(feature.properties.P0010001 <5000000) {
        return {
            weight: 1,
            opacity: 1,
            color: 'white',
            dashArray: '3',
            fillOpacity: 0.8,
            fillColor: '#b2e2e2'
        };
    } else  if(feature.properties.P0010001 <10000000) {
        return {
            weight: 1,
            opacity: 1,
            color: 'white',
            dashArray: '3',
            fillOpacity: 0.8,
            fillColor: '#66c2a4'
        };
    } else  if(feature.properties.P0010001 <15000000) {
        return {
            weight: 1,
            opacity: 1,
            color: 'white',
            dashArray: '3',
            fillOpacity: 0.8,
            fillColor: '#2ca25f'
        };
    } else {
        return {
            weight: 1,
            opacity: 1,
            color: 'white',
            dashArray: '3',
            fillOpacity: 0.8,
            fillColor: '#006d2c'
        };
    }
}

function buildPopUpContent(properties) {
    var content = '';
    $.each(properties, function(index, value) {
        content += index + ': ' + value + '<br/>';
    });
    return content;
}

function joinJSON2GeoJSON(geoJSON, json, joinKey) {
    var joinOptions = {},
        target = {};

    _.forEach(geoJSON.features, function(primary) {
        // Set key from variable by using object literal
        joinOptions[joinKey] = primary.properties[joinKey]
        // Find macthing object
        target = _.find(json, joinOptions);
        // Join common objects
        primary.properties = _.assign(primary.properties, target);
    });

    return geoJSON;
}

function mapCensusResults(data) {
    var formattedData = [];
    fields = data.shift();
    for(var d in data) {
        var rawRecord = data[d];
        var cleanRecord = {};
        for(var f in fields) {
            field = fields[f];
            if(field === 'state') {
                field = 'GEOID';
            }
            cleanRecord[field] = rawRecord[f];
        }
        formattedData.push(cleanRecord);
    }
    return formattedData;
}

function modifyKey(inputObject, oldKey, newKey) {
    var newObject = {};
    _.each(inputObject, function(value, key) {
        if(key === oldKey) {
            key = newKey
        }
        newObject[key] = value;
    });
    return newObject;
}