// El Studio no arranca sin projectId, así que una variable faltante tiene que fallar nombrándose: el
// error nativo de Sanity ante un projectId vacío no dice cuál es la variable ni de dónde sale.
export function requireEnv(name: string): string {
	const value = process.env[name];

	if (!value) {
		throw new Error(`Falta la variable de entorno ${name}. Corré "pnpm run config" en cms/ o definila en cms/.env.`);
	}

	return value;
}
