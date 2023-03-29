/**
 * Script para generar el archivo de environment utilizado por Angular.
 * Este script debe ejecutarse como paso previo a la compilación de la aplicación
 * (build step).
 *
 * Para mejorar los tiempos de carga del paint inicial de la aplicación, la con-
 * figuración de contenido se obtiene desde las variables de entorno y se deposita
 * en el archivo de environment.ts, el cual es compilado junto con la aplicación.
 *
 * Autor: @rolivencia
 */

// ToDo: Migrar a imports
const { writeFile, existsSync, mkdirSync } = require('fs');
const { argv } = require('yargs');

// Leer variables de entorno desde .env
require('dotenv').config();

// Lee la línea de comandos pasada con yargs
// -- environment: nombre del entorno donde se ejecuta el script
const environment = argv.environment;
const isProduction = environment === 'prod';

const dirPath: string = `src/app/environments`;
const targetPath = `${dirPath}/environment.ts`;

// Accede a las variables de entorno y genera un string
// correspondiente al objeto environment que utilizará Angular
const environmentFileContent = `
export const environment = {
   production: ${isProduction},
   contentConfig: ${process.env['CUENTONETA_CONTENT']}
};
`;

// En caso de que no exista el directorio environments, se lo crea
if (!existsSync(dirPath)) {
    mkdirSync(dirPath);
}

// Escribe el contenido en el archivo correspondiente environment.ts
writeFile(targetPath, environmentFileContent, { flag: 'wx+' }, function (err: any) {
    if (err) {
        console.log(err);
        return;
    }

    console.log(`Wrote variables to ${targetPath}`);
});
