import { handle } from 'hono/vercel';

const { app } = await import('../dist/cuentoneta/server/server.mjs');
const handler = handle(app);

// Export the handler for all HTTP methods that Vercel uses.
export const GET = handler;
export const POST = handler;
export const PATCH = handler;
export const PUT = handler;
export const OPTIONS = handler;
export const DELETE = handler;
