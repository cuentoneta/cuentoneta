import type { Handler } from 'hono';

/**
 * El listado de obras se mudó de `/story` a `/literary-work`. La mudanza tiene que viajar en la
 * respuesta HTTP y no en el router del cliente: un crawler que no ejecuta JavaScript solo ve el 301,
 * y es el 301 —no un alias— lo que traslada lo que la ruta vieja tenga indexado.
 *
 * Es un handler terminal y no un middleware: responde en vez de ceder a `next()`, a diferencia del
 * resto de esta carpeta.
 *
 * El destino va como literal porque `src/api/**` no importa `AppRoutes`, que es del frontend.
 */
export const legacyStoryListingRedirect: Handler = (c) => c.redirect('/literary-work', 301);
