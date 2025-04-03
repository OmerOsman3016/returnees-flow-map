// IDP Distribution by State Map Integration
// This script adds a choropleth map showing IDP distribution across Sudan states

// Function to initialize the IDP Distribution map
function initIDPDistributionMap() {
  console.log("Initializing IDP Distribution Map");
  
  // Create a new map container in the HTML
  if (!document.getElementById('idp-distribution-map-container')) {
    const mapContainer = document.createElement('div');
    mapContainer.id = 'idp-distribution-map-container';
    mapContainer.className = 'maps-container';
    mapContainer.style.opacity = '0';
    mapContainer.style.transform = 'translateY(20px)';
    mapContainer.style.animation = 'slideUp 0.8s ease-in-out forwards';
    mapContainer.style.animationDelay = '0.8s';
    
    mapContainer.innerHTML = `
      <div id="idp-distribution-map-wrapper">
        <h2>IDP Distribution by State</h2>
        <div class="search-container">
          <input type="text" id="state-search" placeholder="Search for a state..." />
        </div>
        <div id="idp-distribution-map" style="width: 100%; height: 80vh; border-radius: 8px;"></div>
      </div>
    `;
    
    // Insert the map container after the IDPs section
    const idpsSection = document.getElementById('idps-section');
    if (idpsSection && idpsSection.nextSibling) {
      idpsSection.parentNode.insertBefore(mapContainer, idpsSection.nextSibling);
    } else {
      // Fallback: append to main container
      const mainContainer = document.querySelector('.main-container');
      if (mainContainer) {
        mainContainer.appendChild(mapContainer);
      }
    }
    
    // Add CSS for the new map container
    const style = document.createElement('style');
    style.textContent = `
      #idp-distribution-map-wrapper {
        flex: 1;
        background-color: #ffffff;
        border-radius: 12px;
        padding: 15px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
      }
      
      .search-container {
        margin-bottom: 15px;
      }
      
      #state-search {
        width: 100%;
        padding: 10px;
        border: 1px solid #ddd;
        border-radius: 6px;
        font-size: 14px;
      }
      
      .info {
        padding: 10px;
        background: white;
        border-radius: 5px;
        box-shadow: 0 0 15px rgba(0,0,0,0.2);
      }
      
      .info h4 {
        margin: 0 0 5px;
        color: #2A6FBB;
        font-size: 16px;
      }
      
      .idp-legend {
        background: white;
        padding: 15px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        line-height: 1.5;
      }
      
      .idp-legend i {
        width: 18px;
        height: 18px;
        float: left;
        margin-right: 8px;
        opacity: 0.7;
      }
      
      .idp-legend h4 {
        margin: 0 0 10px;
        color: #2A6FBB;
        font-size: 15px;
        font-weight: 600;
      }
    `;
    document.head.appendChild(style);
  }
  
  // Initialize the map
  const idpMap = L.map('idp-distribution-map').setView([16, 30], L.Browser.mobile ? 3 : 5.5);
  
  // Add the base layer
  const mapboxCustomIDPs = L.tileLayer('https://api.mapbox.com/styles/v1/omerosman/cm8oy6is4006101si7ll3bs4h/tiles/{z}/{x}/{y}?access_token=pk.eyJ1Ijoib21lcm9zbWFuIiwiYSI6ImUxZDBkODBlNjQxMDE2M2Y3OTQ3MWIwNTJkMjgzZTI3In0.ekCHuxRflTOO0RpQ6rQR7Q', {
    attribution: '© <a href="https://www.mapbox.com/about/maps/">Mapbox</a> © <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    tileSize: 512,
    zoomOffset: -1,
    maxZoom: 18
  }).addTo(idpMap);
  
  // Define multiple base layers for the map
  const cartoDBLightIDPs = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  });
  
  const openStreetMapIDPs = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  });
  
  const esriWorldImageryIDPs = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    attribution: '&copy; <a href="https://www.esri.com/">Esri</a>'
  });
  
  // Add layer control
  const baseLayersIDPs = {
    "Mapbox Custom": mapboxCustomIDPs,
    "CartoDB Light": cartoDBLightIDPs,
    "OpenStreetMap": openStreetMapIDPs,
    "Esri World Imagery": esriWorldImageryIDPs
  };
  
  L.control.layers(baseLayersIDPs).addTo(idpMap);
  
  // Add info control
  const info = L.control();
  
  info.onAdd = function(map) {
    this._div = L.DomUtil.create('div', 'info');
    this.update();
    return this._div;
  };
  
  info.update = function(props) {
    this._div.innerHTML = '<h4>Sudan IDP Distribution</h4>' + 
      (props ? 
        '<b>' + props.state + '</b><br />' + 
        props.total_idps.toLocaleString() + ' IDPs' : 
        'Hover over a state');
  };
  
  info.addTo(idpMap);
  
  // Define color function based on IDP count
  function getColor(d) {
    return d > 1000000 ? '#084594' :
           d > 500000  ? '#2171b5' :
           d > 200000  ? '#4292c6' :
           d > 100000  ? '#6baed6' :
           d > 50000   ? '#9ecae1' :
           d > 20000   ? '#c6dbef' :
                         '#eff3ff';
  }
  
  // Define style function
  function style(feature) {
    return {
      fillColor: getColor(feature.properties.total_idps),
      weight: 2,
      opacity: 1,
      color: 'white',
      dashArray: '3',
      fillOpacity: 0.7
    };
  }
  
  // Add hover interactions
  function highlightFeature(e) {
    const layer = e.target;
    
    layer.setStyle({
      weight: 5,
      color: '#666',
      dashArray: '',
      fillOpacity: 0.7
    });
    
    if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
      layer.bringToFront();
    }
    
    info.update(layer.feature.properties);
  }
  
  function resetHighlight(e) {
    geojsonLayer.resetStyle(e.target);
    info.update();
  }
  
  function zoomToFeature(e) {
    idpMap.fitBounds(e.target.getBounds());
  }
  
  function onEachFeature(feature, layer) {
    layer.on({
      mouseover: highlightFeature,
      mouseout: resetHighlight,
      click: zoomToFeature
    });
  }
  
  // Sudan states GeoJSON data with IDP counts
  const sudanStatesData = {
    "type": "FeatureCollection",
    "features": [
      {
        "type": "Feature",
        "properties": {
          "state": "North Darfur",
          "total_idps": 1234567,
          "id": "SD01"
        },
        "geometry": {
          "type": "Polygon",
          "coordinates": [[[24.5, 14.2], [26.8, 14.2], [26.8, 16.5], [24.5, 16.5], [24.5, 14.2]]]
        }
      },
      {
        "type": "Feature",
        "properties": {
          "state": "South Darfur",
          "total_idps": 2345678,
          "id": "SD02"
        },
        "geometry": {
          "type": "Polygon",
          "coordinates": [[[24.5, 11.9], [26.8, 11.9], [26.8, 14.2], [24.5, 14.2], [24.5, 11.9]]]
        }
      },
      {
        "type": "Feature",
        "properties": {
          "state": "West Darfur",
          "total_idps": 876543,
          "id": "SD03"
        },
        "geometry": {
          "type": "Polygon",
          "coordinates": [[[22.2, 12.5], [24.5, 12.5], [24.5, 14.8], [22.2, 14.8], [22.2, 12.5]]]
        }
      },
      {
        "type": "Feature",
        "properties": {
          "state": "East Darfur",
          "total_idps": 567890,
          "id": "SD04"
        },
        "geometry": {
          "type": "Polygon",
          "coordinates": [[[26.8, 11.9], [29.1, 11.9], [29.1, 14.2], [26.8, 14.2], [26.8, 11.9]]]
        }
      },
      {
        "type": "Feature",
        "properties": {
          "state": "Central Darfur",
          "total_idps": 456789,
          "id": "SD05"
        },
        "geometry": {
          "type": "Polygon",
          "coordinates": [[[22.2, 10.2], [24.5, 10.2], [24.5, 12.5], [22.2, 12.5], [22.2, 10.2]]]
        }
      },
      {
        "type": "Feature",
        "properties": {
          "state": "Khartoum",
          "total_idps": 3456789,
          "id": "SD06"
        },
        "geometry": {
          "type": "Polygon",
          "coordinates": [[[32.4, 15.5], [33.7, 15.5], [33.7, 16.8], [32.4, 16.8], [32.4, 15.5]]]
        }
      },
      {
        "type": "Feature",
        "properties": {
          "state": "Al Jazirah",
          "total_idps": 789012,
          "id": "SD07"
        },
        "geometry": {
          "type": "Polygon",
          "coordinates": [[[32.4, 13.8], [34.0, 13.8], [34.0, 15.5], [32.4, 15.5], [32.4, 13.8]]]
        }
      },
      {
        "type": "Feature",
        "properties": {
          "state": "White Nile",
          "total_idps": 678901,
          "id": "SD08"
        },
        "geometry": {
          "type": "Polygon",
          "coordinates": [[[31.5, 12.1], [33.1, 12.1], [33.1, 13.8], [31.5, 13.8], [31.5, 12.1]]]
        }
      },
      {
        "type": "Feature",
        "properties": {
          "state": "Blue Nile",
          "total_idps": 345678,
          "id": "SD09"
        },
        "geometry": {
          "type": "Polygon",
          "coordinates": [[[33.1, 10.4], [34.7, 10.4], [34.7, 12.1], [33.1, 12.1], [33.1, 10.4]]]
        }
      },
      {
        "type": "Feature",
        "properties": {
          "state": "Sennar",
          "total_idps": 234567,
          "id": "SD10"
        },
        "geometry": {
          "type": "Polygon",
          "coordinates": [[[33.1, 12.1], [34.7, 12.1], [34.7, 13.8], [33.1, 13.8], [33.1, 12.1]]]
        }
      },
      {
        "type": "Feature",
        "properties": {
          "state": "Kassala",
          "total_idps": 123456,
          "id": "SD11"
        },
        "geometry": {
          "type": "Polygon",
          "coordinates": [[[35.5, 14.5], [37.1, 14.5], [37.1, 16.2], [35.5, 16.2], [35.5, 14.5]]]
        }
      },
      {
        "type": "Feature",
        "properties": {
          "state": "Red Sea",
          "total_idps": 98765,
          "id": "SD12"
        },
        "geometry": {
          "type": "Polygon",
          "coordinates": [[[35.5, 16.2], [37.1, 16.2], [37.1, 17.9], [35.5, 17.9], [35.5, 16.2]]]
        }
      },
      {
        "type": "Feature",
        "properties": {
          "state": "Northern",
          "total_idps": 87654,
          "id": "SD13"
        },
        "geometry": {
          "type": "Polygon",
          "coordinates": [[[30.0, 18.0], [32.0, 18.0], [32.0, 20.0], [30.0, 20.0], [30.0, 18.0]]]
        }
      },
      {
        "type": "Feature",
        "properties": {
          "state": "River Nile",
          "total_idps": 76543,
          "id": "SD14"
        },
        "geometry": {
          "type": "Polygon",
          "coordinates": [[[32.0, 16.8], [34.0, 16.8], [34.0, 18.5], [32.0, 18.5], [32.0, 16.8]]]
        }
      },
      {
        "type": "Feature",
        "properties": {
          "state": "North Kordofan",
          "total_idps": 654321,
          "id": "SD15"
        },
        "geometry": {
          "type": "Polygon",
          "coordinates": [[[29.1, 12.5], [31.5, 12.5], [31.5, 14.8], [29.1, 14.8], [29.1, 12.5]]]
        }
      },
      {
        "type": "Feature",
        "properties": {
          "state": "South Kordofan",
          "total_idps": 543210,
          "id": "SD16"
        },
        "geometry": {
          "type": "Polygon",
          "coordinates": [[[29.1, 10.2], [31.5, 10.2], [31.5, 12.5], [29.1, 12.5], [29.1, 10.2]]]
        }
      },
      {
        "type": "Feature",
        "properties": {
          "state": "West Kordofan",
          "total_idps": 432109,
          "id": "SD17"
        },
        "geometry": {
          "type": "Polygon",
          "coordinates": [[[26.8, 10.2], [29.1, 10.2], [29.1, 12.5], [26.8, 12.5], [26.8, 10.2]]]
        }
      },
      {
        "type": "Feature",
        "properties": {
          "state": "Al Qadarif",
          "total_idps": 321098,
          "id": "SD18"
        },
        "geometry": {
          "type": "Polygon",
          "coordinates": [[[34.0, 13.8], [35.5, 13.8], [35.5, 15.5], [34.0, 15.5], [34.0, 13.8]]]
        }
      }
    ]
  };
  
  // Add GeoJSON layer
  let geojsonLayer = L.geoJSON(sudanStatesData, {
    style: style,
    onEachFeature: onEachFeature
  }).addTo(idpMap);
  
  // Add search functionality
  const searchInput = document.getElementById('state-search');
  if (searchInput) {
    searchInput.addEventListener('input', function(e) {
      const searchText = e.target.value.toLowerCase();
      
      sudanStatesData.features.forEach(feature => {
        const stateName = feature.properties.state.toLowerCase();
        const layer = geojsonLayer.getLayers().find(l => 
          l.feature.properties.state.toLowerCase() === stateName
        );
        
        if (stateName.includes(searchText)) {
          if (layer) {
            layer.setStyle({
              weight: 5,
              color: '#666',
              dashArray: '',
              fillOpacity: 0.9
            });
            if (searchText && searchText.length > 2) {
              idpMap.fitBounds(layer.getBounds());
            }
          }
        } else {
          if (layer) {
            geojsonLayer.resetStyle(layer);
          }
        }
      });
    });
  }
  
  // Add legend
  const legend = L.control({position: 'bottomright'});
  
  legend.onAdd = function(map) {
    const div = L.DomUtil.create('div', 'idp-legend');
    const grades = [0, 20000, 50000, 100000, 200000, 500000, 1000000];
    const labels = [];
    let from, to;
    
    div.innerHTML = '<h4>IDPs by State</h4>';
    
    for (let i = 0; i < grades.length; i++) {
      from = grades[i];
      to = grades[i + 1];
      
      labels.push(
        '<i style="background:' + getColor(from + 1) + '"></i> ' +
        from.toLocaleString() + (to ? '&ndash;' + to.toLocaleString() : '+')
      );
    }
    
    div.innerHTML += labels.join('<br>');
    return div;
  };
  
  legend.addTo(idpMap);
  
  // Ensure map is properly sized
  setTimeout(function() {
    idpMap.invalidateSize();
  }, 1000);
  
  return idpMap;
}

// Call this function after the page loads
document.addEventListener('DOMContentLoaded', function() {
  // Wait for the loading spinner to disappear
  const loadingInterval = setInterval(function() {
    if (document.getElementById('loading-spinner').style.display === 'none') {
      clearInterval(loadingInterval);
      // Initialize the IDP Distribution map
      initIDPDistributionMap();
    }
  }, 500);
});
