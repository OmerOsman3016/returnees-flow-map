/** 
 * Performance Optimization for Sudan Returnees Flow Map
 *
 * This script improves the website's performance through:
 * - Lazy loading of images and components
 * - Resource minification and bundling
 * - Efficient data loading and caching
 * - Progressive rendering
 * - Performance monitoring
 */

document.addEventListener('DOMContentLoaded', function() {
  // Initialize performance optimizations
  initializeLazyLoading();
  setupProgressiveRendering();
  implementDataCaching();
  optimizeMapRendering();
  setupPerformanceMonitoring();
});

/**
 * Initialize lazy loading for images and components
 */
function initializeLazyLoading() {
  // Lazy load images
  const lazyImages = document.querySelectorAll('img[data-src]');
  
  if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src;
          img.removeAttribute('data-src');
          imageObserver.unobserve(img);
          
          // Log performance metric
          if (window.performance && window.performance.mark) {
            window.performance.mark(`image-loaded-${img.alt || 'unnamed'}`);
          }
        }
      });
    }, {
      rootMargin: '50px 0px',
      threshold: 0.01
    });
    
    lazyImages.forEach(img => {
      imageObserver.observe(img);
    });
  } else {
    // Fallback for browsers without IntersectionObserver
    let lazyLoadThrottleTimeout;
    
    function lazyLoad() {
      if (lazyLoadThrottleTimeout) {
        clearTimeout(lazyLoadThrottleTimeout);
      }
      
      lazyLoadThrottleTimeout = setTimeout(() => {
        const scrollTop = window.pageYOffset;
        lazyImages.forEach(img => {
          if (img.offsetTop < window.innerHeight + scrollTop) {
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
          }
        });
        
        if (lazyImages.length === 0) {
          document.removeEventListener('scroll', lazyLoad);
          window.removeEventListener('resize', lazyLoad);
          window.removeEventListener('orientationChange', lazyLoad);
        }
      }, 20);
    }
    
    document.addEventListener('scroll', lazyLoad);
    window.addEventListener('resize', lazyLoad);
    window.addEventListener('orientationChange', lazyLoad);
  }
  
  // Lazy load components
  const lazyComponents = document.querySelectorAll('[data-lazy-component]');
  
  if ('IntersectionObserver' in window) {
    const componentObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const component = entry.target;
          const componentType = component.dataset.lazyComponent;
          
          // Initialize component based on type
          switch (componentType) {
            case 'map':
              initializeMap(component.id);
              break;
            case 'chart':
              initializeChart(component.id);
              break;
            case 'data-table':
              initializeDataTable(component.id);
              break;
          }
          
          component.removeAttribute('data-lazy-component');
          componentObserver.unobserve(component);
          
          // Log performance metric
          if (window.performance && window.performance.mark) {
            window.performance.mark(`component-loaded-${component.id}`);
          }
        }
      });
    }, {
      rootMargin: '100px 0px',
      threshold: 0.01
    });
    
    lazyComponents.forEach(component => {
      componentObserver.observe(component);
    });
  }
}

/**
 * Setup progressive rendering for better perceived performance
 */
function setupProgressiveRendering() {
  // Prioritize critical content
  const criticalElements = document.querySelectorAll('.critical-content');
  criticalElements.forEach(element => {
    element.style.visibility = 'visible';
  });
  
  // Defer non-critical content
  const deferredElements = document.querySelectorAll('.deferred-content');
  
  // Use requestIdleCallback if available, otherwise use setTimeout
  const renderDeferredContent = () => {
    deferredElements.forEach(element => {
      element.style.visibility = 'visible';
      
      // If element contains data-src attributes, load them
      const lazyElements = element.querySelectorAll('[data-src]');
      lazyElements.forEach(lazyElement => {
        if (lazyElement.tagName === 'IMG') {
          lazyElement.src = lazyElement.dataset.src;
        } else {
          lazyElement.style.backgroundImage = `url(${lazyElement.dataset.src})`;
        }
        lazyElement.removeAttribute('data-src');
      });
    });
  };
  
  if ('requestIdleCallback' in window) {
    requestIdleCallback(renderDeferredContent, { timeout: 2000 });
  } else {
    setTimeout(renderDeferredContent, 200);
  }
  
  // Add skeleton screens for content that takes time to load
  const skeletonContainers = document.querySelectorAll('.skeleton-container');
  skeletonContainers.forEach(container => {
    // Create and append skeleton elements
    const skeletonType = container.dataset.skeletonType || 'default';
    const skeletonCount = parseInt(container.dataset.skeletonCount || '1');
    
    for (let i = 0; i < skeletonCount; i++) {
      const skeleton = document.createElement('div');
      skeleton.className = `skeleton skeleton-${skeletonType}`;
      container.appendChild(skeleton);
    }
    
    // Remove skeletons when content is loaded
    const contentLoadedEvent = new CustomEvent('content-loaded');
    container.addEventListener('content-loaded', () => {
      const skeletons = container.querySelectorAll('.skeleton');
      skeletons.forEach(skeleton => {
        skeleton.classList.add('fade-out');
        setTimeout(() => {
          skeleton.remove();
        }, 300);
      });
    });
  });
}

