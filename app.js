//step 10
const weatherLookup = {
	0: "Clear ☀️",
  	1: "Mainly Clear 🌤️",
	2: "Partly Cloudy ⛅",
	3: "Overcast ☁️",
	45: "Fog 🌫️",
	48: "Depositing Rime Fog 🌫️",
	51: "Light Drizzle 🌦️",
	61: "Rain 🌧️",
	71: "Snow ❄️",
	95: "Thunderstorm ⛈️"
};

const searchBtn = document.querySelector(".search-btn");
const searchInput = document.querySelector(".search-input");
const currentWeatherCard = document.querySelector(".current-weather");
const forecastGrid = document.querySelector(".forecast-grid");

function showErrorBanner(message) {
	const banner = document.createElement("div");
	banner.className = "error-banner";
	banner.innerHTML = `
	<p>${message}</p>
	<button onclick="location.reload()">Retry</button>
	`;
	document.body.prepend(banner);
}

function removeSkeletons(){
	document.querySelectorAll(".skeleton").forEach(el => {
		el.classList.remove("skeleton");
		el.style.color = "";
	});
}

//step 16
async function safeFetch(url, options = {}) {
	const controller = new AbortController();
	const timeoutId = setTimeout (() => controller.abort(), 10000); //step 19

	try {
		const response = await fetch(url, {...options, signal: controller.signal});
		clearTimeout(timeoutId);

		if (!response.ok) {
			throw new Error(`HTTP Error: ${response.status}`);
		}

		return await response.json();
	} catch(error) {
		clearTimeout(timeoutId);
		throw error;
	}
}

//step 17
function validateInput(city){
	if (!city || city.length < 2) {
		currentWeatherCard.innerHTML = `<p class ="error">Please enter at least 2 characters.</p>`;
		return false;
	}
	return true;
}

//step 18
function debounce(fn, delay) {
	let timer;
	return function (...args) {
		clearTimeout(timer);
		timer = setTimeout(() => fn.apply(this, args), delay);
	};
}

async function fetchWeather(city) {
	try {

		if (!validateInput(city)) {return;}

		//step 5
		const geoData = await
		safeFetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1`);

		//step 6
		if (!geoData.results || geoData.results.length === 0) {
			currentWeatherCard.innerHTML = `<p class="error">City not found. Please try again.</p>`;
			return;
		}

		const {latitude, longitude, name, country, timezone} = geoData.results[0];

		//step 7
		const weatherData = await 
		safeFetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&hourly=temperature_2m,relativehumidity_2m,windspeed_10m&daily=temperature_2m_max,temperature_2m_min,weathercode&timezone=auto`);

		//step 8
		removeSkeletons();
		const current = weatherData.current_weather;
		currentWeatherCard.innerHTML = `
			<h2>${name}, ${country}</h2>
			<p>${current.temperature}°C</p>
			<p>${weatherLookup[current.weathercode] || "Unknown"}</p>
	      	<p>Humidity: ${weatherData.hourly.relativehumidity_2m[0]}%</p>
	      	<p>Wind: ${current.windspeed} km/h</p>
	      	<p>Time: ${current.time}</p>
	      	`; 

	    const daily = weatherData.daily;
    	forecastGrid.innerHTML = "";
    		daily.time.forEach((day, i) => {
      		forecastGrid.innerHTML += `
        		<div class="forecast-card">
          		<p>${new Date(day).toLocaleDateString("en-US", { weekday: "short" })}</p>
          		<p>${weatherLookup[daily.weathercode[i]] || "?"}</p>
          		<p>${daily.temperature_2m_max[i]}° / ${daily.temperature_2m_min[i]}°</p>
        		</div>
      		`;
    	});

    	fetchLocalTime(timezone);

	} catch (error) {
		//step 9
		if (error.name === "AbortError") {
			showErrorBanner("Request timed out. Please try again.");
		} else {
			showErrorBanner(error.message || "Network error. Please try again.");
		}
		console.error("Fetch failed:", error);
	}
}

function fetchLocalTime(timezone){
	//step 13
	if (!timezone) {
		const localTime = new Date().toLocaleTimeString();
		$(".current-weather").append(`<p>Local Time: ${localTime}</p>`);
		return;
	}

	//step 11-15
	$.getJSON(`https://worldtimeapi.org/api/timezone/${timezone}`)
		//step 14
		.done(function(data) {
			//step 12
			const localTime = new Date(data.datetime).toLocaleTimeString();
			$(".current-weather").append(`<p>Local Time: ${localTime}</p>`);
		})
		//step 13
		.fail(function() {
			//step 13
			const fallbackTime = new Date().toLocaleTimeString();
			$(".current-weather").append(`<p>Local Time: ${fallbackTime}</p>`);
		})
		//step 15
		.always(function() {
			//step 15
			console.log("WorldTimeAPI request completed at:", new Date().toISOString());
		});
}

//step 18
const debouncedSearch = debounce(() => {
	const city = searchInput.value.trim();
	if (city) {
		fetchWeather(city);
	}
}, 500);

searchInput.addEventListener("input", debouncedSearch);

searchBtn.addEventListener("click", () => {
	const city = searchInput.value.trim();
	if (city) {
		fetchWeather(city);
	}
});