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
import { writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import type { TEnvironmentType } from '../scripts/vercel-environments.model';

export const defaultEnvVariables = {
	SANITY_STUDIO_DATASET: 'development',
	SANITY_STUDIO_PROJECT_ID: 's4dbqkc5',
};

// Constantes para generar el archivo de environment
const environment: TEnvironmentType = (process.env['VERCEL_ENV'] as TEnvironmentType) ?? 'development';

function createSanityStudioEnvFile() {
	const envFilePath = join(process.cwd(), '.env');
	console.log(envFilePath, 'Path actual');
	if (existsSync(envFilePath)) {
		console.log('El archivo .env de Sanity Studio ya existe, se saltea el paso de creación 👻.');
		return;
	}

	const fileContents = Object.entries(defaultEnvVariables)
		.map(([key, value]) => `${key}=${value}`)
		.join('\n');

	writeFileSync(envFilePath, fileContents);
	console.log('Creado archivo .env para Sanity Studio con variables por defecto 🚀.');
}

if (environment === 'development') {
	createSanityStudioEnvFile();
}
