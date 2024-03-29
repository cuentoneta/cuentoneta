import { execSync } from 'child_process';

// Define scripts de npm a ejecutar
const environment = process.env['NODE_ENV'] ?? 'development';

const devConfigScript = "pnpm run config:dev";
const prodConfigScript = "pnpm run config:production";

console.log(`Ejecutando script de configuración en ambiente ${environment}...`);

if(environment !== 'production'){
    execSync(devConfigScript, { stdio: 'inherit' });
}
else {
    execSync(prodConfigScript, { stdio: 'inherit' });
}
