// Wrappers centralizados sobre la API de Vitest.
//
// Las reglas de ESLint (`viRestrictedSyntax` en `eslint.config.js`) prohíben usar `vi.*`
// directamente en los specs y obligan a pasar por estos helpers. Centralizar la API de
// test deja un único punto de adaptación si el runner cambia y mantiene los specs limpios.
//
// Este archivo es la ÚNICA excepción permitida al uso directo de `vi.*`.
import { vi } from 'vitest';

// Re-export del tipo `Mock` para que los specs casteen funciones auto-mockeadas sin importar
// directamente de 'vitest' (`as Mock`). No es un barrel: es parte del wrapper de test.
// eslint-disable-next-line no-barrel-files/no-barrel-files -- re-export de tipos del runner, no un barrel
export type { Mock, MockInstance } from 'vitest';

export const fn = vi.fn;
export const spyOn = vi.spyOn;

export const clearAllMocks = (): void => {
	vi.clearAllMocks();
};

export const resetAllMocks = (): void => {
	vi.resetAllMocks();
};

export const restoreAllMocks = (): void => {
	vi.restoreAllMocks();
};

export const useFakeTimers = (): void => {
	vi.useFakeTimers();
};

export const useRealTimers = (): void => {
	vi.useRealTimers();
};

export const advanceTimersByTime = (ms: number): void => {
	vi.advanceTimersByTime(ms);
};

export const advanceTimersByTimeAsync = (ms: number): Promise<void> =>
	vi.advanceTimersByTimeAsync(ms).then(() => undefined);

export const runOnlyPendingTimers = (): void => {
	vi.runOnlyPendingTimers();
};

export const setSystemTime = (time: number | Date): void => {
	vi.setSystemTime(time);
};
