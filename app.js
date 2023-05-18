let originMarker;
let destinationMarker;
let routePolyline;

const categories = [
  {
    name: "police stations",
    queryThai: "สถานีตำรวจ",
  },
  {
    name: "hotels",
    queryThai: "โรงแรม",
  },
  {
    name: "Resorts",
    queryThai: "รีสอร์ท",
  },
  {
    name: "gas stations",
    queryThai: "ปั๊มน้ำมัน",
  },

];

const mapElement = document.getElementById("map");
const destinationForm = document.getElementById("destination-form");
const durationElement = document.getElementById("duration");
const distanceElement = document.getElementById("distance");
const exportPriceElement = document.getElementById("export-price");

// Initialize the Google Places Autocomplete Service
const autocompleteService = new google.maps.places.AutocompleteService();
const originAutocomplete = new google.maps.places.Autocomplete(document.getElementById("origin"));
const destinationAutocomplete = new google.maps.places.Autocomplete(document.getElementById("destination"));

// Set Autocomplete Options
originAutocomplete.setFields(["address_components", "geometry", "icon", "name"]);
destinationAutocomplete.setFields(["address_components", "geometry", "icon", "name"]);

function formatDuration(seconds) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return `${hours} hours ${minutes} minutes`;
}

function formatDistance(meters) {
  const kilometers = meters / 1000;
  return `${kilometers.toFixed(2)} km`;
}

// Initialize the Google Map with a view of Thailand
const map = new google.maps.Map(mapElement, {
  center: { lat: 13.736717, lng: 100.524186 }, // Thailand's coordinates
  zoom: 5.5, // Zoom level to show the whole country
  // styles: [...] // Add your desired map style here
  
});

