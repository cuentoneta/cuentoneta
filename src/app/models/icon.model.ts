export interface Icon {
	name: string;
	provider: string;
}

// TODO: #535 - Reemplazar estas interfaces por uso directo de íconos cargados de manera dinámica
export interface IconMapper {
	name: string;
	ngIconsName: string;
}

// TODO: #535 - Reemplazar estas interfaces por uso directo de íconos cargados de manera dinámica
export const iconMappers: IconMapper[] = [
	{
		name: 'curaduria',
		ngIconsName: 'faSolidStar',
	},
	{
		name: 'x-spaces',
		ngIconsName: 'faSolidMicrophoneLines',
	},
	{
		name: 'ingles',
		ngIconsName: 'faSolidGlobe',
	},
	{
		name: 'certamen',
		ngIconsName: 'faSolidTrophy',
	},
	{
		name: 'colaborativa',
		ngIconsName: 'faSolidPeopleGroup',
	},
	{
		name: 'antologia',
		ngIconsName: 'faSolidBookBookmark',
	},
	{
		name: 'tertulia-literaria',
		ngIconsName: 'faSolidBook',
	},
	{
		name: 'video',
		ngIconsName: 'faSolidPlay',
	},
	{
		name: 'wattpad',
		ngIconsName: 'simpleWattpad',
	},
	{
		name: 'wikipedia',
		ngIconsName: 'faBrandWikipediaW',
	},
	{
		name: 'recurso-original',
		ngIconsName: 'faSolidMedal',
	},
	{
		name: 'sitio-web',
		ngIconsName: 'faSolidGlobe',
	},
	{
		name: 'web-personal',
		ngIconsName: 'faSolidGlobe',
	},
	{
		name: 'biografia-del-autor-en-sitio-web',
		ngIconsName: 'faSolidAddressBook',
	},
	{
		name: 'instagram',
		ngIconsName: 'faBrandInstagram',
	},
	{
		name: 'wikisource',
		ngIconsName: 'simpleWikisource',
	},
	{
		name: 'discord',
		ngIconsName: 'simpleDiscord',
	},
	{
		name: 'substack',
		ngIconsName: 'simpleSubstack',
	},
	{
		name: 'blogspot',
		ngIconsName: 'simpleBlogger',
	},
	{
		name: 'email',
		ngIconsName: 'faSolidEnvelope',
	},
	{
		name: 'amazon',
		ngIconsName: 'faBrandAmazon',
	},
	{
		name: 'youtube',
		ngIconsName: 'simpleYoutube',
	},
	{
		name: 'x',
		ngIconsName: 'simpleX',
	},
];
