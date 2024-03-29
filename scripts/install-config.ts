import { execSync } from 'child_process';

// Define scripts de npm a ejecutar
const environment = process.env['NODE_ENV'];

const devConfigScript = "node -r ts-node/register --env-file=.env ./scripts/set-environment.ts";
const prodConfigScript = "ts-node ./scripts/set-environment.ts";

console.log(`Ejecutando script de configuración en ambiente ${environment}...`);

if(environment !== 'production'){
    execSync(devConfigScript, { stdio: 'inherit' });
}
else {
    execSync(prodConfigScript, { stdio: 'inherit' });
}
