/** 
 * Enhanced User Interaction for Sudan Returnees Flow Map
 *
 * This script provides improved user interaction features including:
 * - Smooth scrolling navigation
 * - Interactive data filtering
 * - Responsive controls
 * - Accessibility improvements
 * - User tour/guide functionality
 */

document.addEventListener('DOMContentLoaded', function() {
  // Initialize all interactive components
  initializeNavigation();
  initializeDataFilters();
  initializeUserTour();
  initializeAccessibility();
  initializeResponsiveControls();
});

/**
 * Initialize smooth scrolling navigation and active state tracking
 */
function initializeNavigation() {
  // Smooth scrolling for all internal links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      
      const targetId = this.getAttribute('href');
      const targetElement = document.querySelector(targetId);
      
      if (targetElement) {
        // Smooth scroll to target
        window.scrollTo({
          top: targetElement.offsetTop - 70, // Offset for fixed header
          behavior: 'smooth'
        });
        
        // Update active navigation link
        document.querySelectorAll('.nav-links a').forEach(link => {
          link.classList.remove('active');
        });
        this.classList.add('active');
        
        // Close mobile menu if open
        document.getElementById('nav-links').classList.remove('active');
        
        // Update URL hash without scrolling
        history.pushState(null, null, targetId);
      }
    });
  });
  
  // Track scroll position to update active navigation link
  window.addEventListener('scroll', function() {
    const scrollPosition = window.scrollY;
    
    // Get all sections with IDs
    const sections = document.querySelectorAll('section[id], div[id].card, div[id].section-header');
    
    // Find the current section in view
    sections.forEach(section => {
      const sectionTop = section.offsetTop - 100;
      const sectionHeight = section.offsetHeight;
      const sectionId = section.getAttribute('id');
      
      if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
        // Update active navigation link
        document.querySelectorAll('.nav-links a').forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('href') === '#' + sectionId) {
            link.classList.add('active');
          }
        });
      }
    });
  });
  
  // Mobile menu toggle
  const mobileMenuToggle = document.getElementById('mobile-menu');
  if (mobileMenuToggle) {
    mobileMenuToggle.addEventListener('click', function() {
      const navLinks = document.getElementById('nav-links');
      navLinks.classList.toggle('active');
      
      // Change icon based on menu state
      const icon = this.querySelector('i');
      if (navLinks.classList.contains('active')) {
        icon.classList.remove('fa-bars');
        icon.classList.add('fa-times');
      } else {
        icon.classList.remove('fa-times');
        icon.classList.add('fa-bars');
      }
    });
  }
  
  // Back to top button functionality
  const backToTopButton = document.getElementById('back-to-top');
  if (backToTopButton) {
    // Show/hide button based on scroll position
    window.addEventListener('scroll', function() {
      if (window.pageYOffset > 300) {
        backToTopButton.classList.add('visible');
      } else {
        backToTopButton.classList.remove('visible');
      }
    });
    
    // Scroll to top when clicked
    backToTopButton.addEventListener('click', function() {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }
}

/**
 * Initialize interactive data filters for the visualizations
 */
function initializeDataFilters() {
  // Create filter controls for the maps and charts
  createTimeRangeFilter();
  createCategoryFilter();
  createRegionFilter();
  createComparisonTools();
}

/**
 * Create time range filter for temporal data
 */
function createTimeRangeFilter() {
  // Create time range filter container
  const filterContainer = document.createElement('div');
  filterContainer.className = 'filter-container time-filter';
  filterContainer.innerHTML = `
    <h3>Time Period</h3>
    <div class="time-range-selector">
      <div class="range-labels">
        <span>Apr 2023</span>
        <span>Mar 2025</span>
      </div>
      <div class="dual-range-slider">
        <input type="range" id="time-range-min" min="0" max="23" value="0" class="range-slider">
        <input type="range" id="time-range-max" min="0" max="23" value="23" class="range-slider">
        <div class="slider-track"></div>
        <div class="slider-range"></div>
      </div>
      <div class="selected-range">
        <span id="selected-start-date">Apr 2023</span> - <span id="selected-end-date">Mar 2025</span>
      </div>
    </div>
  `;
  
  // Add filter to the page
  const filterSection = document.getElementById('data-filters');
  if (filterSection) {
    filterSection.appendChild(filterContainer);
    
    // Initialize dual range slider functionality
    initializeDualRangeSlider();
  }
}

/**
 * Initialize dual range slider for time filtering
 */
function initializeDualRangeSlider() {
  const minSlider = document.getElementById('time-range-min');
  const maxSlider = document.getElementById('time-range-max');
  const range = document.querySelector('.slider-range');
  const startDateDisplay = document.getElementById('selected-start-date');
  const endDateDisplay = document.getElementById('selected-end-date');
  
  // Define all months in the range
  const months = [
    'Apr 2023', 'May 2023', 'Jun 2023', 'Jul 2023', 'Aug 2023', 'Sep 2023',
    'Oct 2023', 'Nov 2023', 'Dec 2023', 'Jan 2024', 'Feb 2024', 'Mar 2024',
    'Apr 2024', 'May 2024', 'Jun 2024', 'Jul 2024', 'Aug 2024', 'Sep 2024',
    'Oct 2024', 'Nov 2024', 'Dec 2024', 'Jan 2025', 'Feb 2025', 'Mar 2025'
  ];
  
  // Update range display
  function updateRange() {
    const minVal = parseInt(minSlider.value);
    const maxVal = parseInt(maxSlider.value);
    
    // Ensure min doesn't exceed max
    if (minVal >= maxVal) {
      minSlider.value = maxVal - 1;
      return;
    }
    
    // Update range display
    const minPercent = (minVal / minSlider.max) * 100;
    const maxPercent = (maxVal / maxSlider.max) * 100;
    
    range.style.left = minPercent + '%';
    range.style.width = (maxPercent - minPercent) + '%';
    
    // Update date labels
    startDateDisplay.textContent = months[minVal];
    endDateDisplay.textContent = months[maxVal];
    
    // Trigger data update event
    triggerDataUpdate({
      startDate: months[minVal],
      endDate: months[maxVal],
      startIndex: minVal,
      endIndex: maxVal
    });
  }
  
  // Add event listeners
  minSlider.addEventListener('input', updateRange);
  maxSlider.addEventListener('input', updateRange);
  
  // Initialize
  updateRange();
}

/**
 * Create category filter for data types
 */
function createCategoryFilter() {
  // Create category filter container
  const filterContainer = document.createElement('div');
  filterContainer.className = 'filter-container category-filter';
  filterContainer.innerHTML = `
    <h3>Data Categories</h3>
    <div class="category-options">
      <label class="category-option">
        <input type="checkbox" value="idps" checked>
        <span class="checkmark"></span>
        <span class="label-text">IDPs</span>
      </label>
      <label class="category-option">
        <input type="checkbox" value="returnees" checked>
        <span class="checkmark"></span>
        <span class="label-text">Returnees</span>
      </label>
      <label class="category-option">
        <input type="checkbox" value="border_crossings" checked>
        <span class="checkmark"></span>
        <span class="label-text">Border Crossings</span>
      </label>
      <label class="category-option">
        <input type="checkbox" value="camps" checked>
        <span class="checkmark"></span>
        <span class="label-text">Camp Populations</span>
      </label>
    </div>
  `;
  
  // Add filter to the page
  const filterSection = document.getElementById('data-filters');
  if (filterSection) {
    filterSection.appendChild(filterContainer);
    
    // Add event listeners to checkboxes
    const checkboxes = filterContainer.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
      checkbox.addEventListener('change', function() {
        // Get all selected categories
        const selectedCategories = Array.from(checkboxes)
          .filter(cb => cb.checked)
          .map(cb => cb.value);
        
        // Trigger data update event
        triggerDataUpdate({
          categories: selectedCategories
        });
      });
    });
  }
}

