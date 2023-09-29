    const axios = require('axios');
const fs = require('fs');
const path = require('path');

// URL de la API para obtener información de los teatros
const theatersUrl = "https://api.cinemark-core.com/vista/country/co/cities-theaters?$format=json&$select=ID,Name,PhoneNumber,Address1,Address2,Latitude,Longitude,City,LoyaltyCode";

axios.get(theatersUrl)
  .then(responseTheaters => {
    if (responseTheaters.status !== 200) {
      throw new Error("Error al realizar la solicitud a la API.");
    }

    const data = responseTheaters.data;

    // Inicializar una lista para almacenar los datos de ID y Nombre de los teatros
    const theatersData = [];

    // Iterar a través de los datos anidados
    data.forEach(cityData => {
      const theaters = cityData.Theaters || [];
      theaters.forEach(theater => {
        const theaterId = theater.ID;
        const theaterName = theater.Name.toLowerCase();
        if (theaterId && theaterName) {
          theatersData.push({ "ID": theaterId, "Nombre": theaterName });
        }
      });
    });

    // Ruta completa al archivo CSV en la carpeta 'generated'
    const outputFilePath = path.join(__dirname, "generated", "theaters.csv");

    // Crear un archivo CSV con los datos de ID y Nombre de los teatros
    const csvContent = `${Object.keys(theatersData[0]).join(',')}\n${theatersData.map(theater => Object.values(theater).join(',')).join('\n')}`;

    fs.writeFileSync(outputFilePath, csvContent, 'utf-8');

    console.log(`Archivo CSV generado exitosamente en '${outputFilePath}'.`);
  })
  .catch(error => {
    console.error(error.message);
  });
