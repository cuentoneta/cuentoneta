// Los ids de asset de Sanity codifican las dimensiones en el propio id (image-<hash>-<ancho>x<alto>-<formato>),
// así que la validación de tamaño puede leerlas sin pedir el documento del asset.
const imageResourcePattern = /^image-([a-f\d]+)-(\d+x\d+)-(\w+)$/;

export type DecodedAssetId = {
	assetId: string;
	dimensions: { width: number; height: number };
	format: string;
};

export function decodeAssetId(id: string): DecodedAssetId {
	const match = imageResourcePattern.exec(id);

	if (!match) {
		throw new Error(`El id de asset "${id}" no tiene el formato image-<hash>-<ancho>x<alto>-<formato>.`);
	}

	const [, assetId, dimensions, format] = match;
	const [width, height] = dimensions.split('x').map((value: string) => parseInt(value, 10));

	return { assetId, dimensions: { width, height }, format };
}