/**
 * Create region filter for geographic areas
 */
function createRegionFilter() {
  // Create region filter container
  const filterContainer = document.createElement('div');
  filterContainer.className = 'filter-container region-filter';
  filterContainer.innerHTML = `
    <h3>Regions</h3>
    <div class="region-selector">
      <select id="region-select" class="region-dropdown">
        <option value="all">All Regions</option>
        <option value="darfur">Darfur States</option>
        <option value="khartoum">Khartoum</option>
        <option value="eastern">Eastern States</option>
        <option value="northern">Northern States</option>
        <option value="central">Central States</option>
      </select>
    </div>
  `;
  
  // Add filter to the page
  const filterSection = document.getElementById('data-filters');
  if (filterSection) {
    filterSection.appendChild(filterContainer);
    
    // Add event listener to dropdown
    const regionSelect = filterContainer.querySelector('#region-select');
    regionSelect.addEventListener('change', function() {
      // Trigger data update event
      triggerDataUpdate({
        region: this.value
      });
    });
  }
}

/**
 * Create comparison tools for data analysis
 */
function createComparisonTools() {
  // Create comparison tools container
  const toolsContainer = document.createElement('div');
  toolsContainer.className = 'filter-container comparison-tools';
  toolsContainer.innerHTML = `
    <h3>Comparison Tools</h3>
    <div class="comparison-selectors">
      <div class="comparison-selector">
        <label for="comparison-metric">Metric:</label>
        <select id="comparison-metric">
          <option value="absolute">Absolute Numbers</option>
          <option value="percentage">Percentage of Population</option>
          <option value="density">Population Density</option>
          <option value="change">Monthly Change</option>
        </select>
      </div>
      <div class="comparison-selector">
        <label for="comparison-view">View:</label>
        <select id="comparison-view">
          <option value="map">Map</option>
          <option value="chart">Chart</option>
          <option value="table">Table</option>
        </select>
      </div>
    </div>
  `;
  
  // Add tools to the page
  const filterSection = document.getElementById('data-filters');
  if (filterSection) {
    filterSection.appendChild(toolsContainer);
    
    // Add event listeners to selectors
    const metricSelect = toolsContainer.querySelector('#comparison-metric');
    const viewSelect = toolsContainer.querySelector('#comparison-view');
    
    metricSelect.addEventListener('change', function() {
      triggerDataUpdate({
        metric: this.value
      });
    });
    
    viewSelect.addEventListener('change', function() {
      triggerDataUpdate({
        view: this.value
      });
    });
  }
}

