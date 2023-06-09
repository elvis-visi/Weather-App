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
    .map((hour) => {
       
        //Date object to get the hour and minutes only
        const hourTime = new Date(hour.time_epoch * 1000)
        const hours = hourTime.getHours();
        const minutes = hourTime.getMinutes();
        const formattedTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;


        return {
        time: formattedTime,
        temp_c: hour.temp_c,
        chance_of_rain: hour.chance_of_rain,
        icon: hour.condition.icon
        }
    });


    for(let i = 0; i < response.forecast.forecastday.length; i++)
    {
        //create a Date object, can get the day using getDate()
        const dateObject = new Date(response.forecast.forecastday[i].date);

        days[i] = {
            avg : response.forecast.forecastday[i].day.avgtemp_c,
            min : response.forecast.forecastday[i].day.mintemp_c,
            max : response.forecast.forecastday[i].day.maxtemp_c,
            date : dateObject.getDate(),
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

function showSpinner() {
  const spinners = document.querySelectorAll(".spinner");
  spinners.forEach((spinner) => {
    spinner.style.display = "inline-block";
  });
}

function hideSpinner() {
  const spinners = document.querySelectorAll(".spinner");
  spinners.forEach((spinner) => {
    spinner.style.display = "none";
  });
}


// take a location and return the weather data for that location
async function getWeather (city)
{
    try{
        //fetch data
        const response = await fetch(
        `https://api.weatherapi.com/v1/forecast.json?key=3823e80266704c9586702427230405&q=${city}&days=8
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


async function getCityImage(city) {
    try {
        const response = await fetch(
            `https://api.unsplash.com/search/photos?query=${city}&client_id=wAmMuhxorHCEgV5IzlV7QP38piMHoPJVw-MGhWDCGgY`
        );

        if (!response.ok) {
            throw new Error('Http error, response status ', response.status);
        }

        const data = await response.json();

        if (data.results.length > 0) {
            let randomIndex = Math.floor(Math.random() * data.results.length) ;
            return data.results[randomIndex].urls.small;
        } else {
            return null;
        }
    } catch (error) {
        console.error('Error fetching city image:', error);
    }
}

  



//On initial render of the page display weather data about London.
async function initialRender(city)
{
  showSpinner();
// getWeather for London, return weather data as an object
const weatherData = await getWeather(city)
const cityImage = await getCityImage(city);

//display the weather into basic div
displayWeather(weatherData,cityImage)
hideSpinner();
}

initialRender('london')

const form = document.getElementById("search-form");
const input = document.getElementById("search-input");

//listen for the submit event on the form element
//event is an object representing the event triggered
form.addEventListener('submit', async (event) => {

    event.preventDefault() //prevent the form from submitting(page reloading)
    showSpinner();
    const city = input.value; // Get the input value
   const weatherData = await getWeather(city); // Call the getWeather function with the input value
   const cityImage = await getCityImage(city);

   displayWeather(weatherData,cityImage);
   hideSpinner();

});

//display the content from getWeather in the basic div
function displayWeather(weatherData, cityImage)
{
    const basicDiv = document.querySelector('.basic')
    const dailyDiv =  document.querySelector('.Daily')
    const hourlyDiv =  document.querySelector('.Hourly')
    

    basicDiv.innerHTML = `
    
    <div class="city-info-container">
        <div class="city-info">
            <h1>${weatherData.city} ${weatherData.temp_c} °C </h1>   
        </div>    
        ${cityImage ? `<img src="${cityImage}" alt="${weatherData.city}">` : ''}
    </div>
    `;

    //iterate over the days array, add each day's data to a div

    let dailyContent = ''

    for(let i = 1; i <weatherData.days.length; i++)
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
            <p> Chance of Rain:  </p>
            <p> ${weatherData.hourlyData[i].chance_of_rain}%  </p>
        </div>

        `;
    }

    hourlyDiv.innerHTML = hourlyContent;

}

