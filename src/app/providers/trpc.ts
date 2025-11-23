import { inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { createTRPCProxyClient, httpBatchLink } from '@trpc/client';
import { environment } from '../environments/environment';
import type { AppRouter } from '../../api/trpc/root';

let cachedClient: ReturnType<typeof createTRPCProxyClient<AppRouter>> | null = null;

export function getTRPCClient(): ReturnType<typeof createTRPCProxyClient<AppRouter>> {
	if (cachedClient) {
		return cachedClient;
	}

	// Determine the URL for tRPC
	const trpcUrl =
		typeof window === 'undefined'
			? `http://localhost:4000/trpc` // SSR
			: `${environment.apiUrl.replace('/api', '')}/trpc`; // Client-side

	cachedClient = createTRPCProxyClient<AppRouter>({
		links: [
			httpBatchLink({
				url: trpcUrl,
				async fetch(url, options) {
					const response = await fetch(url, {
						...options,
						credentials: 'include',
					});
					return response;
				},
			}),
		],
	});

	return cachedClient;
}

/**
 * Injectable service to provide tRPC client to Angular components
 */
export class TRPCService {
	private client = getTRPCClient();

	getClient(): ReturnType<typeof createTRPCProxyClient<AppRouter>> {
		return this.client;
	}
}
