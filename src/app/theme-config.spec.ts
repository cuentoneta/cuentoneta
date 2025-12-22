import { extendedColors } from '../../theme.config';
import { readFileSync } from 'fs';
import { join } from 'path';

describe('Theme Configuration', () => {
	describe('theme-color meta tag synchronization', () => {
		it('should match the primary-500 color from theme.config.ts', () => {
			const indexFilePath = join(process.cwd(), 'src', 'indexFile.html');
			const indexFileContent = readFileSync(indexFilePath, 'utf-8');
			const themeColorMatch = indexFileContent.match(/<meta\s+name="theme-color"\s+content="([^"]+)"\s*\/?>/);

			if (!themeColorMatch) {
				throw new Error('theme-color meta tag not found');
			}

			expect(themeColorMatch).toBeTruthy();
			expect(themeColorMatch[1]).toBeDefined();

			const themeColorFromMetaTag = themeColorMatch[1];
			const primaryColor500 = extendedColors['primary-500'];

			// Compare the values
			expect(themeColorFromMetaTag).toBe(primaryColor500);
		});

		it('should have primary-500 defined in theme.config.ts', () => {
			expect(extendedColors['primary-500']).toBeDefined();
			expect(extendedColors['primary-500']).toBe('hsl(21, 57%, 44%)');
		});
	});
});