/**
 * Trigger data update event with filter parameters
 */
function triggerDataUpdate(params) {
  // Create custom event with filter parameters
  const event = new CustomEvent('dataUpdate', {
    detail: params
  });
  
  // Dispatch event for listeners
  document.dispatchEvent(event);
  
  // Update visualizations based on filters
  updateVisualizations(params);
}

/**
 * Update visualizations based on filter parameters
 */
function updateVisualizations(params) {
  // Update time-based chart if it exists
  updateTimeChart(params);
  
  // Update maps if they exist
  updateMaps(params);
  
  // Update data tables if they exist
  updateDataTables(params);
}

/**
 * Update time-based chart with new parameters
 */
function updateTimeChart(params) {
  // Get the chart container
  const chartContainer = document.getElementById('displacement-time-chart');
  if (!chartContainer) return;
  
  // Check if we have a chart instance
  let chart = window.displacementChart;
  
  // If no chart exists yet, create one
  if (!chart) {
    createDisplacementTimeChart();
    chart = window.displacementChart;
  }
  
  // Apply filters to chart
  if (chart) {
    // Filter by time range if specified
    if (params.startIndex !== undefined && params.endIndex !== undefined) {
      // Update chart data range
      chart.data.labels = chart.data.fullLabels.slice(params.startIndex, params.endIndex + 1);
      
      // Update datasets
      chart.data.datasets.forEach(dataset => {
        dataset.data = dataset.fullData.slice(params.startIndex, params.endIndex + 1);
      });
    }
    
    // Filter by categories if specified
    if (params.categories) {
      chart.data.datasets.forEach(dataset => {
        const category = dataset.category;
        dataset.hidden = !params.categories.includes(category);
      });
    }
    
    // Update chart
    chart.update();
  }
}

