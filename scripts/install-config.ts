import { execSync } from 'child_process';
import { TEnvironmentType } from './vercel-environments.model';

// Define scripts de npm a ejecutar
const environment: TEnvironmentType = (process.env['VERCEL_ENV'] as TEnvironmentType) ?? 'development';

const devConfigScript = 'pnpm run config:dev';
const prodConfigScript = 'pnpm run config:production';

console.log(`Ejecutando script de configuración en ambiente ${environment}...`);

if (environment === 'development') {
	execSync(devConfigScript, { stdio: 'inherit' });
} else {
	execSync(prodConfigScript, { stdio: 'inherit' });
}
