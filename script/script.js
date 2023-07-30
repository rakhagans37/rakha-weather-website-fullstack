// Function, Async, and API call
import { getSevenDaysDetails, printChart, dayForecast } from "./chart.js";
function locAPI(latitude, longitude) {
    const param = new URLSearchParams();
    param.append("lat", latitude);
    param.append("lon", longitude);
    param.append("limit", 5);
    param.append("appid", "5e12c37e2ff0623c3469032dd5ba1d6b");
    param.append("lang", "id");

    const request = new Request(
        `https://api.openweathermap.org/geo/1.0/reverse?${[param]}`
    );

    try {
        const response = fetch(request);
        return response.then((response) => response.json());
    } catch (error) {
        return error;
    }
}

function forecastAPI(latitude, longitude, city) {
    const param = new URLSearchParams();

    //Untuk mengambil parameter yang tepat untuk digunakan dalam URL
    if (latitude === null || longitude === null) {
        param.append("q", city);
    } else {
        param.append("lat", latitude);
        param.append("lon", longitude);
    }

    //Parameter wajib dalam URL
    param.append("appid", "5e12c37e2ff0623c3469032dd5ba1d6b");
    param.append("units", "metric");
    param.append("lang", "id");

    //Membuat request ke server
    const request = new Request(
        `https://api.openweathermap.org/data/2.5/weather?${param}`
    );
    try {
        const response = fetch(request);
        return response.then((response) => response.json());
    } catch (error) {
        return error;
    }
}

function uvAPI(latitude, longitude) {
    const param = new URLSearchParams();
    param.append("lat", latitude);
    param.append("lng", longitude);

    var myHeaders = new Headers();
    myHeaders.append("x-access-token", "openuv-24jv0rlkm8fmi8-io");
    myHeaders.append("Content-Type", "application/json");

    var requestOptions = {
        method: "GET",
        headers: myHeaders,
        redirect: "follow",
    };

    try {
        const response = fetch(
            `https://api.openuv.io/api/v1/uv?${param}`,
            requestOptions
        );
        return response.then((response) => response.json());
    } catch (error) {
        return error;
    }
}

function hourlyForecastAPI(latitude, longitude, city) {
    const param = new URLSearchParams();

    //Untuk mengambil parameter yang tepat untuk digunakan dalam URL
    if (latitude === null || longitude === null) {
        param.append("q", city);
    } else {
        param.append("lat", latitude);
        param.append("lon", longitude);
    }

    //Parameter wajib dalam URL
    param.append("appid", "5e12c37e2ff0623c3469032dd5ba1d6b");
    param.append("units", "metric");
    param.append("lang", "id");
    param.append("cnt", 12);

    //Membuat request ke server
    const request = new Request(
        `https://pro.openweathermap.org/data/2.5/forecast/hourly?${param}`
    );
    try {
        const response = fetch(request);
        return response.then((response) => response.json());
    } catch (error) {
        return error;
    }
}

function makeTime() {
    const time = new Date();
    document.getElementById("date-time").textContent = `${time.toLocaleString(
        "default",
        { month: "long" }
    )} ${time.getDate()}, ${time.toLocaleTimeString()}`;
}

async function getTemp(latitude, longitude, city) {
    try {
        const response = await forecastAPI(latitude, longitude, city);
        return response;
    } catch (error) {
        return error;
    }
}
async function getLoc(latitude, longitude) {
    try {
        const response = await locAPI(latitude, longitude);
        return response;
    } catch (error) {
        return error;
    }
}
async function getUV(latitude, longitude) {
    try {
        const response = await uvAPI(latitude, longitude);
        return response;
    } catch (error) {
        return error;
    }
}
async function getHourlyForecast(latitude, longitude) {
    try {
        const response = await hourlyForecastAPI(latitude, longitude, city);
        return response;
    } catch (error) {
        return error;
    }
}