// Function to handle form submission
destinationForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const origin = originAutocomplete.getPlace();
  const destination = destinationAutocomplete.getPlace();

  // Retrieve the weight of the durian
  const weightElement = document.getElementById("weight");
  const weightOfDurian = parseFloat(weightElement.value);

  if (!origin || !destination || isNaN(weightOfDurian) || weightOfDurian <= 0) {
    alert("Please enter a valid origin, destination, and weight of durian");
    return;
  }

  // Get origin and destination coordinates
  const originLatLng = origin.geometry.location;
  const destinationLatLng = destination.geometry.location;

  // Calculate route using a routing API, such as OpenRouteService API
  const routeUrl = `https://api.openrouteservice.org/v2/directions/driving-car?api_key=5b3ce3597851110001cf6248f2d3179444d847aab1231a9e06b7472a&start=${originLatLng.lng()},${originLatLng.lat()}&end=${destinationLatLng.lng()},${destinationLatLng.lat()}`;

  try {
    const routeResponse = await fetch(routeUrl);
    const routeData = await routeResponse.json();

    // Remove the previous origin and destination markers from the map
    if (originMarker) {
      originMarker.setMap(null);
    }

    if (destinationMarker) {
      destinationMarker.setMap(null);
    }

    // Add new origin and destination markers to the map
    originMarker = new google.maps.Marker({
      position: originLatLng,
      map: map,
      title: "Origin",
    });

    destinationMarker = new google.maps.Marker({
      position: destinationLatLng,
      map: map,
      title: "Destination",
    });

    // Remove the previous route from the map
    if (routePolyline) {
      routePolyline.setMap(null);
    }

  // Update route information on the web page
  const duration = routeData.features[0].properties.segments[0].duration;
  const distance = routeData.features[0].properties.segments[0].distance;
  const exportPrice = calculateExportPrice(weightOfDurian);

  durationElement.innerText = `Delivery time: ${formatDuration(duration)}`;
  distanceElement.innerText = `Route distance: ${formatDistance(distance)}`;
  exportPriceElement.innerText = `Export price: ฿${exportPrice.toFixed(2)}`;

    // Display route on the map
    const routePath = routeData.features[0].geometry.coordinates.map(([lng, lat]) => ({
      lat,
      lng,
    }));
    
    routePolyline = new google.maps.Polyline({
      path: routePath,
      geodesic: true,
      strokeColor: "#4A90E2", // Use a modern shade of blue instead of red
      strokeOpacity: 0.8, // Slightly reduce opacity for a more subtle appearance
      strokeWeight: 4, // Increase the stroke weight for better visibility
      strokeDashArray: [5, 5], // Create a dashed line effect (5px dash, 5px space)
      map: map,
    });
    
  } catch (error) {
    console.error("Error fetching route data:", error);
    alert("Error fetching route data");
    }
    });
    
    function calculateExportPrice(weight) { 
      // replace this with a function to calculate the actual export price based on weight
      const weightInKg = weight;
      let pricePerKg;
  
      if (weightInKg <= 500) {
          pricePerKg = 42; // for weight less than or equal to 500 kg
      } else {
          pricePerKg = 39; // for weight greater than 500 kg
      }
  
      return weightInKg * pricePerKg;
  }
  
    let currentInfoWindow; 
    function showDurianOrchards() {
      const destination = destinationAutocomplete.getPlace();
    
      if (!destination) {
        alert("Please enter a valid destination");
        return;
      }
    
      // Get the destination coordinates
      const destinationLatLng = destination.geometry.location;
    
      // Initialize the PlacesService
      const placesService = new google.maps.places.PlacesService(map);
    
      // Use the country's native language for searching Durian Orchards
      const country = destination.address_components.find(component => component.types.includes("country"));
      const countryNativeName = country && country.long_name;
      console.log(countryNativeName);

      // Search for Durian Orchards worldwide
      placesService.textSearch({
        query: `durian OR ทุเรียน OR market OR ตลาด${countryNativeName}`,
        location: destinationLatLng,
        radius: 50000, // Search within 50 km of the destination
      }, (results, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK) {
          // Clear any existing results
          document.getElementById("durian-orchards").innerHTML = "";
    
          // Loop through each result and create an HTML element
          for (const result of results) {
            const orchardElement = document.createElement("div");
            orchardElement.classList.add("orchard");
    
            const nameElement = document.createElement("div");
            nameElement.classList.add("orchard-name");
            nameElement.innerText = result.name;
            orchardElement.appendChild(nameElement);
    
            const addressElement = document.createElement("div");
            addressElement.classList.add("orchard-address");
            addressElement.innerText = result.formatted_address;
            orchardElement.appendChild(addressElement);
    
            const distanceElement = document.createElement("div");
            distanceElement.classList.add("orchard-distance");
            const distance = google.maps.geometry.spherical.computeDistanceBetween(
              destinationLatLng, result.geometry.location
            );
            distanceElement.innerText = `Distance: ${formatDistance(distance)}`;
            orchardElement.appendChild(distanceElement);
    
            // Append the HTML element to the #durian-orchards section
            document.getElementById("durian-orchards").appendChild(orchardElement);
          }
        } else {
          console.error("Error searching for Durian Orchards:", status);
          alert("Error searching for Durian Orchards");
        }
      });
    }
       
    // Add event listener for the "Durain orchards at destination" button
    document.getElementById("durian-orchards-btn").addEventListener("click", (e) => {
      e.preventDefault();
      showDurianOrchards();
    });

// List of provinces in Thailand
const provinces = [
  "Amnat Charoen", "Ang Thong", "Bangkok", "Bueng Kan", "Buri Ram", "Chachoengsao", "Chai Nat", "Chaiyaphum", "Chanthaburi", "Chiang Mai", "Chiang Rai", "Chon Buri", "Chumphon", "Kalasin", "Kamphaeng Phet", "Kanchanaburi", "Khon Kaen", "Krabi", "Lampang", "Lamphun", "Loei", "Lop Buri", "Mae Hong Son", "Maha Sarakham", "Mukdahan", "Nakhon Nayok", "Nakhon Pathom", "Nakhon Phanom", "Nakhon Ratchasima", "Nakhon Sawan", "Nakhon Si Thammarat", "Nan", "Narathiwat", "Nong Bua Lam Phu", "Nong Khai", "Nonthaburi", "Pathum Thani", "Pattani", "Phang Nga", "Phatthalung", "Phayao", "Phetchabun", "Phetchaburi", "Phichit", "Phitsanulok", "Phra Nakhon Si Ayutthaya", "Phrae", "Phuket", "Prachin Buri", "Prachuap Khiri Khan", "Ranong", "Ratchaburi", "Rayong", "Roi Et", "Sa Kaeo", "Sakon Nakhon", "Samut Prakan", "Samut Sakhon", "Samut Songkhram", "Saraburi", "Satun", "Sing Buri", "Sisaket", "Songkhla", "Sukhothai", "Suphan Buri", "Surat Thani", "Surin", "Tak", "Trang", "Trat", "Ubon Ratchathani", "Udon Thani", "Uthai Thani", "Uttaradit", "Yala", "Yasothon"
];

