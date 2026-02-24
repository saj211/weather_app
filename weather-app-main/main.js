
const texts = {
  greeting: "How's the sky looking today?",
  search: "Search",
  loadingCity: "Loading city..."
};

//handle the day drp-down menu
const dayMenu= document.querySelector("#dayMenu");

//search consts
const search = document.querySelector("#search-btn");
const cityInput = document.querySelector("#search-txt");
const noResult = document.querySelector("#no-result");

//loader consts
const loadingBox = document.getElementById("loading-box");
const note = document.querySelector(".note");

//unit menu consts
const btn = document.getElementById("unitbtn");
const menu = document.getElementById("unitmenu");
const state = {
  temp: "c",
  wind: "kmh",
  rain: "mm"
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

  return data.results;
}

async function getWeather(lat, lon) {
const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,wind_speed_10m,apparent_temperature,relative_humidity_2m,precipitation,weathercode&hourly=temperature_2m,weathercode,apparent_temperature,relative_humidity_2m,precipitation&daily=weathercode,temperature_2m_max,temperature_2m_min&timezone=auto&forecast_days=7`;    const res = await fetch(url);
    if (!res.ok) throw new Error("API failed");
    const data = await res.json();
    if (!data.current) return;

  try {

//for the bg today
    //  

//for the four boex below the bg today
    document.getElementById("feelslike").textContent =
      `${data.current.apparent_temperature}°C`;

    document.getElementById("humidity").textContent =
      `${data.current.relative_humidity_2m}%`;

    document.getElementById("wind").textContent =
      `${data.current.wind_speed_10m} km/h`;

    document.getElementById("precipitation").textContent =
      `${data.current.precipitation} mm`;


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
  const position = await getLocation();
  const lat = position.coords.latitude;
  const lon = position.coords.longitude;

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
  weatherEl.textContent = temps[i] + "°C";
  hourEl.textContent = formatted;
  iconEl.src = getWeatherIcon(codes[i]);

  hourEl.parentElement.style.display = "flex";
}
      }


      count++;
      if (count === 7) break;
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


    const places = await searchCity(city);
    if (!places) return;

const place = places.find(p =>
  p.name.toLowerCase().includes(city.toLowerCase())
) || places[0];

if (!place) {
  showNoResultPage();
  return;
}

    const weather = await getWeather(place.latitude, place.longitude);
    if (!weather) {
      showNothingButErr();
      return;
    }
    
    const icon = document.getElementById("weatherIcon");
    icon.src = getWeatherIcon(weather.weathercode);
    document.getElementById("err-container").classList.remove("hidden");

    showWeatherPage();


  } catch (err) {
    console.log(err);
  } finally {
    hideLoading();
  }
}

// init main func
async function initWeather() {
  try {
    hideErr();
    showLoading();

    const position = await getLocation().catch(() => null);
    if (!position) {
      hideLoading();
      showNothingButErr();
      return;
    }

    const lat = position.coords.latitude;
    const lon = position.coords.longitude;

    document.getElementById("city").textContent = texts.loadingCity;

    const [weather, city] = await Promise.all([
      getWeather(lat, lon),
      getCity(lat, lon)
    ]);

    if (!weather) {
      hideLoading();
      showNothingButErr();
      return;
    }

    document.getElementById("city").textContent = city;
    document.getElementById("temp").textContent =
      `${weather.temperature_2m}°C`;

    const icon = document.getElementById("weatherIcon");
    icon.src = getWeatherIcon(weather.weathercode);

    document.getElementById("err-container").classList.remove("hidden");

    showWeatherPage();

currentCoords = { lat, lon };

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
  item.addEventListener("click", () => {
    const type = item.dataset.type;
    const value = item.dataset.value;

    state[type] = value;
    updateCheck(type);
    applyFilters();
  });
});

function updateCheck(type) {
  document.querySelectorAll(`.item[data-type="${type}"]`)
    .forEach(i => i.querySelector(".check").innerHTML = "");

  document.querySelector(
    `.item[data-type="${type}"][data-value="${state[type]}"] .check`
  ).innerHTML =
    '<img src="assets/images/icon-checkmark.svg" class="check-icon">';
}

//this will change
function applyFilters() {
  console.log("current units: ", state);
}

document.addEventListener("click", e => {
  if (!menu.contains(e.target) && !btn.contains(e.target)) {
    menu.classList.remove("open");
   
  }
});

//handle the enter and search button
search.addEventListener("click", handleSearch);
cityInput.addEventListener("keydown", e => {
  if (e.key === "Enter") {
    handleSearch();
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

// start
applyText();
initWeather();
