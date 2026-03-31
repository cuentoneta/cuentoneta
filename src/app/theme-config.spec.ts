import { extendedColors } from '../../theme.config';
import { readFileSync } from 'fs';
import { join } from 'path';
describe('Theme Configuration', () => {
	describe('theme-color meta tag synchronization', () => {
		it('should match the brand-500 color from theme.config.ts', () => {
			const indexFilePath = join(process.cwd(), 'src', 'indexFile.html');
			const indexFileContent = readFileSync(indexFilePath, 'utf-8');
			const themeColorMatch = indexFileContent.match(/<meta\s+name="theme-color"\s+content="([^"]+)"\s*\/?>/);
			if (!themeColorMatch) {
				throw new Error('theme-color meta tag not found');
			}
			expect(themeColorMatch).toBeTruthy();
			expect(themeColorMatch[1]).toBeDefined();
			const themeColorFromMetaTag = themeColorMatch[1];
			const brandColor500 = extendedColors['brand-500'];
			// Compare the values
			expect(themeColorFromMetaTag).toBe(brandColor500);
		});
		it('should have brand-500 defined in theme.config.ts', () => {
			expect(extendedColors['brand-500']).toBeDefined();
			expect(extendedColors['brand-500']).toBe('hsl(21, 57%, 44%)');
		});
	});
});
