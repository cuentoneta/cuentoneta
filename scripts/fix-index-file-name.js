const fs = require('fs');
const path = require('path');

const projectName = 'cuentoneta'; // replace project name
const filePath = path.join(__dirname, '../dist', projectName, 'server', 'main.server.mjs');

if (!fs.existsSync(filePath)) {
	console.error('❌ main.server.mjs not found at:', filePath);
	process.exit(1);
}

let content = fs.readFileSync(filePath, 'utf8');

const oldString = 'index.csr.html';
const newString = 'indexFile.html';

if (content.includes(oldString)) {
	content = content.replace(new RegExp(oldString, 'g'), newString);
	fs.writeFileSync(filePath, content, 'utf8');
	console.log(`✅ Replaced "${oldString}" with "${newString}" in main.server.mjs`);
} else {
	console.warn(`⚠️ String "${oldString}" not found in main.server.mjs`);
}