const provincesThai = [
  "อำนาจเจริญ", "อ่างทอง", "กรุงเทพมหานคร", "บึงกาฬ", "บุรีรัมย์", "ฉะเชิงเทรา", "ชัยนาท", "ชัยภูมิ", "จันทบุรี", "เชียงใหม่", "เชียงราย", "ชลบุรี", "ชุมพร", "กาฬสินธุ์", "กำแพงเพชร", "กาญจนบุรี", "ขอนแก่น", "กระบี่", "ลำปาง", "ลำพูน", "เลย", "ลพบุรี", "แม่ฮ่องสอน", "มหาสารคาม", "มุกดาหาร", "นครนายก", "นครปฐม", "นครพนม", "นครราชสีมา", "นครสวรรค์", "นครศรีธรรมราช", "น่าน", "นราธิวาส", "หนองบัวลำภู", "หนองคาย", "นนทบุรี", "ปทุมธานี", "ปัตตานี", "พังงา", "พัทลุง", "พะเยา", "เพชรบูรณ์", "เพชรบุรี", "พิจิตร", "พิษณุโลก", "พระนครศรีอยุธยา", "แพร่", "ภูเก็ต", "ปราจีนบุรี", "ประจวบคีรีขันธ์", "ระนอง", "ราชบุรี", "ระยอง", "ร้อยเอ็ด", "สระแก้ว", "สกลนคร", "สมุทรปราการ", "สมุทรสาคร", "สมุทรสงคราม", "สระบุรี", "สตูล", "สิงห์บุรี", "ศรีสะเกษ", "สงขลา", "สุโขทัย", "สุพรรณบุรี", "สุราษฎร์ธานี", "สุรินทร์", "ตาก", "ตรัง", "ตราด", "อุบลราชธานี", "อุดรธานี", "อุทัยธานี", "อุตรดิตถ์", "ยะลา", "ยโสธร"
];

// Array to store all the durian orchard markers
const durianOrchardMarkers = [];
// Function to check if a given location is in Thailand
async function isLocationInThailand(latLng) {
  const geocoder = new google.maps.Geocoder();
  const result = await new Promise((resolve, reject) => {
    geocoder.geocode({ location: latLng }, (results, status) => {
      if (status === "OK") {
        resolve(results);
      } else {
        reject(status);
      }
    });
  });

  for (const component of result[0].address_components) {
    if (component.types.includes("country") && component.long_name === "Thailand") {
      return true;
    }
  }

  return false;
}
// Get all durian orchards in Thailand using the Google Places API
const getDurianOrchards2 = async () => {
  // Clear the existing durian orchard markers from the map
  durianOrchardMarkers.forEach((marker) => {
    marker.setMap(null);
  });

  // Reset the durianOrchardMarkers array
  durianOrchardMarkers.length = 0;

const fetchOrchards = async (province) => {
  const cachedResult = localStorage.getItem(province);
  if (cachedResult) {
    return JSON.parse(cachedResult);
  } else {
    const response = await fetch(`http://49.231.43.88:3000/orchards/${province}`);
    const result = await response.json();

    localStorage.setItem(province, JSON.stringify(result));
    return result;
  }
};

  
  

  const allOrchards = await Promise.all(provinces.map(fetchOrchards));
  const durianOrchards = allOrchards.flat();

  // Filter out any orchards that are not in Thailand
  const thaiOrchards = durianOrchards.filter(orchard => orchard.formatted_address.includes('Thailand'));

// Create a marker for each durian orchard and add it to the map
thaiOrchards.forEach((orchard) => {
  const orchardMarker = new google.maps.Marker({
    position: orchard.geometry.location,
    map,
    title: orchard.name,
    icon: {
      url: "http://maps.google.com/mapfiles/ms/icons/green-dot.png",
    },
  });

  const orchardInfoWindow = new google.maps.InfoWindow({
    content: `<div style="color: black; background-color: white; padding: 5px;"><h3>${orchard.name}</h3><p>${orchard.formatted_address}</p></div>`,
  });

  orchardMarker.addListener("click", () => {
    if (currentInfoWindow) {
      currentInfoWindow.close();
    }
    orchardInfoWindow.open(map, orchardMarker);
    currentInfoWindow = orchardInfoWindow;
  });

    // Add the marker to the array of durian orchard markers
    durianOrchardMarkers.push(orchardMarker);
  });
}

