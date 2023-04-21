//format the data
function formatWeatherData(response)
{
    let days  = [];

    //hourly content 
    // from the API get the currentTime in milliseconds, * 1000 -> to ms, required by Date object
    const currentTime = new Date(response.location.localtime_epoch * 1000)
    
    //calculate the time 24 hours away from the current time, 24 Hrs * 60 mins * 60 secs * 1000 ms
    const next24Hours = new Date(currentTime.getTime() + 24 * 60 * 60 * 1000)

    //filter the hours which are within the 24 hours time frame
    const hourlyData = response.forecast.forecastday
    .flatMap(day => day.hour)  //all the hours of each day(7) into the same array
    .filter((hour) => {
        const hourTime = new Date (hour.time_epoch * 1000)
        return hourTime >= currentTime && hourTime <= next24Hours
    })
    .map((hour) => (
        {
        time: hour.time,
        temp_c: hour.temp_c,
        icon: hour.condition.icon
        }
    ));


    for(let i = 0; i < response.forecast.forecastday.length; i++)
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
        days : days,
        hourlyData : hourlyData
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

    let hourlyContent = ''

    for(let i = 0; i < weatherData.hourlyData.length; i++ )
    {
        hourlyContent += `
        <div class="hourItem">
            <h4> ${weatherData.hourlyData[i].time}  </h4>
            <img src  ="${weatherData.hourlyData[i].icon}">
            <p>${weatherData.hourlyData[i].temp_c} °C</p>
        </div>

        `;
    }

    hourlyDiv.innerHTML = hourlyContent;

}

