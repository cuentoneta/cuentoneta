import { ClarityApiResponse } from '../../api/_utils/clarity.utils';

export const fetchClarityData = async (): Promise<ClarityApiResponse> => {
	return clarityMockResponse;
};

const clarityMockResponse: ClarityApiResponse = [
	{
		metricName: 'DeadClickCount',
		information: [
			{
				sessionsCount: '239',
				sessionsWithMetricPercentage: 15.48,
				sessionsWithoutMetricPercentage: 84.52,
				pagesViews: '42',
				subTotal: '95',
			},
		],
	},
	{
		metricName: 'ExcessiveScroll',
		information: [
			{
				sessionsCount: '239',
				sessionsWithMetricPercentage: 0,
				sessionsWithoutMetricPercentage: 100,
				pagesViews: '0',
				subTotal: '0',
			},
		],
	},
	{
		metricName: 'RageClickCount',
		information: [
			{
				sessionsCount: '239',
				sessionsWithMetricPercentage: 0.42,
				sessionsWithoutMetricPercentage: 99.58,
				pagesViews: '1',
				subTotal: '1',
			},
		],
	},
	{
		metricName: 'QuickbackClick',
		information: [
			{
				sessionsCount: '239',
				sessionsWithMetricPercentage: 2.93,
				sessionsWithoutMetricPercentage: 97.07,
				pagesViews: '17',
				subTotal: '17',
			},
		],
	},
	{
		metricName: 'ScriptErrorCount',
		information: [
			{
				sessionsCount: '239',
				sessionsWithMetricPercentage: 0,
				sessionsWithoutMetricPercentage: 100,
				pagesViews: '0',
				subTotal: '0',
			},
		],
	},
	{
		metricName: 'ErrorClickCount',
		information: [
			{
				sessionsCount: '239',
				sessionsWithMetricPercentage: 0,
				sessionsWithoutMetricPercentage: 100,
				pagesViews: '0',
				subTotal: '0',
			},
		],
	},
	{
		metricName: 'ScrollDepth',
		information: [
			{
				averageScrollDepth: 55.53,
			},
		],
	},
	{
		metricName: 'Traffic',
		information: [
			{
				totalSessionCount: '239',
				totalBotSessionCount: '14',
				distinctUserCount: '195',
				pagesPerSessionPercentage: 1.8841698841698842,
			},
		],
	},
	{
		metricName: 'EngagementTime',
		information: [
			{
				totalTime: '247',
				activeTime: '120',
			},
		],
	},
	{
		metricName: 'Browser',
		information: [
			{
				name: 'ChromeMobile',
				sessionsCount: '117',
			},
			{
				name: 'Chrome',
				sessionsCount: '69',
			},
			{
				name: 'MobileSafari',
				sessionsCount: '24',
			},
			{
				name: 'Edge',
				sessionsCount: '18',
			},
			{
				name: 'Firefox',
				sessionsCount: '4',
			},
			{
				name: 'Opera',
				sessionsCount: '4',
			},
			{
				name: 'Other',
				sessionsCount: '1',
			},
			{
				name: 'Safari',
				sessionsCount: '1',
			},
			{
				name: 'SamsungInternet',
				sessionsCount: '1',
			},
		],
	},
	{
		metricName: 'Device',
		information: [
			{
				name: 'Mobile',
				sessionsCount: '143',
			},
			{
				name: 'PC',
				sessionsCount: '91',
			},
			{
				name: 'Tablet',
				sessionsCount: '5',
			},
		],
	},
	{
		metricName: 'OS',
		information: [
			{
				name: 'Android',
				sessionsCount: '117',
			},
			{
				name: 'Windows',
				sessionsCount: '76',
			},
			{
				name: 'IOS',
				sessionsCount: '31',
			},
			{
				name: 'MacOSX',
				sessionsCount: '9',
			},
			{
				name: 'Linux',
				sessionsCount: '6',
			},
		],
	},
	{
		metricName: 'Country',
		information: [
			{
				name: 'Argentina',
				sessionsCount: '102',
			},
			{
				name: 'Mexico',
				sessionsCount: '34',
			},
			{
				name: 'Spain',
				sessionsCount: '28',
			},
			{
				name: 'Colombia',
				sessionsCount: '23',
			},
			{
				name: 'Ecuador',
				sessionsCount: '9',
			},
			{
				name: 'Costa Rica',
				sessionsCount: '6',
			},
			{
				name: 'Uruguay',
				sessionsCount: '6',
			},
			{
				name: 'United States',
				sessionsCount: '6',
			},
			{
				name: 'Peru',
				sessionsCount: '4',
			},
			{
				name: 'Brazil',
				sessionsCount: '4',
			},
		],
	},
	{
		metricName: 'PageTitle',
		information: [
			{
				name: 'El Huevo - Andy Weir',
				sessionsCount: '33',
			},
			{
				name: 'La Cuentoneta',
				sessionsCount: '16',
			},
			{
				name: 'El Huevo - Andy Weir | La Cuentoneta',
				sessionsCount: '11',
			},
			{
				name: 'Te Digo Más - Roberto Fontanarrosa',
				sessionsCount: '10',
			},
			{
				name: 'No Moriré del Todo - Guadalupe Dueñas',
				sessionsCount: '7',
			},
			{
				name: 'La Bestia que Gritaba Amor en el Corazón del Universo - Harlan Ellison',
				sessionsCount: '7',
			},
			{
				name: 'La Cuentoneta 1.0 | La Cuentoneta',
				sessionsCount: '7',
			},
			{
				name: 'Dos Suicidios - Fiódor Dostoievski | La Cuentoneta',
				sessionsCount: '6',
			},
			{
				name: 'La cabeza entre los lirios - Leonardo Castellani',
				sessionsCount: '6',
			},
			{
				name: 'Relato de un Utilero - Roberto Fontanarrosa',
				sessionsCount: '6',
			},
		],
	},
	{
		metricName: 'ReferrerUrl',
		information: [
			{
				name: 'https://www.google.com/',
				sessionsCount: '162',
			},
			{
				name: null,
				sessionsCount: '43',
			},
			{
				name: 'https://www.bing.com/',
				sessionsCount: '13',
			},
			{
				name: 'https://www.cuentoneta.ar/storylist/ciudades-campos-pueblos-islas',
				sessionsCount: '9',
			},
			{
				name: 'https://duckduckgo.com/',
				sessionsCount: '4',
			},
			{
				name: 'http://localhost:4200/storylist/borges-en-twitter-spaces',
				sessionsCount: '2',
			},
			{
				name: 'https://www.cuentoneta.ar/story/yuki-onna-la-mujer-de-nieve?navigation=storylist&navigationSlug=cuentos-de-terror-de-alberto-laiseca',
				sessionsCount: '2',
			},
			{
				name: 'https://www.facebook.com/',
				sessionsCount: '2',
			},
			{
				name: 'https://www.cuentoneta.ar/story/algunas-peculiaridades-de-los-ojos?navigation=storylist&navigationSlug=verano-2022',
				sessionsCount: '1',
			},
			{
				name: 'http://localhost:4200/storylist/textos-de-primavera',
				sessionsCount: '1',
			},
		],
	},
	{
		metricName: 'PopularPages',
		information: [
			{
				url: 'https://www.cuentoneta.ar/story/el-huevo',
				visitsCount: '44',
			},
			{
				url: 'https://www.cuentoneta.ar/story',
				visitsCount: '16',
			},
			{
				url: 'https://www.cuentoneta.ar/home',
				visitsCount: '15',
			},
			{
				url: 'https://www.cuentoneta.ar/story/te-digo-mas',
				visitsCount: '13',
			},
			{
				url: 'https://www.cuentoneta.ar/story/no-morire-del-todo',
				visitsCount: '11',
			},
			{
				url: 'https://www.cuentoneta.ar/story/dos-suicidios',
				visitsCount: '11',
			},
			{
				url: 'https://www.cuentoneta.ar/story/el-puente-de-arena',
				visitsCount: '9',
			},
			{
				url: 'https://www.cuentoneta.ar/story/la-bestia-que-gritaba-amor-en-el-corazon-del-universo',
				visitsCount: '8',
			},
			{
				url: 'https://www.cuentoneta.ar/story/relato-de-un-utilero',
				visitsCount: '8',
			},
			{
				url: 'https://www.cuentoneta.ar/storylist/verano-2022',
				visitsCount: '7',
			},
		],
	},
];
