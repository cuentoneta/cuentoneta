// Segmentos que el API de obras usa como sub-ruta: una obra con uno de estos slugs quedaría
// inalcanzable en `GET /api/literary-work/:slug`, porque la sub-ruta se registra antes.
export const RESERVED_LITERARY_WORK_SLUGS = Object.freeze(['teasers'] as const);
