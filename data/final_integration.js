// IDP Distribution by State Map Integration
// This script adds a choropleth map showing IDP distribution across Sudan states

// Function to initialize the IDP Distribution map
async function initIDPDistributionMap() {
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
          <div id="search-results" class="search-results"></div>
        </div>
        <div id="idp-distribution-map" style="width: 100%; height: 80vh; border-radius: 8px;"></div>
        <div id="map-loading" class="map-loading">Loading map data...</div>
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
        position: relative;
      }
      
      .search-container {
        margin-bottom: 15px;
        position: relative;
      }
      
      #state-search {
        width: 100%;
        padding: 10px;
        border: 1px solid #ddd;
        border-radius: 6px;
        font-size: 14px;
      }
      
      .search-results {
        position: absolute;
        top: 100%;
        left: 0;
        right: 0;
        background: white;
        border: 1px solid #ddd;
        border-top: none;
        border-radius: 0 0 6px 6px;
        max-height: 200px;
        overflow-y: auto;
        z-index: 1000;
        display: none;
      }
      
      .search-results div {
        padding: 8px 10px;
        cursor: pointer;
      }
      
      .search-results div:hover {
        background-color: #f5f5f5;
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
      
      .map-loading {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(255, 255, 255, 0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
        font-size: 16px;
        color: #333;
      }
    `;
    document.head.appendChild(style);
  }
  
  try {
    // Show loading state
    const loadingElement = document.getElementById('map-loading');
    if (loadingElement) loadingElement.style.display = 'flex';
    
    // Load GeoJSON data
    const response = await fetch('./data/ADMIN1.json');
    if (!response.ok) {
      throw new Error(`Failed to load GeoJSON data: ${response.status}`);
    }
    
    const sudanStatesData = await response.json();
    
    // Sample IDP data - in a real app, this would come from your data source
    const idpData = {
      "North Darfur": 1234567,
      "South Darfur": 2345678,
      "West Darfur": 876543,
      "East Darfur": 567890,
      "Central Darfur": 456789,
      "Khartoum": 3456789,
      "Al Jazirah": 789012,
      "White Nile": 678901,
      "Blue Nile": 345678,
      "Sennar": 234567,
      "Kassala": 123456,
      "Red Sea": 98765,
      "Northern": 87654,
      "River Nile": 76543,
      "North Kordofan": 654321,
      "South Kordofan": 543210,
      "West Kordofan": 432109,
      "Al Qadarif": 321098
    };
    
  // Merge IDP data with GeoJSON features
sudanStatesData.features.forEach(feature => {
  const stateName = feature.properties.admin1Name_en;
  console.log(`Processing state: ${stateName}`); // Debug logging
  
  if (stateName && idpData[stateName] !== undefined) {
    feature.properties.total_idps = idpData[stateName];
    feature.properties.state = stateName;
  } else {
    console.warn(`No IDP data found for state: ${stateName}`);
    feature.properties.total_idps = 0;
    feature.properties.state = stateName || 'Unknown';
  }
});
    
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
          (props.total_idps || 0).toLocaleString() + ' IDPs' : 
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
        fillColor: getColor(feature.properties.total_idps || 0),
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
    
    // Add GeoJSON layer
    let geojsonLayer = L.geoJSON(sudanStatesData, {
      style: style,
      onEachFeature: onEachFeature
    }).addTo(idpMap);
    
    // Fit map to bounds of all features
    idpMap.fitBounds(geojsonLayer.getBounds());
    
    // Add search functionality
    const searchInput = document.getElementById('state-search');
    const searchResults = document.getElementById('search-results');
    
    if (searchInput && searchResults) {
      let searchTimeout;
      
      searchInput.addEventListener('input', function(e) {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
          const searchText = e.target.value.toLowerCase().trim();
          
          if (searchText.length < 2) {
            searchResults.style.display = 'none';
            return;
          }
          
          const matches = sudanStatesData.features.filter(feature => {
            const stateName = feature.properties.state.toLowerCase();
            return stateName.includes(searchText);
          });
          
          if (matches.length > 0) {
            searchResults.innerHTML = matches.map(feature => 
              `<div data-state="${feature.properties.state}">${feature.properties.state}</div>`
            ).join('');
            searchResults.style.display = 'block';
          } else {
            searchResults.innerHTML = '<div>No matching states found</div>';
            searchResults.style.display = 'block';
          }
        }, 300);
      });
      
      // Handle click on search results
      searchResults.addEventListener('click', function(e) {
        if (e.target.tagName === 'DIV' && e.target.dataset.state) {
          const stateName = e.target.dataset.state;
          const feature = sudanStatesData.features.find(f => 
            f.properties.state === stateName
          );
          
          if (feature) {
            const layer = geojsonLayer.getLayers().find(l => 
              l.feature.properties.state === stateName
            );
            
            if (layer) {
              searchInput.value = stateName;
              searchResults.style.display = 'none';
              zoomToFeature({ target: layer });
              highlightFeature({ target: layer });
              
              // Reset highlight after 3 seconds
              setTimeout(() => {
                resetHighlight({ target: layer });
              }, 3000);
            }
          }
        }
      });
      
      // Close search results when clicking elsewhere
      document.addEventListener('click', function(e) {
        if (e.target !== searchInput && e.target !== searchResults) {
          searchResults.style.display = 'none';
        }
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
    
    // Hide loading state
    if (loadingElement) loadingElement.style.display = 'none';
    
    // Ensure map is properly sized
    setTimeout(function() {
      idpMap.invalidateSize();
    }, 1000);
    
    return idpMap;
    
  } catch (error) {
    console.error('Error initializing IDP map:', error);
    const errorElement = document.createElement('div');
    errorElement.className = 'map-error';
    errorElement.style.color = 'red';
    errorElement.style.padding = '20px';
    errorElement.textContent = 'Failed to load map data. Please try again later.';
    
    const mapContainer = document.getElementById('idp-distribution-map');
    if (mapContainer) {
      mapContainer.appendChild(errorElement);
    }
    
    const loadingElement = document.getElementById('map-loading');
    if (loadingElement) loadingElement.style.display = 'none';
    
    return null;
  }
}

// Call this function after the page loads
document.addEventListener('DOMContentLoaded', function() {
  // Wait for the loading spinner to disappear
  const loadingInterval = setInterval(function() {
    const loadingSpinner = document.getElementById('loading-spinner');
    if (!loadingSpinner || loadingSpinner.style.display === 'none') {
      clearInterval(loadingInterval);
      // Initialize the IDP Distribution map
      initIDPDistributionMap();
    }
  }, 500);
  
  // Fallback timeout in case loading spinner never disappears
  setTimeout(() => {
    clearInterval(loadingInterval);
    initIDPDistributionMap();
  }, 10000);
});
