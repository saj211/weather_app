
const texts = {
  greeting: "How's the sky looking today?",
  search: "Search",
  loadingCity: "Loading city..."
};

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

// get weather helper func
async function getWeather(lat, lon) {
  try {
    const url =
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,wind_speed_10m,weathercode`;

    const res = await fetch(url);
    if (!res.ok) throw new Error("API down");

    const data = await res.json();
    return data.current;

  } catch (err) {
    return null;
  }
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
  document.getElementById("weather-container").classList.add("hidden");
  document.getElementById("no-result").classList.remove("hidden");
}

function showWeatherPage() {
  document.getElementById("weather-container").classList.remove("hidden");
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

    const place =
      places.find(p => p.name.toLowerCase().includes(city.toLowerCase()));

    const weather = await getWeather(place.latitude, place.longitude);
    if (!weather) {
      showNothingButErr();
      return;
    }

    document.getElementById("city").textContent =
      `${place.name}, ${place.country}`;
    document.getElementById("temp").textContent =
      `${weather.temperature_2m}°C`;

    const icon = document.getElementById("weatherIcon");
    icon.src = getWeatherIcon(weather.weathercode);
    document.getElementById("err-container").classList.remove("hidden");
    document.getElementById("weather-container").classList.remove("hidden");


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
document.getElementById("weather-container").classList.remove("hidden");

    showWeatherPage();


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

// start
applyText();
initWeather();
