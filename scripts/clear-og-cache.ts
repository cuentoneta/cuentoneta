import { rmSync, existsSync } from 'fs';

const CACHE_DIR = `${process.cwd()}/cache/og`;

console.log('🧹 Limpiando caché de imágenes OpenGraph...');

if (existsSync(CACHE_DIR)) {
	rmSync(CACHE_DIR, { recursive: true, force: true });
	console.log('✅ Caché de imágenes OG eliminado correctamente');
} else {
	console.log('ℹ️  No se encontró directorio de caché');
}
