//format the data
function formatWeatherData(response)
{
    return {
        city : response.location.name,
        country: response.location.country,
        temp_c : response.current.temp_c
    }
}


// take a location and return the weather data for that location
async function getWeather (city)
{
    try{
        //fetch data
        const response = await fetch(
        `https://api.weatherapi.com/v1/current.json?key=1178c00a7b88412bb23193429231804&q=${city}` // Use the city parameter
        )

        //check is response is ok(status 200)
        if(!response.ok)
        {
            throw new Error('Http error, response status ', response.status)
        }

        //convert to json
        const data = await response.json();

        //format output object
        const weatherData  = formatWeatherData(data)
        
        console.log("Weather data ", weatherData )
       
        return weatherData ;
    } catch(error)
    {
        console.error('Error fetching weather data:', error)
    }
     
}

getWeather('london')


const form = document.getElementById("search-form");
const input = document.getElementById("search-input");

//listen for the submit event on the form element
//event is an object representing the event triggered
form.addEventListener('submit', async (event) => {

    event.preventDefault() //prevent the form from submitting(page reloading)
 
    const city = input.value; // Get the input value
   const weatherData = await getWeather(city); // Call the getWeather function with the input value
 
   displayWeather(weatherData);


});

//display the content from getWeather in the basic div
function displayWeather(weatherData)
{
    const basicDiv = document.querySelector('.basic')

    basicDiv.innerHTML = `
    
    <h1>${weatherData.city} </h1>   
    <p>${weatherData.country} </p> 
    <p>${weatherData.temp_c} °C</p> 
    `;

}

