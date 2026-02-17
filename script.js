const API_KEY = 'eacc57bd33e94388ba694346261702';
const API_ENDPOINT = 'http://api.weatherapi.com/v1/current.json';

// Tab switching functionality
const tabButtons = document.querySelectorAll('.tab-button');
const tabContents = document.querySelectorAll('.tab-content');

tabButtons.forEach(button => {
    button.addEventListener('click', () => {
        const tabName = button.getAttribute('data-tab');
        
        // Remove active class from all buttons and contents
        tabButtons.forEach(btn => btn.classList.remove('active'));
        tabContents.forEach(content => content.classList.remove('active'));
        
        // Add active class to clicked button and corresponding content
        button.classList.add('active');
        document.getElementById(tabName).classList.add('active');
    });
});

// Weather search functionality
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const weatherResult = document.getElementById('weatherResult');

searchBtn.addEventListener('click', () => {
    const city = searchInput.value.trim();
    if (city) {
        fetchWeather(city);
    }
});

searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        const city = searchInput.value.trim();
        if (city) {
            fetchWeather(city);
        }
    }
});

// Fetch weather data from API
async function fetchWeather(city) {
    try {
        weatherResult.innerHTML = '<p>Loading...</p>';
        
        const response = await fetch(
            `${API_ENDPOINT}?key=${API_KEY}&q=${encodeURIComponent(city)}&aqi=no`
        );
        
        if (!response.ok) {
            throw new Error('City not found');
        }
        
        const data = await response.json();
        displayWeather(data);
        saveLocation(city);
        loadSavedLocations();
        
    } catch (error) {
        weatherResult.innerHTML = `<p style="color: #ff6b6b;">❌ ${error.message}. Please try another city.</p>`;
    }
}

// Display weather data
function displayWeather(data) {
    const { location, current } = data;
    
    const weatherHTML = `
        <div class="weather-info">
            <div class="weather-location">
                📍 ${location.name}, ${location.country}
            </div>
            <div class="weather-condition">
                <img src="https:${current.condition.icon}" alt="${current.condition.text}" class="weather-icon">
                <div>
                    <div class="condition-text">${current.condition.text}</div>
                </div>
            </div>
            <div class="weather-details">
                <div class="detail-item">
                    <div class="detail-label">Temperature</div>
                    <div class="detail-value">${current.temp_c}°C</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Feels Like</div>
                    <div class="detail-value">${current.feelslike_c}°C</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Humidity</div>
                    <div class="detail-value">${current.humidity}%</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Wind Speed</div>
                    <div class="detail-value">${current.wind_kph} km/h</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Wind Direction</div>
                    <div class="detail-value">${current.wind_dir}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Visibility</div>
                    <div class="detail-value">${current.vis_km} km</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Pressure</div>
                    <div class="detail-value">${current.pressure_mb} mb</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">UV Index</div>
                    <div class="detail-value">${current.uv}</div>
                </div>
            </div>
        </div>
    `;
    
    weatherResult.innerHTML = weatherHTML;
}

// Save location to localStorage
function saveLocation(city) {
    let locations = JSON.parse(localStorage.getItem('weatherLocations')) || [];
    if (!locations.includes(city)) {
        locations.push(city);
        localStorage.setItem('weatherLocations', JSON.stringify(locations));
    }
}

// Load and display saved locations
function loadSavedLocations() {
    const locationList = document.getElementById('locationList');
    const locations = JSON.parse(localStorage.getItem('weatherLocations')) || [];
    
    locationList.innerHTML = '';
    
    if (locations.length === 0) {
        locationList.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #999;">No saved locations yet</p>';
        return;
    }
    
    locations.forEach(city => {
        const locationItem = document.createElement('div');
        locationItem.className = 'location-item';
        locationItem.innerHTML = `
            <div class="location-item-name">${city}</div>
            <div class="location-item-delete" onclick="deleteLocation('${city}')">Remove</div>
        `;
        locationItem.addEventListener('click', (e) => {
            if (!e.target.classList.contains('location-item-delete')) {
                fetchWeather(city);
            }
        });
        locationList.appendChild(locationItem);
    });
}

// Delete location
function deleteLocation(city) {
    let locations = JSON.parse(localStorage.getItem('weatherLocations')) || [];
    locations = locations.filter(loc => loc !== city);
    localStorage.setItem('weatherLocations', JSON.stringify(locations));
    loadSavedLocations();
}

// Add location form submission
const locationForm = document.getElementById('locationForm');
const formMessage = document.getElementById('formMessage');

locationForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const city = document.getElementById('cityInput').value.trim();
    const country = document.getElementById('countryInput').value.trim();
    
    if (!city) {
        showFormMessage('Please enter a city name', 'error');
        return;
    }
    
    const searchQuery = country ? `${city}, ${country}` : city;
    
    fetchWeather(searchQuery);
    
    showFormMessage('Location added and weather fetched!', 'success');
    locationForm.reset();
    
    // Switch to weather tab
    setTimeout(() => {
        document.querySelector('[data-tab="weather"]').click();
    }, 1000);
});

// Show form message
function showFormMessage(message, type) {
    formMessage.textContent = message;
    formMessage.className = `form-message ${type}`;
    
    setTimeout(() => {
        formMessage.className = 'form-message';
    }, 3000);
}

// Quick city buttons
const quickCityButtons = document.querySelectorAll('.quick-city-btn');

quickCityButtons.forEach(button => {
    button.addEventListener('click', () => {
        const city = button.getAttribute('data-city');
        fetchWeather(city);
        
        // Switch to weather tab
        document.querySelector('[data-tab="weather"]').click();
    });
});

// Load saved locations on page load
document.addEventListener('DOMContentLoaded', () => {
    loadSavedLocations();
});