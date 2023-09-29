const axios = require('axios');
const fs = require('fs');
const path = require('path');

// URL de la API para obtener información de los teatros
const theatersUrl = "https://api.cinemark-core.com/vista/country/co/cities-theaters?$format=json&$select=ID,Name,PhoneNumber,Address1,Address2,Latitude,Longitude,City,LoyaltyCode";

// URL de la API para obtener información de las películas
const moviesUrl = "https://api.cinemark-core.com/vista/country/co/movies-billboard?$filter=(CinemaId eq '792' or CinemaId eq '790' or CinemaId eq '2424' or CinemaId eq '2421')&$format=json&companyId=5d9770721db034a0279ad989";

axios.all([
  axios.get(theatersUrl),
  axios.get(moviesUrl)
])
  .then(axios.spread((responseTheaters, responseMovies) => {
    if (responseTheaters.status !== 200 || responseMovies.status !== 200) {
      throw new Error("Error al realizar una de las solicitudes a las APIs.");
    }

    const theatersData = responseTheaters.data;
    const premieres = responseMovies.data.PremieresBillboard || [];

    // Crear un objeto para almacenar las películas y sus teatros
    const moviesAndTheaters = {};

    // Llenar el objeto con las películas y sus teatros
    premieres.forEach(movie => {
      const movieTitle = movie.Title;
      if (movieTitle) {
        const cityTheaters = {};
        theatersData.forEach(cityData => {
          const cityName = cityData.Name;
          const theaters = cityData.Theaters;
          cityTheaters[cityName] = theaters.map(theater => theater.Name);
        });
        moviesAndTheaters[movieTitle] = cityTheaters;
      }
    });

    // Ruta completa al archivo MD en la carpeta 'generated'
    const outputFilePath = path.join(__dirname, "generated", "moviesPerCity.md");

    // Crear un archivo MD con los datos combinados en formato de tabla
    const mdContent = `| Pelicula | Ciudad con funciones | Cines disponibles |\n| --- | --- | --- |\n`;
    const mdRows = Object.entries(moviesAndTheaters).map(([movieTitle, cityTheaters]) => {
      return Object.entries(cityTheaters).map(([city, theaters]) => {
        const theatersStr = theaters.join(", ");
        return `| ${movieTitle} | ${city} | ${theatersStr} |`;
      }).join('\n');
    }).join('\n');

    const mdContentFinal = mdContent + mdRows;

    fs.writeFileSync(outputFilePath, mdContentFinal, 'utf-8');
    console.log(`Archivo MD generado exitosamente en '${outputFilePath}'.`);
  }))
  .catch(error => {
    console.error(error.message);
  });
