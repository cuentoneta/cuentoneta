import React, { useCallback, useEffect, useState } from 'react';
import { useClient } from 'sanity';
import { IntentLink } from 'sanity/router';
import { Badge, Box, Button, Card, Flex, Spinner, Stack, Text } from '@sanity/ui';
import { AddIcon } from '@sanity/icons';

import { ACTIVE_LANDING_ID_QUERY, LANDING_LIST_QUERY, activeWeekSlug } from '../utils/landing-page';

interface LandingPageRow {
	_id: string;
	config: string;
}

const API_VERSION = '2024-01-01';

export function LandingPageListPane() {
	const client = useClient({ apiVersion: API_VERSION });
	const [rows, setRows] = useState<LandingPageRow[] | null>(null);
	const [activeId, setActiveId] = useState<string | null>(null);

	const load = useCallback(async () => {
		const [list, active] = await Promise.all([
			client.fetch<LandingPageRow[]>(LANDING_LIST_QUERY),
			client.fetch<string | null>(ACTIVE_LANDING_ID_QUERY, { slug: activeWeekSlug() }),
		]);
		setRows(list);
		setActiveId(active ?? null);
	}, [client]);

	useEffect(() => {
		load();
		// Refresca el badge ante altas/ediciones/borrados de landing pages sin recargar el Studio.
		const subscription = client
			.listen(LANDING_LIST_QUERY, {}, { visibility: 'query', includeResult: false })
			.subscribe(() => load());
		return () => subscription.unsubscribe();
	}, [client, load]);

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
					as={IntentLink}
					intent="create"
					params={{ type: 'landingPage' }}
					icon={AddIcon}
					text="Crear nueva"
					mode="ghost"
					tone="primary"
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
