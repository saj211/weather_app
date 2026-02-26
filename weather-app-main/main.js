
const texts = {
  greeting: "How's the sky looking today?",
  search: "Search",
  loadingCity: "Loading city..."
};
//the retry btn on the err page
const retryBtn = document.getElementById("retryBtn");
//for the lat and lon modification
let currentcoords = null;

//handle the day drp-down menu
const dayMenu= document.querySelector("#dayMenu");

//search consts
const search = document.querySelector(".search-btn");
const cityInput = document.querySelector(".search-txt");
const noResult = document.querySelector("#no-result");

//loader consts
const loadingBox = document.getElementById("loading-box");
const note = document.querySelector(".note");

//unit menu consts
const btn = document.getElementById("unitbtn");
const menu = document.getElementById("unitmenu");

const state = {
unit : "metric"
};

// letter animation
function showTextLetterByLetter(el, text, delay) {
  const letters = text.split("");
  el.textContent = "";

  letters.forEach((ch, i) => {
    setTimeout(() => {
      el.textContent += ch;
    }, i * delay);
  });
}

// date helper func
function showEnglishDate() {
  const now = new Date();
  const options = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric"
  };
  document.getElementById("date").textContent =
    now.toLocaleDateString("en-US", options);

}

// initial UI text helper func
function applyText() {
  showTextLetterByLetter(
    document.querySelector(".greeting"),
    texts.greeting,
    50
  );

  document.querySelector("#search-btn").textContent = texts.search;
  showEnglishDate();
  
}

// get lat lon helper func
function getLocation() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject("Geolocation not supported");
    } else {
      navigator.geolocation.getCurrentPosition(resolve, reject);
    }
  });
}

// get city helper func
async function getCity(lat, lon) {
  const url =
    `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`;

  const res = await fetch(url);
  const data = await res.json();

  return `${data.city || data.locality || data.principalSubdivision || "Unknown City"}, ${data.countryName}`;
}

// get weather icon helper func
function getWeatherIcon(code) {
  if (code === 0 || code === 1) return "assets/images/icon-sunny.webp";
  else if (code === 2) return "assets/images/icon-partly-cloudy.webp";
  else if (code === 3) return "assets/images/icon-fog.webp";
  else if (code < 50 && code >= 40) return "assets/images/icon-fog.webp";
  else if (code >= 51 && code <= 67) return "assets/images/icon-rain.webp";
  else if (code >= 71 && code <= 77) return "assets/images/icon-snow.webp";
  else if (code >= 95) return "assets/images/icon-storm.webp";
  return "assets/images/icon-sunny.webp";
}



// loader helper funcs
function showLoading() {
  loadingBox.classList.remove("hidden");
  note.classList.add("hidden");
}

function hideLoading() {
  loadingBox.classList.add("hidden");
  note.classList.remove("hidden");
}

//err: "cant load the page" helper func
function showNothingButErr() {
  document.getElementById("err").classList.remove("hidden");
  document.getElementById("err-container").classList.add("hidden");
}

function hideErr() {
  document.getElementById("err").classList.add("hidden");
}

//search for city helper func
function showNoResultPage() {
  document.getElementById("weatherContainer").classList.add("hidden");
  document.getElementById("no-result").classList.remove("hidden");
}

function showWeatherPage() {
  
  document.getElementById("weatherContainer").classList.remove("hidden");
  document.getElementById("no-result").classList.add("hidden");
}


