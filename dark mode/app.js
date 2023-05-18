function formatDuration(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours} hours ${minutes} minutes`;
  }
  
  function formatDistance(meters) {
    const kilometers = meters / 1000;
    return `${kilometers.toFixed(2)} km`;
  }
  
  const mapElement = document.getElementById("map");
  const destinationForm = document.getElementById("destination-form");
  const durationElement = document.getElementById("duration");
  const distanceElement = document.getElementById("distance");
  const exportPriceElement = document.getElementById("export-price");
  
  const chumphonLatLng = { lat: 10.493049, lng: 99.180019 }; // Chumphon Province coordinates
  
  // Initialize the Google Map
  const map = new google.maps.Map(mapElement, {
    center: chumphonLatLng,
    zoom: 5,
  });
  
  const durianMarker = new google.maps.Marker({
    position: chumphonLatLng,
    map: map,
    title: "Chumphon Province",
  });
  
  let routePolyline; // Variable to store the current route
  
  // Function to handle form submission
  destinationForm.addEventListener("submit", async (e) => {
    e.preventDefault();
  
    const destination = document.getElementById("destination").value;
  
    // Get destination coordinates using Geocoding API
    const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
      destination
    )}&key=AIzaSyBEFDWOjOOFhNFXrDVVItMg3YlnR6oECxA`;
  
    try {
      const geoResponse = await fetch(geocodeUrl);
      const geoData = await geoResponse.json();
  
      if (geoData.status !== "OK") {
        alert("Destination not found");
        return;
      }
  
      const destinationLatLng = geoData.results[0].geometry.location;
  
      // Calculate route using a routing API, such as OpenRouteService API
      const routeUrl = `https://api.openrouteservice.org/v2/directions/driving-car?api_key=5b3ce3597851110001cf6248f2d3179444d847aab1231a9e06b7472a&start=${chumphonLatLng.lng},${chumphonLatLng.lat}&end=${destinationLatLng.lng},${destinationLatLng.lat}`;
  
      const routeResponse = await fetch(routeUrl);
      const routeData = await routeResponse.json();
  
      // Remove the previous route from the map
      if (routePolyline) {
        routePolyline.setMap(null);
      }
  
      // Update route information on the web page
      const duration = routeData.features[0].properties.segments[0].duration;
      const distance = routeData.features[0].properties.segments[0].distance;
      const exportPrice = calculateExportPrice(distance); // Replace this with an actual function to calculate export price
  
      durationElement.innerText = `Delivery time: ${formatDuration(duration)}`;
      distanceElement.innerText = `Route distance: ${formatDistance(distance)}`;
      exportPriceElement.innerText = `Export price: $${exportPrice.toFixed(2)}`;
  
      // Display route on the map
      const routePath = routeData.features[0].geometry.coordinates.map(([lng, lat]) => ({
        lat,
        lng,
      }));
  
      routePolyline = new google.maps.Polyline({
        path: routePath,
        geodesic: true,
        strokeColor: "#FF0000",
        strokeOpacity: 1.0,
        strokeWeight: 2,
        map: map,
      });
    } catch (error) {
      console.error("Error fetching route data:", error);
      alert("Error fetching route data");
      }
      });
      
      function calculateExportPrice(distance) {
      // Replace this with a function to calculate the actual export price based on distance and other factors
      const basePrice = 100;
      const pricePerKm = 0.5;
      
      return basePrice + distance * pricePerKm;
      }
  