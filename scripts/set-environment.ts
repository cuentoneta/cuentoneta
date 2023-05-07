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

import { writeFile, existsSync, mkdirSync } from 'fs';
import yargs from 'yargs/yargs';
import * as dotenv from 'dotenv';
import ErrnoException = NodeJS.ErrnoException;

// Leer variables de entorno desde .env
dotenv.config();

const argv = yargs(process.argv.slice(2))
  .options({
    environment: { type: 'string', default: 'dev' },
  })
  .parseSync();

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
   contentConfig: ${process.env['CUENTONETA_CONTENT']},
   website: "${process.env['CUENTONETA_WEBSITE']}",
   apiUrl: "${process.env['CUENTONETA_API_URL'] ?? ''}"
};
`;

// En caso de que no exista el directorio environments, se lo crea
if (!existsSync(dirPath)) {
  mkdirSync(dirPath);
}

// Escribe el contenido en el archivo correspondiente environment.ts
writeFile(
  targetPath,
  environmentFileContent,
  { flag: 'w' },
  function (err: ErrnoException | null) {
    if (err) {
      console.log(err);
      return;
    }
    console.log(`Variables de entorno escritas en ${targetPath}`);
  }
);
