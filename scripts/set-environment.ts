/**
 * Script para generar el archivo de environment utilizado por Angular.
 * Este script debe ejecutarse como paso previo a la compilación de la aplicación
 * (build step).
 *
 * En caso de que no exista el archivo .env en la raíz del proyecto, se creará uno
 * con las variables por defecto, las cuales se encuentran descriptas en la constante
 * defaultEnvVariables.
 *
 * Autor: @rolivencia
 */

// NodeJS & env
import { writeFileSync, existsSync, mkdirSync, writeFile } from 'fs';
import ErrnoException = NodeJS.ErrnoException;
import { TEnvironmentType } from './vercel-environments.model';
import { join } from 'node:path';

// Constantes para generar el archivo de environment
const environment: TEnvironmentType = (process.env['VERCEL_ENV'] as TEnvironmentType) ?? 'development';
const dirPath = `src/app/environments`;
const targetPath = `${dirPath}/environment.ts`;

const defaultEnvVariables = {
	SANITY_STUDIO_DATASET: 'development',
	SANITY_STUDIO_PROJECT_ID: 's4dbqkc5',
};

// Crea un archivo .env con las variables por defecto si no existe
function createAppEnvFile() {
	const envFilePath = join(process.cwd(), '.env');
	if (existsSync(envFilePath)) {
		console.log('El archivo .env de la app ya existe, se saltea el paso de creación.');
		return;
	}

	const fileContents = Object.entries(defaultEnvVariables)
		.map(([key, value]) => `${key}=${value}`)
		.join('\n');

	writeFileSync(envFilePath, fileContents);
	console.log('Creado archivo .env para la app con variables por defecto.');
}

function createSanityStudioEnvFile() {
	const envFilePath = join(process.cwd(), 'cms/.env');
	if (existsSync(envFilePath)) {
		console.log('El archivo .env de Sanity Studio ya existe, se saltea el paso de creación.');
		return;
	}

	const fileContents = Object.entries(defaultEnvVariables)
		.map(([key, value]) => `${key}=${value}`)
		.join('\n');

	writeFileSync(envFilePath, fileContents);
	console.log('Creado archivo .env para Sanity Studio con variables por defecto.');
}

if (environment === 'development') {
	createAppEnvFile();
	createSanityStudioEnvFile();
}

// Genera una ruta absoluta a la API en función del ambiente
const generateApiUrl = (environment: TEnvironmentType): string => {
	let url = '/';

	const branchUrl: string = process.env['VERCEL_BRANCH_URL'] as string;
	const stagingBranchUrl = 'cuentoneta-git-develop-cuentoneta.vercel.app';

	// Asigna URL en base a la URL de la rama de Vercel para ambiente staging
	if (branchUrl === stagingBranchUrl) {
		url = `https://staging.cuentoneta.ar/`;
	}
	// Lectura de la variable de entorno de Vercel para deployments de preview fuera de staging
	else if (environment === 'preview') {
		url = `https://${process.env['VERCEL_BRANCH_URL']}/`;
	}
	// Asigna URL en base a variables de entorno para producción y staging (preview develop)
	else if (environment === 'production') {
		url = `https://${process.env['VERCEL_PROJECT_PRODUCTION_URL']}/` as string;
	}

	return url;
};

const apiUrl = generateApiUrl(environment);
// Accede a las variables de entorno y genera un string
// correspondiente al objeto environment que utilizará Angular
const environmentFileContent = `
    export const environment = {
       environment: "${environment}",
       website: "${process.env['VERCEL_PROJECT_PRODUCTION_URL'] ?? 'https://cuentoneta.ar/'}",
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
	console.log('Ambiente de Vercel - VERCEL_ENV = ', process.env['VERCEL_ENV']);
	console.log('URL de branch de Vercel - VERCEL_BRANCH_URL = ', process.env['VERCEL_BRANCH_URL']);
	console.log('URL de API = ', apiUrl);
});
