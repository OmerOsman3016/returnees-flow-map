// Function to initialize the Population Distribution map
async function initPopulationDistributionMap() {
  console.log("Initializing Population Distribution Map");
  
  // Create a new map container in the HTML
  if (!document.getElementById('population-distribution-map-container')) {
    const mapContainer = document.createElement('div');
    mapContainer.id = 'population-distribution-map-container';
    mapContainer.className = 'maps-container';
    mapContainer.style.opacity = '0';
    mapContainer.style.transform = 'translateY(20px)';
    mapContainer.style.animation = 'slideUp 0.8s ease-in-out forwards';
    mapContainer.style.animationDelay = '0.8s';
    
    mapContainer.innerHTML = `
      <div id="population-distribution-map-wrapper">
        <div class="map-header">
          <h2>Population Distribution by State</h2>
          <div class="population-toggle">
            <button class="toggle-btn active" data-type="idps">IDPs</button>
            <button class="toggle-btn" data-type="returnees">Returnees</button>
            <button class="toggle-btn" data-type="foreign_nationals">Foreign Nationals</button>
          </div>
        </div>
        <div id="population-distribution-map" style="width: 100%; height: 80vh; border-radius: 8px;"></div>
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
      #population-distribution-map-wrapper {
        flex: 1;
        background-color: #ffffff;
        border-radius: 12px;
        padding: 15px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
        position: relative;
      }
      
      .map-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 15px;
        flex-wrap: wrap;
        gap: 15px;
      }
      
      .population-toggle {
        display: flex;
        background: #f0f0f0;
        border-radius: 6px;
        overflow: hidden;
        flex-wrap: wrap;
      }
      
      .population-toggle .toggle-btn {
        border: none;
        padding: 8px 16px;
        background: transparent;
        cursor: pointer;
        font-size: 14px;
        font-weight: 500;
        color: #555;
        transition: all 0.3s ease;
        white-space: nowrap;
      }
    
      .population-toggle .toggle-btn.active {
        background: #2A6FBB;
        color: white;
      }
      
      .population-toggle .toggle-btn:first-child {
        border-radius: 6px 0 0 6px;
      }
      
      .population-toggle .toggle-btn:last-child {
        border-radius: 0 6px 6px 0;
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
      
      .population-legend {
        background: white;
        padding: 15px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        line-height: 1.5;
      }
      
      .population-legend i {
        width: 18px;
        height: 18px;
        float: left;
        margin-right: 8px;
        opacity: 0.7;
      }
      
      .population-legend h4 {
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
      
      @media (max-width: 768px) {
        .map-header {
          flex-direction: column;
          align-items: flex-start;
        }
        
        .population-toggle {
          width: 100%;
        }
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
    
    // Sample population data - in a real app, this would come from your data source
    const populationData = {
      "North Darfur": { 
        idps: 1234567, 
        returnees: 0,
        foreign_nationals: 0
      },
      "South Darfur": { 
        idps: 2345678, 
        returnees: 0,
        foreign_nationals: 0
      },
      "West Darfur": { 
        idps: 876543, 
        returnees:  8765,
        foreign_nationals: 0
      },
      "East Darfur": { 
        idps: 567890, 
        returnees: 0,
        foreign_nationals: 0
      },
      "Central Darfur": { 
        idps: 456789, 
        returnees:0,
        foreign_nationals: 0
      },
      "Khartoum": { 
        idps:  456789, 
        returnees:  6789,
        foreign_nationals:  7890
      },
      "Aj Jazirah": { 
        idps: 789012, 
        returnees: 889012,
        foreign_nationals: 7890
      },
      "White Nile": { 
        idps: 678901, 
        returnees: 78901,
        foreign_nationals: 8901
      },
      "Blue Nile": { 
        idps: 345678, 
        returnees: 0,
        foreign_nationals: 9012
      },
      "Sennar": { 
        idps: 234567, 
        returnees: 34567,
        foreign_nationals: 0
      },
      "Kassala": { 
        idps: 123456, 
        returnees: 23456,
        foreign_nationals: 2345
      },
      "Red Sea": { 
        idps: 98765, 
        returnees: 8765,
        foreign_nationals: 3456
      },
      "Northern": { 
        idps: 87654, 
        returnees: 7654,
        foreign_nationals: 0
      },
      "River Nile": { 
        idps: 76543, 
        returnees:  0,
        foreign_nationals:  678
      },
      "North Kordofan": { 
        idps: 654321, 
        returnees: 0,
        foreign_nationals: 0
      },
      "South Kordofan": { 
        idps: 543210, 
        returnees: 0,
        foreign_nationals: 0
      },
      "West Kordofan": { 
        idps: 432109, 
        returnees: 0,
        foreign_nationals: 0
      },
      "Gedaref": { 
        idps: 321098, 
        returnees: 0,
        foreign_nationals: 9012
      }
    };
    
    // Merge population data with GeoJSON features
    sudanStatesData.features.forEach(feature => {
      const stateName = feature.properties.admin1Name_en;
      console.log(`Processing state: ${stateName}`);
      
      if (stateName && populationData[stateName]) {
        feature.properties.total_idps = populationData[stateName].idps || 0;
        feature.properties.total_returnees = populationData[stateName].returnees || 0;
        feature.properties.total_foreign_nationals = populationData[stateName].foreign_nationals || 0;
        feature.properties.state = stateName;
      } else {
        console.warn(`No population data found for state: ${stateName}`);
        feature.properties.total_idps = 0;
        feature.properties.total_returnees = 0;
        feature.properties.total_foreign_nationals = 0;
        feature.properties.state = stateName || 'Unknown';
      }
    });
    
    // Initialize the map
    const populationMap = L.map('population-distribution-map').setView([16, 30], L.Browser.mobile ? 3 : 5.5);
    
    // Add the base layer
    const mapboxCustom = L.tileLayer('https://api.mapbox.com/styles/v1/omerosman/cm8oy6is4006101si7ll3bs4h/tiles/{z}/{x}/{y}?access_token=pk.eyJ1Ijoib21lcm9zbWFuIiwiYSI6ImUxZDBkODBlNjQxMDE2M2Y3OTQ3MWIwNTJkMjgzZTI3In0.ekCHuxRflTOO0RpQ6rQR7Q', {
      attribution: '© <a href="https://www.mapbox.com/about/maps/">Mapbox</a> © <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      tileSize: 512,
      zoomOffset: -1,
      maxZoom: 18
    }).addTo(populationMap);
    
    // Define multiple base layers for the map
    const cartoDBLight = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    });
    
    const openStreetMap = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    });
    
    const esriWorldImagery = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      attribution: '&copy; <a href="https://www.esri.com/">Esri</a>'
    });
    
    // Add layer control
    const baseLayers = {
      "Mapbox Custom": mapboxCustom,
      "CartoDB Light": cartoDBLight,
      "OpenStreetMap": openStreetMap,
      "Esri World Imagery": esriWorldImagery
    };
    
    L.control.layers(baseLayers).addTo(populationMap);
    
    // Current data type (IDPs, Returnees, or Foreign Nationals)
    let currentDataType = 'idps';
    
    // Define color functions based on population type
    function getColorForIDPs(d) {
      return d > 1000000 ? '#084594' :
             d > 500000  ? '#2171b5' :
             d > 200000  ? '#4292c6' :
             d > 100000  ? '#6baed6' :
             d > 50000   ? '#9ecae1' :
             d > 20000   ? '#c6dbef' :
                           '#eff3ff';
    }
    
    function getColorForReturnees(d) {
      // Use RGB(255, 137, 82) for returnees with different opacities
      return d > 1000000 ? 'rgba(255, 137, 82, 0.9)' :
             d > 500000  ? 'rgba(255, 137, 82, 0.8)' :
             d > 200000  ? 'rgba(255, 137, 82, 0.7)' :
             d > 100000  ? 'rgba(255, 137, 82, 0.6)' :
             d > 50000   ? 'rgba(255, 137, 82, 0.5)' :
             d > 20000   ? 'rgba(255, 137, 82, 0.4)' :
                           'rgba(255, 137, 82, 0.3)';
    }
    
    function getColorForForeignNationals(d) {
      // Use RGB(0, 196, 148) for foreign nationals with different opacities
      return d > 1000000 ? 'rgba(0, 196, 148, 0.9)' :
             d > 500000  ? 'rgba(0, 196, 148, 0.8)' :
             d > 200000  ? 'rgba(0, 196, 148, 0.7)' :
             d > 100000  ? 'rgba(0, 196, 148, 0.6)' :
             d > 50000   ? 'rgba(0, 196, 148, 0.5)' :
             d > 20000   ? 'rgba(0, 196, 148, 0.4)' :
                           'rgba(0, 196, 148, 0.3)';
    }
    
    // Main color function that selects the appropriate palette
    function getColor(d) {
      switch(currentDataType) {
        case 'idps':
          return getColorForIDPs(d);
        case 'returnees':
          return getColorForReturnees(d);
        case 'foreign_nationals':
          return getColorForForeignNationals(d);
        default:
          return getColorForIDPs(d);
      }
    }
    
    // Define style function
    function style(feature) {
      return {
        fillColor: getColor(feature.properties[`total_${currentDataType}`] || 0),
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
      populationMap.fitBounds(e.target.getBounds());
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
    }).addTo(populationMap);
    
    // Fit map to bounds of all features
    populationMap.fitBounds(geojsonLayer.getBounds());
    
    // Add info control
    const info = L.control();
    
    info.onAdd = function(map) {
      this._div = L.DomUtil.create('div', 'info');
      this.update();
      return this._div;
    };
    
    info.update = function(props) {
      let title, valueLabel;
      
      switch(currentDataType) {
        case 'idps':
          title = 'IDP Distribution';
          valueLabel = 'IDPs';
          break;
        case 'returnees':
          title = 'Returnee Distribution';
          valueLabel = 'Returnees';
          break;
        case 'foreign_nationals':
          title = 'Foreign Nationals Distribution';
          valueLabel = 'Foreign Nationals';
          break;
      }
      
      this._div.innerHTML = `<h4>Sudan ${title}</h4>` + 
        (props ? 
          `<b>${props.state}</b><br />` + 
          (props[`total_${currentDataType}`] || 0).toLocaleString() + 
          ` ${valueLabel}` : 
          'Hover over a state');
    };
    
    info.addTo(populationMap);
    
    // Function to update map display based on selected data type
    function updateMapDisplay(dataType) {
      currentDataType = dataType;
      
      // Update the legend
      if (legend) {
        legend.remove();
        legend.addTo(populationMap);
      }
      
      // Update the style and info display
      geojsonLayer.setStyle(feature => {
        const value = feature.properties[`total_${dataType}`] || 0;
        return {
          fillColor: getColor(value),
          weight: 2,
          opacity: 1,
          color: 'white',
          dashArray: '3',
          fillOpacity: 0.7
        };
      });
      
      // Update the info control function
      info.update = function(props) {
        let title, valueLabel;
        
        switch(dataType) {
          case 'idps':
            title = 'IDP Distribution';
            valueLabel = 'IDPs';
            break;
          case 'returnees':
            title = 'Returnee Distribution';
            valueLabel = 'Returnees';
            break;
          case 'foreign_nationals':
            title = 'Foreign Nationals Distribution';
            valueLabel = 'Foreign Nationals';
            break;
        }
        
        this._div.innerHTML = `<h4>Sudan ${title}</h4>` + 
          (props ? 
            `<b>${props.state}</b><br />` + 
            (props[`total_${dataType}`] || 0).toLocaleString() + 
            ` ${valueLabel}` : 
            'Hover over a state');
      };
      
      // Force update of info control
      info.update();
    }
    
    // Add legend
    const legend = L.control({position: 'bottomright'});
    
    legend.onAdd = function(map) {
      const div = L.DomUtil.create('div', 'population-legend');
      const grades = [0, 20000, 50000, 100000, 200000, 500000, 1000000];
      const labels = [];
      let from, to;
      
      let legendTitle;
      switch(currentDataType) {
        case 'idps':
          legendTitle = 'IDPs by State';
          break;
        case 'returnees':
          legendTitle = 'Returnees by State';
          break;
        case 'foreign_nationals':
          legendTitle = 'Foreign Nationals by State';
          break;
      }
      
      div.innerHTML = `<h4>${legendTitle}</h4>`;
      
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
    
    legend.addTo(populationMap);
    
    // Add event listeners for toggle buttons
    const toggleButtons = document.querySelectorAll('.toggle-btn');
    toggleButtons.forEach(button => {
      button.addEventListener('click', function() {
        // Update active state
        document.querySelectorAll('.toggle-btn').forEach(btn => {
          btn.classList.remove('active');
        });
        this.classList.add('active');
        
        // Update map display
        const dataType = this.dataset.type;
        updateMapDisplay(dataType);
      });
    });
    
    // Hide loading state
    if (loadingElement) loadingElement.style.display = 'none';
    
    // Ensure map is properly sized
    setTimeout(function() {
      populationMap.invalidateSize();
    }, 1000);
    
    return populationMap;
    
  } catch (error) {
    console.error('Error initializing population map:', error);
    const errorElement = document.createElement('div');
    errorElement.className = 'map-error';
    errorElement.style.color = 'red';
    errorElement.style.padding = '20px';
    errorElement.textContent = 'Failed to load map data. Please try again later.';
    
    const mapContainer = document.getElementById('population-distribution-map');
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
      // Initialize the Population Distribution map
      initPopulationDistributionMap();
    }
  }, 500);
  
  // Fallback timeout in case loading spinner never disappears
  setTimeout(() => {
    clearInterval(loadingInterval);
    initPopulationDistributionMap();
  }, 10000);
});