/**
 * Create the displacement time chart
 */
function createDisplacementTimeChart() {
  const chartContainer = document.getElementById('displacement-time-chart');
  if (!chartContainer) return;
  
  // Create canvas for chart if it doesn't exist
  let canvas = chartContainer.querySelector('canvas');
  if (!canvas) {
    canvas = document.createElement('canvas');
    chartContainer.appendChild(canvas);
  }
  
  // Get chart context
  const ctx = canvas.getContext('2d');
  
  // Define all months in the range
  const months = [
    'Apr 2023', 'May 2023', 'Jun 2023', 'Jul 2023', 'Aug 2023', 'Sep 2023',
    'Oct 2023', 'Nov 2023', 'Dec 2023', 'Jan 2024', 'Feb 2024', 'Mar 2024',
    'Apr 2024', 'May 2024', 'Jun 2024', 'Jul 2024', 'Aug 2024', 'Sep 2024',
    'Oct 2024', 'Nov 2024', 'Dec 2024', 'Jan 2025', 'Feb 2025', 'Mar 2025'
  ];
  
  // Generate sample data for demonstration
  // In a real application, this would come from an API or database
  const idpData = [
    3200000, 3450000, 3800000, 4100000, 4350000, 4600000,
    4900000, 5200000, 5500000, 5800000, 6100000, 6400000,
    6700000, 7000000, 7300000, 7600000, 7900000, 8200000,
    8500000, 8800000, 9100000, 9300000, 9350000, 9400000
  ];
  
  const returneeData = [
    50000, 75000, 100000, 150000, 200000, 250000,
    300000, 350000, 400000, 450000, 500000, 550000,
    600000, 650000, 700000, 750000, 800000, 850000,
    900000, 950000, 1000000, 1050000, 1150000, 1200000
  ];
  
  const borderCrossingData = [
    800000, 900000, 1000000, 1100000, 1200000, 1300000,
    1400000, 1500000, 1600000, 1700000, 1800000, 1900000,
    2000000, 2100000, 2200000, 2300000, 2400000, 2500000,
    2600000, 2650000, 2700000, 2750000, 2780000, 2800000
  ];
  
  // Create chart
  const chart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: months,
      fullLabels: months, // Store full labels for filtering
      datasets: [
        {
          label: 'IDPs',
          data: idpData,
          fullData: idpData, // Store full data for filtering
          category: 'idps',
          borderColor: '#2A81CB',
          backgroundColor: 'rgba(42, 129, 203, 0.1)',
          borderWidth: 2,
          tension: 0.3,
          fill: true
        },
        {
          label: 'Returnees',
          data: returneeData,
          fullData: returneeData, // Store full data for filtering
          category: 'returnees',
          borderColor: '#FF6B6B',
          backgroundColor: 'rgba(255, 107, 107, 0.1)',
          borderWidth: 2,
          tension: 0.3,
          fill: true
        },
        {
          label: 'Border Crossings',
          data: borderCrossingData,
          fullData: borderCrossingData, // Store full data for filtering
          category: 'border_crossings',
          borderColor: '#6BCB77',
          backgroundColor: 'rgba(107, 203, 119, 0.1)',
          borderWidth: 2,
          tension: 0.3,
          fill: true
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: {
          display: true,
          text: 'Displacement Trends Over Time',
          font: {
            size: 18,
            weight: 'bold'
          },
          padding: {
            top: 10,
            bottom: 30
          }
        },
        legend: {
          position: 'top',
          labels: {
            usePointStyle: true,
            padding: 20
          }
        },
        tooltip: {
          mode: 'index',
          intersect: false,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          titleFont: {
            size: 14
          },
          bodyFont: {
            size: 13
          },
          padding: 15,
          cornerRadius: 5,
          displayColors: true
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: 'Number of People',
            font: {
              size: 14,
              weight: 'bold'
            }
          },
          ticks: {
            callback: function(value) {
              if (value >= 1000000) {
                return (value / 1000000).toFixed(1) + 'M';
              } else if (value >= 1000) {
                return (value / 1000).toFixed(0) + 'K';
              }
              return value;
            }
          },
          grid: {
            color: 'rgba(0, 0, 0, 0.05)'
          }
        },
        x: {
          title: {
            display: true,
            text: 'Month',
            font: {
              size: 14,
              weight: 'bold'
            }
          },
          grid: {
            display: false
          }
        }
      },
      interaction: {
        mode: 'nearest',
        axis: 'x',
        intersect: false
      },
      elements: {
        point: {
          radius: 3,
          hoverRadius: 5
        }
      }
    }
  });
  
  // Store chart instance for later reference
  window.displacementChart = chart;
}

