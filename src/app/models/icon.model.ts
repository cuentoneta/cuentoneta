import {
	faSolidAddressBook,
	faSolidBook,
	faSolidBookBookmark,
	faSolidEnvelope,
	faSolidGlobe,
	faSolidMedal,
	faSolidMicrophoneLines,
	faSolidPeopleGroup,
	faSolidPlay,
	faSolidStar,
	faSolidTrophy,
} from '@ng-icons/font-awesome/solid';
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

export interface Icon {
	name: string;
	provider: string;
}

// TODO: #535 - Reemplazar estas interfaces por uso directo de íconos cargados de manera dinámica
export interface IconMapper {
	name: string;
	ngIconsName: Record<string, string>;
}

// TODO: #535 - Reemplazar estas interfaces por uso directo de íconos cargados de manera dinámica
export const iconMappers: IconMapper[] = [
	{
		name: 'curaduria',
		ngIconsName: { faSolidStar },
	},
	{
		name: 'x-spaces',
		ngIconsName: { faSolidMicrophoneLines },
	},
	{
		name: 'certamen',
		ngIconsName: { faSolidTrophy },
	},
	{
		name: 'colaborativa',
		ngIconsName: { faSolidPeopleGroup },
	},
	{
		name: 'antologia',
		ngIconsName: { faSolidBookBookmark },
	},
	{
		name: 'tertulia-literaria',
		ngIconsName: { faSolidBook },
	},
	{
		name: 'video',
		ngIconsName: { faSolidPlay },
	},
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
		name: 'sitio-web',
		ngIconsName: { faSolidGlobe },
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
