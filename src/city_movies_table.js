const axios = require('axios');
const fs = require('fs');
const path = require('path');

// URL de la API para obtener información de los teatros
const theatersUrl = "https://api.cinemark-core.com/vista/country/co/cities-theaters?$format=json&$select=ID,Name,PhoneNumber,Address1,Address2,Latitude,Longitude,City,LoyaltyCode";

// Realizar la solicitud GET a la API de teatros
axios.get(theatersUrl)
  .then(responseTheaters => {
    // URL de la API para obtener información de las películas
    const moviesUrl = "https://api.cinemark-core.com/vista/country/co/movies-billboard?$filter=(CinemaId eq '792' or CinemaId eq '790' or CinemaId eq '2424' or CinemaId eq '2421')&$format=json&companyId=5d9770721db034a0279ad989";

    // Realizar la solicitud GET a la API de películas
    return axios.get(moviesUrl)
      .then(responseMovies => ({ theatersData: responseTheaters.data, premieres: responseMovies.data.PremieresBillboard }));
  })
  .then(({ theatersData, premieres }) => {
    // Crear un diccionario para almacenar las ciudades y sus películas
    const citiesAndMovies = {};

    // Llenar el diccionario con las ciudades y sus películas
    for (const movie of premieres) {
      const movieTitle = movie.Title;
      if (movieTitle) {
        for (const cityData of theatersData) {
          const cityName = cityData.Name;
          if (!citiesAndMovies[cityName]) {
            citiesAndMovies[cityName] = [];
          }
          citiesAndMovies[cityName].push(movieTitle);
        }
      }
    }

    // Ruta completa al archivo MD en la carpeta 'generated'
    const outputFilePath = path.join(__dirname, "generated", "cityMoviesTable.md");

    // Crear un archivo MD con los datos combinados en formato de tabla
    const mdContent = `| Ciudad | Peliculas |\n| --- | --- |\n${Object.entries(citiesAndMovies).map(([city, movies]) => `| ${city} | ${movies.join(", ")} |`).join('\n')}\n`;

    // Escribir el contenido en el archivo MD
    fs.writeFileSync(outputFilePath, mdContent, { encoding: "utf-8" });

    console.log(`Archivo MD generado exitosamente en '${outputFilePath}'.`);
  })
  .catch(error => {
    console.error(`Error al realizar una de las solicitudes a las APIs: ${error.message}`);
  });