async function searchCity(city) {
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${city}`;
  const res = await fetch(url);
  const data = await res.json();

  if (!data.results || data.results.length === 0) {
    showNoResultPage();
    return null;
  }

  return data.results[0];
}


//get weather, windspeed, etc
async function getWeather(lat, lon) {

let url = `https://api.open-meteo.com/v1/forecast?
latitude=${lat}
&longitude=${lon}
&current=temperature_2m,wind_speed_10m,apparent_temperature,relative_humidity_2m,precipitation,weathercode
&hourly=temperature_2m,weathercode,apparent_temperature,relative_humidity_2m,precipitation
&daily=weathercode,temperature_2m_max,temperature_2m_min
&timezone=auto
&forecast_days=7`;


if (state.unit === "imperial") {
  url += "&temperature_unit=fahrenheit&windspeed_unit=mph&precipitation_unit=inch";
}else {
    url += "&temperature_unit=celsius&windspeed_unit=kmh&precipitation_unit=mm";
  }//to ensure the browser mentions them alright
const res = await fetch(url);
if (!res.ok) {
  showNothingButErr();
  return;
}  
  const data = await res.json();
    if (!data.current){
      hideLoading();
      showNothingButErr();
      return;
    }

  try {
const weather = data.current;

//for bg today
    const city = await getCity(lat, lon);
document.getElementById("city").textContent = city;
    document.getElementById("temp").textContent =
     `${weather.temperature_2m}${state.unit === "imperial" ? "°F" : "°C"}` ;
    const icon = document.getElementById("weatherIcon");
    icon.src = getWeatherIcon(weather.weathercode);

//for the four box below the bg today
    document.getElementById("feelslike").textContent =
      `${data.current.apparent_temperature}${state.unit === "imperial" ? "°F" : "°C"}`;

    document.getElementById("humidity").textContent =
      `${data.current.relative_humidity_2m}%`;

    document.getElementById("wind").textContent =
      `${data.current.wind_speed_10m} ${state.unit === "imperial" ? "mph" : "km/h"}`;

    document.getElementById("precipitation").textContent =
      `${data.current.precipitation} ${state.unit === "imperial" ? "inch" : "mm"}`;


//for the daily forecast

for (let i = 0; i < 7 ; i++) {
    const dataStr= data.daily.time[i];
    const code= data.daily.weathercode[i];
    const max = data.daily.temperature_2m_max[i];
    const min = data.daily.temperature_2m_min[i];

    const dayName = new Date(dataStr).toLocaleDateString("en-US", {weekday : "short"});
    const icon = getWeatherIcon(code);
    const minnimum = document.getElementById("min" + (i+1));
    const maximum = document.getElementById("max" + (i+1));
    const dayDiv = document.getElementById("day" + (i+1));
    const iconDiv = document.getElementById("daily-icon" + (i + 1));

    if (iconDiv && dayDiv && minnimum && maximum) {
      iconDiv.src = icon;
      dayDiv.textContent = dayName;
      maximum.textContent = max + "°";
      minnimum.textContent = min + "°";
    };}


return data.current;
  } catch (err) {
    console.log(err);
  }
}


//handle the day column
async function handleDay(selectedDay) {
  //currencoords defined globally and the inputs are coming from the initweather() and handlesearch().
 const lat = currentcoords.lat;
const lon = currentcoords.lon;

  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=temperature_2m,weathercode&timezone=auto`;

  const res = await fetch(url);
  const data = await res.json();

  if (!data.hourly) return;

  const times = data.hourly.time;
  const temps = data.hourly.temperature_2m;
  const codes = data.hourly.weathercode;

  const now = new Date();
  let count = 0;

for (let j = 1; j <= 7; j++) {
  const hourEl = document.getElementById("hour" + j);
  const weatherEl = document.getElementById("weather" + j);
  const iconEl = document.getElementById("icon" + j);

  if (hourEl && weatherEl && iconEl) {
    hourEl.textContent = "";
    weatherEl.textContent = "";
    iconEl.src = "";
    hourEl.parentElement.style.display = "none"; 
  }
}


  for (let i = 1; i < times.length; i++) {
    const dateObj = new Date(times[i]);

    const dayName = dateObj.toLocaleDateString("en-US", {
      weekday: "long"
    });

    if (dayName === selectedDay) {

      // skip past hours for today
      const todayName = now.toLocaleDateString("en-US", {
        weekday: "long"
      });

const nowHour = now.getHours();
const itemHour = dateObj.getHours();

if (selectedDay === todayName && itemHour < nowHour) continue;
      const formatted = dateObj.toLocaleTimeString("en-US", {
        hour: "numeric",
        hour12: true
      });

      const hourEl = document.getElementById("hour" + (count + 1));
      const weatherEl = document.getElementById("weather" + (count + 1));
      const iconEl = document.getElementById("icon" + (count + 1));

    if (hourEl && weatherEl && iconEl) {
       const unitSymbol = state.unit === "imperial" ? "°F" : "°C";
  weatherEl.textContent = temps[i] + unitSymbol;
  hourEl.textContent = formatted;
  iconEl.src = getWeatherIcon(codes[i]);

  hourEl.parentElement.style.display = "flex";
}
      count++;
      if (count === 7) break;
    }
  }
  }

