import React, {
	type ComponentProps,
	type ComponentType,
	type CSSProperties,
	useCallback,
	useEffect,
	useState,
} from 'react';
import { useClient } from 'sanity';
import { usePaneRouter } from 'sanity/structure';
import { Badge, Box, Button, Card, Flex, Spinner, Stack, Text } from '@sanity/ui';
import { AddIcon } from '@sanity/icons/Add';
import { CodeBlockIcon } from '@sanity/icons/CodeBlock';

import { buildWeekSlug } from '@utils/week-slug.utils';

import { API_VERSION, LANDING_LIST_QUERY, type LandingPageRow, resolveActiveLandingId } from '../utils/landing-page';

function toMessage(cause: unknown): string {
	return cause instanceof Error ? cause.message : 'Error desconocido';
}

/** El tono clasifica la fila: la activa, una semana futura, o cualquier otra. */
type RowTone = 'positive' | 'primary' | 'default';

function ErrorNotice({ message }: { message: string }) {
	return (
		<Box padding={4}>
			{/* El tono va en el Card: Text de @sanity/ui v3 no acepta `tone`, así que el mensaje se venía
			    renderizando sin color de error. */}
			<Card padding={3} radius={2} tone="critical">
				<Text>No se pudieron cargar las páginas de inicio: {message}</Text>
			</Card>
		</Box>
	);
}

function LoadingIndicator() {
	return (
		<Flex align="center" justify="center" padding={5}>
			<Spinner muted />
		</Flex>
	);
}

function EmptyNotice() {
	return (
		<Box padding={3}>
			<Text muted>No hay páginas de inicio cargadas.</Text>
		</Box>
	);
}

/**
 * La lista de fichas, clasificadas contra la activa. El enlace llega por prop porque lo produce el
 * router del panel, que solo el componente de arriba puede consultar.
 */
function LandingPageRows({
	rows,
	activeId,
	ChildLink,
}: {
	rows: LandingPageRow[];
	activeId: string | null;
	ChildLink: ReturnType<typeof usePaneRouter>['ChildLink'];
}) {
	// ChildLink no declara `style` en sus props, pero reenvía el resto al ancla que termina renderizando.
	// El reset tiene que ir sobre esa ancla: la decoración la dibuja ella, y ponerlo en un descendiente
	// no la cancela.
	const PlainChildLink = ChildLink as ComponentType<ComponentProps<typeof ChildLink> & { style?: CSSProperties }>;

	// Referencia para clasificar filas: el config de la activa (máximo config <= semana actual). Toda fila con
	// config mayor es una semana futura. Sin activa, se cae a la semana actual como referencia.
	const activeConfig = rows.find((row) => row._id === activeId)?.config ?? buildWeekSlug(new Date());

	return rows.map((row) => {
		const isActive = row._id === activeId;
		const isFuture = !isActive && row.config > activeConfig;
		const tone: RowTone = isActive ? 'positive' : isFuture ? 'primary' : 'default';
		const badge = isActive ? 'Activa' : isFuture ? 'Futura' : null;
		return (
			<PlainChildLink key={row._id} childId={row._id} style={{ textDecoration: 'none', color: 'inherit' }}>
				<LandingPageCard config={row.config} tone={tone} badge={badge} />
			</PlainChildLink>
		);
	});
}

/** La ficha de una landing page. `badge` es el rótulo de su clasificación, o nada si no la tiene. */
function LandingPageCard({ config, tone, badge }: { config: string; tone: RowTone; badge: string | null }) {
	return (
		<Card paddingX={3} paddingY={3} radius={0} borderBottom tone={tone}>
			<Flex align="center" gap={3}>
				<Text size={2} muted={tone === 'default'}>
					<CodeBlockIcon />
				</Text>
				<Box flex={1}>
					<Text size={2} weight="medium" textOverflow="ellipsis">
						{config}
					</Text>
				</Box>
				{badge !== null && (
					<Badge tone={tone} mode="outline">
						{badge}
					</Badge>
				)}
			</Flex>
		</Card>
	);
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
				resolveActiveLandingId(client),
			]);
			setRows(list);
			setActiveId(active);
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
		return <ErrorNotice message={error} />;
	}

	if (rows === null) {
		return <LoadingIndicator />;
	}

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
			{rows.length === 0 ? <EmptyNotice /> : <LandingPageRows rows={rows} activeId={activeId} ChildLink={ChildLink} />}
		</Stack>
	);
}
