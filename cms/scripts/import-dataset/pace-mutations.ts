/** Las dos dependencias de tiempo del ritmo, inyectables para que los tests no esperen de verdad. */
export interface Clock {
	now(): number;
	sleep(milliseconds: number): Promise<void>;
}

/** Corre la tarea cuando le toca su turno: dos tareas nunca arrancan con menos de un intervalo entre sí. */
export type Pace = <T>(task: () => Promise<T>) => Promise<T>;

/**
 * Espacia el arranque de las tareas. No limita cuántas corren a la vez, sino cuántas arrancan por
 * unidad de tiempo, que es lo que mide el límite de Sanity.
 */
export function createPace(interval: `${number}ms`, clock: Clock): Pace {
	const intervalMs = Number.parseInt(interval, 10);
	let nextStart = 0;
	return async (task) => {
		const now = clock.now();
		const start = Math.max(now, nextStart);
		nextStart = start + intervalMs;
		if (start > now) {
			await clock.sleep(start - now);
		}
		return task();
	};
}

type Method = (...args: unknown[]) => unknown;

// Los builders de Sanity encadenan devolviendo `this`: si ese `this` no se vuelve a envolver, el
// `commit` del final se llama sobre el builder original y escapa al ritmo.
function paceCommit<T extends object>(builder: T, pace: Pace): T {
	const proxy: T = new Proxy(builder, {
		get(target, property) {
			const value: unknown = Reflect.get(target, property);
			if (typeof value !== 'function') {
				return value;
			}
			const method = value as Method;
			if (property === 'commit') {
				return (...args: unknown[]) => pace(() => Promise.resolve(method.apply(target, args)));
			}
			return (...args: unknown[]) => {
				const result = method.apply(target, args);
				return result === target ? proxy : result;
			};
		},
	});
	return proxy;
}

/**
 * Devuelve el mismo cliente, con cada `commit` de una transacción o de un patch pasado por `pace`.
 * Son las únicas vías por las que `@sanity/import` muta documentos, y las mutaciones son las que
 * Sanity limita por IP. Los clientes que deriva (`withConfig`, `clone`) conservan el ritmo.
 */
export function paceMutations<T extends object>(client: T, pace: Pace): T {
	return new Proxy(client, {
		get(target, property) {
			const value: unknown = Reflect.get(target, property);
			if (typeof value !== 'function') {
				return value;
			}
			const method = value as Method;
			return (...args: unknown[]) => {
				const result = method.apply(target, args);
				if (property === 'transaction' || property === 'patch') {
					return paceCommit(result as object, pace);
				}
				if (property === 'withConfig' || property === 'clone') {
					return paceMutations(result as object, pace);
				}
				return result;
			};
		},
	});
}
