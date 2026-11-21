/** Devuelve el dataset si puede recibir un import; lanza si falta o si es production, el origen del sync. */
export function assertTargetDataset(dataset: string | undefined): string {
	if (!dataset || dataset === 'production') {
		throw new Error(`Destino inválido: "${dataset ?? ''}". production es el origen del sync y nunca se escribe.`);
	}
	return dataset;
}
