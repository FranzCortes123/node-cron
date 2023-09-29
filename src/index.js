const cron = require('node-cron');
const { exec } = require('child_process');
const { execSync } = require('child_process');



function runScript(scriptName) {
  const scriptPath = `./${scriptName}`;
  execSync(`railway run node ${scriptPath}`);
}


// Función para ejecutar un script
function runScript(scriptName) {
  const scriptPath = `./${scriptName}`;
  exec(`node ${scriptPath}`, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error al ejecutar ${scriptName}: ${error.message}`);
      return;
    }
    console.log(`Salida de ${scriptName}:\n${stdout}`);
  });
}

const scripts = ["city_movies_table.js", "moviesPerCity.js", "script_md.js", "cinemasCSV.js", "moviesCSV.js"];

// Ejecutar los scripts secuencialmente
async function runScripts() {
  for (const script of scripts) {
    await runScript(script);
  }
  console.log("Todos los scripts han sido ejecutados y los archivos han sido generados.");
}

// Ejecutar todos los scripts cada minuto (puedes ajustar la frecuencia según tus necesidades)
cron.schedule(`*/1 * * * *`, runScripts);
