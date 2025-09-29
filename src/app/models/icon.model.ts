export interface Icon {
	name: string;
	provider: string;
}

// TODO: Replace this interface with direct uses of ngIcons
export interface IconMapper {
	name: string;
	ngIconsName: string;
}

// TODO: Replace this mapper with direct uses of ngIcons
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
		name: 'mail',
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
