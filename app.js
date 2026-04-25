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

async function fetchWeather(city) {
	try {
		//step 5
		const geoRes = await
		fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1`);
		const geoData = await geoRes.json();

		//step 6
		if (!geoData.results || geoData.results.length === 0) {
			currentWeatherCard.innerHTML = `<p class="error">City not found. Please try again.</p>`;
			return;
		}

		const {latitude, longtitude, name, country} = geoData.results[0];

		//step 7
		const weatherRes = await 
		fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&hourly=temperature_2m,relativehumidity_2m,windspeed_10m&daily=temperature_2m_max,temperature_2m_min,weathercode&timezone=auto`);
		const weatherData = await weatherRes.json();

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

	    //skip step 7
	} catch (error) {
		//step 9
		showErrorBanner("Network error. Please try again.");
		console.error("Fetch failed:" , error);

	}
}

searchBtn.addEventListener("click", () => {
	const city = searchInput.value.trim();
	if (city) {
		fetchWeather(city);
	}
});