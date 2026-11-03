import { readFileSync } from 'fs';
import { join } from 'path';

/**
 * Inyecta en el documento de test la hoja real que subraya los enlaces del HTML de Markdown, para que
 * un spec pueda afirmar el estilo computado del enlace renderizado. Es idempotente.
 *
 * La hoja se lee del disco porque el CSS importado llega vacío en Vitest.
 */
export function installMarkdownLinksSheet(): void {
	const styleElementId = 'markdown-links-sheet';
	document.getElementById(styleElementId)?.remove();

	const style = document.createElement('style');
	style.id = styleElementId;
	style.textContent = readFileSync(join(process.cwd(), 'src/assets/css/markdown-links.css'), 'utf-8');
	document.head.appendChild(style);
}
