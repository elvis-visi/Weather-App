//format the data
function formatWeatherData(response)
{
    let days  = [];

    for(let i = 0; i < 7; i++)
    {
        days[i] = {
            avg : response.forecast.forecastday[i].day.avgtemp_c,
            min : response.forecast.forecastday[i].day.mintemp_c,
            max : response.forecast.forecastday[i].day.maxtemp_c,
            date : response.forecast.forecastday[i].date,
            icon : response.forecast.forecastday[i].day.condition.icon
        }
    }

    console.log("days", days)

    return {
        city : response.location.name,
        country: response.location.country,
        temp_c : response.current.temp_c,
        days : days
    }
}


// take a location and return the weather data for that location
async function getWeather (city)
{
    try{
        //fetch data
        const response = await fetch(
        `https://api.weatherapi.com/v1/forecast.json?key=1178c00a7b88412bb23193429231804&q=${city}&days=7
        ` // Use the city parameter
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

//On initial render of the page display weather data about london.
async function initialRender(city)
{
// getWeather for london, return weather data as an object
const weatherData = await getWeather(city)

//display the weather into basic div
displayWeather(weatherData)
}

initialRender('london')

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
    const dailyDiv =  document.querySelector('.Daily')
    const hourlyDiv =  document.querySelector('.Hourly')
    

    basicDiv.innerHTML = `
    
    <h1>${weatherData.city} </h1>   
    <p>${weatherData.country} </p> 
    <p>${weatherData.temp_c} °C</p> 
    `;

    //iterate over the days array, add each day's data to a div

    let dailyContent = ''

    for(let i = 0; i <weatherData.days.length; i++)
    {
        dailyContent += `
        <div class="dayItem">
            <h3>${weatherData.days[i].date}</h3>
            <img src ="${weatherData.days[i].icon}">
            <p>Avg: ${weatherData.days[i].avg} °C</p>
            <p>Min: ${weatherData.days[i].min} °C</p>
            <p>Max: ${weatherData.days[i].max} °C</p>
        </div>
        `;
    
    }
    //display the 7 days in the Daily div
    dailyDiv.innerHTML = dailyContent;



}

