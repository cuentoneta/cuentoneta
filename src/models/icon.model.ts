import { faSolidAddressBook, faSolidEnvelope, faSolidGlobe, faSolidMedal } from '@ng-icons/font-awesome/solid';
import {
	simpleBlogger,
	simpleDiscord,
	simpleSubstack,
	simpleWattpad,
	simpleWikisource,
	simpleX,
	simpleYoutube,
} from '@ng-icons/simple-icons';
import { faBrandAmazon, faBrandInstagram, faBrandWikipediaW } from '@ng-icons/font-awesome/brands';

export interface IconMapper {
	name: string;
	ngIconsName: Record<string, string>;
}

/**
 * Traduce el slug de un `resourceType` al ícono de `@ng-icons` que lo representa. Lo consume
 * `ResourceComponent`, el único lugar del sitio donde se pinta un ícono resuelto por slug.
 *
 * El mapa está hardcodeado porque los íconos de `@ng-icons` se importan como símbolos: servirlos desde
 * el CMS exige resolverlos dinámicamente en tiempo de ejecución, que es la dirección a futuro pero no
 * está implementada. Hasta entonces, cada entrada tiene que corresponder a un `resourceType` cargado —
 * una entrada que ningún documento indexa es peso muerto que nadie detecta, porque el componente
 * simplemente no pinta ícono cuando no encuentra el slug.
 */
export const iconMappers: IconMapper[] = [
	{
		name: 'wattpad',
		ngIconsName: { simpleWattpad },
	},
	{
		name: 'wikipedia',
		ngIconsName: { faBrandWikipediaW },
	},
	{
		name: 'recurso-original',
		ngIconsName: { faSolidMedal },
	},
	{
		name: 'web-personal',
		ngIconsName: { faSolidGlobe },
	},
	{
		name: 'biografia-del-autor-en-sitio-web',
		ngIconsName: { faSolidAddressBook },
	},
	{
		name: 'instagram',
		ngIconsName: { faBrandInstagram },
	},
	{
		name: 'wikisource',
		ngIconsName: { simpleWikisource },
	},
	{
		name: 'discord',
		ngIconsName: { simpleDiscord },
	},
	{
		name: 'substack',
		ngIconsName: { simpleSubstack },
	},
	{
		name: 'blogspot',
		ngIconsName: { simpleBlogger },
	},
	{
		name: 'email',
		ngIconsName: { faSolidEnvelope },
	},
	{
		name: 'amazon',
		ngIconsName: { faBrandAmazon },
	},
	{
		name: 'youtube',
		ngIconsName: { simpleYoutube },
	},
	{
		name: 'x',
		ngIconsName: { simpleX },
	},
];