/**
 * Update maps with new parameters
 */
function updateMaps(params) {
  // Implementation would depend on the map library being used
  // This is a placeholder for the actual implementation
  console.log('Updating maps with params:', params);
}

/**
 * Update data tables with new parameters
 */
function updateDataTables(params) {
  // Implementation would depend on the table structure
  // This is a placeholder for the actual implementation
  console.log('Updating data tables with params:', params);
}

/**
 * Initialize user tour/guide functionality
 */
function initializeUserTour() {
  // Create tour button
  const tourButton = document.createElement('button');
  tourButton.id = 'start-tour';
  tourButton.className = 'tour-button';
  tourButton.innerHTML = '<i class="fas fa-question-circle"></i> Take a Tour';
  
  // Add to page
  const header = document.querySelector('header');
  if (header) {
    header.appendChild(tourButton);
  }
  
  // Add event listener
  tourButton.addEventListener('click', startTour);
}

/**
 * Start the user tour
 */
function startTour() {
  // Define tour steps
  const tourSteps = [
    {
      element: '#map-container',
      title: 'Interactive Map',
      content: 'This map shows the distribution of internally displaced persons across Sudan. Hover over states to see details and click for more information.',
      position: 'bottom'
    },
    {
      element: '.time-filter',
      title: 'Time Period Filter',
      content: 'Use this slider to adjust the time period for the data displayed on the map and charts.',
      position: 'top'
    },
    {
      element: '.category-filter',
      title: 'Data Categories',
      content: 'Toggle these options to show or hide different types of displacement data.',
      position: 'right'
    },
    {
      element: '.region-filter',
      title: 'Region Filter',
      content: 'Select a specific region to focus the visualization on that area.',
      position: 'left'
    },
    {
      element: '#displacement-time-chart',
      title: 'Displacement Trends Chart',
      content: 'This chart shows the trends of displacement and returns over time. Use the filters above to adjust what data is displayed.',
      position: 'top'
    }
  ];
  
  // Create tour overlay
  let currentStep = 0;
  const tourOverlay = document.createElement('div');
  tourOverlay.className = 'tour-overlay';
  document.body.appendChild(tourOverlay);
  
  // Create tour tooltip
  const tourTooltip = document.createElement('div');
  tourTooltip.className = 'tour-tooltip';
  document.body.appendChild(tourTooltip);
  
  // Show first step
  showTourStep(currentStep);
  
  // Function to show a tour step
  function showTourStep(stepIndex) {
    if (stepIndex >= tourSteps.length) {
      // End tour
      tourOverlay.remove();
      tourTooltip.remove();
      return;
    }
    
    const step = tourSteps[stepIndex];
    const targetElement = document.querySelector(step.element);
    
    if (!targetElement) {
      // Skip this step if element not found
      showTourStep(stepIndex + 1);
      return;
    }
    
    // Highlight target element
    const rect = targetElement.getBoundingClientRect();
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    
    // Scroll element into view if needed
    if (rect.top < 0 || rect.bottom > window.innerHeight) {
      targetElement.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
      
      // Wait for scroll to complete
      setTimeout(() => {
        positionTourElements(targetElement, step);
      }, 500);
    } else {
      positionTourElements(targetElement, step);
    }
  }
  
  // Position tour elements
  function positionTourElements(targetElement, step) {
    const rect = targetElement.getBoundingClientRect();
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    
    // Update overlay cutout
    tourOverlay.style.setProperty('--cutout-top', (rect.top + scrollTop) + 'px');
    tourOverlay.style.setProperty('--cutout-left', rect.left + 'px');
    tourOverlay.style.setProperty('--cutout-width', rect.width + 'px');
    tourOverlay.style.setProperty('--cutout-height', rect.height + 'px');
    
    // Position tooltip
    let tooltipTop, tooltipLeft;
    
    switch (step.position) {
      case 'top':
        tooltipTop = rect.top + scrollTop - tourTooltip.offsetHeight - 10;
        tooltipLeft = rect.left + (rect.width / 2) - (tourTooltip.offsetWidth / 2);
        break;
      case 'bottom':
        tooltipTop = rect.bottom + scrollTop + 10;
        tooltipLeft = rect.left + (rect.width / 2) - (tourTooltip.offsetWidth / 2);
        break;
      case 'left':
        tooltipTop = rect.top + scrollTop + (rect.height / 2) - (tourTooltip.offsetHeight / 2);
        tooltipLeft = rect.left - tourTooltip.offsetWidth - 10;
        break;
      case 'right':
        tooltipTop = rect.top + scrollTop + (rect.height / 2) - (tourTooltip.offsetHeight / 2);
        tooltipLeft = rect.right + 10;
        break;
      default:
        tooltipTop = rect.bottom + scrollTop + 10;
        tooltipLeft = rect.left + (rect.width / 2) - (tourTooltip.offsetWidth / 2);
    }
    
    // Ensure tooltip stays within viewport
    tooltipTop = Math.max(scrollTop + 10, Math.min(tooltipTop, scrollTop + window.innerHeight - tourTooltip.offsetHeight - 10));
    tooltipLeft = Math.max(10, Math.min(tooltipLeft, window.innerWidth - tourTooltip.offsetWidth - 10));
    
    tourTooltip.style.top = tooltipTop + 'px';
    tourTooltip.style.left = tooltipLeft + 'px';
    
    // Update tooltip content
    tourTooltip.innerHTML = `
      <div class="tour-tooltip-header">
        <h3>${step.title}</h3>
        <span class="tour-step">${currentStep + 1}/${tourSteps.length}</span>
      </div>
      <div class="tour-tooltip-content">
        <p>${step.content}</p>
      </div>
      <div class="tour-tooltip-footer">
        <button class="tour-btn" id="tour-prev" ${currentStep === 0 ? 'disabled' : ''}>Previous</button>
        <button class="tour-btn" id="tour-next">${currentStep === tourSteps.length - 1 ? 'Finish' : 'Next'}</button>
        <button class="tour-btn tour-btn-skip" id="tour-skip">Skip Tour</button>
      </div>
    `;
    
    // Add event listeners to buttons
    document.getElementById('tour-prev').addEventListener('click', () => {
      if (currentStep > 0) {
        currentStep--;
        showTourStep(currentStep);
      }
    });
    
    document.getElementById('tour-next').addEventListener('click', () => {
      currentStep++;
      showTourStep(currentStep);
    });
    
    document.getElementById('tour-skip').addEventListener('click', () => {
      tourOverlay.remove();
      tourTooltip.remove();
    });
  }
}

