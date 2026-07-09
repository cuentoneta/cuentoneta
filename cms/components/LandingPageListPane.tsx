import React, { useCallback, useEffect, useState } from 'react';
import { useClient } from 'sanity';
import { usePaneRouter } from 'sanity/structure';
import { Badge, Box, Button, Card, Flex, Spinner, Stack, Text } from '@sanity/ui';
import { AddIcon, CodeBlockIcon } from '@sanity/icons';

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
	const { ChildLink, navigateIntent } = usePaneRouter();
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

	// Referencia para clasificar filas: el config de la activa (máximo config <= semana actual). Toda fila con
	// config mayor es una semana futura. Sin activa, se cae a la semana actual como referencia.
	const activeConfig = rows.find((row) => row._id === activeId)?.config ?? activeWeekSlug();

	return (
		<Stack space={0}>
			<Box padding={2}>
				<Button
					icon={AddIcon}
					text="Crear nueva"
					mode="ghost"
					tone="primary"
					onClick={() => navigateIntent('create', { type: 'landingPage' })}
				/>
			</Box>
			{rows.length === 0 ? (
				<Box padding={3}>
					<Text muted>No hay páginas de inicio cargadas.</Text>
				</Box>
			) : (
				rows.map((row) => {
					const isActive = row._id === activeId;
					const isFuture = !isActive && row.config > activeConfig;
					const tone = isActive ? 'positive' : isFuture ? 'primary' : 'default';
					return (
						<ChildLink key={row._id} childId={row._id} style={{ textDecoration: 'none', color: 'inherit' }}>
							<Card paddingX={3} paddingY={3} radius={0} borderBottom tone={tone}>
								<Flex align="center" gap={3}>
									<Text size={2} muted={tone === 'default'}>
										<CodeBlockIcon />
									</Text>
									<Box flex={1}>
										<Text size={2} weight="medium" textOverflow="ellipsis">
											{row.config}
										</Text>
									</Box>
									{isActive && (
										<Badge tone="positive" mode="outline">
											Activa
										</Badge>
									)}
									{isFuture && (
										<Badge tone="primary" mode="outline">
											Futura
										</Badge>
									)}
								</Flex>
							</Card>
						</ChildLink>
					);
				})
			)}
		</Stack>
	);
}
