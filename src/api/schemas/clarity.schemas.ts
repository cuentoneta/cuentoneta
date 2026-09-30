import { z } from 'zod';

export const clarityResponseSchema = z.array(z.object({ metricName: z.string() }).loose());

export const popularPagesMetricSchema = z.object({
	metricName: z.literal('PopularPages'),
	information: z.array(z.looseObject({ url: z.string() })),
});

export type PopularPagesMetric = z.infer<typeof popularPagesMetricSchema>;