/**
 * Initialize accessibility improvements
 */
function initializeAccessibility() {
  // Add accessibility controls
  const accessibilityControls = document.createElement('div');
  accessibilityControls.className = 'accessibility-controls';
  accessibilityControls.innerHTML = `
    <button id="text-size-increase" aria-label="Increase text size">A+</button>
    <button id="text-size-decrease" aria-label="Decrease text size">A-</button>
    <button id="high-contrast" aria-label="Toggle high contrast">Contrast</button>
  `;
  
  // Add to page
  const header = document.querySelector('header');
  if (header) {
    header.appendChild(accessibilityControls);
  }
  
  // Text size adjustment
  let currentTextSize = 100;
  document.getElementById('text-size-increase').addEventListener('click', () => {
    if (currentTextSize < 150) {
      currentTextSize += 10;
      document.body.style.fontSize = currentTextSize + '%';
    }
  });
  
  document.getElementById('text-size-decrease').addEventListener('click', () => {
    if (currentTextSize > 80) {
      currentTextSize -= 10;
      document.body.style.fontSize = currentTextSize + '%';
    }
  });
  
  // High contrast toggle
  let highContrastMode = false;
  document.getElementById('high-contrast').addEventListener('click', () => {
    highContrastMode = !highContrastMode;
    
    if (highContrastMode) {
      document.body.classList.add('high-contrast');
    } else {
      document.body.classList.remove('high-contrast');
    }
  });
  
  // Add keyboard navigation support
  document.addEventListener('keydown', function(e) {
    // Tab index navigation
    if (e.key === 'Tab') {
      document.body.classList.add('keyboard-navigation');
    }
    
    // Escape key to close modals
    if (e.key === 'Escape') {
      const modals = document.querySelectorAll('.modal');
      modals.forEach(modal => {
        modal.style.display = 'none';
      });
    }
  });
  
  // Mouse detection to disable focus outlines for mouse users
  document.addEventListener('mousedown', function() {
    document.body.classList.remove('keyboard-navigation');
  });
}

