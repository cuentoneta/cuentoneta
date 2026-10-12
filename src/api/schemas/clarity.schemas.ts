import { z } from 'zod';

// Solo el envoltorio: cada métrica se valida recién al extraerla, para que una deformación en una que
// nadie lee no tumbe a las demás.
export const clarityResponseSchema = z.array(z.looseObject({ metricName: z.string() }));

export type ClarityResponse = z.infer<typeof clarityResponseSchema>;

export const popularPagesMetricSchema = z.object({
	metricName: z.literal('PopularPages'),
	information: z.array(z.looseObject({ url: z.string() })),
});

export type PopularPagesMetric = z.infer<typeof popularPagesMetricSchema>;
