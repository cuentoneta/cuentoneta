/**
 * La etapa que vuelve legible el corpus. Existe como módulo aparte porque es la única que necesita un
 * bundler: el resto del generador trabaja con valores ya cargados y no debería saber que Vite existe.
 *
 * Aísla además el ciclo de vida del servidor detrás de un callback: el `finally` lo cierra pase lo que
 * pase, y sin eso cualquier `throw` de las etapas siguientes dejaría el proceso colgado.
 */
import { createServer, type ViteDevServer } from 'vite';

/**
 * El corpus no se puede cargar con `tsx`: importa la prosa de cada obra con el sufijo `?raw`, que solo
 * resuelve un bundler. Se levanta Vite en modo middleware para reusar su resolución y su pipeline de
 * transformación, que es lo mismo que hace Vitest para correr los specs que consumen estas fixtures.
 *
 * `resolve.tsconfigPaths` nativo y no el plugin `vite-tsconfig-paths`, por el mismo motivo que
 * `vitest.config.ts`: el plugin recorre las copias del repo bajo `.claude/worktrees/` y aborta si el
 * tsconfig de cualquiera de ellas no le parsea.
 */
export async function withCorpus<T>(use: (load: (path: string) => Promise<unknown>) => Promise<T>): Promise<T> {
	const server: ViteDevServer = await createServer({
		configFile: false,
		resolve: { tsconfigPaths: true },
		server: { middlewareMode: true },
		appType: 'custom',
		logLevel: 'warn',
	});

	try {
		return await use((path) => server.ssrLoadModule(path));
	} finally {
		await server.close();
	}
}
