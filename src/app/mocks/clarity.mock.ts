import { ClarityApiResponse } from '../../api/_utils/clarity.utils';

export const fetchClarityData = async (): Promise<ClarityApiResponse> => {
	return clarityMockResponse;
};

const clarityMockResponse: ClarityApiResponse = [
	{
		metricName: 'DeadClickCount',
		information: [
			{
				sessionsCount: '209',
				sessionsWithMetricPercentage: 19.62,
				sessionsWithoutMetricPercentage: 80.38,
				pagesViews: '46',
				subTotal: '108',
			},
		],
	},
	{
		metricName: 'ExcessiveScroll',
		information: [
			{
				sessionsCount: '209',
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
				sessionsCount: '209',
				sessionsWithMetricPercentage: 0.96,
				sessionsWithoutMetricPercentage: 99.04,
				pagesViews: '2',
				subTotal: '4',
			},
		],
	},
	{
		metricName: 'QuickbackClick',
		information: [
			{
				sessionsCount: '209',
				sessionsWithMetricPercentage: 2.39,
				sessionsWithoutMetricPercentage: 97.61,
				pagesViews: '10',
				subTotal: '10',
			},
		],
	},
	{
		metricName: 'ScriptErrorCount',
		information: [
			{
				sessionsCount: '209',
				sessionsWithMetricPercentage: 0.48,
				sessionsWithoutMetricPercentage: 99.52,
				pagesViews: '1',
				subTotal: '5',
			},
		],
	},
	{
		metricName: 'ErrorClickCount',
		information: [
			{
				sessionsCount: '209',
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
				averageScrollDepth: 60.99,
			},
		],
	},
	{
		metricName: 'Traffic',
		information: [
			{
				totalSessionCount: '209',
				totalBotSessionCount: '19',
				distinctUserCount: '191',
				pagesPerSessionPercentage: 1.420849420849421,
			},
		],
	},
	{
		metricName: 'EngagementTime',
		information: [
			{
				totalTime: '369',
				activeTime: '193',
			},
		],
	},
	{
		metricName: 'Browser',
		information: [
			{
				name: 'ChromeMobile',
				sessionsCount: '108',
			},
			{
				name: 'Chrome',
				sessionsCount: '50',
			},
			{
				name: 'MobileSafari',
				sessionsCount: '27',
			},
			{
				name: 'SamsungInternet',
				sessionsCount: '11',
			},
			{
				name: 'Edge',
				sessionsCount: '9',
			},
			{
				name: 'Other',
				sessionsCount: '2',
			},
			{
				name: 'Firefox',
				sessionsCount: '2',
			},
		],
	},
	{
		metricName: 'Device',
		information: [
			{
				name: 'Mobile',
				sessionsCount: '146',
			},
			{
				name: 'PC',
				sessionsCount: '61',
			},
			{
				name: 'Tablet',
				sessionsCount: '2',
			},
		],
	},
	{
		metricName: 'OS',
		information: [
			{
				name: 'Android',
				sessionsCount: '116',
			},
			{
				name: 'Windows',
				sessionsCount: '54',
			},
			{
				name: 'IOS',
				sessionsCount: '32',
			},
			{
				name: 'ChromeOS',
				sessionsCount: '5',
			},
			{
				name: 'Linux',
				sessionsCount: '1',
			},
			{
				name: 'MacOSX',
				sessionsCount: '1',
			},
		],
	},
	{
		metricName: 'Country',
		information: [
			{
				name: 'Argentina',
				sessionsCount: '145',
			},
			{
				name: 'Mexico',
				sessionsCount: '28',
			},
			{
				name: 'Spain',
				sessionsCount: '8',
			},
			{
				name: 'Ecuador',
				sessionsCount: '8',
			},
			{
				name: 'Brazil',
				sessionsCount: '6',
			},
			{
				name: 'Venezuela, Bolivarian Republic of',
				sessionsCount: '3',
			},
			{
				name: 'United States',
				sessionsCount: '2',
			},
			{
				name: 'Paraguay',
				sessionsCount: '2',
			},
			{
				name: 'Chile',
				sessionsCount: '1',
			},
			{
				name: 'Belgium',
				sessionsCount: '1',
			},
		],
	},
	{
		metricName: 'PageTitle',
		information: [
			{
				name: 'El Árbol de la Buena Muerte - Héctor Germán Oesterheld',
				sessionsCount: '26',
			},
			{
				name: 'El Árbol de la Buena Muerte - Héctor Germán Oesterheld | La Cuentoneta',
				sessionsCount: '22',
			},
			{
				name: 'El Huevo - Andy Weir | La Cuentoneta',
				sessionsCount: '16',
			},
			{
				name: 'El Huevo - Andy Weir',
				sessionsCount: '14',
			},
			{
				name: 'El Corazón Delator - Edgar Allan Poe | La Cuentoneta',
				sessionsCount: '14',
			},
			{
				name: 'Te Digo Más - Roberto Fontanarrosa | La Cuentoneta',
				sessionsCount: '13',
			},
			{
				name: 'Te Digo Más - Roberto Fontanarrosa',
				sessionsCount: '13',
			},
			{
				name: 'La Cuentoneta',
				sessionsCount: '12',
			},
			{
				name: 'La Casa de Adela - Mariana Enríquez',
				sessionsCount: '10',
			},
			{
				name: 'El Corazón Delator - Edgar Allan Poe',
				sessionsCount: '5',
			},
		],
	},
	{
		metricName: 'ReferrerUrl',
		information: [
			{
				name: 'https://www.google.com/',
				sessionsCount: '113',
			},
			{
				name: null,
				sessionsCount: '79',
			},
			{
				name: 'https://www.google.com.ar/',
				sessionsCount: '4',
			},
			{
				name: 'https://www.bing.com/',
				sessionsCount: '4',
			},
			{
				name: 'https://mx.search.yahoo.com/',
				sessionsCount: '2',
			},
			{
				name: 'https://www.cuentoneta.ar/home',
				sessionsCount: '2',
			},
			{
				name: 'https://search.yahoo.com/',
				sessionsCount: '2',
			},
			{
				name: 'https://t.co/',
				sessionsCount: '2',
			},
			{
				name: 'https://plataforma.acadeu.com/',
				sessionsCount: '1',
			},
			{
				name: 'https://www.cuentoneta.ar/story/la-bestia-que-gritaba-amor-en-el-corazon-del-universo?navigation=storylist&navigationSlug=lecturas-de-verano',
				sessionsCount: '1',
			},
		],
	},
	{
		metricName: 'PopularPages',
		information: [
			{
				url: 'https://www.cuentoneta.ar/story/el-arbol-de-la-buena-muerte',
				visitsCount: '37',
			},
			{
				url: 'https://www.cuentoneta.ar/story/el-huevo',
				visitsCount: '29',
			},
			{
				url: 'https://www.cuentoneta.ar/story/el-corazon-delator',
				visitsCount: '17',
			},
			{
				url: 'https://www.cuentoneta.ar/story/te-digo-mas',
				visitsCount: '16',
			},
			{
				url: 'https://www.cuentoneta.ar/story/el-arbol-de-la-buena-muerte/otono-2023',
				visitsCount: '13',
			},
			{
				url: 'https://www.cuentoneta.ar/story/la-casa-de-adela',
				visitsCount: '10',
			},
			{
				url: 'https://www.cuentoneta.ar/story/te-digo-mas/lecturas-de-verano',
				visitsCount: '9',
			},
			{
				url: 'https://www.cuentoneta.ar/story',
				visitsCount: '7',
			},
			{
				url: 'https://www.cuentoneta.ar/story/el-puente-de-arena',
				visitsCount: '6',
			},
			{
				url: 'https://www.cuentoneta.ar/home',
				visitsCount: '6',
			},
		],
	},
];