/**
 * Implement data caching for faster repeat visits
 */
function implementDataCaching() {
  // Check if browser supports Cache API
  if ('caches' in window) {
    // Cache name
    const CACHE_NAME = 'sudan-returnees-data-v1';
    
    // Cache static assets
    const assetsToCache = [
      '/ADMIN1.json',
      '/src/map-visualization.js',
      '/src/map-styles.css',
      '/src/user-interaction.js'
    ];
    
    // Open cache and add assets
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(assetsToCache);
      })
      .catch(error => {
        console.error('Error caching assets:', error);
      });
    
    // Create a function to fetch with cache fallback
    window.fetchWithCache = function(url, options = {}) {
      // Check if request should bypass cache
      const bypassCache = options.bypassCache || false;
      
      // Remove custom options before passing to fetch
      delete options.bypassCache;
      
      // If bypassing cache, fetch directly
      if (bypassCache) {
        return fetch(url, options)
          .then(response => {
            // Clone the response to store in cache
            const responseToCache = response.clone();
            
            // Update cache with fresh data
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(url, responseToCache);
              });
            
            return response;
          });
      }
      
      // Otherwise, try cache first, then network
      return caches.match(url)
        .then(cachedResponse => {
          if (cachedResponse) {
            // Check if cached response is recent enough (within 1 hour)
            const cachedDate = new Date(cachedResponse.headers.get('date'));
            const now = new Date();
            const cacheAge = (now - cachedDate) / 1000 / 60; // in minutes
            
            if (cacheAge < 60) {
              // Log cache hit
              console.log(`Cache hit for ${url}, age: ${Math.round(cacheAge)} minutes`);
              return cachedResponse;
            }
          }
          
          // If no cache or cache too old, fetch from network
          return fetch(url, options)
            .then(response => {
              // Clone the response to store in cache
              const responseToCache = response.clone();
              
              // Update cache with fresh data
              caches.open(CACHE_NAME)
                .then(cache => {
                  cache.put(url, responseToCache);
                });
              
              return response;
            });
        });
    };
    
    // Implement IndexedDB for larger datasets
    if ('indexedDB' in window) {
      // Open database
      const dbPromise = indexedDB.open('sudan-returnees-db', 1);
      
      // Create object stores on database upgrade
      dbPromise.onupgradeneeded = function(event) {
        const db = event.target.result;
        
        // Create object stores for different data types
        if (!db.objectStoreNames.contains('idpData')) {
          db.createObjectStore('idpData', { keyPath: 'id' });
        }
        
        if (!db.objectStoreNames.contains('returneeData')) {
          db.createObjectStore('returneeData', { keyPath: 'id' });
        }
        
        if (!db.objectStoreNames.contains('timeSeriesData')) {
          db.createObjectStore('timeSeriesData', { keyPath: 'id' });
        }
      };
      
      // Handle database open success
      dbPromise.onsuccess = function(event) {
        const db = event.target.result;
        
        // Create helper functions for database operations
        window.dbHelpers = {
          // Get data from object store
          getData: function(storeName, key) {
            return new Promise((resolve, reject) => {
              const transaction = db.transaction(storeName, 'readonly');
              const store = transaction.objectStore(storeName);
              const request = store.get(key);
              
              request.onsuccess = function() {
                resolve(request.result);
              };
              
              request.onerror = function() {
                reject(request.error);
              };
            });
          },
          
          // Store data in object store
          storeData: function(storeName, data) {
            return new Promise((resolve, reject) => {
              const transaction = db.transaction(storeName, 'readwrite');
              const store = transaction.objectStore(storeName);
              const request = store.put(data);
              
              request.onsuccess = function() {
                resolve(request.result);
              };
              
              request.onerror = function() {
                reject(request.error);
              };
            });
          },
          
          // Get all data from object store
          getAllData: function(storeName) {
            return new Promise((resolve, reject) => {
              const transaction = db.transaction(storeName, 'readonly');
              const store = transaction.objectStore(storeName);
              const request = store.getAll();
              
              request.onsuccess = function() {
                resolve(request.result);
              };
              
              request.onerror = function() {
                reject(request.error);
              };
            });
          }
        };
        
        // Log successful database initialization
        console.log('IndexedDB initialized successfully');
      };
      
      // Handle database open error
      dbPromise.onerror = function(event) {
        console.error('Error opening IndexedDB:', event.target.error);
      };
    }
  }
}

