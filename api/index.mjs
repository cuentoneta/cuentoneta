const serverDistPath = '../dist/cuentoneta/server/server.mjs';
export default import(serverDistPath).then((module) => module.app);