// Call the function to show all durian orchards on page load
//getDurianOrchards2();

// Function to toggle the visibility of the durian orchard markers
let durianOrchardsLoaded = false;

const toggleDurianOrchardMarkers = async () => {
  if (!durianOrchardsLoaded) {
    await getDurianOrchards2();
    durianOrchardsLoaded = true;
  } else {
    const allVisible = durianOrchardMarkers.every(marker => marker.getVisible());

    durianOrchardMarkers.forEach((marker) => {
      marker.setVisible(!allVisible);
    });
  }
};


document.addEventListener('DOMContentLoaded', () => {
  const toggleButton = document.getElementById("toggleButton");
  if (toggleButton) {
    toggleButton.onclick = toggleDurianOrchardMarkers;
  }

  const navbarToggle = document.getElementById('navbar-toggle');
  const navMenu = document.getElementById('nav-menu');

  if (navbarToggle && navMenu) {
    navbarToggle.addEventListener('click', () => {
      navMenu.classList.toggle('hidden');
    });
  }
});



// Initialize cache
const cache = new Map();

async function fetchPlacesInProvinces(category, queryThai) {
  const fetchPlaces = async (province) => {
    const url = `http://49.231.43.88:3001/https://maps.googleapis.com/maps/api/place/textsearch/json?query=${queryThai}+${province}+ไทย&key=AIzaSyB3LHd0aUM90OGkBfPwR5MvnXk_AHhRODE`;

    // Check cache
    if (cache.has(url)) {
      return cache.get(url);
    }

    const placesResponseThai = await fetch(url);
    const placesDataThai = await placesResponseThai.json();
    const placesThai = placesDataThai.results;

    // Store to cache
    cache.set(url, placesThai);

    return placesThai;
  };

  const allPlaces = await Promise.all(provinces.map(fetchPlaces));
  const places = allPlaces.flat();
  const allPlaces2 = await Promise.all(provincesThai.map(fetchPlaces));
  const places2 = allPlaces2.flat();

  const allCombinedPlaces = [...places, ...places2];

  return allCombinedPlaces;
}


// Initialize markers array with empty arrays for each category
let markers = categories.map(() => []);


async function displayPlacesInProvinces() {
  const promises = categories.map((category) =>
    fetchPlacesInProvinces(category.name, category.queryThai)
  );

  try {
    const allPlaces = await Promise.all(promises);
    allPlaces.forEach((places, index) => {
      const categoryMarkers = [];
      places.forEach((place) => {
        const placeMarker = new google.maps.Marker({
          position: place.geometry.location,
          map: null,
          title: place.name,
        });

        const placeInfoWindow = new google.maps.InfoWindow({
          content: `<div style="color: black; background-color: white; padding: 5px;"><h3>${place.name}</h3><p>${place.formatted_address}</p></div>`,
        });

        placeMarker.addListener("click", () => {
          if (currentInfoWindow) {
            currentInfoWindow.close();
          }
          placeInfoWindow.open(map, placeMarker);
          currentInfoWindow = placeInfoWindow;
        });

        categoryMarkers.push(placeMarker);
      });
      
      markers[index] = categoryMarkers; 
    });
  } catch (error) {
    console.error("Error in displayPlacesInProvinces:", error);
    //alert("Error in displayPlacesInProvinces");
  }
}

displayPlacesInProvinces();

function toggleCategoryLayer(categoryIndex, isVisible) {
  const mapInstance = isVisible ? map : null;
  markers[categoryIndex].forEach((marker) => {
    marker.setMap(mapInstance);
  });
}

// Example usage:
// Show hotels (index 1 in categories array)
// toggleCategoryLayer(1, true);

// Hide hotels (index 1 in categories array)
toggleCategoryLayer(1, false);

function isCategoryVisible(categoryIndex) {
  if (markers[categoryIndex] && markers[categoryIndex].length > 0) {
    return markers[categoryIndex][0].getMap() !== null;
  } else {
    return false;
  }
}


