import fs from 'fs';
import { join } from 'node:path';

const projectName = 'cuentoneta'; // replace project name
const filePath = join(import.meta.dirname, '../dist', projectName, 'server', 'main.server.mjs');

if (!fs.existsSync(filePath)) {
	console.error('❌ No se encontró el archivo main.server.mjs en:', filePath);
	process.exit(1);
}

let content = fs.readFileSync(filePath, 'utf8');

const oldString = 'index.csr.html';
const newString = 'indexFile.html';

if (content.includes(oldString)) {
	content = content.replace(new RegExp(oldString, 'g'), newString);
	fs.writeFileSync(filePath, content, 'utf8');
	console.log(`✅ Reemplazada cadena "${oldString}" por "${newString}" in main.server.mjs`);
} else {
	console.warn(`⚠️ La cadena "${oldString}" no se encontró en main.server.mjs`);
}
