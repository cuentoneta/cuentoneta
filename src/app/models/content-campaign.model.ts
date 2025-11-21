import { TextBlockContent } from '@models/block-content.model';

/**
 * Tipo que representa los diferentes viewports soportados por la aplicación para las campañas de contenido, a fin de
 * proveer una experiencia responsive y adaptable para su visualización.
 */
export const ContentCampaignViewportKeys = ['xs', 'md'];
export type ContentCampaignViewport = (typeof ContentCampaignViewportKeys)[number];

/**
 * Constante que indica, para los viewports soportados, las longitudes máximas asignables a los títulos y subtítulos
 * de las campañas de contenido y las dimensiones de las imágenes asociadas a cada una de ellas.
 */
export const viewportElementSizes = Object.freeze({
	xs: {
		imageWidth: 540,
		imageHeight: 220,
	},
	md: {
		imageWidth: 960,
		imageHeight: 280,
	},
});

/**
 * Interface que define al objeto de dominio que representa una campaña de contenido en la plataforma.
 */
export interface ContentCampaign {
	title: string;
	slug: string;
	description: TextBlockContent[];
	url: string;
	contents: {
		[key in ContentCampaignViewport]: {
			imageUrl: string;
			imageWidth: number;
			imageHeight: number;
		};
	};
}
