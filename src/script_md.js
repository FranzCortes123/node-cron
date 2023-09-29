const axios = require('axios');
const fs = require('fs');
const path = require('path');

// URL de la API para obtener información de los teatros
const theatersUrl = "https://api.cinemark-core.com/vista/country/co/cities-theaters?$format=json&$select=ID,Name,PhoneNumber,Address1,Address2,Latitude,Longitude,City,LoyaltyCode";

// URL de la API para obtener información de las películas
const moviesUrl = "https://api.cinemark-core.com/vista/country/co/movies-billboard?$filter=(CinemaId eq '792' or CinemaId eq '790' or CinemaId eq '2424' or CinemaId eq '2421')&$format=json&companyId=5d9770721db034a0279ad989";

// Ruta completa al archivo MD en la carpeta 'generated'
const outputFilePath = path.join(__dirname, "generated", "infoCines.md");

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

    // Crear un array con el contenido MD
    const mdContentArray = premieres.map(movie => {
      const cast = movie.Cast || [];
      const directors = cast.filter(item => item.PersonType === 'Director').map(item => `${item.FirstName} ${item.LastName}`);
      const actors = cast.filter(item => item.PersonType === 'Actor').map(item => `${item.FirstName} ${item.LastName}`);

      // Obtener la calificación de TMDb
      const api_key = "9ca574fa8174f57ac91ef1df13bc8aaa";
      const cleanedTitle = movie.Title.replace(/\s*\(.*\)$/, '').trim();
      const tmdbSearchUrl = `https://api.themoviedb.org/3/search/movie?api_key=${api_key}&query=${cleanedTitle}`;

      return axios.get(tmdbSearchUrl)
        .then(responseTmdb => {
          const tmdbMovie = responseTmdb.data.results && responseTmdb.data.results[0];
          const calificacion = tmdbMovie ? tmdbMovie.vote_average : 'No disponible';

          return `# ${movie.Title} (${movie.TitleAlt})\n` +
            `## Plot / Summary / Synopsis\n${movie.Synopsis}\n` +
            `## Rating\n${movie.Rating} (${movie.RatingAlt})\n` +
            `## Calificación de TMDb\n${calificacion}\n` +
            `## Runtime\n${movie.RunTime}\n` +
            `## Trailer URL\nEl trailer de ${movie.Title} es ${movie.TrailerUrl}\n` +
            `## Cast\n${directors.map(director => `* Director: ${director}`).concat(actors.map(actor => `* Actor: ${actor}`)).join('\n')}\n\n`;
        });
    });

    // Escribir el contenido MD en el archivo
    return Promise.all(mdContentArray);
  }))
  .then(mdContentArray => {
    fs.writeFileSync(outputFilePath, mdContentArray.join('\n'), 'utf-8');
    console.log(`Archivo MD generado exitosamente en '${outputFilePath}'.`);
  })
  .catch(error => {
    console.error(error.message);
  });
