import React, { useCallback, useEffect, useState } from 'react';
import { useClient } from 'sanity';
import { IntentLink, useRouter } from 'sanity/router';
import { Badge, Box, Button, Card, Flex, Spinner, Stack, Text } from '@sanity/ui';
import { AddIcon } from '@sanity/icons';

import {
	ACTIVE_LANDING_ID_QUERY,
	API_VERSION,
	LANDING_LIST_QUERY,
	activeWeekSlug,
	type LandingPageRow,
} from '../utils/landing-page';

function toMessage(cause: unknown): string {
	return cause instanceof Error ? cause.message : 'Error desconocido';
}

export function LandingPageListPane() {
	const client = useClient({ apiVersion: API_VERSION });
	const router = useRouter();
	const [rows, setRows] = useState<LandingPageRow[] | null>(null);
	const [activeId, setActiveId] = useState<string | null>(null);
	const [error, setError] = useState<string | null>(null);

	const load = useCallback(async () => {
		try {
			const [list, active] = await Promise.all([
				client.fetch<LandingPageRow[]>(LANDING_LIST_QUERY),
				client.fetch<string | null>(ACTIVE_LANDING_ID_QUERY, { slug: activeWeekSlug() }),
			]);
			setRows(list);
			setActiveId(active ?? null);
			setError(null);
		} catch (cause) {
			setError(toMessage(cause));
		}
	}, [client]);

	useEffect(() => {
		load();
		// Refresca el badge ante altas/ediciones/borrados de landing pages sin recargar el Studio.
		const subscription = client
			.listen(LANDING_LIST_QUERY, {}, { visibility: 'query', includeResult: false })
			.subscribe({ next: () => load(), error: (cause) => setError(toMessage(cause)) });
		return () => subscription.unsubscribe();
	}, [client, load]);

	if (error !== null) {
		return (
			<Box padding={4}>
				<Text tone="critical">No se pudieron cargar las páginas de inicio: {error}</Text>
			</Box>
		);
	}

	if (rows === null) {
		return (
			<Flex align="center" justify="center" padding={5}>
				<Spinner muted />
			</Flex>
		);
	}

	return (
		<Stack space={2} padding={3}>
			<Flex justify="flex-end">
				<Button
					icon={AddIcon}
					text="Crear nueva"
					mode="ghost"
					tone="primary"
					onClick={() => router.navigateIntent('create', { type: 'landingPage' })}
				/>
			</Flex>
			{rows.length === 0 ? (
				<Box padding={3}>
					<Text muted>No hay páginas de inicio cargadas.</Text>
				</Box>
			) : (
				rows.map((row) => {
					const isActive = row._id === activeId;
					return (
						<IntentLink
							key={row._id}
							intent="edit"
							params={{ id: row._id, type: 'landingPage' }}
							style={{ textDecoration: 'none' }}
						>
							<Card padding={3} radius={2} shadow={1} tone={isActive ? 'positive' : 'default'}>
								<Flex align="center" gap={3}>
									<Text size={2} weight="semibold" style={{ flex: 1 }}>
										{row.config}
									</Text>
									{isActive && <Badge tone="positive">Activa</Badge>}
								</Flex>
							</Card>
						</IntentLink>
					);
				})
			)}
		</Stack>
	);
}
