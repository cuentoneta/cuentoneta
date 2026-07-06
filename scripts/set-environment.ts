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
// `APP_ENV` es el flag de entorno propio de la app (host-agnóstico), reemplaza a `VERCEL_TARGET_ENV`.
const environment: TEnvironmentType = (process.env['APP_ENV'] as TEnvironmentType) ?? 'development';
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

// La API se consume con URL relativa (`/api/...`): el SSR la resuelve contra el origen del
// request (self-fetch same-origin), tanto en el server Node como en Cloudflare Workers. Evita
// depender de una URL pública por-plataforma (VERCEL_PROJECT_PRODUCTION_URL, etc.).
const apiUrl = '/';

// URL absoluta del sitio para canónicas/OG. Host-agnóstica vía `SITE_URL`; en dev cae a '/'.
const website = environment === 'development' ? '/' : (process.env['SITE_URL'] ?? 'https://www.cuentoneta.ar/');

const exportedEnvironment = {
	environment: `${environment ?? 'development'}`,
	website,
	apiUrl,
	clarityProjectId: '',
};

// Chequea si existe la variable de entorno para analytics de Microsoft Clarity
if (process.env['CLARITY_PROJECT_ID']) {
	exportedEnvironment.clarityProjectId = `${process.env['CLARITY_PROJECT_ID']}`;
}

const environmentFileContent = `
    export const environment = ${JSON.stringify(exportedEnvironment)};
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
	console.log('APP_ENV = ', process.env['APP_ENV']);
	console.log('SITE_URL = ', process.env['SITE_URL']);
	console.log('apiUrl = ', apiUrl, '| website = ', website);
});
