const server = await import('../dist/cuentoneta/server/main.server.mjs');
module.exports = server.app();
