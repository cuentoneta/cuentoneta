import type { ImageValue, ValidationContext } from 'sanity';

import {
	type ContentCampaignViewport,
	ContentCampaignViewportKeys,
	viewportElementSizes,
} from '@models/content-campaign.model';

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

const isViewport = (segment: unknown): segment is ContentCampaignViewport =>
	ContentCampaignViewportKeys.some((key) => key === segment);

// Las campañas ocupan un espacio fijo en la home, así que la imagen tiene que traer exactamente el
// tamaño del viewport al que corresponde; validarlo en el Studio evita que un desajuste llegue al sitio.
export function campaignImageSizeValidation(image: ImageValue | undefined, context: ValidationContext): true | string {
	// El viewport es el penúltimo segmento del path del campo (`<viewport>.image`) y llega sin tipar: se
	// valida contra las claves declaradas para no indexar el mapa de tamaños con una clave cualquiera.
	const viewport = context.path?.[context.path.length - 2];
	const viewportSize = isViewport(viewport) ? viewportElementSizes[viewport] : undefined;

	if (!image?.asset?._ref || !viewportSize) return true;

	const { dimensions } = decodeAssetId(image.asset._ref);

	return (
		(dimensions.width === viewportSize.imageWidth && dimensions.height === viewportSize.imageHeight) ||
		`La imagen debe tener un tamaño estricto de ${viewportSize.imageWidth} x ${viewportSize.imageHeight} px. El tamaño de la imagen actual es de ${dimensions.width} x ${dimensions.height} px`
	);
}
