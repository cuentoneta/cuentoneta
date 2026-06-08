import { readFileSync } from 'fs';
import { join } from 'path';

/**
 * Lee el valor de un token de color del tema declarado en `src/tailwind.css` (`@theme`).
 * A partir de la migración a Tailwind CSS v4 (CSS-first), el tema dejó de vivir en un archivo `.ts`,
 * por lo que el valor se obtiene parseando la hoja de estilos de configuración.
 */
function readThemeColor(token: string): string | undefined {
	const tailwindCssPath = join(process.cwd(), 'src', 'tailwind.css');
	const tailwindCssContent = readFileSync(tailwindCssPath, 'utf-8');
	const match = tailwindCssContent.match(new RegExp(`--color-${token}:\\s*([^;]+);`));
	return match ? match[1].trim() : undefined;
}

describe('Theme Configuration', () => {
	describe('theme-color meta tag synchronization', () => {
		it('should match the brand-500 color from the @theme configuration', () => {
			const indexFilePath = join(process.cwd(), 'src', 'indexFile.html');
			const indexFileContent = readFileSync(indexFilePath, 'utf-8');
			const themeColorMatch = indexFileContent.match(/<meta\s+name="theme-color"\s+content="([^"]+)"\s*\/?>/);

			if (!themeColorMatch) {
				throw new Error('theme-color meta tag not found');
			}

			expect(themeColorMatch).toBeTruthy();
			expect(themeColorMatch[1]).toBeDefined();

			const themeColorFromMetaTag = themeColorMatch[1];
			const brandColor500 = readThemeColor('brand-500');

			// Compare the values
			expect(themeColorFromMetaTag).toBe(brandColor500);
		});

		it('should have brand-500 defined in the @theme configuration', () => {
			expect(readThemeColor('brand-500')).toBeDefined();
			expect(readThemeColor('brand-500')).toBe('hsl(21, 57%, 44%)');
		});
	});
});
