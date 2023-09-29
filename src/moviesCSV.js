const axios = require('axios');
const fs = require('fs');
const path = require('path');

// URL de la API para obtener información de las películas
const moviesUrl = "https://api.cinemark-core.com/vista/country/co/movies-billboard?$filter=(CinemaId eq '792' or CinemaId eq '790' or CinemaId eq '2424' or CinemaId eq '2421')&$format=json&companyId=5d9770721db034a0279ad989";

axios.get(moviesUrl)
  .then(responseMovies => {
    if (responseMovies.status !== 200) {
      throw new Error("Error al realizar la solicitud a la API.");
    }

    const data = responseMovies.data;

    // Inicializar una lista para almacenar los datos de ID y Título de las películas
    const moviesData = [];

    // Define a regular expression pattern to remove unwanted text
    const pattern = /\s*\(.*\)$/;  // Matches text inside parentheses and trailing spaces

    // Iterar a través de los datos para obtener el título y la ID de cada película
    (data.PremieresBillboard || []).forEach(movie => {
      const movieId = movie.CorporateFilmId;
      const movieTitle = movie.Title;
      if (movieId && movieTitle) {
        // Remove unwanted text using regular expressions
        const cleanedTitle = movieTitle.replace(pattern, '').trim().toLowerCase();
        moviesData.push({ "ID": movieId, "Título": cleanedTitle });
      }
    });

    // Ruta completa al archivo CSV en la carpeta 'generated'
    const outputFilePath = path.join(__dirname, "generated", "movies.csv");

    // Crear un archivo CSV con los datos de ID y Título de las películas
    const csvContent = `${Object.keys(moviesData[0]).join(',')}\n${moviesData.map(movie => Object.values(movie).join(',')).join('\n')}`;

    fs.writeFileSync(outputFilePath, csvContent, 'utf-8');

    console.log(`Archivo CSV generado exitosamente en '${outputFilePath}'.`);
  })
  .catch(error => {
    console.error(error.message);
  });
