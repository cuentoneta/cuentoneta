/**
 * Conjunto de tipos y funciones de utilidad para el manejo de datos provenientes desde la API de Microsoft Clarity.
 * @author Ramiro Olivencia <ramiro@olivencia.com.ar>
 */

// Interfaces base para representar la información de las métricas
interface MetricWithSessions {
	sessionsCount: string;
	sessionsWithMetricPercentage: number;
	sessionsWithoutMetricPercentage: number;
	pagesViews: string;
	subTotal: string;
}

interface ScrollDepthInfo {
	averageScrollDepth: number;
}

interface TrafficInfo {
	totalSessionCount: string;
	totalBotSessionCount: string;
	distinctUserCount: string;
	pagesPerSessionPercentage: number;
}

interface EngagementTimeInfo {
	totalTime: string;
	activeTime: string;
}

interface SessionsCountInfo {
	name: string | null;
	sessionsCount: string;
}

interface PopularPageInfo {
	url: string;
	visitsCount: string;
}

// Type guards
interface DeadClickMetric {
	metricName: 'DeadClickCount';
	information: [MetricWithSessions];
}

interface ExcessiveScrollMetric {
	metricName: 'ExcessiveScroll';
	information: [MetricWithSessions];
}

interface RageClickMetric {
	metricName: 'RageClickCount';
	information: [MetricWithSessions];
}

interface QuickbackClickMetric {
	metricName: 'QuickbackClick';
	information: [MetricWithSessions];
}

interface ScriptErrorMetric {
	metricName: 'ScriptErrorCount';
	information: [MetricWithSessions];
}

interface ErrorClickMetric {
	metricName: 'ErrorClickCount';
	information: [MetricWithSessions];
}

interface ScrollDepthMetric {
	metricName: 'ScrollDepth';
	information: [ScrollDepthInfo];
}

interface TrafficMetric {
	metricName: 'Traffic';
	information: [TrafficInfo];
}

interface EngagementTimeMetric {
	metricName: 'EngagementTime';
	information: [EngagementTimeInfo];
}

interface BrowserMetric {
	metricName: 'Browser';
	information: SessionsCountInfo[];
}

interface DeviceMetric {
	metricName: 'Device';
	information: SessionsCountInfo[];
}

interface OSMetric {
	metricName: 'OS';
	information: SessionsCountInfo[];
}

interface CountryMetric {
	metricName: 'Country';
	information: SessionsCountInfo[];
}

interface PageTitleMetric {
	metricName: 'PageTitle';
	information: SessionsCountInfo[];
}

interface ReferrerUrlMetric {
	metricName: 'ReferrerUrl';
	information: SessionsCountInfo[];
}

interface PopularPagesMetric {
	metricName: 'PopularPages';
	information: PopularPageInfo[];
}

type MetricData =
	| DeadClickMetric
	| ExcessiveScrollMetric
	| RageClickMetric
	| QuickbackClickMetric
	| ScriptErrorMetric
	| ErrorClickMetric
	| ScrollDepthMetric
	| TrafficMetric
	| EngagementTimeMetric
	| BrowserMetric
	| DeviceMetric
	| OSMetric
	| CountryMetric
	| PageTitleMetric
	| ReferrerUrlMetric
	| PopularPagesMetric;

export type ClarityApiResponse = MetricData[];

// Funciones de utilidad para obtener métricas específicas desde la respuesta de la API
export const getDeadClickMetric = (response: ClarityApiResponse): DeadClickMetric | undefined => {
	return response.find((metric): metric is DeadClickMetric => metric.metricName === 'DeadClickCount');
};

export const getExcessiveScrollMetric = (response: ClarityApiResponse): ExcessiveScrollMetric | undefined => {
	return response.find((metric): metric is ExcessiveScrollMetric => metric.metricName === 'ExcessiveScroll');
};

export const getRageClickMetric = (response: ClarityApiResponse): RageClickMetric | undefined => {
	return response.find((metric): metric is RageClickMetric => metric.metricName === 'RageClickCount');
};

export const getQuickbackClickMetric = (response: ClarityApiResponse): QuickbackClickMetric | undefined => {
	return response.find((metric): metric is QuickbackClickMetric => metric.metricName === 'QuickbackClick');
};

export const getScriptErrorMetric = (response: ClarityApiResponse): ScriptErrorMetric | undefined => {
	return response.find((metric): metric is ScriptErrorMetric => metric.metricName === 'ScriptErrorCount');
};

export const getErrorClickMetric = (response: ClarityApiResponse): ErrorClickMetric | undefined => {
	return response.find((metric): metric is ErrorClickMetric => metric.metricName === 'ErrorClickCount');
};

export const getScrollDepthMetric = (response: ClarityApiResponse): ScrollDepthMetric | undefined => {
	return response.find((metric): metric is ScrollDepthMetric => metric.metricName === 'ScrollDepth');
};

export const getTrafficMetric = (response: ClarityApiResponse): TrafficMetric | undefined => {
	return response.find((metric): metric is TrafficMetric => metric.metricName === 'Traffic');
};

export const getEngagementTimeMetric = (response: ClarityApiResponse): EngagementTimeMetric | undefined => {
	return response.find((metric): metric is EngagementTimeMetric => metric.metricName === 'EngagementTime');
};

export const getBrowserMetric = (response: ClarityApiResponse): BrowserMetric | undefined => {
	return response.find((metric): metric is BrowserMetric => metric.metricName === 'Browser');
};

export const getDeviceMetric = (response: ClarityApiResponse): DeviceMetric | undefined => {
	return response.find((metric): metric is DeviceMetric => metric.metricName === 'Device');
};

export const getOSMetric = (response: ClarityApiResponse): OSMetric | undefined => {
	return response.find((metric): metric is OSMetric => metric.metricName === 'OS');
};

export const getCountryMetric = (response: ClarityApiResponse): CountryMetric | undefined => {
	return response.find((metric): metric is CountryMetric => metric.metricName === 'Country');
};

export const getPageTitleMetric = (response: ClarityApiResponse): PageTitleMetric | undefined => {
	return response.find((metric): metric is PageTitleMetric => metric.metricName === 'PageTitle');
};

export const getReferrerUrlMetric = (response: ClarityApiResponse): ReferrerUrlMetric | undefined => {
	return response.find((metric): metric is ReferrerUrlMetric => metric.metricName === 'ReferrerUrl');
};

export const getPopularPagesMetric = (response: ClarityApiResponse): PopularPagesMetric | undefined => {
	return response.find((metric): metric is PopularPagesMetric => metric.metricName === 'PopularPages');
};
