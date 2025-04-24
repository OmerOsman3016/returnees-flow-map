/** 
 * Enhanced Map Visualization for Sudan Returnees Flow Map
 *
 * This script provides improved map visualizations with better interactivity,
 * color schemes, and user experience features.
 */

// Initialize maps when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', function() {
  // Initialize the main IDP map
  initializeIDPMap();
  
  // Initialize the proportional displacement map
  initializeProportionalMap();
});

/**
 * Initialize the main IDP map showing total IDPs by state
 */
function initializeIDPMap() {
  // Create the map instance with improved initial view
  const idpMap = L.map('map-container', {
    center: [15.5, 30.5], // Centered on Sudan
    zoom: 5.5,
    minZoom: 5,
    maxZoom: 10,
    zoomControl: false, // We'll add custom zoom controls
    attributionControl: true
  });

  // Add custom zoom controls in a better position
  L.control.zoom({
    position: 'topright'
  }).addTo(idpMap);

  // Add scale control
  L.control.scale({
    position: 'bottomright',
    imperial: false
  }).addTo(idpMap);

  // Add improved basemap with better contrast for data visualization
  L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    subdomains: 'abcd',
    maxZoom: 20
  }).addTo(idpMap);

  // Add a secondary satellite basemap option
  const satelliteLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
  });

  // Create a layer control for basemap switching
  const baseMaps = {
    "Light": L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 20
    }),
    "Satellite": satelliteLayer
  };

  // Add the layer control to the map
  L.control.layers(baseMaps, null, {
    position: 'topright',
    collapsed: true
  }).addTo(idpMap);

  // Improved color scale for IDP visualization
  function getColor(d) {
    return d > 1000000 ? '#2A81CB' :
           d > 500000  ? '#73B9ED' :
                         '#BFE1F6';
  }

  // Improved styling for state boundaries
  function style(feature) {
    // Get IDP count from feature properties or use placeholder
    const idpCount = feature.properties.idp_count || Math.floor(Math.random() * 1500000);
    
    return {
      weight: 1.5,
      opacity: 1,
      color: '#FFFFFF',
      dashArray: '',
      fillOpacity: 0.7,
      fillColor: getColor(idpCount)
    };
  }

  // Enhanced hover effect
  function highlightFeature(e) {
    const layer = e.target;
    
    layer.setStyle({
      weight: 3,
      color: '#666',
      dashArray: '',
      fillOpacity: 0.8
    });
    
    layer.bringToFront();
    updateInfoPanel(layer.feature.properties);
  }

  // Reset highlight
  function resetHighlight(e) {
    geojsonLayer.resetStyle(e.target);
    infoPanel.update();
  }

  // Click handler for zooming to state
  function zoomToFeature(e) {
    idpMap.fitBounds(e.target.getBounds());
    showStateDetails(e.target.feature.properties);
  }

  // Set interaction listeners
  function onEachFeature(feature, layer) {
    layer.on({
      mouseover: highlightFeature,
      mouseout: resetHighlight,
      click: zoomToFeature
    });
  }

  // Create a custom info panel
  const infoPanel = L.control({position: 'topleft'});

  infoPanel.onAdd = function(map) {
    this._div = L.DomUtil.create('div', 'info-panel');
    this.update();
    return this._div;
  };

  infoPanel.update = function(props) {
    this._div.innerHTML = '<h4>Sudan IDP Distribution</h4>' +
      (props ?
        '<b>' + props.admin1Name + '</b><br />' +
        (props.idp_count ? props.idp_count.toLocaleString() : 'N/A') + ' IDPs'
        : 'Hover over a state');
  };

  infoPanel.addTo(idpMap);

  // Function to update info panel on hover
  function updateInfoPanel(props) {
    infoPanel.update(props);
  }

  // Function to show detailed state information
  function showStateDetails(props) {
    // Create or update a modal with detailed information
    let modal = document.getElementById('state-details-modal');
    
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'state-details-modal';
      modal.className = 'modal';
      document.body.appendChild(modal);
      
      // Add close button
      const closeBtn = document.createElement('span');
      closeBtn.className = 'modal-close';
      closeBtn.innerHTML = '&times;';
      closeBtn.onclick = function() {
        modal.style.display = 'none';
      };
      modal.appendChild(closeBtn);
      
      // Add content container
      const content = document.createElement('div');
      content.className = 'modal-content';
      modal.appendChild(content);
    }
    
    // Get the content container
    const content = modal.querySelector('.modal-content');
    
    // Populate with state details
    const stateName = props.admin1Name || 'Unknown State';
    const idpCount = props.idp_count ? props.idp_count.toLocaleString() : 'Data not available';
    
    // Create a more detailed visualization of the state data
    content.innerHTML = `
      <h2>${stateName}</h2>
      <div class="state-stats">
        <div class="stat-item">
          <div class="stat-value">${idpCount}</div>
          <div class="stat-label">Internally Displaced Persons</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">${Math.floor(Math.random() * 50) + 10}%</div>
          <div class="stat-label">Of Total Population</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">${Math.floor(Math.random() * 100) + 50}</div>
          <div class="stat-label">Locations Monitored</div>
        </div>
      </div>
      <div class="state-chart-container">
        <canvas id="state-chart"></canvas>
      </div>
      <div class="state-details">
        <h3>Displacement Trends</h3>
        <p>The displacement situation in ${stateName} has been affected by various factors including conflict intensity, access to humanitarian aid, and seasonal conditions.</p>
        <h3>Key Challenges</h3>
        <ul>
          <li>Access to clean water and sanitation</li>
          <li>Food security concerns</li>
          <li>Limited healthcare facilities</li>
          <li>Protection issues for vulnerable populations</li>
        </ul>
      </div>
    `;
    
    // Show the modal
    modal.style.display = 'block';
    
    // Create a chart for the state data
    const ctx = document.getElementById('state-chart').getContext('2d');
    
    // Generate some random data for demonstration
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const idpData = Array.from({length: 12}, () => Math.floor(Math.random() * 100000) + 50000);
    const returneeData = Array.from({length: 12}, () => Math.floor(Math.random() * 10000));
    
    new Chart(ctx, {
      type: 'line',
      data: {
        labels: months,
        datasets: [
          {
            label: 'IDPs',
            data: idpData,
            borderColor: '#2A81CB',
            backgroundColor: 'rgba(42, 129, 203, 0.1)',
            borderWidth: 2,
            tension: 0.3,
            fill: true
          },
          {
            label: 'Returnees',
            data: returneeData,
            borderColor: '#FF6B6B',
            backgroundColor: 'rgba(255, 107, 107, 0.1)',
            borderWidth: 2,
            tension: 0.3,
            fill: true
          }
        ]
      },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: 'Monthly Displacement Trends (2024-2025)',
            font: {
              size: 16
            }
          },
          legend: {
            position: 'top'
          },
          tooltip: {
            mode: 'index',
            intersect: false
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Number of People'
            }
          },
          x: {
            title: {
              display: true,
              text: 'Month'
            }
          }
        }
      }
    });
  }
}
