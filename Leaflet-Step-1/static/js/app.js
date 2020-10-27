// Store our API endpoint inside queryUrl
var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/4.5_week.geojson";

// Perform a GET request to the query URL
d3.json(queryUrl).then(data => {
  console.log(data);
  // Once we get a response, send the data.features object to the createFeatures function
  createFeatures(data.features);
});

// Color function, determines color based on Z-coordinate of earthquake
function getColor(d) {
    if (d>60) {
        return '#FF0000'
    }
    else if (d>50) {
        return '#FF9700'
    }
    else if (d>30) {
        return '#FFF700'
    }
    else if (d>10) {
        return '#6CFF00'
    }
    else if (d>5) {
        return '#00FFAE'
    }
    else {
        return 'blue'
    }
}

// Instantiate features function to bind markers and popups to all data

function createFeatures(earthquakeData) {

  // Binding popups
  function onEachFeature(feature, layer) {
    layer.bindPopup("<h3>" + feature.properties.title + ': ' + feature.geometry.coordinates[2] +
      "km underground</h3><hr><p>" + new Date(feature.properties.time) + "</p>");
  }

  
  // Binding markers
  let earthquakes = L.geoJSON(earthquakeData, {
    onEachFeature: onEachFeature,
    pointToLayer: (feature, latlng) => {
      return new L.Circle(latlng, {
        radius: (feature.properties.mag**2)*10000,
        // Calling color grabbing function on each data point
        fillColor: getColor(feature.geometry.coordinates[2]),
        fillOpacity: .7,
        stroke: false 
      });
    }
  });

  // Sending our earthquakes layer to the createMap function
  createMap(earthquakes);
}

function createMap(earthquakes) {

// Specify maps to be selected in control

  // Darker map shows contrast well
  const darkmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "dark-v10",
    accessToken: API_KEY
  });

  // Satellite map shows landmarks well
  const lightmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "satellite-v9",
    accessToken: API_KEY
  });

  // Define a baseMaps object to hold our base layers
  const baseMaps = {
    "Dark Map": darkmap,
    "Light Map": lightmap
  };

  // Create overlay object to hold our overlay layer
  const overlayMaps = {
    Earthquakes: earthquakes
  };

  // Create our map, giving it the darkmap and earthquakes layers to display on load
  let myMap = L.map("map", {
    center: [
      0, 0
    ],
    zoom: 3,
    layers: [lightmap, earthquakes],
    // Stops markers from being left behind with infinite world scroll
    worldCopyJump: true
  });

  // Create a layer control
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);

    // Set up the legend
    var legend = L.control({ position: "bottomright" });
    legend.onAdd = function() {
      let div = L.DomUtil.create("div", "info legend");
      let grades = [0, 5, 10, 30, 50, 60];
      let colors = ['#FF0000', '#FF9700', '#FFF700', '#6CFF00', '#00FFAE', 'blue'].reverse();
  
      // Add min & max
      var legendInfo = '<h2>Earthquake Depth</h2>'
  
      div.innerHTML = legendInfo;
  
      for (var i = 0; i < grades.length; i++) {
        div.innerHTML +=
            '<i style="background:' + colors[i] + '"></i> ' +
            grades[i] + (grades[i + 1] ? '&ndash;' + (grades[i + 1]-1) + 'km<br>' : '+km');
    }

      return div;

      // Legend code adapted from Leaflet Choropleth example (https://leafletjs.com/examples/choropleth/)
    };
  
    // Adding legend to the map
    legend.addTo(myMap);
}