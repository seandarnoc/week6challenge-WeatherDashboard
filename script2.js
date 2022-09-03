var searchForm = document.getElementById("search-form");
var searchInput = document.getElementById("search-input");
//var searchField = document.getElementById("search-field");
//var searchField = document.getElementById("search-field");
searchForm.addEventListener("submit", searchSubmitQuery);


function searchSubmitQuery(event) {
    if (!searchInput.value) {
        return;
    }
    event.preventDefault();


    let cityName = searchInput.value.trim();
    console.log(cityName)

    getCityInfo(cityName);

    searchInput.value = "";

}

function getCityInfo(searchInput) {
    let apiUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${searchInput}&limit=5&appid=c48c0b53b415c3b9b157cc9b307523b9`;
    fetch(apiUrl)

        .then(function (response) {
            return response.json();


        })
        .then(function (data) {
            if (!data[0]) {
                alert("location not found");

            } else {
                //this is where you call out a function for history (persistent data)
                getCityInfo(data[0])
               
            }


        })

        .catch(function (error) {

            console.error(error)
        })
}