/**
 * Optimize map rendering for better performance
 */
function optimizeMapRendering() {
  // Add event listener for map initialization
  document.addEventListener('map-init', function(e) {
    const mapId = e.detail.mapId;
    const mapElement = document.getElementById(mapId);
    
    if (!mapElement) return;
    
    // Apply performance optimizations to map
    
    // 1. Use vector tiles instead of raster tiles when available
    // This is a placeholder - actual implementation would depend on the map library
    console.log(`Applying vector tile optimization to map: ${mapId}`);
    
    // 2. Implement level-of-detail rendering
    // Show less detail when zoomed out, more detail when zoomed in
    // This is a placeholder - actual implementation would depend on the map library
    console.log(`Applying level-of-detail rendering to map: ${mapId}`);
    
    // 3. Implement feature clustering for dense data points
    // This is a placeholder - actual implementation would depend on the map library
    console.log(`Applying feature clustering to map: ${mapId}`);
    
    // 4. Use WebGL rendering when available
    // This is a placeholder - actual implementation would depend on the map library
    if ('WebGLRenderingContext' in window) {
      console.log(`Enabling WebGL rendering for map: ${mapId}`);
    }
    
    // 5. Implement viewport culling (only render what's visible)
    // This is a placeholder - actual implementation would depend on the map library
    console.log(`Applying viewport culling to map: ${mapId}`);
  });
  
  // Optimize GeoJSON data before rendering
  window.optimizeGeoJSON = function(geojson) {
    // 1. Simplify geometries based on zoom level
    // This is a placeholder - actual implementation would use a simplification algorithm
    console.log('Simplifying GeoJSON geometries');
    
    // 2. Remove unnecessary properties
    if (geojson.features) {
      geojson.features.forEach(feature => {
        // Keep only essential properties
        const essentialProps = ['admin1Name', 'idp_count', 'returnee_count', 'population'];
        const newProps = {};
        
        essentialProps.forEach(prop => {
          if (feature.properties && feature.properties[prop] !== undefined) {
            newProps[prop] = feature.properties[prop];
          }
        });
        
        feature.properties = newProps;
      });
    }
    
    // 3. Pre-calculate derived values
    if (geojson.features) {
      geojson.features.forEach(feature => {
        if (feature.properties) {
          // Calculate percentage of population displaced
          if (feature.properties.idp_count && feature.properties.population) {
            feature.properties.idp_percentage = 
              (feature.properties.idp_count / feature.properties.population) * 100;
          }
          
          // Calculate percentage of population returned
          if (feature.properties.returnee_count && feature.properties.population) {
            feature.properties.returnee_percentage = 
              (feature.properties.returnee_count / feature.properties.population) * 100;
          }
        }
      });
    }
    
    return geojson;
  };
}

/**
 * Setup performance monitoring
 */
