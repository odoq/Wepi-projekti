const inputField = document.getElementById("input-show");
const getSubmitButton = document.getElementById("submit-data");
const getContainer = document.getElementById("show-weather");
const apiKey = ""
const getLocationButton = document.getElementById("get-location");

getSubmitButton.addEventListener("click", getData);
getLocationButton.addEventListener("click", getLocation);

async function getData(event) {
    event.preventDefault();
    if (inputField.value === "") {
        console.log("inputfield is empty");
        return;
    }

    const placeUrl = "https://api.openweathermap.org/geo/1.0/direct?q=" + inputField.value + "&limit=1&appid=" + apiKey;
    const placeRes = await fetch(placeUrl);
    const placeData = await placeRes.json();
    console.log(placeData);

    const lat = placeData[0].lat;
    const lon = placeData[0].lon;

    return setWeather(lat, lon);
}

function getLocation(event) {
    event.preventDefault();
    if (!navigator.geolocation) {
        console.log("Error getting location");
        return;
    }

    const localtion = navigator.geolocation.getCurrentPosition(
        (position) => {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;
            console.log(lat, lon);
            return setWeather(lat, lon);
    })

    
}

async function setWeather(lat, lon) {
    const unit = document.getElementById("unit-select").value;
    const url = "https://api.openweathermap.org/data/2.5/forecast?lat="+lat+ "&lon="+lon+"&units="+unit+"&appid=" + apiKey;
    const dataRes = await fetch(url);
    const dataJSON = await dataRes.json();
    console.log(dataJSON);
    //const data = dataJSON.data[0];
    //console.log(data);
    getContainer.innerHTML = "";

    const now = dataJSON.list[0];

    

    const title = document.createElement("h1");
    title.textContent = "Weather " + dataJSON.city.name + ", " + dataJSON.city.country;
    const nowDiv = document.createElement("div");
    nowDiv.className = "now";
    const titleHour = document.createElement("h2");
    titleHour.textContent = "Next 24 hours";
    

    

    let tempColor = now.main.temp;
    if (unit === "metric") {
        usedUnit = "°C";
    } else if (unit === "imperial") {
        usedUnit = "°F";
        tempColor = (tempColor - 32) / 1.8;
    } else if (unit === "standard") {
        usedUnit = "°K";
        tempColor = tempColor - 273.15;
    } 

    const nowSec = Date.now() / 1000;
    const nightChech = nowSec < dataJSON.city.sunrise || nowSec > dataJSON.city.sunset;
    let color = "default";
    if (nightChech) {
        color = "dark";
    } else if (tempColor <= 0) {
        color = "freeze"
    } else if (tempColor < 12) {
        color = "cold"
    } else {
        color = "hot"
    }
    document.body.className = color;

    const currentWeather = document.createElement("div");
    const seconds = now.dt + dataJSON.city.timezone;
    const date = new Date(seconds * 1000).toISOString().slice(0, 10);
    const localTime = new Date(seconds * 1000).toISOString().slice(11, 16);
    currentWeather.innerHTML = `
        <div class="current">
            <h2>Current weather</h2>
            <div id="time">${date} | ${localTime}</div>
            <img src="${"https://openweathermap.org/img/wn/" + now.weather[0].icon + "@2x.png"}">
            <div id="temp">${now.main.temp}${usedUnit}</div>
            <div class="info">
                <div id="feel">Feels like  ${now.main.feels_like}${usedUnit}</div>
                
                <div id="humid">Humidity  ${now.main.humidity} %</div>
                <div id="desc">  ${now.weather[0].description}</div>
            </div>
            
        </div>
        `

    for (let i = 1; i < 9; i++) {
        const item = dataJSON.list[i];
        const seconds = item.dt + dataJSON.city.timezone;
        const date = new Date(seconds * 1000).toISOString().slice(0, 10);
        const localTime = new Date(seconds * 1000).toISOString().slice(11, 16);
        const image = "https://openweathermap.org/img/wn/" + item.weather[0].icon + "@2x.png";

        const temp = item.main.temp;
        const desc = item.weather[0].description;
        
        nowDiv.innerHTML += `
        <div class="hour">
            <div id="time">${date} | ${localTime}</div>
            <img src="${image}">
            <div id="temp">${temp}${usedUnit}</div>
            <div id="desc">  ${desc}</div>
        </div>`;
}
   

    getContainer.append(title, currentWeather, titleHour, nowDiv);
}