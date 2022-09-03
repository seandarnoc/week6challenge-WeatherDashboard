let searchHistory = []
let citySearched = ""

let getCityWeather = function (city) {
    console.log(city)
    let requestUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=c48c0b53b415c3b9b157cc9b307523b9`;

    fetch(requestUrl)

        .then(function (response) {
            return response.json()
        })
        .then(function (data) {
            console.log(data)
            displayWeather(city, data);



        })
        .catch(function (error) {
            alert("something went wrong, please try again later");
            console.error(error)
        })
};
function getCityInfo(city) {
    let apiUrl = `https://api.openweathermap.org/go/1.0/direct?q=${city}&limit=5&appid=c48c0b53b415c3b9b157cc9b307523b9`;
    fetch(apiUrl)

        .then(function (response) {
            return response.json()


        })
        .then(function (data) {
            //this is where you call out a function for history (persistent data)
            getCityWeather(data[0])
        })

        .catch(function (error) {
            alert("something went wrong, please try again later");
            console.error(error)
        })
}

let searchSubmitQuery = function (event) {

    event.preventDefault();


    let cityName = $("#cityname").val().trim();
    console.log(cityName)

    if (cityName) {

        getCityInfo(cityName);


        $("#cityname").val("");
    } else {

        alert("Please enter the city you wish to search");

    };

    let displayWeather = function (weatherResponse) {


        $("#current-city-name").text(weatherResponse.name, moment(weatherResponse.dt * 1000).format('L')).append(`<img src="https://openweathermap.org/img/wn/${weatherResponse.weather[0].icon}@2x.png"></img>`);
        $("#current-city-temp").text("Temp: " + weatherResponse.main.temp.toFixed(1) + "°F");
        $("#current-city-wind").text("Wind: " + weatherResponse.main.wind.speed.toFixed(1) + "MPH");
        $("#current-city-humidity").text("Humidity: " + weatherResponse.humidity + "%");
        console.log(weatherResponse.name)

        fetch("https://api.openweathermap.org/data/2.5/uvi?lat=" + weatherResponse.coord.lat + "&lon=" + weatherResponse.coord.lon + "&appid=c48c0b53b415c3b9b157cc9b307523b9")
            .then(function (response) {
                response.json().then(function (data) {


                    $("#uv-index").text(data.value);


                    if (data.value >= 11) {
                        $("#uv-index").css("background-color", "#6c49cb")
                    } else if (data.value < 11 && data.value >= 8) {
                        $("#uv-index").css("background-color", "#d90011")
                    } else if (data.value < 8 && data.value >= 6) {
                        $("#uv-index").css("background-color", "#f95901")
                    } else if (data.value < 6 && data.value >= 3) {
                        $("#uv-index").css("background-color", "#f7e401")
                    } else {
                        $("#uv-index").css("background-color", "#299501")
                    }
                })
            });



        fetch("https://api.openweathermap.org/data/2.5/forecast?q=" + weatherResponse.name + "&appid=c48c0b53b415c3b9b157cc9b307523b9&units=imperial")
            .then(function (response) {
                response.json().then(function (data) {


                    $("#five-day-forecast").empty();

                    for (i = 7; i <= data.list.length; i += 8) {

                        let fiveDayCard = `
                    <div class="col-md-2 m-2 py-3 card text-white bg-primary">
                        <div class="card-body p-1">
                            <h5 class="card-title">` + moment(data.list[i]).format("L") + `</h5>
                            <img src="https://openweathermap.org/img/wn/` + data.list[i].weather[0].icon + `.png" alt="rain">
                            <p class="card-text">Temp: ` + data.list[i].main.temp + `</p>
                            <p class="card-text">Humidity: ` + data.list[i].main.humidity + `</p>
                        </div>
                    </div>
                    `;


                        $("#five-day-forecast").append(fiveDayCard);
                    }
                })
            });


        citySearched = weatherResponse.name;


        saveSearchHistory(weatherResponse.name);


    };


    let saveSearchHistory = function (city) {
        if (!searchHistory.includes(city)) {
            searchHistory.push(city);
            $("#search-history").append("<a href='#' class='list-group-item list-group-item-action' id='" + city + "'>" + city + "</a>")
        }

        localStorage.setItem("weatherSearchHistory", JSON.stringify(searchHistory));


        localStorage.setItem("citySearched", JSON.stringify(citySearched));


        loadSearchHistory();
    };

    let loadSearchHistory = function () {
        searchHistory = JSON.parse(localStorage.getItem("weatherSearchHistory"));
        citySearched = JSON.parse(localStorage.getItem("citySearched"));


        if (!searchHistory) {
            searchHistory = []
        }

        if (!citySearched) {
            citySearched = ""
        }


        $("#search-history").empty();



        for (i = 0; i < searchHistory.length; i++) {


            $("#search-history").append("<a href='#' class='list-group-item list-group-item-action' id='" + searchHistory[i] + "'>" + searchHistory[i] + "</a>");
        }
    };


    loadSearchHistory();


    if (citySearched != "") {
        getCityWeather(citySearched);
    }
    var searchField = document.getElementById("search-field")
    searchField.addEventListener("submit", searchSubmitQuery)
    //$("#search-field").submit(searchSubmitQuery);
    console.log(searchSubmitQuery)
    $("#search-history").on("click", function (event) {

        let prevCity = $(event.target).closest("a").attr("id");

        getCityWeather(prevCity);
    });
}