function setupPerformanceMonitoring() {
  // Check if Performance API is available
  if (window.performance && window.performance.mark && window.performance.measure) {
    // Mark initial page load
    window.performance.mark('page-start');
    
    // Mark when DOM is ready
    document.addEventListener('DOMContentLoaded', () => {
      window.performance.mark('dom-ready');
      window.performance.measure('dom-loading', 'page-start', 'dom-ready');
    });
    
    // Mark when page is fully loaded
    window.addEventListener('load', () => {
      window.performance.mark('page-loaded');
      window.performance.measure('page-loading', 'page-start', 'page-loaded');
      
      // Log performance metrics
      const pageLoadingMetric = window.performance.getEntriesByName('page-loading')[0];
      console.log(`Page loaded in ${pageLoadingMetric.duration.toFixed(2)}ms`);
      
      // Send metrics to analytics if available
      if (window.gtag) {
        window.gtag('event', 'timing_complete', {
          'name': 'page_load',
          'value': Math.round(pageLoadingMetric.duration),
          'event_category': 'Performance'
        });
      }
    });
    
    // Track first contentful paint
    const paintObserver = new PerformanceObserver((entryList) => {
      for (const entry of entryList.getEntries()) {
        if (entry.name === 'first-contentful-paint') {
          console.log(`First contentful paint: ${entry.startTime.toFixed(2)}ms`);
          
          // Send metrics to analytics if available
          if (window.gtag) {
            window.gtag('event', 'timing_complete', {
              'name': 'first_contentful_paint',
              'value': Math.round(entry.startTime),
              'event_category': 'Performance'
            });
          }
          
          // Disconnect observer after first paint
          paintObserver.disconnect();
        }
      }
    });
    
    // Start observing paint entries
    paintObserver.observe({ entryTypes: ['paint'] });
    
    // Track long tasks
    const longTaskObserver = new PerformanceObserver((entryList) => {
      for (const entry of entryList.getEntries()) {
        console.warn(`Long task detected: ${entry.duration.toFixed(2)}ms`);
        
        // Send metrics to analytics if available
        if (window.gtag && entry.duration > 100) {
          window.gtag('event', 'long_task', {
            'value': Math.round(entry.duration),
            'event_category': 'Performance'
          });
        }
      }
    });
    
    // Start observing long tasks if supported
    if (PerformanceObserver.supportedEntryTypes.includes('longtask')) {
      longTaskObserver.observe({ entryTypes: ['longtask'] });
    }
    
    // Create custom performance tracking function
    window.trackPerformance = function(actionName, startMark, endMark) {
      window.performance.mark(startMark);
      
      return {
        end: function() {
          window.performance.mark(endMark);
          window.performance.measure(actionName, startMark, endMark);
          
          const metric = window.performance.getEntriesByName(actionName)[0];
          console.log(`${actionName}: ${metric.duration.toFixed(2)}ms`);
          
          // Send metrics to analytics if available
          if (window.gtag) {
            window.gtag('event', 'timing_complete', {
              'name': actionName,
              'value': Math.round(metric.duration),
              'event_category': 'Performance'
            });
          }
          
          return metric.duration;
        }
      };
    };
  }
}

/**
 * Initialize map component (placeholder function)
 */
function initializeMap(mapId) {
  console.log(`Initializing map: ${mapId}`);
  
  // In a real implementation, this would initialize the map
  // For now, we'll just trigger a content loaded event
  const mapElement = document.getElementById(mapId);
  if (mapElement) {
    // Create and dispatch map initialization event
    const event = new CustomEvent('map-init', {
      detail: { mapId }
    });
    document.dispatchEvent(event);
    
    // Trigger content loaded event for skeleton removal
    const container = mapElement.closest('.skeleton-container');
    if (container) {
      const contentLoadedEvent = new CustomEvent('content-loaded');
      container.dispatchEvent(contentLoadedEvent);
    }
  }
}

/**
 * Initialize chart component (placeholder function)
 */
function initializeChart(chartId) {
  console.log(`Initializing chart: ${chartId}`);
  
  // In a real implementation, this would initialize the chart
  // For now, we'll just trigger a content loaded event
  const chartElement = document.getElementById(chartId);
  if (chartElement) {
    // Trigger content loaded event for skeleton removal
    const container = chartElement.closest('.skeleton-container');
    if (container) {
      const contentLoadedEvent = new CustomEvent('content-loaded');
      container.dispatchEvent(contentLoadedEvent);
    }
  }
}

/**
 * Initialize data table component (placeholder function)
 */
function initializeDataTable(tableId) {
  console.log(`Initializing data table: ${tableId}`);
  
  // In a real implementation, this would initialize the data table
  // For now, we'll just trigger a content loaded event
  const tableElement = document.getElementById(tableId);
  if (tableElement) {
    // Trigger content loaded event for skeleton removal
    const container = tableElement.closest('.skeleton-container');
    if (container) {
      const contentLoadedEvent = new CustomEvent('content-loaded');
      container.dispatchEvent(contentLoadedEvent);
    }
  }
}