/**
 * Initialize responsive controls and styles
 */
function initializeResponsiveControls() {
  // Add responsive styles
  const style = document.createElement('style');
  style.textContent = `
    /* Base responsive styles */
    .filter-container {
      margin-bottom: 20px;
    }
    
    .time-range-selector {
      width: 100%;
      max-width: 600px;
      margin: 0 auto;
    }
    
    .dual-range-slider {
      position: relative;
      height: 30px;
      margin: 10px 0;
    }
    
    .range-slider {
      position: absolute;
      width: 100%;
      height: 5px;
      background: none;
      pointer-events: none;
      -webkit-appearance: none;
    }
    
    .range-slider::-webkit-slider-thumb {
      height: 20px;
      width: 20px;
      border-radius: 50%;
      background: #2A81CB;
      cursor: pointer;
      pointer-events: auto;
      -webkit-appearance: none;
    }
    
    .slider-track {
      position: absolute;
      width: 100%;
      height: 5px;
      background: #ddd;
      top: 50%;
      transform: translateY(-50%);
      border-radius: 3px;
    }
    
    .slider-range {
      position: absolute;
      height: 5px;
      background: #2A81CB;
      top: 50%;
      transform: translateY(-50%);
    }
    
    .category-options {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
    }
    
    .category-option {
      position: relative;
      padding-left: 30px;
      cursor: pointer;
      user-select: none;
    }
    
    .category-option input {
      position: absolute;
      opacity: 0;
      cursor: pointer;
      height: 0;
      width: 0;
    }
    
    .checkmark {
      position: absolute;
      top: 0;
      left: 0;
      height: 20px;
      width: 20px;
      background-color: #eee;
      border-radius: 4px;
    }
    
    .category-option:hover .checkmark {
      background-color: #ccc;
    }
    
    .category-option input:checked ~ .checkmark {
      background-color: #2A81CB;
    }
    
    .checkmark:after {
      content: "";
      position: absolute;
      display: none;
    }
    
    .category-option input:checked ~ .checkmark:after {
      display: block;
    }
    
    .category-option .checkmark:after {
      left: 7px;
      top: 3px;
      width: 5px;
      height: 10px;
      border: solid white;
      border-width: 0 2px 2px 0;
      transform: rotate(45deg);
    }
    
    .comparison-selectors {
      display: flex;
      flex-wrap: wrap;
      gap: 15px;
    }
    
    .comparison-selector {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    
    .comparison-selector select {
      padding: 8px;
      border-radius: 4px;
      border: 1px solid #ddd;
    }
    
    .tour-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.7);
      z-index: 9998;
      pointer-events: none;
      mask-image: linear-gradient(#000 0 0), linear-gradient(#000 0 0);
      mask-position: 0 0, var(--cutout-left) var(--cutout-top);
      mask-size: 100% 100%, var(--cutout-width) var(--cutout-height);
      mask-composite: exclude;
      -webkit-mask-composite: source-out;
    }
    
    .tour-tooltip {
      position: absolute;
      z-index: 9999;
      background-color: white;
      border-radius: 5px;
      box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
      padding: 15px;
      width: 300px;
    }
    
    .tour-tooltip-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 10px;
    }
    
    .tour-tooltip-header h3 {
      margin: 0;
      font-size: 18px;
    }
    
    .tour-step {
      font-size: 14px;
      color: #666;
    }
    
    .tour-tooltip-content {
      margin-bottom: 15px;
    }
    
    .tour-tooltip-footer {
      display: flex;
      justify-content: space-between;
    }
    
    .tour-btn {
      padding: 8px 12px;
      border: none;
      border-radius: 4px;
      background-color: #2A81CB;
      color: white;
      cursor: pointer;
    }
    
    .tour-btn:disabled {
      background-color: #ccc;
      cursor: not-allowed;
    }
    
    .tour-btn-skip {
      background-color: transparent;
      color: #666;
    }
    
    .accessibility-controls {
      display: flex;
      gap: 10px;
      margin-left: auto;
    }
    
    .accessibility-controls button {
      padding: 5px 10px;
      background-color: #f5f5f5;
      border: 1px solid #ddd;
      border-radius: 4px;
      cursor: pointer;
    }
    
    .keyboard-navigation *:focus {
      outline: 3px solid #2A81CB !important;
      outline-offset: 2px !important;
    }
    
    .high-contrast {
      background-color: black !important;
      color: white !important;
    }
    
    .high-contrast a, .high-contrast button {
      color: yellow !important;
    }
    
    .high-contrast .chart-container {
      background-color: white !important;
    }
    
    .arrow-left:before {
      content: '';
      position: absolute;
      left: -10px;
      top: 50%;
      margin-top: -10px;
      border-width: 10px 10px 10px 0;
      border-style: solid;
      border-color: transparent white transparent transparent;
    }
    
    .arrow-right:before {
      content: '';
      position: absolute;
      right: -10px;
      top: 50%;
      margin-top: -10px;
      border-width: 10px 0 10px 10px;
      border-style: solid;
      border-color: transparent transparent transparent white;
    }
    
    /* Responsive adjustments */
    @media (max-width: 768px) {
      #data-filters {
        grid-template-columns: 1fr;
      }
      
      .comparison-selectors {
        grid-template-columns: 1fr;
        gap: 15px;
      }
      
      .tour-tooltip {
        width: 250px;
      }
      
      .accessibility-controls {
        flex-direction: column;
        align-items: flex-start;
      }
    }
  `;
  
  document.head.appendChild(style);
  
  // Create data filters container if it doesn't exist
  if (!document.getElementById('data-filters')) {
    const dataFilters = document.createElement('div');
    dataFilters.id = 'data-filters';
    dataFilters.className = 'data-filters';
    
    // Add to page before the map
    const mapContainer = document.getElementById('map-container');
    if (mapContainer) {
      mapContainer.parentNode.insertBefore(dataFilters, mapContainer);
    }
  }
}
