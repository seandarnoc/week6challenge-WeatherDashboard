//global variables
let searchHistory = []
let lastCitySearched = ""

// api call to openweathermap.org
let getCityWeather = function (city) {
    // format the OpenWeather api url
    let apiUrl = "https://api.openweathermap.org/data/2.5/weather?q=" + city + "&appid=c48c0b53b415c3b9b157cc9b307523b9&units=imperial";

    // call the url of the api
    fetch(apiUrl)

        .then(function (response) {
            // request was successful
            if (response.ok) {
                response.json().then(function (data) {
                    displayWeather(data);
                });
                // request fails
            } else {
                alert("Error: " + response.statusText);
            }
        })

        // alert user if there is no responce from OpenWeather
        .catch(function (error) {
            alert("Unable to connect to OpenWeather");
        })
};

//function to hand the search field submission
let searchSubmitHandler = function (event) {
    // stop page from refreshing
    event.preventDefault();

    // get value from input element
    let cityName = $("#cityname").val().trim();

    // check if the search field has a value
    if (cityName) {
        // pass the value to getCityWeather function
        getCityWeather(cityName);

        // clear the search input
        $("#cityname").val("");
    } else {
        // if nothing was entered alert the user
        alert("Please enter a city name");
    }
};

// function to render to the screen the information from the weather api
let displayWeather = function (weatherResponse) {

    // format and display the values
    $("#current-city-name").text(weatherResponse.name + " " + moment(weatherResponse.dt * 1000).format("MM/DD/YYYY") + ") ").append(`<img src="https://openweathermap.org/img/wn/${weatherResponse.weather[0].icon}@2x.png"></img>`);
    $("#current-city-temp").text("Temp: " + weatherResponse.main.temp.toFixed(1) + "°F");
    $("#current-city-wind").text("Wind: " + weatherResponse.wind.speed.toFixed(1) + " MPH");
    $("#current-city-humidity").text("Humidity: " + weatherResponse.main.humidity + "%");


    // use lat & lon to make the uv api call
    fetch("https://api.openweathermap.org/data/2.5/uvi?lat=" + weatherResponse.coord.lat + "&lon=" + weatherResponse.coord.lon + "&appid=c48c0b53b415c3b9b157cc9b307523b9")
        .then(function (response) {
            response.json().then(function (data) {

                // display the uv index value
                $("#uv-box").text(data.value);

                // highlight the value using the EPA's UV Index Scale colors
                if (data.value >= 11) {
                    $("#uv-box").css("background-color", "#cb4990")
                } else if (data.value < 11 && data.value >= 8) {
                    $("#uv-box").css("background-color", "#cb4949")
                } else if (data.value < 8 && data.value >= 6) {
                    $("#uv-box").css("background-color", "#cb7f49")
                } else if (data.value < 6 && data.value >= 3) {
                    $("#uv-box").css("background-color", "#f8c023")
                } else {
                    $("#uv-box").css("background-color", "#49cb7b")
                }
            })
        });

    // api call for 5 day forecast. 
    fetch("https://api.openweathermap.org/data/2.5/forecast?q=" + weatherResponse.name + "&appid=c48c0b53b415c3b9b157cc9b307523b9&units=imperial")
        .then(function (response) {
            response.json().then(function (data) {

                // clear any previous entries in the five-day forecast
                $("#five-day-forecast").empty();

                // get every 8th value (24hours) in the returned array from the api call
                for (i = 7; i <= data.list.length; i += 8) {

                    // insert data into five day forecast card template
                    let fiveDayCard = `
                    <div class="col-md-2 m-2 py-3 card text-white bg-primary">
                        <div class="card-body p-1">
                            <h5 class="card-title">` + moment(data.list[i].dt * 1000).format("MM/DD/YYYY") + `</h5>
                            <img src="https://openweathermap.org/img/wn/` + data.list[i].weather[0].icon + `.png" alt="rain">
                            <p class="card-text">Temp: ` + data.list[i].main.temp + ` °F</p>
                            <p class="cart-text">Wind: ` + data.list[i].wind.speed + ` MPH</p> 
                            <p class="card-text">Humidity: ` + data.list[i].main.humidity + ` %</p>
                        </div>
                    </div>
                    `;

                    // append the day to the five-day forecast
                    $("#five-day-forecast").append(fiveDayCard);
                }
            })
        });

    // save the last city searched
    lastCitySearched = weatherResponse.name;

    // save to the search history using the api's name value for consistancy
    saveSearchHistory(weatherResponse.name);


};

// function to save the city search history to local storage
let saveSearchHistory = function (city) {
    if (!searchHistory.includes(city)) {
        searchHistory.push(city);
        $("#search-history").append("<a href='#' class='list-group-item list-group-item-action' id='" + city + "'>" + city + "</a>")
    }

    // save the searchHistory array to local storage
    localStorage.setItem("weatherSearchHistory", JSON.stringify(searchHistory));

    // save the lastCitySearched to local storage
    localStorage.setItem("lastCitySearched", JSON.stringify(lastCitySearched));

    // display the searchHistory array
    loadSearchHistory();
};

// function to load saved city search history from local storage
let loadSearchHistory = function () {
    searchHistory = JSON.parse(localStorage.getItem("weatherSearchHistory"));
    lastCitySearched = JSON.parse(localStorage.getItem("lastCitySearched"));

    // if nothing in localStorage, create an empty searchHistory array and an empty lastCitySearched string
    if (!searchHistory) {
        searchHistory = []
    }

    if (!lastCitySearched) {
        lastCitySearched = ""
    }

    // clear any previous values from th search-history ul
    $("#search-history").empty();

    // for loop that will run through all the citys found in the array
    for (i = 0; i < searchHistory.length; i++) {

        // add the city as a link, set it's id, and append it to the search-history ul
        $("#search-history").append("<a href='#' class='list-group-item list-group-item-action' id='" + searchHistory[i] + "'>" + searchHistory[i] + "</a>");
    }
};

// load search history from local storage
loadSearchHistory();

// start page with the last city searched if there is one
if (lastCitySearched != "") {
    getCityWeather(lastCitySearched);
}

// event handlers
$("#search-field").submit(searchSubmitHandler);
$("#search-history").on("click", function (event) {
    // get the links id value
    let prevCity = $(event.target).closest("a").attr("id");
    // pass it's id value to the getCityWeather function
    getCityWeather(prevCity);
});