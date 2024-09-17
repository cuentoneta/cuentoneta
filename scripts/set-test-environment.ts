/**
 * Script para generar el archivo de environment utilizado para el entorno de CI/CD.
 * Este script debe ejecutarse como paso previo a la compilación de la aplicación en el pipeline de Github Actions
 * (build step).
 *
 * Autor: @rolivencia
 */

// NodeJS
import { existsSync, mkdirSync, writeFile } from 'fs';
import ErrnoException = NodeJS.ErrnoException;

const dirPath = `src/app/environments`;
const targetPath = `${dirPath}/environment.ts`;

// Constantes para generar el archivo de environment
const environment = 'pipeline';
const apiUrl = 'http://localhost:4000/';

// Accede a las variables de entorno y genera un string
// correspondiente al objeto environment que utilizará Angular
const environmentFileContent = `
    export const environment = {
       environment: "${environment}",
       contentConfig: { 
        cards: []
       },
       website: "http://localhost:4000/",
       apiUrl: "${apiUrl}"
    };
`;

// En caso de que no exista el directorio environments, se lo crea
if (!existsSync(dirPath)) {
	mkdirSync(dirPath);
}

// Escribe el contenido en el archivo correspondiente environment.ts
writeFile(targetPath, environmentFileContent, { flag: 'w' }, function (err: ErrnoException | null) {
	if (err) {
		console.log(err);
		return;
	}
	console.log(`Variables de entorno escritas en ${targetPath}`);
	console.log('URL de API = ', apiUrl);
});