//for the unit selection
function unitItems(e) {
  const item = e.currentTarget;
  const value = item.dataset.value;

  state.unit = value;
  localStorage.setItem("unit", value);
  updateCheck();

  if (currentcoords) {
    // re-fetch weather with the new unit
    getWeather(currentcoords.lat, currentcoords.lon).then(() => {
      const today = new Date().toLocaleDateString("en-US", { weekday: "long" });
      handleDay(today); // redraw hourly forecast immediately
    });
  }
}

// update the checkmarks
function updateCheck() {
  // clear all checkmarks first
  document.querySelectorAll(`#unitmenu .item .check`).forEach(span => {
    span.innerHTML = "";
  });

  // set checkmark for the selected unit
  const selectedSpan = document.querySelector(
    `#unitmenu .item[data-value="${state.unit}"] .check`
  );

  if (selectedSpan) {
    selectedSpan.innerHTML =
      '<img src="assets/images/icon-checkmark.svg" class="check-icon">';
  }
}



//handle the search helper func
async function handleSearch() {
  const city = cityInput.value.trim();

  if (!city) {
    initWeather();
    return;
  }

  try {
hideErr();
showLoading();

const place = await searchCity(city);
if (!place) {
  hideLoading();
  return;
}
currentcoords = {
  lat: place.latitude,
  lon: place.longitude
};

await getWeather(place.latitude, place.longitude);
    document.getElementById("err-container").classList.remove("hidden");
    showWeatherPage();

   const today = new Date().toLocaleDateString("en-US", { weekday: "long" });
    handleDay(today);

  } catch (err) {
    console.log(err);
  } finally {
    hideLoading();
  }
}

//handle the retry btn
async function handleRetry() {
  try {
    hideErr();
    showLoading();
    await initWeather(); // ← await ensures errors are caught
  } catch(err) {
    hideLoading();
    showNothingButErr();
  }
}

// init main func
async function initWeather() {
  try {
    hideErr();
    showLoading();

//for the loading phase
    document.getElementById("city").textContent = texts.loadingCity;
//init the real work
    document.getElementById("err-container").classList.remove("hidden");

    const position = await getLocation().catch(() => null);
    if (!position) {
      hideLoading();
      showNothingButErr();
      return;
    }

    const lat = position.coords.latitude;
    const lon = position.coords.longitude;
    currentcoords = { lat, lon };
    await getWeather(lat, lon);

    showWeatherPage();

const today = new Date().toLocaleDateString("en-US", { weekday: "long" });
handleDay(today);

  } catch (err) {
    console.log(err);
  } finally {
    hideLoading();
  }
}

// event listeners
btn.onclick = () => menu.classList.toggle("open");

document.querySelectorAll(".item").forEach(item => {
item.addEventListener("click",unitItems)});

document.addEventListener("click", e => {
  if (!menu.contains(e.target) && !btn.contains(e.target)) {
    menu.classList.remove("open");
   
  }
});

//handle the enter and search button
search.addEventListener("click", handleSearch);
cityInput.addEventListener("keydown", e => {
  if (e.key === "Enter") {
    handleSearch(e);
  }
});

document.addEventListener("click", e => {
  if (!dayMenu.contains(e.target)) {
    dayMenu.classList.remove("open");
  }
});


dayMenu.addEventListener("change", (e) => {
  handleDay(e.target.value);
});

retryBtn.addEventListener("click", handleRetry);



state.unit = localStorage.getItem("unit") || "metric";
updateCheck();

// start
applyText();
initWeather();