function printData(response) {
    //Print current data temperature
    document.getElementById("temp").textContent = Math.round(
        response.main.temp
    );

    //Print current data feels temperature
    document.getElementById("feels-temp").textContent = Math.round(
        response.main.feels_like
    );

    //Print current simbol forecast
    const locationTime = new Date(
        new Date().getTime() + response.timezone * 1000
    ).toISOString(); //Algorithm to convert timezone in second to UTC

    if (locationTime.substring(11, 13) > 18) {
        if (response.weather[0].id > 800) {
            document
                .getElementById("forecast-icon")
                .setAttribute(
                    "src",
                    `image/forecast icon/${response.weather[0].id}-night.png`
                );
        } else {
            document
                .getElementById("forecast-icon")
                .setAttribute(
                    "src",
                    `image/forecast icon/${response.weather[0].main}-night.png`
                );
        }
    } else {
        if (response.weather[0].id > 800) {
            document
                .getElementById("forecast-icon")
                .setAttribute(
                    "src",
                    `image/forecast icon/${response.weather[0].id}.png`
                );
        } else {
            document
                .getElementById("forecast-icon")
                .setAttribute(
                    "src",
                    `image/forecast icon/${response.weather[0].main}.png`
                );
        }
    }

    //Print current deskripsi forecast ex: clouds, sunny, etc
    document.getElementById("forecast-desc").textContent =
        response.weather[0].main;

    //Print current wind speed
    document.getElementById("wind").textContent = response.wind.speed + " m/s";

    //Print current pressure
    document.getElementById("pressure").textContent =
        response.main.pressure + " hPa";

    //Print current rain
    document.getElementById("rain-volume").textContent =
        (response?.rain?.["1h"] ?? response?.rain?.["3h"] ?? 0) + " mm";

    getUV(response.coord.lat, response.coord.lon).then((responseUV) => {
        try {
            document.getElementById("uv-index").textContent = Math.round(
                responseUV.result.uv
            );
        } catch (error) {
            document.getElementById("uv-index").textContent = "NO DATA";
            console.log(`Error Occured : ${error}`);
        }
    });

    //Print hourly

    getHourlyForecast(response.coord.lat, response.coord.lon).then(
        (responseHourly) => {
            console.log();
            for (let i = 0; i < 12; i++) {
                const target = document.getElementById(`forecast${i + 1}`);
                const date = new Date(
                    Number(responseHourly.list[i].dt + "000") - 7000 * 3600
                );

                target.querySelector("h3").textContent = `${date.toLocaleString(
                    "en-US",
                    {
                        hour: "numeric",
                        hour12: true,
                    }
                )}`;

                //If clouds
                if (responseHourly.list[i].weather[0].id > 800) {
                    target
                        .querySelector("img")
                        .setAttribute(
                            "src",
                            `image/forecast icon/${responseHourly.list[i].weather[0].id}.png`
                        );
                } else {
                    target
                        .querySelector("img")
                        .setAttribute(
                            "src",
                            `image/forecast icon/${responseHourly.list[i].weather[0].main}.png`
                        );
                }

                target.querySelector("span").textContent = `${Math.round(
                    responseHourly.list[i].main.temp
                )}`;
            }
        }
    );
    //Print Chart
    try {
        printChart(response.coord.lat, response.coord.lon);
    } catch (error) {
        document.getElementById("chart").textContent = "No Data";
    }
}
function printLoc(response) {
    document.getElementById("location").textContent = `${
        response[0].local_names.id ?? response[0].name
    }, ${response[0].state ?? response[0].country}`;
}

function getAllData() {
    navigator.geolocation.getCurrentPosition((position) => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;

        getTemp(latitude, longitude).then((response) => {
            printData(response);
        });
        getLoc(latitude, longitude).then((response) => {
            printLoc(response);
        });
    });
}

//Javascript procedural
document.getElementById("city").addEventListener("submit", function (event) {
    event.preventDefault();
    const city = document.getElementById("city-input").value;

    //Memanggil async function untuk get data
    getTemp(null, null, city).then((response) => {
        try {
            printData(response);
        } catch (error) {
            alert("Kota Tidak Ditemukan");
        }
        try {
            getLoc(response.coord.lat, response.coord.lon).then((response) => {
                printLoc(response);
            });
        } catch (error) {
            console.log(`Kota Tidak Ditemukan, Error code: ${error}`);
        }
    });
    document.getElementById("city-input").value = "";
});

setInterval(makeTime, 1000);
getAllData();
