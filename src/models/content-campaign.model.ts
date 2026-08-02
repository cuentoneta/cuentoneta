/**
 * Tipo que representa los diferentes viewports soportados por la aplicación para las campañas de contenido, a fin de
 * proveer una experiencia responsive y adaptable para su visualización.
 */
export const ContentCampaignViewportKeys = ['xs', 'md'];
export type ContentCampaignViewport = (typeof ContentCampaignViewportKeys)[number];

/**
 * Constante que indica, para los viewports soportados, las dimensiones de las imágenes asociadas a las campañas de
 * contenido.
 */
export const viewportElementSizes = Object.freeze({
	xs: {
		imageWidth: 540,
		imageHeight: 220,
	},
	sm: {
		imageWidth: 1240,
		imageHeight: 360,
	},
	md: {
		imageWidth: 1240,
		imageHeight: 360,
	},
	lg: {
		imageWidth: 1240,
		imageHeight: 360,
	},
});

/**
 * Interface que define al objeto de dominio que representa una campaña de contenido en la plataforma.
 */
export interface ContentCampaign {
	title: string;
	slug: string;
	url: string;
	contents: {
		[key in ContentCampaignViewport]: {
			imageUrl: string;
			imageWidth: number;
			imageHeight: number;
		};
	};
}
