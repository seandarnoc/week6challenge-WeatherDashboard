let searchHistory = []
let citySearched = ""
console.log(citySearched)
console.log(searchHistory)
let getCityWeather = function(city) {
    
    let requestUrl = "https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=c48c0b53b415c3b9b157cc9b307523b9";

    fetch(requestUrl)

    .then(function(response) {

        if (response.ok) {
            response.json().then(function(data) {
                displayWeather(data);

            });
        } else {
            alert("Error: " + response.statusText);
        }
    })
    .catch(function(error) {
        alert("something went wrong, please try again later");
    })
};

// function to handle city search form submit
let searchSubmitQuery = function(event) {
    // stop page from refreshing
    event.preventDefault();

    // get value from input element
    let cityName = $("#cityname").val().trim();

    // check if the search field has a value
    if(cityName) {
        // pass the value to getCityWeather function
        getCityWeather(cityName);

        // clear the search input
        $("#cityname").val("");
    } else {
        // if nothing was entered alert the user
        alert("Please enter the city you wish to search");
    //}
};

// function to display the information collected from openweathermap.org
let displayWeather = function(weatherResponse) {

    // format and display the values
    $("#current-city-name").text(weatherResponse.name, moment(weatherResponse.dt *1000).format('L')).append(`<img src="https://openweathermap.org/img/wn/${weatherResponse.weather[0].icon}@2x.png"></img>`);
    $("#current-city-temp").text("Temp: " + weatherResponse.main.temp.toFixed(1) + "°F");
    $("#current-city-wind").text("Wind: " + weatherResponse.main.wind.speed.toFixed(1) + "MPH");
    $("#current-city-humidity").text("Humidity: " + weatherResponse.humidity + "%");
console.log("weweatherResponse.main.wind.speed")
    // use lat & lon to make the uv api call
    fetch("https://api.openweathermap.org/data/2.5/uvi?lat=" + weatherResponse.coord.lat + "&lon="+ weatherResponse.coord.lon + "&appid=c48c0b53b415c3b9b157cc9b307523b9")
        .then(function(response) {
            response.json().then(function(data) {

                // display the uv index value
                $("#uv-index").text(data.value);

                // highlight the value using the EPA's UV Index Scale colors
                if(data.value >= 11) {
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


    // five-day api call
    fetch("https://api.openweathermap.org/data/2.5/forecast?q=" + weatherResponse.name + "&appid=c48c0b53b415c3b9b157cc9b307523b9&units=imperial")
        .then(function(response) {
            response.json().then(function(data) {

                // clear any previous entries in the five-day forecast
                $("#five-day-forecast").empty();

                // get every 8th value (24hours) in the returned array from the api call
                for(i = 7; i <= data.list.length; i += 8){

                    let fiveDayCard =`
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
    if(!searchHistory.includes(city)){
        searchHistory.push(city);
        $("#search-history").append("<a href='#' class='list-group-item list-group-item-action' id='" + city + "'>" + city + "</a>")
    } 

    localStorage.setItem("weatherSearchHistory", JSON.stringify(searchHistory));

  
    localStorage.setItem("citySearched", JSON.stringify(citySearched));

    
    loadSearchHistory();
};

let loadSearchHistory = function() {
    searchHistory = JSON.parse(localStorage.getItem("weatherSearchHistory"));
    citySearched = JSON.parse(localStorage.getItem("citySearched"));
  
   
    if (!searchHistory) {
        searchHistory = []
    }

    if (!citySearched) {
        citySearched = ""
    }

   
    $("#search-history").empty();
    

   
    for(i = 0 ; i < searchHistory.length ;i++) {

        
        $("#search-history").append("<a href='#' class='list-group-item list-group-item-action' id='" + searchHistory[i] + "'>" + searchHistory[i] + "</a>");
    }
  };


loadSearchHistory();


if (citySearched != ""){
    getCityWeather(citySearched);
}


$("#search-field").submit(searchSubmitQuery);
$("#search-history").on("click", function(event){
   
    let prevCity = $(event.target).closest("a").attr("id");
    
    getCityWeather(prevCity);
});
}