const path = require('path');
const serverDistPath = path.join(process.cwd(), 'dist/cuentoneta/server/server.mjs');
export default import(serverDistPath).then((module) => module.app);
