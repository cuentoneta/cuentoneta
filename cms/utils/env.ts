// El valor entra por parámetro y no se lee acá con process.env[name]: el bundler del Studio inyecta las
// variables con el `define` de Vite, que reemplaza la expresión `process.env.LO_QUE_SEA` de forma
// literal. Un acceso por índice computado no se reemplaza, queda leyendo un objeto vacío en el browser
// y el Studio no arranca — sin que ningún gate lo note, porque en Node process.env sí existe.
export function requireEnv(name: string, value: string | undefined): string {
	if (!value) {
		throw new Error(`Falta la variable de entorno ${name}. Corré "pnpm run config" en cms/ o definila en cms/.env.`);
	}

	return value;
}
