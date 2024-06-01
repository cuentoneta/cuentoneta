import { inject, Injectable, PLATFORM_ID } from '@angular/core';

// Tailwind
import * as defaultColors from 'tailwindcss/colors';
import { DefaultColors } from 'tailwindcss/types/generated/colors';
import { Meta } from '@angular/platform-browser';
import { isPlatformBrowser } from '@angular/common';
import { extendedColors } from '../../../theme.config';

@Injectable({
	providedIn: 'root',
})
export class ThemeService {
	private meta = inject(Meta);
	private platformId = inject(PLATFORM_ID);

	pickColor(color: keyof DefaultColors, scale: number = 50) {
		if (!defaultColors[color]) {
			throw new Error(`Color ${color} not found in Tailwind CSS config!`);
		}

		// @ts-expect-error - Este guard chequea la existencia de la escala en el color
		if (!defaultColors[color][scale.toString()]) {
			throw new Error(`Scale ${scale} not found in color ${color}!`);
		}

		// @ts-expect-error - En este punto tanto el color como la escala han sido validados
		return defaultColors[color][scale.toString()].toUpperCase();
	}

	addThemeColorTag() {
		if (isPlatformBrowser(this.platformId)) {
			this.meta.addTag({ name: 'theme-color', content: extendedColors['primary-500'] });
		}
	}
}
